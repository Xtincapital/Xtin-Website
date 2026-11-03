// Connection settings for the broker's XTS Interactive API, read from the
// environment. Nothing here is a secret default: keys come only from env, and
// an incomplete set means "no adapter" rather than a half-configured one.

export interface XtsConfig {
    /**
     * Base URL of the Interactive API including its path prefix (for example
     * https://host/interactive). Not needed when host lookup is configured, since the
     * lookup returns it as `connectionString`.
     */
    baseUrl: string | null;
    appKey: string;
    secretKey: string;
    /** Optional first step that asks Symphony's host-lookup endpoint where this broker's instance lives. */
    hostLookup: { url: string; accessPassword: string; version: string } | null;
}

const clean = (v: string | undefined) => (v ?? "").trim();

/** The config from `env`, or null when the keys or the address are missing. */
export function readXtsConfig(env: NodeJS.ProcessEnv = process.env): XtsConfig | null {
    const appKey = clean(env.XTS_APP_KEY);
    const secretKey = clean(env.XTS_SECRET_KEY);
    const baseUrl = clean(env.XTS_BASE_URL).replace(/\/+$/, "") || null;
    const lookupUrl = clean(env.XTS_HOSTLOOKUP_URL);
    const accessPassword = clean(env.XTS_ACCESS_PASSWORD);

    const hostLookup = lookupUrl && accessPassword ? { url: lookupUrl, accessPassword, version: clean(env.XTS_API_VERSION) || "interactive_1.0.1" } : null;
    if (!appKey || !secretKey || (!baseUrl && !hostLookup)) return null;
    return { baseUrl, appKey, secretKey, hostLookup };
}
