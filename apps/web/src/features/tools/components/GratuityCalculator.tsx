import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
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

const GratuityCalculator = () => {
  const [monthlySalary, setMonthlySalary] = useState("50,000");
  const [years, setYears] = useState("10");
  const [gratuity, setGratuity] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("line");

  const calculateGratuity = () => {
    const salary = parseFloat(monthlySalary.replace(/,/g, ""));
    const serviceYears = parseFloat(years);

    if (salary > 0 && serviceYears > 0) {
      const gratuityAmount = (salary * 15 * serviceYears) / 26;
      setGratuity(
        gratuityAmount.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );

      const data = [];
      for (let i = 0; i <= serviceYears; i++) {
        const value = (salary * 15 * i) / 26;
        data.push({ year: i, value: value.toFixed(2) });
      }
      setChartData(data);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            Gratuity Calculator
          </h1>
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
              What is Gratuity?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Gratuity is a lump sum amount paid by an employer to an employee
                as a token of appreciation for their services. It is a component
                of an employee's gross salary and is typically paid upon
                retirement, resignation, or death, provided the employee has
                completed a minimum of five years of continuous service.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Drawn Monthly Salary (Basic + DA)
                </label>
                <input
                  type="text"
                  value={monthlySalary}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (value === "" || /^[0-9\b]+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      setMonthlySalary(num === "" ? "" : num.toLocaleString("en-IN"));
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Service
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <button
                onClick={calculateGratuity}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate Gratuity
              </button>

              {gratuity && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-xl font-medium">
                    Gratuity Amount:{" "}
                    <span className="text-green-700 text-2xl">
                      ₹{gratuity}
                    </span>
                  </p>
                </div>
              )}
            </div>
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
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
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
                            name: "Gratuity Amount",
                            value: parseFloat(gratuity.replace(/,/g, "")),
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
                      </Pie>
                      <Tooltip />
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
      <Footer />
    </div>
  );
};

export default GratuityCalculator;