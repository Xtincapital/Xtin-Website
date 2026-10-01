import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { moneyTooltip } from "../lib/format";
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
} from "recharts";

const SIPCalculator = () => {
  const { symbol: sym } = useRegion();
  const [monthlyInvestment, setMonthlyInvestment] = useState("5,000");
  const [annualRate, setAnnualRate] = useState("12");
  const [years, setYears] = useState("10");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const structuredData = generateToolData({
    name: 'SIP Calculator',
    description: 'Calculate Systematic Investment Plan (SIP) returns with our free SIP calculator. Estimate future value of monthly investments in mutual funds.'
  });

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment.replace(/,/g, ""));
    const annualRateValue = parseFloat(annualRate) / 100;
    const yearsValue = parseFloat(years);

    if (P > 0 && annualRateValue > 0 && yearsValue > 0) {
      // Monthly rate = annual rate / 12 — the standard SIP formula used by
      // Groww, ET Money and AMFI calculators, so results match what users see
      // elsewhere. FV = P × [((1 + r)^n − 1) / r] × (1 + r).
      const r = annualRateValue / 12;
      const n = yearsValue * 12;

      const M = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      setFutureValue(
        M.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 1; i <= yearsValue; i++) {
        const n_i = i * 12;
        const value = P * ((Math.pow(1 + r, n_i) - 1) / r) * (1 + r);
        data.push({ year: i, value: value.toFixed(2) });
      }
      setChartData(data);
    }
  };

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/tools/sip"
                className="px-6 py-2 text-lg font-semibold text-white bg-green-700 rounded-full shadow-md"
              >
                SIP
              </Link>
              <Link
                to="/tools/lumpsum"
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
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Investment
                </label>
                <input
                  type="text"
                  value={monthlyInvestment}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (value === "" || /^[0-9\b]+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      setMonthlyInvestment(
                        num === "" ? "" : num.toLocaleString("en-IN")
                      );
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
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
                      {sym}
                      {(
                        parseFloat(monthlyInvestment.replace(/,/g, "")) *
                        parseFloat(years) *
                        12
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      {sym}
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) -
                        parseFloat(monthlyInvestment.replace(/,/g, "")) *
                          parseFloat(years) *
                          12
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
                <ResponsiveContainer width="100%" height={320}>
                  {chartType === "line" ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="year"
                        label={{
                          value: "Years",
                          position: "insideBottom",
                          dy: 10,
                        }}
                      />
                      <YAxis
                        width={100}
                        label={{
                          value: "",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
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
                            value:
                              parseFloat(monthlyInvestment.replace(/,/g, "")) *
                              parseFloat(years) *
                              12,
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) -
                              parseFloat(monthlyInvestment.replace(/,/g, "")) *
                                parseFloat(years) *
                                12,
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

export default SIPCalculator;