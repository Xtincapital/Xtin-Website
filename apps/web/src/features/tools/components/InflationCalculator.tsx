import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartGrid, chartTooltip, chartColors } from "@/components/charts/chartTheme";

const InflationCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [currentAmount, setCurrentAmount] = useMoneyState("inflation.amount", "1,00,000");
  const [inflationRate, setInflationRate] = usePersistedState("inflation.rate", "6");
  const [years, setYears] = usePersistedState("inflation.years", "10");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ currentAmount: "", years: "" });
  const [showInfo, setShowInfo] = useState(false);

  const calculateInflation = () => {
    const P = parseFloat(currentAmount.replace(/,/g, ""));
    const r = parseFloat(inflationRate) / 100;
    const n = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && r > 0 && n > 0;
    const problem = valid ? limitProblem({ amount: P, rate: r, years: n }) : "Amount, rate and period must all be greater than 0.";
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && r > 0 && n > 0) {
      const M = P * Math.pow(1 + r, n);
      setFutureValue(
        M.toLocaleString(numLocale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 0; i <= n; i++) {
        const value = P * Math.pow(1 + r, i);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setSnap({ currentAmount, years });
    }
  };

  useCalcSession("inflation", calculateInflation, !!futureValue);

  const formProps = useCalcForm(calculateInflation);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            Inflation Calculator
          </h1>
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is Inflation?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power of currency is falling. This calculator shows you how much a certain amount of money will be worth in the future, given a certain inflation rate.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="inflation-current-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Amount ({sym})
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="inflation-current-amount"
                    type="text"
                    value={currentAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setCurrentAmount(num === "" ? "" : num.toLocaleString(numLocale));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="inflation-annual-inflation-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Inflation Rate (%)
                </label>
                <input
                  id="inflation-annual-inflation-rate"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="inflation-number-of-years" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Years
                </label>
                <input
                  id="inflation-number-of-years"
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
                onClick={calculateInflation}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Future Value
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value (with inflation): <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                   <p className="mt-3 text-sm text-gray-600">
                    This means that in {snap.years} snap.years, you will need {sym}{futureValue} to buy what {sym}{snap.currentAmount} buys today.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="xt-section mb-6">Value Over Time</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={CHART_MARGIN}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis
                      dataKey="year" {...X_AXIS_PROPS}
                      label={{ value: "Years", position: "insideBottom", dy: 10 }}
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
      <Footer />
    </div>
  );
};

export default InflationCalculator;