import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
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

const StepUpSIPCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [monthlyInvestment, setMonthlyInvestment] = useMoneyState("stepup.monthly", "5,000");
  const [annualIncrease, setAnnualIncrease] = usePersistedState("stepup.increase", "10");
  const [annualRate, setAnnualRate] = usePersistedState("stepup.rate", "12");
  const [years, setYears] = usePersistedState("stepup.years", "10");
  const [futureValue, setFutureValue] = useState(null);
  const [totalInvestment, setTotalInvestment] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const calculateStepUpSIP = () => {
    let P = parseFloat(monthlyInvestment.replace(/,/g, ""));
    const annual_increase_percentage = parseFloat(annualIncrease) / 100;
    const annualRateValue = parseFloat(annualRate) / 100;
    // Monthly rate = annual rate / 12, the standard SIP convention (matches sip.tsx)
    const r = annualRateValue / 12;
    const t = parseFloat(years);
    let total_value = 0;
    const data: { year: number; value: number }[] = [{ year: 0, value: 0 }];
    let investment = 0;
 
     // Clear the old result so it is never shown next to inputs it wasn't computed from.
     const valid = P > 0 && annual_increase_percentage >= 0 && r > 0 && t > 0;
     const problem = valid ? limitProblem({ amount: P, rate: annualRateValue, years: t }) : "Amount, return rate and period must be greater than 0, and the step-up can't be negative.";
     setError(problem);
     if (problem) {
       setFutureValue(null);
       setTotalInvestment(null);
       setChartData([]);
       return;
     }

     if (P > 0 && annual_increase_percentage >= 0 && r > 0 && t > 0) {
       for (let i = 1; i <= t; i++) {
         for (let j = 1; j <= 12; j++) {
           // Instalment at the start of each month (same convention as the SIP calculator).
           total_value = (total_value + P) * (1 + r);
           investment += P;
         }
         P = P * (1 + annual_increase_percentage);
         data.push({ year: i, value: Number(total_value.toFixed(2)) });
       }
       setFutureValue(
         total_value.toLocaleString(numLocale, {
           maximumFractionDigits: 2,
           minimumFractionDigits: 2,
         })
       );
       setTotalInvestment(
         investment.toLocaleString(numLocale, {
           maximumFractionDigits: 2,
           minimumFractionDigits: 2,
         })
       );
       setChartData(data);
     }
  };

  useCalcSession("stepup", calculateStepUpSIP, !!futureValue);

  const formProps = useCalcForm(calculateStepUpSIP);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            Step-up SIP Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is a Step-up SIP?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                A Step-up SIP, or a top-up SIP, allows you to increase your SIP amount annually by a fixed percentage.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="step-up-sip-monthly-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="step-up-sip-monthly-investment"
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
                <label htmlFor="step-up-sip-annual-increase" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Increase (%)
                </label>
                <input
                  id="step-up-sip-annual-increase"
                  type="number"
                  value={annualIncrease}
                  onChange={(e) => setAnnualIncrease(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="step-up-sip-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="step-up-sip-expected-annual-return-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="step-up-sip-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="step-up-sip-investment-period"
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
                onClick={calculateStepUpSIP}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Step-up SIP
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                 <p className="mt-3 text-sm text-gray-600">
                   Total Investment:{" "}
                   <span className="font-semibold">{sym}{totalInvestment}</span>
                 </p>
                 <p className="text-sm text-gray-600">
                   Total Interest:{" "}
                   <span className="font-semibold">
                     {sym}
                     {(
                       parseFloat(futureValue.replace(/,/g, "")) -
                       parseFloat(totalInvestment.replace(/,/g, ""))
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
                            name: "Total Investment",
                            value: parseFloat(totalInvestment.replace(/,/g, "")),
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) -
                              parseFloat(totalInvestment.replace(/,/g, "")),
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

export default StepUpSIPCalculator;