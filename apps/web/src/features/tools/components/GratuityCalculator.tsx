import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS_INR as Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
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

const GratuityCalculator = () => {
  const [monthlySalary, setMonthlySalary] = useState("50,000");
  const [years, setYears] = useState("10");
  const [gratuity, setGratuity] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  const calculateGratuity = () => {
    const salary = parseFloat(monthlySalary.replace(/,/g, ""));
    const serviceYears = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = salary > 0 && serviceYears > 0;
    const problem = valid ? limitProblem({ amount: salary, years: serviceYears }) : "Salary and years of service must be greater than 0.";
    setError(problem);
    if (problem) {
      setGratuity(null);
      setChartData([]);
      return;
    }

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
        data.push({ year: i, value: Number(value.toFixed(2)) });
      }
      setChartData(data);
    }
  };

  const formProps = useCalcForm(calculateGratuity);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
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
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="gratuity-last-drawn-monthly-salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Drawn Monthly Salary (Basic + DA)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                  <input
                    id="gratuity-last-drawn-monthly-salary"
                    type="text"
                    value={monthlySalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setMonthlySalary(num === "" ? "" : num.toLocaleString("en-IN"));
                      }
                    }}
                    className="w-full p-3 border rounded-lg pl-8"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="gratuity-years-of-service" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Service
                </label>
                <input
                  id="gratuity-years-of-service"
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
                <h2 className="xt-section">Growth Over Time</h2>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
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