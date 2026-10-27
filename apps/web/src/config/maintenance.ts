/**
 * Maintenance & Feature Gate Configuration
 * 
 * Toggle any feature to `true` to display a branded "Coming Soon / Under Upgrades"
 * page to public visitors while preserving all data, components, and backend logic.
 * 
 * When you are ready to make a feature public again, change its flag to `false`.
 * 
 * DEVELOPER ACCESS:
 * You can bypass this gate and view the live feature on any device by:
 * 1. Adding `?preview=true` or `?dev=true` to the URL.
 * 2. Clicking the discreet "Developer Access" button on the Coming Soon page.
 * 3. In local development (`import.meta.env.DEV`), developer preview can also be toggled anytime.
 */

export const MAINTENANCE_CONFIG = {
  // Set to true to gate public access while you make changes
  fundakamental: true,
  backtest: true,
} as const;

export type MaintenanceFeature = keyof typeof MAINTENANCE_CONFIG;

const PREVIEW_STORAGE_KEY = 'xtin_dev_preview_mode';

/**
 * Checks whether developer preview mode is currently active.
 */
export const isPreviewActive = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const urlPreview = params.get('preview') || params.get('dev');
    if (urlPreview === 'true' || urlPreview === 'xtin' || urlPreview === '1') {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
      return true;
    }

    return sessionStorage.getItem(PREVIEW_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Sets or clears developer preview mode in session storage.
 */
export const setPreviewMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};
