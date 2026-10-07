/**
 * Where the API lives.
 *
 * `EXPO_PUBLIC_API_URL` is inlined into the bundle at build time, so this is a
 * static value and changing it requires restarting the dev server.
 *
 * Use your machine's LAN IP, not `localhost` — a physical device cannot reach
 * your laptop's loopback interface. The Android emulator can, via 10.0.2.2.
 */

function normalise(url: string): string {
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL = normalise(
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:3000',
);

/** Matches the web `md:` breakpoint (768px) used by the collapsible sidebar. */
export const DESKTOP_BREAKPOINT = 768;