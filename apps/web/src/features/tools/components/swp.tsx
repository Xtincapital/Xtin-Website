import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
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

const SWPCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [swpMode, setSwpMode] = useState("duration"); // "duration" or "balance"
  const [principal, setPrincipal] = useMoneyState("swp.principal", "10,00,000");
  const [withdrawal, setWithdrawal] = useMoneyState("swp.withdrawal", "5,000");
  const [annualRate, setAnnualRate] = usePersistedState("swp.rate", "8");
  const [tenure, setTenure] = usePersistedState("swp.tenure", "10");
  const [summary, setSummary] = useState("");
  const [chartData, setChartData] = useState([]);

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ principal: "", withdrawal: "", tenure: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const formatNumber = (value) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? "0" : num.toLocaleString(numLocale);
  };

  const calculateSWP = () => {
    const corpusValue = parseFloat(principal.replace(/,/g, ""));
    const withdrawalValue = parseFloat(withdrawal.replace(/,/g, ""));
    const rateValue = parseFloat(annualRate);
    const tenureValue = parseFloat(tenure);

    const balances = [];
    let summaryText = "";

    if (swpMode === "duration") {
      let months = 0;
      let balance = corpusValue;
      const monthlyRate = Math.pow(1 + rateValue / 100, 1 / 12) - 1;
      balances.push({ month: 0, balance: balance });

      while (balance > 0 && months < 600 && withdrawalValue > 0) {
        balance = balance * (1 + monthlyRate) - withdrawalValue;
        months++;
        if (months % 12 === 0 || balance <= 0) {
          balances.push({
            month: months,
            balance: balance > 0 ? balance : 0,
          });
        }
      }
      if (months % 12 !== 0 && balance > 0) {
        balances.push({ month: months, balance: balance > 0 ? balance : 0 });
      }

      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      // The loop stops at 600 months; if money is still left then, returns
      // cover the withdrawals and the corpus never runs out.
      summaryText = balance > 0
        ? `Your investment of <b>${sym}${formatNumber(
            corpusValue
          )}</b> will <b>never run out</b> if you withdraw <b>${sym}${formatNumber(
            withdrawalValue
          )}</b> each month — your returns cover the withdrawals and the corpus keeps growing.`
        : `Your investment of <b>${sym}${formatNumber(
            corpusValue
          )}</b> will last for approximately <b>${years} ${years === 1 ? "year" : "years"}${
            remMonths > 0 ? " " + remMonths + (remMonths === 1 ? " month" : " months") : ""
          }</b> if you plan to withdraw <b>${sym}${formatNumber(
            withdrawalValue
          )}</b> each month.`;
    } else {
      const months = tenureValue * 12;
      let balance = corpusValue;
      const monthlyRate = Math.pow(1 + rateValue / 100, 1 / 12) - 1;
      balances.push({ month: 0, balance: balance });

      for (let i = 1; i <= months; i++) {
        balance = balance * (1 + monthlyRate) - withdrawalValue;
        if (i % 12 === 0) {
          balances.push({ month: i, balance: balance > 0 ? balance : 0 });
        }
      }
      if (months % 12 !== 0) {
        balances.push({ month: months, balance: balance > 0 ? balance : 0 });
      }

      summaryText = `After <b>${tenureValue} years</b> of withdrawing <b>${sym}${formatNumber(
        withdrawalValue
      )}</b> per month, your remaining balance will be <b>${sym}${formatNumber(
        Math.max(0, Math.round(balance))
      )}</b>.`;
    }

    setChartData(
      balances.map((item) => ({
        year: Math.round((item.month / 12) * 10) / 10,
        value: Math.round(item.balance),
      }))
    );
    setSummary(summaryText);
    setSnap({ principal, withdrawal, tenure });
  };

  useCalcSession("swp", calculateSWP, chartData.length > 0);

  // Guests get a few free calculations (lib/guestGate.ts). useCalcSession keeps the
  // ungated function: its automatic re-runs must not use up a try.
  const { gate } = useGuestGate();
  const onCalculate = gate(calculateSWP);
  const formProps = useCalcForm(onCalculate);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            SWP Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-brand-soft text-brand rounded-full shadow hover:bg-brand-soft transition"
            >
               What is SWP?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed amount of money from your investments at regular intervals.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-6">
                <div className="flex justify-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="swpMode"
                      value="duration"
                      checked={swpMode === "duration"}
                      onChange={(e) => setSwpMode(e.target.value)}
                      className="form-radio h-4 w-4 text-brand"
                    />
                    <span className="ml-2 text-gray-700">Find Duration</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="swpMode"
                      value="balance"
                      checked={swpMode === "balance"}
                      onChange={(e) => setSwpMode(e.target.value)}
                      className="form-radio h-4 w-4 text-brand"
                    />
                    <span className="ml-2 text-gray-700">Find Balance</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="swp-total-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="swp-total-investment"
                    type="text"
                    value={principal}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setPrincipal(num === "" ? "" : num.toLocaleString(numLocale));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="swp-monthly-withdrawal" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Withdrawal
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="swp-monthly-withdrawal"
                    type="text"
                    value={withdrawal}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setWithdrawal(num === "" ? "" : num.toLocaleString(numLocale));
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="swp-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="swp-expected-annual-return-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              {swpMode === "balance" && (
                <div className="mb-6">
                  <label htmlFor="swp-withdrawal-period" className="block text-sm font-medium text-gray-700 mb-1">
                    Withdrawal Period (Years)
                  </label>
                  <input
                    id="swp-withdrawal-period"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}
              <button
                onClick={onCalculate}
                className="w-full py-3 bg-brand-fill hover:bg-brand-hover text-white rounded-lg font-semibold transition-colors"
              >
                Calculate SWP
              </button>
              {summary && (
                <div
                  className="mt-8 bg-brand-soft p-6 rounded-lg text-center"
                  dangerouslySetInnerHTML={{ __html: summary }}
                ></div>
              )}
            </div>

            {/* Graph Section */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="xt-section">
                  Investment Value Over Time
                </h2>
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
                <ResponsiveContainer width="100%" height={400}>
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
                      <Tooltip {...chartTooltip}
                        formatter={(value) => [
                          `${sym}${formatNumber(value)}`,
                          "Balance",
                        ]}
                      />
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
                            name: "Principal",
                            value: parseFloat(snap.principal.replace(/,/g, "")),
                          },
                          {
                            name: "Total Withdrawal",
                            value:
                              parseFloat(snap.withdrawal.replace(/,/g, "")) *
                              parseFloat(snap.tenure) *
                              12,
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

export default SWPCalculator;