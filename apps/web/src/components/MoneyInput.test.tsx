// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CurrencyContext } from "@/contexts/CurrencyContext";
import MoneyInput from "./MoneyInput";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// 1 USD = 100 INR, to keep the arithmetic obvious.
const ctx = (currency: string) =>
  ({
    currency,
    inrToDisplay: (n: number) => (currency === "INR" ? n : n / 100),
    displayToInr: (n: number) => (currency === "INR" ? n : n * 100),
  }) as any;

let root: Root | null = null;
let container: HTMLDivElement;
let saved = "";
let setCurrency: (c: string) => void = () => {};

function Harness({ initial }: { initial: string }) {
  const [currency, setC] = useState("USD");
  const [value, setValue] = useState(initial);
  setCurrency = setC;
  saved = value;
  return (
    <CurrencyContext.Provider value={ctx(currency)}>
      <MoneyInput aria-label="amount" value={value} onChange={(e) => setValue(e.target.value)} />
    </CurrencyContext.Provider>
  );
}

const input = () => container.querySelector("input") as HTMLInputElement;
function type(text: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input(), text);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function render(initial: string) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(<Harness initial={initial} />));
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
});

describe("MoneyInput", () => {
  it("shows a rupee amount in the selected currency", () => {
    render("250000");
    expect(input().value).toBe("2,500");
  });

  it("saves what the user types back in rupees", () => {
    render("250000");
    type("3000");
    expect(saved).toBe("300000");
    expect(input().value).toBe("3,000"); // grouped, but the typed number is kept
  });

  it("never changes an amount the user didn't touch when the currency changes", () => {
    render("123457");
    act(() => setCurrency("INR"));
    expect(input().value).toBe("1,23,457");
    act(() => setCurrency("USD"));
    expect(input().value).toBe("1,234.57");
    expect(saved).toBe("123457");
  });

  it("keeps an empty box empty", () => {
    render("");
    expect(input().value).toBe("");
    type("");
    expect(saved).toBe("");
  });
});
