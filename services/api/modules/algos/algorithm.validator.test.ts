import { describe, it, expect } from "vitest";
import { validateAlgoOrder } from "./algorithm.validator.js";

const order = (algo_name: string) => validateAlgoOrder({ algo_name, tradingview_username: "trader", phone_number: "9876543210" });

describe("validateAlgoOrder", () => {
    it.each(["AurumV", "Bird Eye", "Gamma", "Z1"])("accepts %s", (name) => {
        expect(order(name).errors).toBeUndefined();
    });

    it("no longer sells the retired names", () => {
        for (const name of ["XTIN Alpha 1.0", "XTIN ALPHA V1", "XTIN GammaV1", "XTIN Z1", "Bird Eye 1", "Bird Eye 2"]) {
            expect(order(name).errors).toBeDefined();
        }
    });
});
