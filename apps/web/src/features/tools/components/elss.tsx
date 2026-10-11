import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { limitProblem, useCalcForm, CHART_MARGIN, Y_AXIS_PROPS_INR as Y_AXIS_PROPS, X_AXIS_PROPS } from "../lib/calcForm";
import { moneyTooltipInr as moneyTooltip } from "../lib/format";
import { piePercentLabel, pieLegendInr as pieLegend } from "../lib/pieParts";
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
  Legend,
} from "recharts";

const ELSSCalculator = () => {
  const [investmentType, setInvestmentType] = useState("sip"); // 'sip' or 'lumpsum'
  const [investmentAmount, setInvestmentAmount] = useState("5,000");
  const [annualRate, setAnnualRate] = useState("12");
  const [years, setYears] = useState("3"); // ELSS has a 3-year lock-in
  const [compoundingFrequency, setCompoundingFrequency] = useState("yearly");
  const [futureValue, setFutureValue] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");

  // Inputs as they were when Calculate was last pressed. The results read from
  // this, so editing a field does not change them until Calculate is pressed again.
  const [snap, setSnap] = useState<Record<string, any>>({ investmentType: "", investmentAmount: "", years: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [taxSlab, setTaxSlab] = useState("30"); // Default to 30%
  const [taxSaved, setTaxSaved] = useState(null);
  const [chartType, setChartType] = useState("line"); // 'line' or 'pie'

  const calculateELSS = () => {
    const P = parseFloat(investmentAmount.replace(/,/g, ""));
    const annualRateValue = parseFloat(annualRate) / 100;
    const yearsValue = parseFloat(years);

    // Clear the old result so it is never shown next to inputs it wasn't computed from.
    // (A lumpsum may use a 0% rate; the SIP formula divides by the rate.)
    const rateOk = investmentType === "sip" ? annualRateValue > 0 : annualRateValue >= 0;
    const valid = P > 0 && rateOk && yearsValue > 0;
    const problem = valid
      ? limitProblem({ amount: P, rate: annualRateValue, years: yearsValue })
      : investmentType === "sip"
        ? "Amount, return rate and period must all be greater than 0."
        : "Amount and period must be greater than 0, and the return rate can't be negative.";
    setError(problem);
    if (problem) {
      setFutureValue(null);
      setChartData([]);
      return;
    }

    if (investmentType === "sip") {
      // Monthly rate = annual rate / 12, the standard SIP convention (matches sip.tsx)
      const r = annualRateValue / 12;
      const n = yearsValue * 12; // number of months

      if (P > 0 && r > 0 && n > 0) {
        const M = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        setFutureValue(
          M.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })
        );

        const data = [];
        for (let i = 0; i <= yearsValue; i++) {
          const n_i = i * 12;
          const value = P * ((Math.pow(1 + r, n_i) - 1) / r) * (1 + r);
          data.push({ year: i, value: Number(value.toFixed(2)) });
        }
        setChartData(data);
        setSnap({ investmentType, investmentAmount, years });
      }
    } else {
      // lumpsum
      let r, n;
      if (compoundingFrequency === "monthly") {
        // Monthly compounding of the annual rate
        r = annualRateValue / 12;
        n = yearsValue * 12;
      } else {
        r = annualRateValue;
        n = yearsValue;
      }

      if (P > 0 && r >= 0 && n > 0) {
        const M = P * Math.pow(1 + r, n);
        setFutureValue(
          M.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })
        );

        const data = [];
        for (let i = 0; i <= yearsValue; i++) {
          let value;
          if (compoundingFrequency === "monthly") {
            const n_i = i * 12;
            value = P * Math.pow(1 + r, n_i);
          } else {
            value = P * Math.pow(1 + r, i);
          }
          data.push({ year: i, value: Number(value.toFixed(2)) });
        }
        setChartData(data);
        setSnap({ investmentType, investmentAmount, years });
      }
    }

    // Tax saving calculation
    const annualInvestment = investmentType === "sip" ? P * 12 : P;
    const eligibleInvestment = Math.min(annualInvestment, 150000);
    const saved = eligibleInvestment * (parseFloat(taxSlab) / 100);
    setTaxSaved(
      saved.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    );
  };

  const formProps = useCalcForm(calculateELSS);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            ELSS Calculator
          </h1>

          {/* Info Badge */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-full shadow hover:bg-green-200 transition"
            >
               What is ELSS?
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow rounded-lg text-gray-700 max-w-2xl mx-auto">
                An Equity Linked Saving Scheme (ELSS) is a type of mutual fund that invests in equities and has a lock-in period of 3 years. It offers tax benefits under Section 80C of the Income Tax Act.
              </div>
            )}
          </div>

          {/* Calculator + Graph Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Calculator Section */}
            <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
              <h2 className="text-2xl font-semibold mb-6">Enter Details</h2>
              <div className="mb-4">
                <label htmlFor="elss-investment-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  {investmentType === "sip"
                    ? "Monthly Investment"
                    : "Total Investment"}
                </label>
                <input
                  id="elss-investment-amount"
                  type="text"
                  value={investmentAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (value === "" || /^[0-9\b]+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      setInvestmentAmount(
                        num === "" ? "" : num.toLocaleString("en-IN")
                      );
                    }
                  }}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="elss-expected-annual-return-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Annual Return Rate (%)
                </label>
                <input
                  id="elss-expected-annual-return-rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="elss-investment-period" className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  id="elss-investment-period"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  min="3"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="elss-your-income-tax-slab" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Income Tax Slab (%)
                </label>
                <select
                  id="elss-your-income-tax-slab"
                  value={taxSlab}
                  onChange={(e) => setTaxSlab(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="30">30%</option>
                </select>
              </div>
              {investmentType === "lumpsum" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compounding Frequency
                  </label>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="yearly"
                      name="compoundingFrequency"
                      value="yearly"
                      checked={compoundingFrequency === "yearly"}
                      onChange={() => setCompoundingFrequency("yearly")}
                      className="mr-2"
                    />
                    <label htmlFor="yearly" className="text-gray-700">
                      Yearly
                    </label>
                    <input
                      type="radio"
                      id="monthly"
                      name="compoundingFrequency"
                      value="monthly"
                      checked={compoundingFrequency === "monthly"}
                      onChange={() => setCompoundingFrequency("monthly")}
                      className="ml-4 mr-2"
                    />
                    <label htmlFor="monthly" className="text-gray-700">
                      Monthly
                    </label>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Type
                </label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="sip"
                    name="investmentType"
                    value="sip"
                    checked={investmentType === "sip"}
                    onChange={() => setInvestmentType("sip")}
                    className="mr-2"
                  />
                  <label htmlFor="sip" className="text-gray-700">
                    SIP
                  </label>
                  <input
                    type="radio"
                    id="lumpsum"
                    name="investmentType"
                    value="lumpsum"
                    checked={investmentType === "lumpsum"}
                    onChange={() => setInvestmentType("lumpsum")}
                    className="ml-4 mr-2"
                  />
                  <label htmlFor="lumpsum" className="text-gray-700">
                    Lumpsum
                  </label>
                </div>
              </div>
              {error && (
                <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={calculateELSS}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate ELSS
              </button>

              {futureValue && (
                <div className="mt-8 bg-green-50 p-6 rounded-lg">
                  <p className="text-lg font-medium">
                     Future Value: <span className="text-green-700">₹{futureValue}</span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Total Investment:{" "}
                    <span className="font-semibold">
                      ₹
                      {snap.investmentType === "sip"
                        ? (
                            parseFloat(snap.investmentAmount.replace(/,/g, "")) *
                            parseFloat(snap.years) *
                            12
                          ).toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })
                        : parseFloat(
                            snap.investmentAmount.replace(/,/g, "")
                          ).toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Interest:{" "}
                    <span className="font-semibold">
                      ₹
                      {(
                        parseFloat(futureValue.replace(/,/g, "")) -
                        (snap.investmentType === "sip"
                          ? parseFloat(snap.investmentAmount.replace(/,/g, "")) *
                            parseFloat(snap.years) *
                            12
                          : parseFloat(snap.investmentAmount.replace(/,/g, "")))
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    Approx. Tax Saved/year:{" "}
                    <span className="font-semibold">₹{taxSaved}</span>
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
                        isAnimationActive={false}
                        label={piePercentLabel}
                        data={[
                          {
                            name: "Total Investment",
                            value:
                              snap.investmentType === "sip"
                                ? parseFloat(snap.investmentAmount.replace(/,/g, "")) *
                                  parseFloat(snap.years) *
                                  12
                                : parseFloat(snap.investmentAmount.replace(/,/g, "")),
                          },
                          {
                            name: "Total Interest",
                            value:
                              parseFloat(futureValue.replace(/,/g, "")) -
                              (snap.investmentType === "sip"
                                ? parseFloat(snap.investmentAmount.replace(/,/g, "")) *
                                  parseFloat(snap.years) *
                                  12
                                : parseFloat(snap.investmentAmount.replace(/,/g, ""))),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        <Cell key="cell-0" fill="#16a34a" />
                        <Cell key="cell-1" fill="#f97316" />
                      </Pie>
                      <Legend content={pieLegend} />
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

export default ELSSCalculator;