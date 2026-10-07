import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["**/*.test.ts"],
        exclude: ["node_modules", "data"],
        // Placeholder Supabase settings (they win over .env, which dotenv never
        // overrides): modules that create the client on import load fine, as
        // they must in CI, and no test can ever reach the live database.
        env: {
            SUPABASE_URL: "http://supabase.test.invalid",
            SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
            SUPABASE_ANON_KEY: "test-anon-key",
        },
    },
});
