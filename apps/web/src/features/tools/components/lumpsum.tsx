import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useCalcForm, CHART_MARGIN, Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import { moneyTooltip } from "../lib/format";
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
} from "recharts";

const LumpsumCalculator = () => {
  const { symbol: sym } = useRegion();
  const [principal, setPrincipal] = useState("100,000");
  const [annualRate, setAnnualRate] = useState("12");
  const [years, setYears] = useState("10");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  // Principal used for the last calculation (results stay put until Calculate is pressed again).
  const [invested, setInvested] = useState(0);
  const [period, setPeriod] = useState("yearly");
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const calculateLumpsum = () => {
    const P = parseFloat(principal.replace(/,/g, ""));
    const annualRateValue = parseFloat(annualRate) / 100;
    const yearsValue = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && annualRateValue > 0 && yearsValue > 0;
    setError(valid ? "" : "Amount, rate and period must all be greater than 0.");
    if (!valid) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && annualRateValue > 0 && yearsValue > 0) {
      let A;
      if (period === "monthly") {
        // Monthly compounding of the nominal annual rate (r/12 per month)
        A = P * Math.pow(1 + annualRateValue / 12, yearsValue * 12);
      } else {
        A = P * Math.pow(1 + annualRateValue, yearsValue);
      }
      setFutureValue(
        A.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 0; i <= yearsValue; i++) {
        let value;
        if (period === "monthly") {
          value = P * Math.pow(1 + annualRateValue / 12, i * 12);
        } else {
          value = P * Math.pow(1 + annualRateValue, i);
        }
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
      setInvested(P);
    }
  };

  const formProps = useCalcForm(calculateLumpsum);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/tools/sip"
                className="px-6 py-2 text-lg font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                SIP
              </Link>
              <Link
                to="/tools/lumpsum"
                className="px-6 py-2 text-lg font-semibold text-white bg-green-700 rounded-full shadow-md"
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
               What is a Lumpsum Investment?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                A lumpsum investment is a one-time investment of a large sum of money.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="lumpsum-total-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Investment
                </label>
                <input
                  id="lumpsum-total-investment"
                  type="text"
                  value={principal}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (value === "" || /^[0-9\b]+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      setPrincipal(num === "" ? "" : num.toLocaleString("en-IN"));
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lumpsum-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="lumpsum-expected-annual-return-rate"
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
                <label htmlFor="lumpsum-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="lumpsum-investment-period"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculation Period
                </label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="yearly"
                    name="calculationPeriod"
                    value="yearly"
                    checked={period === "yearly"}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="yearly" className="text-gray-700">
                    Yearly
                  </label>
                  <input
                    type="radio"
                    id="monthly"
                    name="calculationPeriod"
                    value="monthly"
                    checked={period === "monthly"}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="ml-4 mr-2"
                  />
                  <label htmlFor="monthly" className="text-gray-700">
                    Monthly
                  </label>
                </div>
              </div>
              {error && (
                <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={calculateLumpsum}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Lumpsum
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">{sym}{futureValue}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Total Investment:{" "}
                    <span className="font-semibold">{sym}{invested.toLocaleString("en-IN")}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) - invested
                      ).toLocaleString("en-IN", {
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
                <ResponsiveContainer width="100%" height={450}>
                  {chartType === "line" ? (
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
                  ) : (
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Total Investment",
                            value: invested,
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) - invested,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        <Cell key="cell-0" fill="#16a34a" />
                        <Cell key="cell-1" fill="#f97316" />
                      </Pie>
                      <Tooltip formatter={moneyTooltip} />
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

export default LumpsumCalculator;