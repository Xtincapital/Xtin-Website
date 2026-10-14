import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, usePersistedState, useCalcSession } from "../lib/calcState";
import { useCalcForm, CHART_MARGIN, Y_AXIS_PROPS } from "../lib/calcForm";
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

const RetirementCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  const [currentAge, setCurrentAge] = usePersistedState("retirement.age", "30");
  const [retirementAge, setRetirementAge] = usePersistedState("retirement.retAge", "60");
  const [lifeExpectancy, setLifeExpectancy] = usePersistedState("retirement.life", "80");
  const [monthlyExpenses, setMonthlyExpenses] = useMoneyState("retirement.expenses", "50000");
  const [currentSavings, setCurrentSavings] = useMoneyState("retirement.savings", "500000");
  const [expectedReturn, setExpectedReturn] = usePersistedState("retirement.return", "10");
  const [inflationRate, setInflationRate] = usePersistedState("retirement.inflation", "6");

  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");

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

    // Ages must make sense together: current < retirement < life expectancy.
    let problem = "";
    if (!(ca >= 18 && ca <= 100)) problem = "Current age must be between 18 and 100.";
    else if (!(ra > ca)) problem = "Retirement age must be greater than your current age.";
    else if (ra > 100) problem = "Retirement age can't be more than 100.";
    else if (!(le > ra)) problem = "Life expectancy must be greater than your retirement age.";
    else if (le > 120) problem = "Life expectancy can't be more than 120.";
    setError(problem);
    if (problem) {
      setResults(null);
      setChartData([]);
      return;
    }

    if (ca > 0 && ra > 0 && le > 0 && me > 0 && cs > 0 && er > 0 && ir > 0) {
      const yearsToRetirement = ra - ca;
      const postRetirementYears = le - ra;

      // Inflation-adjusted monthly expenses at retirement
      const inflationAdjustedMonthlyExpenses = me * Math.pow(1 + ir, yearsToRetirement);

      // Required retirement corpus
      const realReturnRate = (1 + er) / (1 + ir) - 1;
      const annualNeed = inflationAdjustedMonthlyExpenses * 12;
      // Present value of an annuity of `annualNeed` for the retirement years
      // (a zero real return degenerates to a plain sum).
      const requiredCorpus =
        Math.abs(realReturnRate) < 1e-9
          ? annualNeed * postRetirementYears
          : (annualNeed * (1 - Math.pow(1 + realReturnRate, -postRetirementYears))) / realReturnRate;

      // Future value of current savings
      const futureValueOfCurrentSavings = cs * Math.pow(1 + er, yearsToRetirement);

      // Corpus to be accumulated
      // If current savings already cover the need, no further investment is required.
      const corpusToBeAccumulated = Math.max(0, requiredCorpus - futureValueOfCurrentSavings);

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
        retirementAge,
      });

      // Chart data
      const data = [];
      for (let i = 0; i <= yearsToRetirement; i++) {
        const age = ca + i;
        const n_i = i * 12;
        const futureValueLumpsum = cs * Math.pow(1 + er, i);
        const futureValueSip =
          requiredMonthlyInvestment *
          ((Math.pow(1 + monthlyReturnRate, n_i) - 1) / monthlyReturnRate);
        const totalValue = futureValueLumpsum + futureValueSip;
        data.push({ year: age, value: Number(totalValue.toFixed(0)) });
      }
      setChartData(data);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat(numLocale).format(num);
  };

  useCalcSession("retirement", calculateRetirement, !!results);

  const formProps = useCalcForm(calculateRetirement);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
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
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="retirement-current-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Age
                </label>
                <input
                  id="retirement-current-age"
                  type="number"
                  value={currentAge}
                  onChange={handleInputChange(setCurrentAge)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="retirement-retirement-age" className="block text-sm font-medium text-gray-700 mb-1">
                  Retirement Age
                </label>
                <input
                  id="retirement-retirement-age"
                  type="number"
                  value={retirementAge}
                  onChange={handleInputChange(setRetirementAge)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="retirement-life-expectancy" className="block text-sm font-medium text-gray-700 mb-1">
                  Life Expectancy
                </label>
                <input
                  id="retirement-life-expectancy"
                  type="number"
                  value={lifeExpectancy}
                  onChange={handleInputChange(setLifeExpectancy)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="retirement-current-monthly-expenses" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Monthly Expenses
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="retirement-current-monthly-expenses"
                    type="text"
                    value={formatNumber(monthlyExpenses)}
                    onChange={handleInputChange(setMonthlyExpenses)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="retirement-current-retirement-savings" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Retirement Savings
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                  <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                    id="retirement-current-retirement-savings"
                    type="text"
                    value={formatNumber(currentSavings)}
                    onChange={handleInputChange(setCurrentSavings)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="retirement-expected-return" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return (p.a.) (%)
                </label>
                <input
                  id="retirement-expected-return"
                  type="number"
                  value={expectedReturn}
                  onChange={handleInputChange(setExpectedReturn)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="retirement-inflation-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Inflation Rate (p.a.) (%)
                </label>
                <input
                  id="retirement-inflation-rate"
                  type="number"
                  value={inflationRate}
                  onChange={handleInputChange(setInflationRate)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              {error && (
                <p role="alert" className="mt-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
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
                      <LineChart data={chartData} margin={CHART_MARGIN}>
                        <CartesianGrid {...chartGrid} />
                        <XAxis
                          dataKey="year"
                          label={{
                            value: "",
                            position: "insideBottom",
                            dy: 10,
                          }}
                        />
                        <YAxis {...Y_AXIS_PROPS} />
                        <Tooltip {...chartTooltip}
                          formatter={(value) => `${sym}${formatNumber(value)}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartColors.positive}
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
                      at age {results.retirementAge}. You should invest{" "}
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