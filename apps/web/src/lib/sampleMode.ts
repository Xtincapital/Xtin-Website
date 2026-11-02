// Sample-data preview mode, shared by Journal and Gini.
//
// Restores the standalone apps' "Load Sample Data" button (see
// features-incoming/journal/app.js `loadSampleDataById()` and
// features-incoming/gini/app.js `sampleData.load()`). Like the originals,
// sample data is preview-only: it lives in memory (mirrored to
// sessionStorage so it survives a reload in the same tab) and is NEVER sent
// to the backend.
//
// How it plugs in: each feature's `lib/api.ts` wraps its CRUD modules with
// `withSampleMode()`, so while sample mode is on every read and write is
// served from the in-memory dataset instead of the API. Pages don't know the
// difference. The feature's app shell subscribes to the store and clears its
// react-query cache + remounts its routes whenever the mode flips, so every
// page refetches from the right source.
import { useSyncExternalStore } from 'react';
import { GuestBlockedError, isGuest, requestSignIn } from './guestGate';

export interface SampleModeState<T> {
  active: boolean;
  datasetId: string | null;
  data: T | null;
  /** Bumped on every enter/exit — app shells key their routes on it. */
  version: number;
}

export interface SampleModeStore<T> {
  getState: () => SampleModeState<T>;
  isActive: () => boolean;
  /** The current sample dataset. Only call while `isActive()`. */
  data: () => T;
  enter: (datasetId: string, data: T) => void;
  exit: () => void;
  /** Apply an edit made while previewing. Persisted for this tab session only. */
  update: (mutate: (data: T) => void) => void;
  subscribe: (listener: () => void) => () => void;
  useState: () => SampleModeState<T>;
}

export function createSampleModeStore<T>(storageKey: string): SampleModeStore<T> {
  const inactive: SampleModeState<T> = { active: false, datasetId: null, data: null, version: 0 };

  const read = (): SampleModeState<T> => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) {
          return { active: true, datasetId: parsed.datasetId ?? null, data: parsed.data, version: 0 };
        }
      }
    } catch {
      // Storage unavailable or corrupt — start outside sample mode.
    }
    return inactive;
  };

  let state = read();
  const listeners = new Set<() => void>();

  const persist = () => {
    try {
      if (state.active) {
        sessionStorage.setItem(storageKey, JSON.stringify({ datasetId: state.datasetId, data: state.data }));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Storage unavailable — sample mode still works for this page load.
    }
  };

  const emit = () => listeners.forEach((listener) => listener());

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getState = () => state;

  return {
    getState,
    isActive: () => state.active,
    data: () => state.data as T,
    enter: (datasetId, data) => {
      state = { active: true, datasetId, data, version: state.version + 1 };
      persist();
      emit();
    },
    exit: () => {
      state = { active: false, datasetId: null, data: null, version: state.version + 1 };
      persist();
      emit();
    },
    update: (mutate) => {
      if (!state.active || !state.data) return;
      mutate(state.data);
      persist();
    },
    subscribe,
    useState: () => useSyncExternalStore(subscribe, getState),
  };
}

type AsyncMethods = Record<string, (...args: any[]) => Promise<any>>;

/** Methods that change data. Every API module here names them create…/update…/delete…/clear…. */
const WRITE_METHOD = /^(create|update|delete|clear)/;

/** Route every method of an API module to its sample implementation while
 *  sample mode is on, and to the real API otherwise.
 *
 *  A signed-out visitor is exploring demo data, so the first attempt to change
 *  it opens the sign-in modal instead (lib/guestGate.ts). */
export function withSampleMode<M extends AsyncMethods>(store: SampleModeStore<unknown>, real: M, sample: M): M {
  const wrapped = {} as M;
  (Object.keys(real) as (keyof M)[]).forEach((key) => {
    wrapped[key] = ((...args: any[]) => {
      if (WRITE_METHOD.test(String(key)) && isGuest()) {
        requestSignIn('save');
        return Promise.reject(new GuestBlockedError('save'));
      }
      return store.isActive() ? sample[key](...args) : real[key](...args);
    }) as M[keyof M];
  });
  return wrapped;
}

interface SampleRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const SAMPLE_USER_ID = 'sample-user';

const nowIso = () => new Date().toISOString();

let idCounter = 0;
export const sampleId = (prefix: string) => `sample-${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** In-memory list/get/create/update/delete over one collection of a sample
 *  dataset — the shape every Journal/Gini CRUD module needs. */
export function sampleCrud<D, Row extends SampleRow>(
  store: SampleModeStore<D>,
  pick: (data: D) => Row[],
  prefix: string,
) {
  const find = (id: string) => {
    const row = pick(store.data()).find((r) => r.id === id);
    if (!row) throw new Error('Not found');
    return row;
  };

  return {
    list: async (): Promise<Row[]> => pick(store.data()).map((r) => ({ ...r })),
    get: async (id: string): Promise<Row> => ({ ...find(id) }),
    create: async (input: Partial<Row>): Promise<Row> => {
      const stamp = nowIso();
      const row = { ...input, id: sampleId(prefix), user_id: SAMPLE_USER_ID, created_at: stamp, updated_at: stamp } as Row;
      store.update((data) => {
        pick(data).unshift(row);
      });
      return { ...row };
    },
    update: async (id: string, input: Partial<Row>): Promise<Row> => {
      let updated = find(id);
      store.update((data) => {
        const rows = pick(data);
        const index = rows.findIndex((r) => r.id === id);
        updated = { ...rows[index], ...input, id, updated_at: nowIso() };
        rows[index] = updated;
      });
      return { ...updated };
    },
    remove: async (id: string): Promise<{ success: boolean; message: string }> => {
      find(id);
      store.update((data) => {
        const rows = pick(data);
        rows.splice(rows.findIndex((r) => r.id === id), 1);
      });
      return { success: true, message: 'Deleted (sample data — not saved)' };
    },
  };
}
