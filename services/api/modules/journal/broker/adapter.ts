// Chooses the broker adapter and whether sync may run at all.
//
// Sync is off until XTS_SYNC_ENABLED=true, and even then it needs an adapter:
//   - XTS_ADAPTER=xts  the real XTS adapter (xts/); also needs its keys and address in the environment
//   - XTS_ADAPTER=mock sample executions, outside production only, for trying the pipeline
// Anything else means no adapter, so nothing can pull (or invent) trades.
import { createMockAdapter } from "./mockAdapter.js";
import { getXtsAdapter } from "./xts/index.js";
import type { BrokerAdapter } from "./types.js";

export const brokerSyncEnabled = (): boolean => process.env.XTS_SYNC_ENABLED === "true";

export function getBrokerAdapter(): BrokerAdapter | null {
    if (process.env.XTS_ADAPTER === "mock" && process.env.NODE_ENV !== "production") return createMockAdapter();
    if (process.env.XTS_ADAPTER === "xts") return getXtsAdapter();
    return null;
}

/** True when a sync can actually run: switched on, and there is an adapter to run it with. */
export const brokerSyncAvailable = (): boolean => brokerSyncEnabled() && getBrokerAdapter() !== null;
