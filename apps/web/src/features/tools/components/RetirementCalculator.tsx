import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
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
} from "recharts";

const RetirementCalculator = () => {
  const { symbol: sym } = useRegion();
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("60");
  const [lifeExpectancy, setLifeExpectancy] = useState("80");
  const [monthlyExpenses, setMonthlyExpenses] = useState("50000");
  const [currentSavings, setCurrentSavings] = useState("500000");
  const [expectedReturn, setExpectedReturn] = useState("10");
  const [inflationRate, setInflationRate] = useState("6");

  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value.replace(/,/g, "");
    setter(value);
  };

  const calculateRetirement = () => {
    const ca = parseFloat(currentAge);
    const ra = parseFloat(retirementAge);
    const le = parseFloat(lifeExpectancy);
    const me = parseFloat(monthlyExpenses);
    const cs = parseFloat(currentSavings);
    const er = parseFloat(expectedReturn) / 100;
    const ir = parseFloat(inflationRate) / 100;

    if (ca > 0 && ra > 0 && le > 0 && me > 0 && cs > 0 && er > 0 && ir > 0) {
      const yearsToRetirement = ra - ca;
      const postRetirementYears = le - ra;

      // Inflation-adjusted monthly expenses at retirement
      const inflationAdjustedMonthlyExpenses = me * Math.pow(1 + ir, yearsToRetirement);

      // Required retirement corpus
      const realReturnRate = (1 + er) / (1 + ir) - 1;
      const requiredCorpus =
        (inflationAdjustedMonthlyExpenses *
          12 *
          (1 - Math.pow(1 + realReturnRate, -postRetirementYears))) /
        realReturnRate;

      // Future value of current savings
      const futureValueOfCurrentSavings = cs * Math.pow(1 + er, yearsToRetirement);

      // Corpus to be accumulated
      const corpusToBeAccumulated = requiredCorpus - futureValueOfCurrentSavings;

      // Required monthly investment (SIP)
      // Use proper compounding conversion for monthly rate
      const monthlyReturnRate = Math.pow(1 + er, 1/12) - 1;
      const numberOfMonths = yearsToRetirement * 12;
      const requiredMonthlyInvestment =
        (corpusToBeAccumulated * monthlyReturnRate) /
        (Math.pow(1 + monthlyReturnRate, numberOfMonths) - 1);

      setResults({
        inflationAdjustedMonthlyExpenses: inflationAdjustedMonthlyExpenses.toFixed(0),
        requiredCorpus: requiredCorpus.toFixed(0),
        futureValueOfCurrentSavings: futureValueOfCurrentSavings.toFixed(0),
        requiredMonthlyInvestment: requiredMonthlyInvestment.toFixed(0),
        yearsToRetirement,
      });

      // Chart data
      const data = [];
      for (let i = 1; i <= yearsToRetirement; i++) {
        const age = ca + i;
        const n_i = i * 12;
        const futureValueLumpsum = cs * Math.pow(1 + er, i);
        const futureValueSip =
          requiredMonthlyInvestment *
          ((Math.pow(1 + monthlyReturnRate, n_i) - 1) / monthlyReturnRate);
        const totalValue = futureValueLumpsum + futureValueSip;
        data.push({ year: age, value: totalValue.toFixed(0) });
      }
      setChartData(data);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            Retirement Calculator
          </h1>
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
              What is Retirement Planning?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                Retirement planning is the process of setting retirement income
                goals and the decisions necessary to achieve those goals. It
                includes identifying sources of income, estimating expenses,
                implementing a savings program, and managing assets and risk.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Age
                </label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={handleInputChange(setCurrentAge)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={handleInputChange(setRetirementAge)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Life Expectancy
                </label>
                <input
                  type="number"
                  value={lifeExpectancy}
                  onChange={handleInputChange(setLifeExpectancy)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Monthly Expenses
                </label>
                <input
                  type="text"
                  value={formatNumber(monthlyExpenses)}
                  onChange={handleInputChange(setMonthlyExpenses)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Retirement Savings
                </label>
                <input
                  type="text"
                  value={formatNumber(currentSavings)}
                  onChange={handleInputChange(setCurrentSavings)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return (p.a.) (%)
                </label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={handleInputChange(setExpectedReturn)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inflation Rate (p.a.) (%)
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={handleInputChange(setInflationRate)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <button
                onClick={calculateRetirement}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-4"
              >
                Calculate
              </button>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6">
              {results ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-6 text-center">
                    Projected Growth
                  </h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="year"
                          label={{
                            value: "",
                            position: "insideBottom",
                            dy: 10,
                          }}
                        />
                        <YAxis
                          width={100}
                          tickFormatter={(tick) => formatNumber(tick)}
                          label={{
                            value: "",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value) => `${sym}${formatNumber(value)}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#16a34a"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-center">
                      Enter details to see the projected growth.
                    </p>
                  )}
                  <div className="mt-8">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">
                        Inflation-adjusted monthly expenses at retirement
                      </span>
                      <span className="font-semibold text-green-700">
                        {sym}{formatNumber(results.inflationAdjustedMonthlyExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">
                        Required retirement corpus
                      </span>
                      <span className="font-semibold text-green-700">
                        {sym}{formatNumber(results.requiredCorpus)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">
                        Future value of current savings
                      </span>
                      <span className="font-semibold text-green-700">
                        {sym}{formatNumber(results.futureValueOfCurrentSavings)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-4">
                      <span className="text-lg font-bold">
                        Required monthly investment
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        {sym}{formatNumber(results.requiredMonthlyInvestment)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-gray-700 bg-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-green-800">
                      To maintain your lifestyle after retirement, you need a
                      corpus of{" "}
                      <span className="font-bold">
                        {sym}{formatNumber(results.requiredCorpus)}
                      </span>{" "}
                      at age {retirementAge}. You should invest{" "}
                      <span className="font-bold">
                        {sym}{formatNumber(results.requiredMonthlyInvestment)}
                      </span>{" "}
                      per month for the next {results.yearsToRetirement} years.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center h-full flex items-center justify-center">
                  Enter your details to see the retirement calculation.
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

export default RetirementCalculator;