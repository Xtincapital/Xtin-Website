import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import { useGuestGate } from "../../../lib/guestGate";
import { moneyTooltip } from "../lib/format";
import { piePercentLabel, pieLegend } from "../lib/pieParts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { chartGrid, chartTooltip, chartColors } from "@/components/charts/chartTheme";

const CAGRCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [initialValue, setInitialValue] = useMoneyState("cagr.initial", "10,000");
  const [finalValue, setFinalValue] = useMoneyState("cagr.final", "20,000");
  const [years, setYears] = usePersistedState("cagr.years", "5");
  const [cagr, setCagr] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ initialValue: "", finalValue: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const calculateCAGR = () => {
    const P = parseFloat(initialValue.replace(/,/g, ""));
    const F = parseFloat(finalValue.replace(/,/g, ""));
    const N = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && F > 0 && N > 0;
    const problem = valid ? limitProblem({ amount: Math.max(P, F), years: N }) : "Initial value, final value and years must all be greater than 0.";
    setError(problem);
    if (problem) {
      setCagr(null);
      setChartData([]);
      return;
    }

    if (P > 0 && F > 0 && N > 0) {
      const result = (Math.pow(F / P, 1 / N) - 1) * 100;
      setCagr(result.toFixed(2));

      const data = [];
      for (let i = 0; i <= N; i++) {
        const value = P * Math.pow(1 + result / 100, i);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setSnap({ initialValue, finalValue });
    }
  };

  useCalcSession("cagr", calculateCAGR, cagr !== null);

  // Guests get a few free calculations (lib/guestGate.ts). useCalcSession keeps the
  // ungated function: its automatic re-runs must not use up a try.
  const { gate } = useGuestGate();
  const onCalculate = gate(calculateCAGR);
  const formProps = useCalcForm(onCalculate);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            CAGR Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-brand-soft text-brand rounded-full shadow hover:bg-brand-soft transition"
            >
              What is CAGR?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                CAGR (Compound Annual Growth Rate) is the rate at which an
                investment grows annually over a period of time, assuming profits
                are reinvested at the end of each period.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="cagr-initial-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="cagr-initial-investment"
                    type="text"
                    value={initialValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setInitialValue(num === "" ? "" : num.toLocaleString(numLocale));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="cagr-final-value" className="block text-sm font-medium text-gray-700 mb-1">
                  Final Value
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="cagr-final-value"
                    type="text"
                    value={finalValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setFinalValue(num === "" ? "" : num.toLocaleString(numLocale));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="cagr-years" className="block text-sm font-medium text-gray-700 mb-1">
                  Years
                </label>
                <input
                  id="cagr-years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              {error && (
                <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={onCalculate}
                className="w-full bg-brand-fill hover:bg-brand-hover text-white py-3 rounded-lg transition"
              >
                Calculate CAGR
              </button>

              {cagr && (
                <div className="mt-8 bg-brand-soft p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     CAGR: <span className="text-brand">{cagr}%</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Initial Investment:{" "}
                    <span className="font-semibold">{sym}{snap.initialValue}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Final Value:{" "}
                    <span className="font-semibold">{sym}{snap.finalValue}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Graph Section */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="xt-section">Growth Over Time</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartType("line")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      chartType === "line"
                        ? "bg-brand-fill text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType("pie")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      chartType === "pie"
                        ? "bg-brand-fill text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Pie
                  </button>
                </div>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  {chartType === "line" ? (
                    <LineChart data={chartData} margin={CHART_MARGIN}>
                      <CartesianGrid {...chartGrid} />
                      <XAxis
                        dataKey="year" {...X_AXIS_PROPS}
                        label={{
                          value: "Years",
                          position: "insideBottom",
                          dy: 10,
                        }}
                      />
                      <YAxis {...Y_AXIS_PROPS} />
                      <Tooltip {...chartTooltip} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={chartColors.positive}
                        strokeWidth={3}
                        dot
                      />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie
                        isAnimationActive={false}
                        label={piePercentLabel}
                        data={[
                          {
                            name: "Initial Investment",
                            value: parseFloat(snap.initialValue.replace(/,/g, "")),
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(snap.finalValue.replace(/,/g, "")) -
                              parseFloat(snap.initialValue.replace(/,/g, "")),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill={chartColors.series[2]}
                        dataKey="value"
                        nameKey="name"
                      >
                        <Cell key="cell-0" fill={chartColors.positive} />
                        <Cell key="cell-1" fill={chartColors.series[4]} />
                      </Pie>
                      <Legend content={pieLegend} />
                      <Tooltip {...chartTooltip} formatter={moneyTooltip} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">
                  Enter details and calculate to see the graph.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CAGRCalculator;
