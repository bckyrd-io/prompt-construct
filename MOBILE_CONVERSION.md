# Next.js → React Native (Expo) Conversion Plan

Status: **all 12 screens implemented and building clean.** Only manual on-device testing and the Supabase cutover remain.

---

## 1. The problem this had to solve

The Next.js app is not just 12 pages — it is **19 API route handlers** that own:

- Postgres + **pgvector** (`properties.embedding vector(3072)`, cosine `<=>` search)
- **Google Gemini** embedding generation (`gemini-embedding-001`, 3072-dim)
- **Paychangu** payment init, server callback verification, and webhook
- File uploads to `public/uploads`

A React Native app cannot reach Postgres, and the Gemini/Paychangu secrets must never
ship in a client bundle. So the backend has to survive the conversion somewhere.

**Decision: keep Next.js as the API layer; build the Expo app purely as a client.**
The Expo app talks to `http://<host>:3000/api/*`.

---

## 2. Backend: offline now, Supabase later, one code path

Requirement: same code runs against local Postgres during offline testing and against
Supabase when hosted, with two env files.

`lib/db.ts` now prefers a connection string and falls back to discrete vars:

```ts
const connectionString = process.env.DATABASE_URL?.trim();
const useSsl = process.env.POSTGRES_SSL === 'true'
  || (process.env.POSTGRES_SSL !== 'false' && Boolean(connectionString));

const pool = connectionString
  ? new Pool({ connectionString, ssl: useSsl ? { rejectUnauthorized: false } : undefined })
  : new Pool({ host, port, database, user, password, ssl: ... });
```

Because all SQL is plain Postgres — including the pgvector operator — moving to Supabase
is **only a connection-string change**. No ORM, no Supabase client SDK, no query rewrites.

| | Offline | Hosted |
|---|---|---|
| Env file | `.env.local` | `.env.supabase` |
| Database vars | `POSTGRES_HOST/PORT/DB/USER/PASSWORD` | `DATABASE_URL` |
| SSL | off | on automatically |

`env.template.md` documents all three setups (backend offline, backend Supabase, mobile
`.env`). `.env*` is already gitignored.

**Supabase notes** are captured in `env.template.md`: pgvector is available, `vector(3072)`
works (but HNSW/IVFFlat indexes cap at 2000 dims, so the current sequential scan is fine
at this data volume), the schema is created by `GET /api/init`, and Paychangu callbacks
need a public URL (tunnel locally).

---

## 3. Mobile app

### Scaffold

```bash
npx create-expo-app@latest mobile --template default
```

| | Version |
|---|---|
| Expo SDK | **57** |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | ~6.0.3 |

The template nests routes inside `src/app/` (not a root `app/`), with `@/*` → `./src/*`.

### Tabs removed

SDK 57's template uses `NativeTabs` from `expo-router/unstable-native-tabs`. Removed, along
with the `explore` tab route and all other template demo code. Replaced with a **drawer**,
because the web app has a collapsible sidebar — not a tab bar — and the mobile build should
look like the responsive web version.

On SDK 56+ the drawer ships **inside `expo-router`** (`react-native-drawer-layout`
under the hood), so `@react-navigation/drawer` is not needed and importing
`@react-navigation/*` in app code is actually disallowed.

### Dependencies

Added on top of the template:

| Package | Why |
|---|---|
| `@expo/ui` | native text inputs, pickers, checkboxes *(in Expo Go)* |
| `expo-secure-store` | auth persistence |
| `expo-linear-gradient` | card/dashboard scrims |
| `expo-image` | remote property photos *(template)* |
| `expo-web-browser` + `expo-linking` | Paychangu checkout *(template)* |
| `react-native-svg` + `lucide-react-native` | keep the existing Lucide icon set |
| `zustand` | port of the auth store |
| `@expo-google-fonts/work-sans` | matches the web app's font |

The template already provided `react-native-gesture-handler`, `react-native-reanimated`,
and `react-native-worklets` — everything the drawer needs.



## 4. Design decisions

### Theme: ported, not redesigned

`app/globals.css` is Tailwind v4 + shadcn driven by CSS custom properties. React Native has
no CSS variables, so `src/constants/theme.ts` reproduces the scale as constants. The oklch
neutrals are the standard shadcn `neutral` ramp, so they map cleanly onto hex:

```
primary #f1a10d   gold #ffc300   background #ffffff   foreground #0a0a0a
muted #f5f5f5     mutedForeground #8a8a8a              border #e5e5e5
destructive #dc2626               radius 10 (6/8/14/18) font Work Sans
```

Light-only on purpose — `app/layout.tsx` never sets `.dark`, so the web app is light-only
too. `app.json` pins `userInterfaceStyle: "light"` to match.

### `@expo/ui`, used surgically

The brief was "expo ui + reactnative styles, customised to look like the Tailwind code."
Where the split falls:

- **`@expo/ui`** for the fiddly native controls: `TextInput` (login/signup/apply/payment),
  `Picker` (employment select), `Checkbox` (terms).
- **RN `View`/`Text`/`StyleSheet`** for layout-heavy screens: property cards, dashboard
  grid, milestone timeline.

Reason: **inside a `<Host>` there is no flexbox** — layout must use `Row`/`Column`/`Spacer`.
Expressing the card grids that way would fight the tool. Similarly `Button` stays a
`Pressable`, because the web app restyles buttons per call site (amber primary, black CTA
that turns gold on press) and a native button imposes its own chrome.

### Drawer mirrors the responsive sidebar

`AppSidebar` is a collapsible sidebar that becomes an overlay below `md` (768px). The
drawer reproduces both states:

```tsx
const isWide = width >= DESKTOP_BREAKPOINT;
<Drawer
  defaultStatus={isWide ? 'open' : 'closed'}
  screenOptions={{
    drawerType: isWide ? 'permanent' : 'front',
    swipeEnabled: !isWide,
    ...
  }}
/>
```

Drawer items come from `<Drawer.Screen>` options, so active-state styling stays in one
place. `auth/login` and `auth/signup` are routed to but hidden — matching the web auth pages
which render full-screen with no sidebar.

### Navigation: query params instead of localStorage

The web app stashed an in-flight AI search in `localStorage` and read it on
`/recommendations`. On mobile that became a route param, so the query survives the login
detour:

```
/?q=2-acre lot  →  /auth/login?next=recommendations&q=…  →  /recommendations?q=…
```

`useSearchParams` + `<Suspense>` became `useLocalSearchParams`, which needs no Suspense
boundary.

### Auth: parity, not improvement

Same store shape as `lib/store/auth-store.ts`, with persistence on `expo-secure-store`
instead of `localStorage`, plus `hasHydrated` so the guard waits for the restore instead of
bouncing a signed-in user to login on first paint.

The trust model is unchanged and still weak — the API returns a user object and the client
decides what to do with it. There is no session token. See §7.

`useAuthGuard()` does the minimum a mobile app should: bounce signed-out users to login,
and send admins to their own landing route. The web app had **no route protection at all**.

### Media URLs

`image_url` and milestone `photos[]` are stored as `/uploads/foo.jpg`, served from the API's
`public/`. A device has no such origin, so `resolveMediaUrl()` absolutises every path
against `EXPO_PUBLIC_API_URL`. Without it every property image 404s.

### Payments

`callback_url` still points at the API — that server-to-server call is what verifies the
transaction with Paychangu, marks the milestone paid, recalculates progress, and flips the
property to `acquired`. `return_url` became a deep link (`royconstruction://payment`) so the
OS hands the user back into the app, and the screen refetches on focus.

---

## 5. SDK 57 gotchas hit along the way

Recorded because each one silently breaks the build or the UI.

| Gotcha | Detail |
|---|---|
| **`@expo/ui` `TextInput.value` is not a string** | It's an `ObservableState<string>` created by `useNativeState`. Used the documented **uncontrolled** path: `defaultValue` + `onChangeText` into React state. Also `key`ed on the initial value so a prefill arriving after mount still lands. |
| **`drawerType`/`swipeEnabled` are not navigator props** | This version reads them from the **focused screen's options**. Only `defaultStatus` (`'open' \| 'closed'`) is a navigator prop. |
| **`StyleSheet.absoluteFillObject` removed** in RN 0.86 | Use explicit `position/top/left/right/bottom`. |
| **`react-native-toast-message` v2.5 breaking change** | `config` became function-valued and `Toast` dropped `children`, so brand styling means re-implementing its renderer. Wrote a ~90-line in-house toast instead and **removed the dependency**. |
| **`useLocalSearchParams<T>()` generic is ambiguous** | Resolves against `TParams` or `TRoute extends RoutePath` depending on the argument; a plain object literal picks the wrong overload. Params are narrowed explicitly with `typeof x === 'string'`. |
| **Work Sans bundle weight** | The package root pulls all 18 variants (~3MB). Imported the 6 used weights from per-weight subpaths. |
| **No flexbox inside `<Host>`** | Use `Row`/`Column`/`Spacer`. See §4. |
| **Never key a native input on its live value** | @expo/ui TextInput is uncontrolled (see above), so passing `key={value}` remounts the native field on every keystroke - the parent re-renders as you type - which drops focus and collapses the keyboard mid-word. Snapshot the initial value once instead. |
| **`gap` vs `rowGap`/`columnGap`** | Collapsing a card grid to one column by setting a single `gap: 0` also removed the vertical spacing, so stacked cards touched. `rowGap` must stay constant; only `columnGap` collapses. |
| **The dev IP moves** | This machine lost its wired adapter and rejoined Wi-Fi mid-session, changing the LAN IP twice. `mobile/.env` is baked into the bundle, so run `npm run api:url` then `npx expo start -c` after any network change. `192.168.56.1` is a VirtualBox adapter and is never the right answer. |
| **`react-hooks` compiler rules** | `react-hooks/refs` forbids reading a ref during render (used `useState` for the toast's `Animated.Value`); `react-hooks/purity` rejects `Date.now()`/`Math.random()` outside an event handler (wrapped in `useCallback`). |

---

## 6. Verification status

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass — 0 errors, all 12 screens |
| `npx expo lint` | pass — 0 errors, 0 warnings |
| `npx expo export --platform android` | pass — all routes resolve, bundle builds |
| `npx expo-doctor` | **21/21 checks pass** |
| On-device / simulator run | **not done** |
| End-to-end against live API | **not done** |

All twelve pages from the web app now exist as Expo Router routes. Every web page handler
that does real work has a mobile counterpart (`handleSearch`, `handleSubmit` ×3,
`handleBack`/`handleNext`, `handlePayment`, `handleSave`, `addMilestone`,
`removeMilestone`, `updateMilestone`, image upload/remove, `handleReview`, `handleVerify`).

Nothing has been exercised at runtime yet, so treat the first `npx expo start` as the real
smoke test.

### Intentional divergences from the web build

Small places where the mobile port deliberately differs. All were either broken or
meaningless on the web:

| Area | Web | Mobile | Why |
|---|---|---|---|
| Home catalog cards | `/apply?property=RC-2024-110` | `/recommendations` | Those `RC-…` reference strings are not database ids, so the web links could never resolve. |
| Apply terms checkbox | decorative — submit ignores it | required before submit | A consent checkbox that isn't checked shouldn't allow submission. |
| Recommendations order | always price-ascending | API order (similarity, else newest) | The web set `sortBy='price-low'` and mutated state with `properties.sort()` during render, with no UI to change it — it overrode the pgvector ranking by accident. |
| Home footer links | `href="#"` | plain text | Avoid shipping tap targets that go nowhere. |
| Admin listing photos | per-card camera button | managed on the edit screen | One place instead of two. |
| Dashboard "Download Schedule" | link with no handler | omitted | Dead control on the web. |

### To run

```bash
# terminal 1 — API
pnpm dev            # from repo root

# terminal 2 — app
cd mobile
npx expo start
```

Then set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your machine's **LAN IP** (a physical
device cannot reach `localhost`). Android emulator: `http://10.0.2.2:3000`.

Seed logins from `db_prompt.sql`: `adam@prompt.construct` / `password123` (client),
`admin@prompt.construct` / `password123` (admin).

---

## 7. Pre-existing bugs

### Fixed

1. **~~Broken admin verify.~~ FIXED.** `app/api/applications/verify/route.ts` and
   `app/api/milestones/route.ts` were `INSERT`ing into `property_milestones` using columns
   `description`, `cost`, `image_url` — **none of which exist** in the schema — and passing
   `payment_status='pending'`, which violates the table's own
   `CHECK (payment_status IN ('paid','due','unpaid'))`. Both routes threw on every call, so
   admin "Verify" was dead. Both now insert `amount` / `photos` and use valid
   `payment_status` values (`due` / `unpaid`). This unblocked end-to-end payment testing.

2. **~~Embeddings wiped on every init.~~ FIXED.** The migration in `lib/db.ts` dropped and
   recreated `properties.embedding` unconditionally, destroying all vectors whenever
   `/api/init` ran. It now gates on the actual column type
   (`format_type(...) = 'vector(768)'`) and otherwise uses
   `ADD COLUMN IF NOT EXISTS embedding vector(3072)`, so it is idempotent.

### Still open — flagged, not fixed

3. **Plaintext passwords.** Stored at `app/api/auth/signup/route.ts:41`, compared at
   `app/api/auth/login/route.ts:39`. `bcryptjs` is a dependency but unused.

4. **No auth on any API route.** Including `/api/users` (`PUT`/`DELETE`) and
   `/api/applications/verify`. `useAuthGuard` hides admin screens in the app, but that is
   client-side only — anyone can still call the endpoints directly.

5. **`payment_transactions`** is created inside `app/api/payment/initialize/route.ts:35`
   rather than in `lib/db.ts`, so the schema has two sources of truth.

6. **Blocking first search.** `GET /api/properties` generates missing Gemini embeddings
   *inline on the search request*, with 4s sleeps between batches — a cold first search
   blocks for many seconds. Belongs in a background job or explicit endpoint.

---

## 8. Remaining work

### ~~Admin screens~~ done

All five are implemented and wired into the drawer:

| Web | Route | Endpoints used |
|---|---|---|
| `app/admin/listings` | `src/app/admin/listings/index.tsx` | `getProperties` |
| `app/admin/listings/new` | `src/app/admin/listings/new.tsx` | `createProperty`, `uploadFile` |
| `app/admin/listings/[id]/edit` | `src/app/admin/listings/[id]/edit.tsx` | `getProperty`, `updateMilestones`, `uploadFile` |
| `app/admin/users` | `src/app/admin/users.tsx` | `getUsers`, `getApplications`, `verifyApplication` |
| `app/admin/reports` | `src/app/admin/reports.tsx` | `getProperties`, `getApplications`, `getPayments`, `verifyApplication` |

Role gating is in two layers: `_layout.tsx` derives `isAdmin` from the auth store and hides
the opposite role's drawer items, and every admin screen calls
`useAuthGuard('admin')` so a client deep-linking in gets redirected to their own landing
route. `expo-image-picker` handles the uploads (bundled in Expo Go).

### Then

1. **On-device run** on a real handset. Nothing has been exercised on a simulator or
   device yet, so the native `@expo/ui` controls, the drawer gestures, and the Paychangu
   deep-link return are all unverified at runtime.
2. **Supabase cutover**: create the env file, run `GET /api/init` once, point
   `EXPO_PUBLIC_API_URL` at the deployment, add a tunnel or public URL for Paychangu
   callbacks.
3. **Bugs #3 and #4** (above) — ideally by adopting Supabase Auth + Storage, which would
   replace the plaintext-password auth and the `public/uploads` directory outright.

### Open questions

1. Supabase Auth + Storage too, or hosted Postgres only? (Plan assumes Postgres only.)
2. `PAYMENT_SIMULATION=true` — `env.template.md` documents it but
   `payment/initialize` never reads it. Wire it up, or drop the flag?
3. The web login page's "Remember me" checkbox is non-functional; it was carried over as-is
   rather than silently implementing session lengthening. Keep or wire up?
`POST /api/upload`), and the role-gated drawer entries. `AppDrawerContent` already has an
`admin` branch ready.

### Then

- **Fix bugs #1 and #2** (§7) before end-to-end testing.
- **On-device run** on a real handset, and decide whether `PAYMENT_SIMULATION` is honoured
  by the payment routes — `env.template.md` documents it but `payment/initialize` does not
  currently read it.
- **Supabase cutover**: create the env file, run `GET /api/init` once, point
  `EXPO_PUBLIC_API_URL` at the deployment, add a tunnel or public URL for Paychangu
  callbacks.
- **Decide on Supabase Auth/Storage** — the plan assumes hosted Postgres over the `pg`
  driver only. Adopting Supabase Auth + Storage would replace the plaintext-password auth
  and the `public/uploads` directory, and would fix bugs #3 and #4 properly.

### Open questions

1. Supabase Auth + Storage too, or hosted Postgres only? (Plan assumes Postgres only.)
2. `PAYMENT_SIMULATION=true` — `env.template.md` documents it but
   `payment/initialize` never reads it. Wire it up, or drop the flag?