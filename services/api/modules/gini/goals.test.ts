// Goal `details` (category answers, migration 0018): validated, and a goal
// still saves if the column hasn't been added to the database yet.
import { describe, it, expect, vi, beforeEach } from "vitest";

const inserts: Record<string, unknown>[] = [];
let missingColumn = false;
const builder: any = {
    insert(row: Record<string, unknown>) {
        inserts.push(row);
        return builder;
    },
    select() {
        const fail = missingColumn && "details" in inserts[inserts.length - 1];
        return Promise.resolve(fail ? { data: null, error: { code: "PGRST204", message: "Could not find the 'details' column of 'gini_goals'" } } : { data: [inserts[inserts.length - 1]], error: null });
    },
};
vi.mock("../../supabase/index.js", () => ({ default: { from: () => builder } }));

const { insertGoal } = await import("./goals.repository.js");
const { validateGoalCreate } = await import("./goals.validator.js");

const goal = { name: "Aarav's degree", current_cost: 1_200_000, details: { mode: "guided", answers: { level: "Undergraduate degree", duration: "3" } } };

beforeEach(() => {
    inserts.length = 0;
    missingColumn = false;
});

describe("goal details", () => {
    it("accepts category answers", () => {
        expect(validateGoalCreate(goal).errors).toBeUndefined();
        expect(validateGoalCreate({ ...goal, details: null }).errors).toBeUndefined();
    });

    it("rejects malformed details", () => {
        expect(validateGoalCreate({ ...goal, details: { mode: "auto" } }).errors).toBeDefined();
        expect(validateGoalCreate({ ...goal, details: { mode: "guided", answers: { a: 5 } } }).errors).toBeDefined();
    });

    it("saves details when the column exists", async () => {
        const { error } = await insertGoal(goal);
        expect(error).toBeNull();
        expect(inserts).toHaveLength(1);
    });

    it("still saves the goal, without details, before migration 0018 has run", async () => {
        missingColumn = true;
        const { data, error } = await insertGoal(goal);
        expect(error).toBeNull();
        expect(inserts).toHaveLength(2);
        expect(data[0]).not.toHaveProperty("details");
        expect(data[0]).toMatchObject({ name: "Aarav's degree" });
    });
});
