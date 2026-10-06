// After a deploy, the previous build's page files are gone. Someone who still has
// the old version open gets "Failed to fetch dynamically imported module" the next
// time they open a page they hadn't loaded yet. Reloading picks up the new version,
// so do that once instead of showing the error screen.

const RELOAD_KEY = "xtin:stale-chunk-reload-at";
const MIN_GAP_MS = 30_000; // never reload in a loop if the file is genuinely unreachable

const STALE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return STALE_CHUNK.test(message);
}

/** Reloads the page unless it already did so in the last 30 seconds. Returns whether it reloaded. */
export function reloadForNewVersion(now = Date.now(), reload = () => window.location.reload()): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (now - last < MIN_GAP_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Storage blocked: still reload once; the browser keeps us from looping on the same page load.
  }
  reload();
  return true;
}

/** Vite fires `vite:preloadError` when a lazy page's file can't be loaded. */
export function installStaleChunkReload() {
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadForNewVersion()) event.preventDefault();
  });
}
