import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
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

const NPSCalculator = () => {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("60");
  const [monthlyInvestment, setMonthlyInvestment] = useState("5000");
  const [expectedReturn, setExpectedReturn] = useState("9");
  const [annuityPercentage, setAnnuityPercentage] = useState("40");
  const [annuityReturn, setAnnuityReturn] = useState("6.5");

  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState("");

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

  const calculateNPS = () => {
    const ca = parseFloat(currentAge);
    const ra = parseFloat(retirementAge);
    const P = parseFloat(monthlyInvestment);
    const annualRateValue = parseFloat(expectedReturn) / 100;
    // Use proper compounding conversion for monthly rate
    const r = Math.pow(1 + annualRateValue, 1/12) - 1;
    const n = (ra - ca) * 12;

    // NPS is open to ages 18–70 and can be held until 75.
    let problem = "";
    if (!(ca >= 18 && ca <= 70)) problem = "Current age must be between 18 and 70.";
    else if (!(ra > ca)) problem = "Retirement age must be greater than your current age.";
    else if (ra > 75) problem = "Retirement age can't be more than 75.";
    else if (!(P > 0)) problem = "Monthly investment must be greater than 0.";
    else if (!(annualRateValue > 0)) problem = "Expected return must be greater than 0%.";
    else if (!(parseFloat(annuityReturn) >= 0)) problem = "Annuity return can't be negative.";
    setError(problem);
    if (problem) {
      setResults(null);
      setChartData([]);
      return;
    }

    if (P > 0 && r > 0 && n > 0) {
      const totalCorpus = P * ((Math.pow(1 + r, n) - 1) / r);
      // At least 40% of the corpus must buy an annuity.
      const annuityPct = Math.min(100, Math.max(40, parseFloat(annuityPercentage) || 40));
      const lumpSumWithdrawal = totalCorpus * (1 - annuityPct / 100);
      const annuityPurchase = totalCorpus * (annuityPct / 100);
      const monthlyPension = (annuityPurchase * (parseFloat(annuityReturn) / 100)) / 12;

      setResults({
        totalCorpus,
        lumpSumWithdrawal,
        annuityPurchase,
        monthlyPension,
        // Inputs used, so the summary text does not change until Calculate is pressed again.
        monthlyInvestment,
        retirementAge,
        annuityPercentage: annuityPct,
      });

      const data = [];
      const investmentYears = parseFloat(retirementAge) - parseFloat(currentAge);
      for (let i = 0; i <= investmentYears; i++) {
        const n_i = i * 12;
        const value = P * ((Math.pow(1 + r, n_i) - 1) / r);
        data.push({
          year: parseFloat(currentAge) + i,
          value: Number(value.toFixed(0)),
        });
      }
      setChartData(data);
    }
  };

  const formProps = useCalcForm(calculateNPS);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-green-800 mb-4">
            NPS Calculator
          </h1>
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is NPS?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                The National Pension System (NPS) helps you build your retirement corpus with regular investments and market-linked returns. Use this calculator to estimate your maturity amount, pension, and lump sum withdrawal.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Input Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg" {...formProps}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="nps-current-age" className="block text-md font-medium text-gray-700">Current Age</label>
                  <input id="nps-current-age" type="number" value={currentAge} onChange={handleInputChange(setCurrentAge)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="nps-retirement-age" className="block text-md font-medium text-gray-700">Retirement Age</label>
                  <input id="nps-retirement-age" type="number" value={retirementAge} onChange={handleInputChange(setRetirementAge)}
                   className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="nps-monthly-investment" className="block text-md font-medium text-gray-700">Monthly Investment</label>
                  <div className="mt-1 relative rounded-lg shadow-sm border border-gray-300">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-md">₹</span>
                    </div>
                    <input id="nps-monthly-investment" type="text" value={formatNumber(monthlyInvestment)} onChange={handleInputChange(setMonthlyInvestment)} className="block w-full p-3 pl-7 pr-12 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="nps-expected-return" className="block text-md font-medium text-gray-700">Expected Return (p.a.)</label>
                  <input id="nps-expected-return" type="number" value={expectedReturn} onChange={handleInputChange(setExpectedReturn)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="nps-to-annuity" className="block text-md font-medium text-gray-700">% to Annuity (min 40%)</label>
                  <input id="nps-to-annuity" type="number" value={annuityPercentage} onChange={handleInputChange(setAnnuityPercentage)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="nps-annuity-return" className="block text-md font-medium text-gray-700">Annuity Return (p.a.)</label>
                  <input id="nps-annuity-return" type="number" value={annuityReturn} onChange={handleInputChange(setAnnuityReturn)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              {error && (
                <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button onClick={calculateNPS} className="mt-8 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                Calculate
              </button>
            </div>

            {/* Right Side: Chart and Results */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={CHART_MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis {...Y_AXIS_PROPS} />
                    <Tooltip formatter={(value) => `₹${formatNumber(value)}`} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {results && (
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">Total Corpus at Retirement</span>
                      <span className="font-bold text-gray-800">₹{formatNumber(results.totalCorpus)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">Lump Sum Withdrawal ({100 - parseFloat(results.annuityPercentage)}%)</span>
                      <span className="font-bold text-gray-800">₹{formatNumber(results.lumpSumWithdrawal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">Annuity Purchase ({results.annuityPercentage}%)</span>
                      <span className="font-bold text-gray-800">₹{formatNumber(results.annuityPurchase)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-semibold text-gray-700">Estimated Monthly Pension</span>
                      <span className="font-bold text-green-600">₹{formatNumber(results.monthlyPension)}</span>
                    </div>
                  </div>
                  <div className="mt-6 bg-green-50 p-4 rounded-lg text-center font-bold text-gray-800">
                    Invest ₹{formatNumber(results.monthlyInvestment)} per month until age {results.retirementAge}. At retirement, withdraw up to ₹{formatNumber(results.lumpSumWithdrawal)} as lump sum and get a monthly pension of ₹{formatNumber(results.monthlyPension)}.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NPSCalculator;