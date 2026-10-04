import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import { pieValueLabel, moneyTooltip } from "../lib/format";
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

const SimpleInterestCalculator = () => {
  const { symbol: sym } = useRegion();
  const [principal, setPrincipal] = useState("10000");
  const [annualRate, setAnnualRate] = useState("10");
  const [years, setYears] = useState("5");
  const [futureValue, setFutureValue] = useState<string | null>(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ principal: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [isPieChart, setIsPieChart] = useState(false);

  const formatNumber = (num) => {
    if (num === null || isNaN(num)) return "0";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/,/g, "");
    setter(value);
  };

  const calculateSimpleInterest = () => {
    const P = parseFloat(principal);
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
      const A = P * (1 + annualRateValue * yearsValue);
      setFutureValue(A.toFixed(2));

      const data = [];
      for (let i = 0; i <= yearsValue; i++) {
        const value = P * (1 + annualRateValue * i);
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setSnap({ principal });
    }
  };

  const formProps = useCalcForm(calculateSimpleInterest);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            Simple Interest Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is Simple Interest?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Simple interest is a quick and easy method of calculating the interest charge on a loan. Simple interest is determined by multiplying the daily interest rate by the principal by the number of days that elapse between payments.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="simple-interest-principal-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount
                </label>
                <input
                  id="simple-interest-principal-amount"
                  type="text"
                  value={formatNumber(principal)}
                  onChange={handleInputChange(setPrincipal)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="simple-interest-annual-interest-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Interest Rate (%)
                </label>
                <input
                  id="simple-interest-annual-interest-rate"
                  type="number"
                  value={annualRate}
                  onChange={handleInputChange(setAnnualRate)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="simple-interest-time-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period (Years)
                </label>
                <input
                  id="simple-interest-time-period"
                  type="number"
                  value={years}
                  onChange={handleInputChange(setYears)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              {error && (
                <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={calculateSimpleInterest}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Simple Interest
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{formatNumber(futureValue)}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Principal Amount:{" "}
                    <span className="font-semibold">{sym}{formatNumber(snap.principal)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">{sym}{formatNumber((Number(futureValue) - Number(snap.principal)).toFixed(2))}</span>
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
                        data={[
                          {
                            name: "Principal Amount",
                            value: parseFloat(snap.principal),
                          },
                          {
                            name: "Total Interest",
                            value: parseFloat(
                              (Number(futureValue) - Number(snap.principal)).toFixed(2)
                            ),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={pieValueLabel}
                      >
                        <Cell key="cell-0" fill="#16a34a" />
                        <Cell key="cell-1" fill="#f97316" />
                      </Pie>
                      <Tooltip formatter={moneyTooltip} />
                      <Legend />
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

export default SimpleInterestCalculator;