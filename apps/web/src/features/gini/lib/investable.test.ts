import { describe, expect, it } from "vitest";
import { investableAssets } from "./investable";

describe("investableAssets", () => {
  it("leaves out the home and insurance, keeps everything else", () => {
    expect(
      investableAssets([
        { category: "Real Estate", value: 5_000_000 },
        { category: "Insurance", value: 300_000 },
        { category: "Stocks", value: 500_000 },
        { category: "Mutual Funds", value: 250_000 },
        { category: null, value: 10_000 },
      ]),
    ).toBe(760_000);
  });
});
