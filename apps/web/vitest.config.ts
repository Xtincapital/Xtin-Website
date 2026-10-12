import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
        // CI has no .env, and the Supabase client throws on an empty URL the
        // moment anything imports it. Tests never reach the network, so any
        // well-formed values will do.
        env: {
            VITE_SUPABASE_URL: "http://localhost:54321",
            VITE_SUPABASE_ANON_KEY: "test-anon-key",
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
