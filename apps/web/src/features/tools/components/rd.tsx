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

const RDCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [monthlyInvestment, setMonthlyInvestment] = useMoneyState("rd.monthly", "2,000");
  const [annualRate, setAnnualRate] = usePersistedState("rd.rate", "6");
  const [years, setYears] = usePersistedState("rd.years", "5");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ monthlyInvestment: "", years: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [isPieChart, setIsPieChart] = useState(false);
  const calculateRD = () => {
    const P = parseFloat(monthlyInvestment.replace(/,/g, ""));
    const annualRateValue = parseFloat(annualRate) / 100;
    const yearsValue = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && annualRateValue > 0 && yearsValue > 0;
    const problem = valid ? limitProblem({ amount: P, rate: annualRateValue, years: yearsValue }) : "Amount, rate and period must all be greater than 0.";
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && annualRateValue > 0 && yearsValue > 0) {
      // Indian banks compound RDs quarterly: maturity of monthly instalments R
      // over m months = R * ((1 + i)^(m/3) - 1) / (1 - (1 + i)^(-1/3)), i = rate / 4.
      const q = annualRateValue / 4;
      const maturity = (months: number) =>
        (P * (Math.pow(1 + q, months / 3) - 1)) / (1 - Math.pow(1 + q, -1 / 3));
      const M = maturity(yearsValue * 12);

      setFutureValue(
        M.toLocaleString(numLocale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 0; i <= yearsValue; i++) {
        const value = maturity(i * 12);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setSnap({ monthlyInvestment, years });
    }
  };

  useCalcSession("rd", calculateRD, !!futureValue);

  const formProps = useCalcForm(calculateRD);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            RD Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
              What is a Recurring Deposit (RD)?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                A Recurring Deposit (RD) is a special kind of term deposit offered by banks in India which help people with regular incomes to deposit a fixed amount every month into their Recurring Deposit account and earn interest at the rate applicable to Fixed Deposits.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="rd-monthly-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="rd-monthly-investment"
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
                <label htmlFor="rd-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="rd-expected-annual-return-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="rd-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="rd-investment-period"
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
                onClick={calculateRD}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate RD
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Total Investment:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(snap.monthlyInvestment.replace(/,/g, "")) *
                        parseFloat(snap.years) *
                        12
                      ).toLocaleString(numLocale)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) -
                        parseFloat(snap.monthlyInvestment.replace(/,/g, "")) *
                          parseFloat(snap.years) *
                          12
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
                <button
                  onClick={() => setIsPieChart(!isPieChart)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  {isPieChart ? "Show Line Chart" : "Show Pie Chart"}
                </button>
              </div>
              {chartData.length > 0 ? (
                isPieChart ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        isAnimationActive={false}
                        label={piePercentLabel}
                        labelLine={false}
                        data={[
                          {
                            name: "Total Investment",
                            value:
                              parseFloat(snap.monthlyInvestment.replace(/,/g, "")) *
                              parseFloat(snap.years) *
                              12,
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) -
                              parseFloat(snap.monthlyInvestment.replace(/,/g, "")) *
                                parseFloat(snap.years) *
                                12,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill={chartColors.series[2]}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill={chartColors.positive} />
                        <Cell key="cell-1" fill={chartColors.series[4]} />
                      </Pie>
                      <Legend content={pieLegend} />
                      <Tooltip {...chartTooltip} formatter={moneyTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
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
                  </ResponsiveContainer>
                )
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

export default RDCalculator;