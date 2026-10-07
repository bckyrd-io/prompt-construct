#!/usr/bin/env node
/**
 * Writes `mobile/.env` with this machine's current LAN IP.
 *
 * Why this exists: the API base URL is inlined into the bundle at build time, and
 * a development machine's IP changes whenever Wi-Fi reconnects or a cable is
 * unplugged. A stale value is the single most confusing failure here — the app
 * loads fine and every request just fails, with no obvious cause.
 *
 * Usage:
 *   node scripts/set-api-url.mjs              # detect and write
 *   node scripts/set-api-url.mjs 10.0.0.5    # override with a specific IP
 *
 * Then restart Expo with `npx expo start -c` so the bundle is rebuilt.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, '..', '.env');
const PORT = process.env.API_PORT || '3000';

/** Interfaces that can never reach a phone. */
const IGNORED = /virtualbox|vmware|loopback|tailscale|zerotier|wsl|bluetooth/i;

function detectIp() {
  const override = process.argv[2];
  if (override) return override;

  if (process.platform === 'win32') {
    const raw = execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        'Get-NetIPAddress -AddressFamily IPv4 | ' +
          'Where-Object { $_.AddressState -eq "Preferred" } | ' +
          'Select-Object -ExpandProperty IPAddress',
      ],
      { encoding: 'utf8' },
    );
    const candidates = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((ip) => /^\d+\.\d+\.\d+\.\d+$/.test(ip))
      .filter((ip) => !ip.startsWith('127.'))
      .filter((ip) => !ip.startsWith('169.254.'));

    // Prefer the RFC1918 ranges a phone would share, then take the first.
    const privateRanges = /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./;
    return (
      candidates.find((ip) => privateRanges.test(ip) && !ip.startsWith('192.168.56.')) ??
      candidates.find((ip) => privateRanges.test(ip)) ??
      candidates[0]
    );
  }

  const raw = execFileSync('ip', ['-4', 'route', 'get', '1.1.1.1'], { encoding: 'utf8' });
  const match = raw.match(/src\s+(\d+\.\d+\.\d+\.\d+)/);
  if (!match) throw new Error('Could not determine a LAN IP. Pass one explicitly.');
  return match[1];
}

const ip = detectIp();
if (!ip) {
  console.error('No usable LAN IP found. Run: node scripts/set-api-url.mjs <ip>');
  process.exit(1);
}

const url = `http://${ip}:${PORT}`;

if (existsSync(envPath)) {
  const current = readFileSync(envPath, 'utf8');
  const next = current.replace(/^EXPO_PUBLIC_API_URL=.*$/m, `EXPO_PUBLIC_API_URL=${url}`);
  writeFileSync(envPath, next, 'utf8');
  console.log(
    current.includes(`EXPO_PUBLIC_API_URL=${url}`)
      ? `Already set to ${url}`
      : `Updated .env -> ${url}`,
  );
} else {
  writeFileSync(envPath, `EXPO_PUBLIC_API_URL=${url}\n`, 'utf8');
  console.log(`Created .env -> ${url}`);
}

console.log('Restart Expo with: npx expo start -c');