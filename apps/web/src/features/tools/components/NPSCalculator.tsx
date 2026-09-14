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
    const P = parseFloat(monthlyInvestment);
    const annualRateValue = parseFloat(expectedReturn) / 100;
    // Use proper compounding conversion for monthly rate
    const r = Math.pow(1 + annualRateValue, 1/12) - 1;
    const n = (parseFloat(retirementAge) - parseFloat(currentAge)) * 12;

    if (P > 0 && r > 0 && n > 0) {
      const totalCorpus = P * ((Math.pow(1 + r, n) - 1) / r);
      const lumpSumWithdrawal = totalCorpus * (1 - parseFloat(annuityPercentage) / 100);
      const annuityPurchase = totalCorpus * (parseFloat(annuityPercentage) / 100);
      const monthlyPension = (annuityPurchase * (parseFloat(annuityReturn) / 100)) / 12;

      setResults({
        totalCorpus,
        lumpSumWithdrawal,
        annuityPurchase,
        monthlyPension,
      });

      const data = [];
      const investmentYears = parseFloat(retirementAge) - parseFloat(currentAge);
      for (let i = 1; i <= investmentYears; i++) {
        const n_i = i * 12;
        const value = P * ((Math.pow(1 + r, n_i) - 1) / r);
        data.push({
          year: parseFloat(currentAge) + i,
          value: value.toFixed(0),
        });
      }
      setChartData(data);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8">
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
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-6">
                <div>
                  <label className="block text-md font-medium text-gray-700">Current Age</label>
                  <input type="number" value={currentAge} onChange={handleInputChange(setCurrentAge)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">Retirement Age</label>
                  <input type="number" value={retirementAge} onChange={handleInputChange(setRetirementAge)}
                   className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">Monthly Investment</label>
                  <div className="mt-1 relative rounded-lg shadow-sm border border-gray-300">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-md">₹</span>
                    </div>
                    <input type="text" value={formatNumber(monthlyInvestment)} onChange={handleInputChange(setMonthlyInvestment)} className="block w-full p-3 pl-7 pr-12 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">Expected Return (p.a.)</label>
                  <input type="number" value={expectedReturn} onChange={handleInputChange(setExpectedReturn)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">% to Annuity (min 40%)</label>
                  <input type="number" value={annuityPercentage} onChange={handleInputChange(setAnnuityPercentage)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700">Annuity Return (p.a.)</label>
                  <input type="number" value={annuityReturn} onChange={handleInputChange(setAnnuityReturn)} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <button onClick={calculateNPS} className="mt-8 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                Calculate
              </button>
            </div>

            {/* Right Side: Chart and Results */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
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
                      <span className="text-gray-600">Lump Sum Withdrawal ({100 - parseFloat(annuityPercentage)}%)</span>
                      <span className="font-bold text-gray-800">₹{formatNumber(results.lumpSumWithdrawal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">Annuity Purchase ({annuityPercentage}%)</span>
                      <span className="font-bold text-gray-800">₹{formatNumber(results.annuityPurchase)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-semibold text-gray-700">Estimated Monthly Pension</span>
                      <span className="font-bold text-green-600">₹{formatNumber(results.monthlyPension)}</span>
                    </div>
                  </div>
                  <div className="mt-6 bg-green-50 p-4 rounded-lg text-center font-bold text-gray-800">
                    Invest ₹{formatNumber(monthlyInvestment)} per month until age {retirementAge}. At retirement, withdraw up to ₹{formatNumber(results.lumpSumWithdrawal)} as lump sum and get a monthly pension of ₹{formatNumber(results.monthlyPension)}.
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