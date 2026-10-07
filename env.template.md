# Environment Variables Template

This file documents every environment variable the API needs. Copy the section you
need into a real env file — the repo ignores all `.env*` files, so credentials are
never committed.

There are two supported setups, and `lib/db.ts` supports both with no code changes:

| | Offline development | Hosted (Supabase) |
|---|---|---|
| Env file | `.env.local` | `.env.supabase` |
| Database | local Postgres, discrete `POSTGRES_*` vars | `DATABASE_URL` connection string |
| SSL | off by default | on by default |

`DATABASE_URL` always wins when it is present. All SQL in this project is plain
Postgres (including the pgvector `<=>` cosine operator), so moving to Supabase only
means swapping the connection string.

---

## 1. Offline / local Postgres (`.env.local`)

```env
# Local Postgres — discrete variables
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=db_prompt_construct
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Set to false for a local socket; defaults to off unless DATABASE_URL is set
POSTGRES_SSL=false

# Google Gemini AI (for RAG embeddings)
GEMINI_API_KEY=your_gemini_api_key_here

# Paychangu Payment Integration
PAYCHANGU_SECRET_KEY=your_secret_key_here

# Optional: Enable simulation mode for testing (no real API calls)
PAYMENT_SIMULATION=true
```

## 2. Supabase (`.env.supabase`)

```env
# Supabase Project Settings -> Database -> Connection string -> URI
# Use the "Session pooler" (port 5432) for migrations and the
# "Transaction pooler" (port 6543) for the running app.
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres

# Set to false only if your host terminates TLS elsewhere
POSTGRES_SSL=true

GEMINI_API_KEY=your_gemini_api_key_here
PAYCHANGU_SECRET_KEY=your_secret_key_here
PAYMENT_SIMULATION=false
```

Then start the API against Supabase by pointing it at that file, e.g.

```bash
# PowerShell
$env:DATABASE_URL = "postgresql://..."
pnpm dev
```

### Notes for Supabase

- **pgvector** is available on Supabase Postgres. `CREATE EXTENSION IF NOT EXISTS vector`
  in `lib/db.ts` is a no-op once the extension exists.
- **`vector(3072)`** works, but Supabase's pgvector only supports HNSW/IVFFlat indexes up
  to 2000 dimensions. The current queries do a sequential scan, which is fine for the
  current data volume. If you later need an index, drop the embedding to 2000 dims or
  keep scanning.
- **The schema** is created by `lib/db.ts` (`initDatabase`, exposed at `GET /api/init`),
  not by Supabase migrations. Run `GET /api/init` once against Supabase before first use.
- **Payment callbacks** must be publicly reachable. Locally that needs a tunnel (ngrok or
  Cloudflare Tunnel) pointed at `/api/payment/callback`; Paychangu cannot reach
  `localhost`.

---

## 3. Mobile app (`.env`)

The Expo app lives in `mobile/` and is configured independently of the database:

```env
# mobile/.env
# Use your machine's LAN IP — a physical device cannot reach localhost.
# Android emulator: http://10.0.2.2:3000
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
```

`EXPO_PUBLIC_*` values are inlined into the bundle at build time. Restart the dev server
after changing them. When you point the API at Supabase, this URL just becomes the
Supabase deployment URL — no other mobile change needed.

---

## Getting Your Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it as the value for `GEMINI_API_KEY`

The Gemini free tier includes:
- 15 requests per minute for embedding models
- No ongoing costs for MVP usage
- Perfect for property search with semantic understanding

## Getting Your Paychangu Credentials

1. Sign up at https://paychangu.com
2. Navigate to Developer/API section in your dashboard
3. Copy your Secret Key
4. Paste it as the value for `PAYCHANGU_SECRET_KEY`

## Simulation Mode

When `PAYMENT_SIMULATION=true`, the payment flow will be simulated without making real API calls. This is useful for:
- Development without live credentials
- Testing the UI flow
- CI/CD pipelines

Remove or set to `false` to use live Paychangu API.