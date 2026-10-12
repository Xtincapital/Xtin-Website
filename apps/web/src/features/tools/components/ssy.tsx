import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS_INR as Y_AXIS_PROPS } from "../lib/calcForm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SSYCalculator = () => {
  const [yearlyInvestment, setYearlyInvestment] = useState("100000");
  const [girlAge, setGirlAge] = useState("5");
  const [interestRate, setInterestRate] = useState("8.2");
  const [startYear, setStartYear] = useState<number | string>(new Date().getFullYear());
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ yearlyInvestment: "", startYear: "" });
  const [showInfo, setShowInfo] = useState(false);

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

  const calculateSSY = () => {
    const P = parseFloat(yearlyInvestment);
    const girl_age = parseInt(girlAge);
    const start_year = parseInt(String(startYear));
    const r = parseFloat(interestRate) / 100;
    let total_value = 0;
    const data = [];

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    const valid = P > 0 && girl_age > 0 && start_year > 0;
    const problem = valid ? limitProblem({ amount: P, rate: r }) : "Yearly investment, girl's age and start year must all be greater than 0.";
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (P > 0 && girl_age > 0 && start_year > 0) {
      for (let i = 0; i < 21; i++) {
        const current_year = start_year + i;
        const current_age = girl_age + i;
        if (i < 15) {
          total_value += P;
        }
        total_value = total_value * (1 + r);
        data.push({ year: current_year, value: Number(total_value.toFixed(2)), age: current_age });
      }
      setFutureValue(total_value.toFixed(2));
      setChartData(data);
      setSnap({ yearlyInvestment, startYear });
    }
  };

  const formProps = useCalcForm(calculateSSY);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            Sukanya Samriddhi Yojana (SSY) Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is SSY?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Sukanya Samriddhi Yojana (SSY) is a small savings scheme for the girl child launched as a part of the 'Beti Bachao Beti Padhao' campaign. It comes with a higher interest rate and tax benefits.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="ssy-yearly-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                  <input
                    id="ssy-yearly-investment"
                    type="text"
                    value={formatNumber(yearlyInvestment)}
                    onChange={handleInputChange(setYearlyInvestment)}
                    className="w-full p-3 border rounded-lg pl-8"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="ssy-girl-s-current-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Girl's Current Age
                </label>
                <input
                  id="ssy-girl-s-current-age"
                  type="number"
                  value={girlAge}
                  onChange={handleInputChange(setGirlAge)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="ssy-interest-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (% p.a.)
                </label>
                <input
                  id="ssy-interest-rate"
                  type="number"
                  value={interestRate}
                  onChange={handleInputChange(setInterestRate)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="ssy-starting-year-of-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Year of Investment
                </label>
                <input
                  id="ssy-starting-year-of-investment"
                  type="number"
                  value={startYear}
                  onChange={handleInputChange(setStartYear)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              {error && (
                <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={calculateSSY}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate SSY
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg text-center">
                  <p className="text-lg font-medium text-gray-800">
                    Investments of <span className="font-bold text-green-700">₹{formatNumber(snap.yearlyInvestment)}</span> each year should be made for 15 years.
                  </p>
                  <p className="mt-4 text-xl font-bold text-gray-800">
                    The maturity amount received at the end of year <span className="text-green-700">{parseInt(String(snap.startYear)) + 21}</span> will be <span className="text-green-700">₹{formatNumber(futureValue)}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Graph Section */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Growth Over Time</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={CHART_MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      label={{ value: "Year", position: "insideBottom", dy: 10 }}
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

export default SSYCalculator;