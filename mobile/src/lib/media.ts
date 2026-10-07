import { API_BASE_URL } from './config';

/**
 * The database stores uploaded media as a root-relative path (`/uploads/foo.jpg`),
 * which the web app resolves against its own origin via `next/image`. A device has
 * no such origin, so every path has to be absolutised against the API base URL or
 * the image request 404s.
 */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Placeholder used when a property has no `image_url`, matching the web fallback. */
export const PROPERTY_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';