import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS_INR as Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import { useGuestGate } from "../../../lib/guestGate";
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

const PPFCalculator = () => {
  const [yearlyInvestment, setYearlyInvestment] = useState("100000");
  const [annualRate, setAnnualRate] = useState("7.1");
  const [years, setYears] = useState("15"); // Default PPF tenure
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ yearlyInvestment: "", annualRate: "", years: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [maturityYear, setMaturityYear] = useState(null);

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

  const calculatePPF = () => {
    const P = parseFloat(yearlyInvestment);
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
      let M = 0;
      const data: { year: number; value: number }[] = [{ year: 0, value: 0 }];
      let balance = 0;
      for (let i = 1; i <= yearsValue; i++) {
        balance = (balance + P) * (1 + annualRateValue);
        data.push({ year: i, value: Number(balance.toFixed(2)) });
      }
      M = balance;
      setFutureValue(M.toFixed(2));
      setChartData(data);
      setSnap({ yearlyInvestment, annualRate, years });

      const currentYear = new Date().getFullYear();
      setMaturityYear(currentYear + yearsValue);
    }
  };

  // Guests get a few free calculations (lib/guestGate.ts).
  const { gate } = useGuestGate();
  const onCalculate = gate(calculatePPF);
  const formProps = useCalcForm(onCalculate);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="xt-title text-center mb-8">
            PPF Calculator
          </h1>
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-brand-soft text-brand rounded-full shadow hover:bg-brand-soft transition"
            >
               What is a Public Provident Fund (PPF)?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                The Public Provident Fund (PPF) is a long-term investment scheme popular in India that offers tax benefits. It has a lock-in period of 15 years, and the interest earned is compounded annually and is tax-free.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="xt-section mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="ppf-yearly-investment" className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Investment
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                  <input
                    id="ppf-yearly-investment"
                    type="text"
                    value={formatNumber(yearlyInvestment)}
                    onChange={handleInputChange(setYearlyInvestment)}
                    className="w-full p-3 border rounded-lg pl-8"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="ppf-annual-interest-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Interest Rate (%)
                </label>
                <input
                  id="ppf-annual-interest-rate"
                  type="number"
                  value={annualRate}
                  onChange={handleInputChange(setAnnualRate)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="ppf-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="ppf-investment-period"
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
                onClick={onCalculate}
                className="w-full bg-brand-fill hover:bg-brand-hover text-white py-3 rounded-lg transition mt-4"
              >
                Calculate PPF Maturity
              </button>

              {futureValue && (
                <div className="mt-8 bg-brand-soft p-6 rounded-lg">
                  <p className="text-lg font-medium text-gray-800">
                    Maturity Value:{" "}
                    <span className="text-brand font-bold">
                      ₹{new Intl.NumberFormat('en-IN').format(futureValue)}
                    </span>
                  </p>
                  <p className="mt-4 text-sm text-gray-600">
                    Investments of{" "}
                    <span className="font-semibold">
                      ₹{new Intl.NumberFormat('en-IN').format(Number(snap.yearlyInvestment))}
                    </span>{" "}
                    each year for{" "}
                    <span className="font-semibold">{snap.years}</span> snap.years at{" "}
                    <span className="font-semibold">{snap.annualRate}%</span> p.a.
                  </p>
                  {maturityYear && (
                    <p className="mt-2 text-sm text-gray-600">
                      Maturity year:{" "}
                      <span className="font-semibold">{maturityYear}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="xt-section mb-6">Growth Over Time</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={CHART_MARGIN}>
                    <CartesianGrid {...chartGrid} />
                    <XAxis
                      dataKey="year" {...X_AXIS_PROPS}
                      label={{ value: "Years", position: "insideBottom", dy: 10 }}
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

export default PPFCalculator;