import React, { useState, useCallback } from "react";
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

const EPFCalculator = () => {
  const [basicMonthlySalary, setBasicMonthlySalary] = useState("30,000");
  const [employeeContribution, setEmployeeContribution] = useState<number | string>(12);
  const [employerContribution, setEmployerContribution] = useState<number | string>(3.67);
  const [numberOfYears, setNumberOfYears] = useState<number | string>(25);
  const [epfInterestRate, setEpfInterestRate] = useState<number | string>(8.15);

  const [totalInvestment, setTotalInvestment] = useState<number | string>(0);
  const [interestEarned, setInterestEarned] = useState<number | string>(0);
  const [maturityValue, setMaturityValue] = useState<number | string>(0);
  const [maturityYear, setMaturityYear] = useState(0);
  const [chartData, setChartData] = useState([]);
  // Inputs as they were when Calculate was last pressed (results read from this).
  const [snap, setSnap] = useState({ basicMonthlySalary: "0", employeeContribution: "0" as number | string, employerContribution: "0" as number | string, numberOfYears: "0" as number | string, epfInterestRate: "0" as number | string });

  const calculateEPF = useCallback(() => {
    const monthlySalary = parseFloat(basicMonthlySalary.replace(/,/g, ""));
    const employeeContP = parseFloat(String(employeeContribution)) / 100;
    const employerContP = parseFloat(String(employerContribution)) / 100;
    const interestRate = parseFloat(String(epfInterestRate)) / 100;
    const years = parseInt(String(numberOfYears));

    if (isNaN(monthlySalary) || isNaN(employeeContP) || isNaN(employerContP) || isNaN(interestRate) || isNaN(years)) {
      return;
    }

    let currentBalance = 0;
    const currentYear = new Date().getFullYear();
    const data: { year: number; value: number }[] = [{ year: currentYear, value: 0 }];

    for (let i = 1; i <= years; i++) {
      // EPFO accrues interest every month on the running balance and credits it
      // once a year, so interest does not compound within the year.
      let accrued = 0;
      for (let month = 1; month <= 12; month++) {
        accrued += currentBalance * (interestRate / 12);
        currentBalance += monthlySalary * employeeContP;
        currentBalance += monthlySalary * employerContP;
      }
      currentBalance += accrued;
      data.push({
        year: currentYear + i,
        value: Number(currentBalance.toFixed(0)),
      });
    }

    const totalContributions = (monthlySalary * employeeContP + monthlySalary * employerContP) * 12 * years;
    const totalInterest = currentBalance - totalContributions;

    setTotalInvestment(totalContributions.toFixed(0));
    setInterestEarned(totalInterest.toFixed(0));
    setMaturityValue(currentBalance.toFixed(0));
    setMaturityYear(currentYear + years);
    setChartData(data);
    setSnap({ basicMonthlySalary, employeeContribution, employerContribution, numberOfYears, epfInterestRate });
  }, [basicMonthlySalary, employeeContribution, employerContribution, numberOfYears, epfInterestRate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formProps = useCalcForm(calculateEPF);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-green-600">
            EPF Calculator
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            The Employees Provident Fund (EPF) is a government-backed retirement savings scheme for salaried employees. Use this calculator to estimate your EPF corpus, total investment, and interest earned.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white shadow-lg rounded-xl p-8" {...formProps}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Monthly Salary + DA
                </label>
                <input
                  type="text"
                  value={basicMonthlySalary}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (value === "" || /^[0-9\b]+$/.test(value)) {
                      const num = value === "" ? "" : parseInt(value, 10);
                      setBasicMonthlySalary(
                        num === "" ? "" : num.toLocaleString("en-IN")
                      );
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Contribution (%)
                </label>
                <input
                  type="number"
                  value={employeeContribution}
                  onChange={(e) => setEmployeeContribution(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer Contribution (%)
                </label>
                <input
                  type="number"
                  value={employerContribution}
                  onChange={(e) => setEmployerContribution(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Years
                </label>
                <input
                  type="number"
                  value={numberOfYears}
                  onChange={(e) => setNumberOfYears(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPF Interest Rate (p.a.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={epfInterestRate}
                  onChange={(e) => setEpfInterestRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={calculateEPF}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
              >
                Calculate
              </button>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-9">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis {...Y_AXIS_PROPS} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-8 space-y-5">
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-gray-600">Total Investment</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totalInvestment)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-gray-600">Interest Earned</span>
                  <span className="font-bold text-gray-800">{formatCurrency(interestEarned)}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-xl">
                  <span className="font-semibold text-gray-700">Maturity Value</span>
                  <span className="font-extrabold text-green-600">{formatCurrency(maturityValue)}</span>
                </div>
                <div className="text-center text-base text-black-800 bg-green-100 p-4 rounded-lg mt-4">
                  <p>
                    Contributions of {formatCurrency((parseFloat(snap.basicMonthlySalary.replace(/,/g, "")) * Number(snap.employeeContribution)) / 100)} (employee) + {formatCurrency((parseFloat(snap.basicMonthlySalary.replace(/,/g, "")) * Number(snap.employerContribution)) / 100)} (employer) per month for {snap.numberOfYears} years at {snap.epfInterestRate}% p.a.
                  </p>
                  <p className="font-semibold">Maturity year: {maturityYear}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
         <Footer />
    </div>
  );
};

export default EPFCalculator;