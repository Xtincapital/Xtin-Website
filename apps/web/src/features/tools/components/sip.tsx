import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { moneyTooltip } from "../lib/format";
import { piePercentLabel, pieLegend } from "../lib/pieParts";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import SEO, { generateToolData } from "../../../components/SEO";
import useRegion from "../../../hooks/useRegion";
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

const SIPCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [monthlyInvestment, setMonthlyInvestment] = useMoneyState("sip.monthly", "5,000");
  const [annualRate, setAnnualRate] = usePersistedState("invest.rate", "12");
  const [years, setYears] = usePersistedState("invest.years", "10");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  // Snapshot of the inputs used for the last calculation, so the result panel
  // and pie do not change until Calculate is pressed again.
  const [invested, setInvested] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const structuredData = generateToolData({
    name: 'SIP Calculator',
    description: 'Calculate Systematic Investment Plan (SIP) returns with our free SIP calculator. Estimate future value of monthly investments in mutual funds.'
  });

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment.replace(/,/g, ""));
    const annualRateValue = parseFloat(annualRate) / 100;
    const yearsValue = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    let problem = "";
    if (!(P > 0)) problem = "Monthly investment must be greater than 0.";
    else if (!(annualRateValue >= 0)) problem = "Expected return can't be negative.";
    else if (!(yearsValue > 0)) problem = "Investment period must be greater than 0 years.";
    else problem = limitProblem({ amount: P, rate: annualRateValue, years: yearsValue });
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && annualRateValue >= 0 && yearsValue > 0) {
      // Monthly rate = annual rate / 12 — the standard SIP formula used by
      // Groww, ET Money and AMFI calculators, so results match what users see
      // elsewhere. FV = P × [((1 + r)^n − 1) / r] × (1 + r).
      const r = annualRateValue / 12;
      const n = yearsValue * 12;
      // At 0% the formula divides by zero; the value is just what was paid in.
      const fv = (months: number) => (r === 0 ? P * months : P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r));

      const M = fv(n);
      setFutureValue(
        M.toLocaleString(numLocale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [{ year: 0, value: 0 }];
      for (let i = 1; i <= yearsValue; i++) {
        const value = fv(i * 12);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setInvested(P * yearsValue * 12);
    }
  };

  useCalcSession("sip", calculateSIP, !!futureValue);

  const formProps = useCalcForm(calculateSIP);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO
        title="SIP Calculator - Calculate Systematic Investment Plan Returns"
        description="Free SIP calculator to estimate returns on your monthly mutual fund investments. Calculate future value, total invested amount, and wealth gained with different SIP amounts and durations."
        keywords="SIP calculator, systematic investment plan calculator, mutual fund SIP, monthly investment calculator, SIP returns, mutual fund calculator India"
        canonicalUrl="/tools/sip"
        structuredData={structuredData}
      />
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            <div className="flex items-center justify-center space-x-4 font-sans tracking-normal">
              <Link
                to="/tools/sip"
                replace
                className="px-6 py-2 text-lg font-semibold text-white bg-green-700 rounded-full shadow-md"
              >
                SIP
              </Link>
              <Link
                to="/tools/lumpsum"
                replace
                className="px-6 py-2 text-lg font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                Lumpsum
              </Link>
            </div>
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is SIP?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                A Systematic Investment Plan (SIP) is a way to invest a fixed amount of money in mutual funds at regular intervals.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="sip-monthly-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="sip-monthly-investment"
                    type="text"
                    value={monthlyInvestment}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setMonthlyInvestment(
                          num === "" ? "" : num.toLocaleString(numLocale)
                        );
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="sip-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="sip-expected-annual-return-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <div className="mt-4">
                  {(() => {
                    const rate = parseFloat(annualRate);
                    if (rate < 8) {
                      return (
                        <div className="w-1/2 mx-auto bg-green-100 text-green-700 p-2 text-center rounded-full" role="alert">
                          <p className="font-bold">Conservative</p>
                        </div>
                      );
                    } else if (rate >= 8 && rate <= 12) {
                      return (
                        <div className="w-1/2 mx-auto bg-yellow-100 text-yellow-700 p-2 text-center rounded-full" role="alert">
                          <p className="font-bold">Moderately</p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-1/2 mx-auto bg-red-100 text-red-700 p-2 text-center rounded-full" role="alert">
                          <p className="font-bold">Aggressive</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="sip-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="sip-investment-period"
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
                onClick={calculateSIP}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate SIP
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Total Investment:{" "}
                    <span className="font-semibold">
                      {sym}{invested.toLocaleString(numLocale)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) - invested
                      ).toLocaleString(numLocale, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}
                    </span>
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
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType("pie")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      chartType === "pie"
                        ? "bg-green-600 text-white"
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
                        dataKey="year"
                        {...X_AXIS_PROPS}
                        label={{
                          value: "Years",
                          position: "insideBottom",
                          dy: 10,
                        }}
                      />
                      <YAxis {...Y_AXIS_PROPS} />
                      <Tooltip {...chartTooltip} formatter={moneyTooltip} labelFormatter={(y) => `Year ${y}`} />
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
                            name: "Total Investment",
                            value: invested,
                          },
                          {
                            name: "Total Interest",
                            value: parseFloat(futureValue.replace(/,/g, "")) - invested,
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

export default SIPCalculator;