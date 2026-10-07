/**
 * Display name shown in the header, drawer and splash.
 *
 * Kept in one place because `app.json`'s `name` governs the launcher label while
 * this governs in-app chrome — the two are configured separately and would
 * otherwise drift.
 */
export const APP_NAME = 'PromptConstruct';

/** Emoji tile used as the logo mark, in place of the web app's Lucide `HardHat`. */
export const APP_LOGO = '🏗️';