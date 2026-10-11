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

const CompoundInterestCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [principal, setPrincipal] = useMoneyState("compound.principal", "10,000");
  const [annualRate, setAnnualRate] = usePersistedState("compound.rate", "10");
  const [years, setYears] = usePersistedState("compound.years", "5");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ principal: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [compoundingFrequency, setCompoundingFrequency] = useState("yearly");
  const [isPieChart, setIsPieChart] = useState(false);

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal.replace(/,/g, ""));
    const r = parseFloat(annualRate) / 100;
    const t = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && r > 0 && t > 0;
    const problem = valid ? limitProblem({ amount: P, rate: r, years: t }) : "Amount, rate and period must all be greater than 0.";
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && r > 0 && t > 0) {
      let n;
      switch (compoundingFrequency) {
        case "monthly":
          n = 12;
          break;
        case "quarterly":
          n = 4;
          break;
        case "half-yearly":
          n = 2;
          break;
        default:
          n = 1;
      }

      const A = P * Math.pow(1 + r / n, n * t);
      setFutureValue(
        A.toLocaleString(numLocale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 0; i <= t; i++) {
        const value = P * Math.pow(1 + r / n, n * i);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setSnap({ principal });
    }
  };

  useCalcSession("compound", calculateCompoundInterest, !!futureValue);

  const formProps = useCalcForm(calculateCompoundInterest);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            Compound Interest Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is Compound Interest?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="compound-interest-principal-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount
                </label>
                <input
                  id="compound-interest-principal-amount"
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
              <div className="mb-4">
                <label htmlFor="compound-interest-annual-interest-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Interest Rate (%)
                </label>
                <input
                  id="compound-interest-annual-interest-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="compound-interest-time-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period (Years)
                </label>
                <input
                  id="compound-interest-time-period"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="compound-interest-compounding-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Compounding Frequency
                </label>
                <select
                  id="compound-interest-compounding-frequency"
                  value={compoundingFrequency}
                  onChange={(e) => setCompoundingFrequency(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="yearly">Yearly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {error && (
                <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={calculateCompoundInterest}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Compound Interest
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Principal Amount:{" "}
                    <span className="font-semibold">{sym}{snap.principal}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) -
                        parseFloat(snap.principal.replace(/,/g, ""))
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
                <h2 className="text-2xl font-semibold">Growth Over Time</h2>
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
                            name: "Principal Amount",
                            value: parseFloat(snap.principal.replace(/,/g, "")),
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) -
                              parseFloat(snap.principal.replace(/,/g, "")),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#16a34a" />
                        <Cell key="cell-1" fill="#f97316" />
                      </Pie>
                      <Legend content={pieLegend} />
                      <Tooltip formatter={moneyTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year" {...X_AXIS_PROPS}
                        label={{
                          value: "Years",
                          position: "insideBottom",
                          dy: 10,
                        }}
                      />
                      <YAxis {...Y_AXIS_PROPS} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#16a34a"
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

export default CompoundInterestCalculator;