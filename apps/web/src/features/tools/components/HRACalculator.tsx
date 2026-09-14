import React, { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const HRACalculator = () => {
  const [basicSalary, setBasicSalary] = useState("480,000");
  const [dearnessAllowance, setDearnessAllowance] = useState("0");
  const [hraReceived, setHraReceived] = useState("120,000");
  const [rentPaid, setRentPaid] = useState("180,000");
  const [cityType, setCityType] = useState("metro");

  const [exemptedHRA, setExemptedHRA] = useState<number | string>("120,000");
  const [taxableHRA, setTaxableHRA] = useState<number | string>("0");
  const [calculationDetails, setCalculationDetails] = useState<{
    actualHRA: number | string;
    rentPaidMinus10pSalary: number | string;
    salaryPercentage: number | string;
  }>({
    actualHRA: "120,000",
    rentPaidMinus10pSalary: "132,000",
    salaryPercentage: "240,000",
  });

  const formatNumber = (num) => {
    if (typeof num !== "number") {
      return "0";
    }
    return num.toLocaleString("en-IN");
  };

  const calculateHRA = () => {
    const salary =
      parseFloat(basicSalary.replace(/,/g, "")) +
      parseFloat(dearnessAllowance.replace(/,/g, ""));
    const hra = parseFloat(hraReceived.replace(/,/g, ""));
    const rent = parseFloat(rentPaid.replace(/,/g, ""));

    if (salary > 0 && hra > 0 && rent > 0) {
      const actualHRA = hra;
      const rentPaidMinus10pSalary = rent - 0.1 * salary;
      const salaryPercentage =
        cityType === "metro" ? 0.5 * salary : 0.4 * salary;

      const exemption = Math.min(
        actualHRA,
        rentPaidMinus10pSalary > 0 ? rentPaidMinus10pSalary : 0,
        salaryPercentage
      );
      
      const finalExemption = Math.max(0, exemption);

      setExemptedHRA(finalExemption);
      setTaxableHRA(hra - finalExemption);
      setCalculationDetails({
        actualHRA,
        rentPaidMinus10pSalary,
        salaryPercentage,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
            HRA Calculator
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Calculate your House Rent Allowance (HRA) exemption as per Section
            10(13A) of the Income Tax Act. Enter your salary, HRA, rent paid,
            and city to know your tax-free HRA.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Side: Inputs */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="space-y-6">
                {/* Basic Salary */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary (Annual)
                  </label>
                  <input
                    type="text"
                    value={basicSalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setBasicSalary(num === "" ? "" : num.toLocaleString());
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                {/* Dearness Allowance */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dearness Allowance (Annual)
                  </label>
                  <input
                    type="text"
                    value={dearnessAllowance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setDearnessAllowance(
                          num === "" ? "" : num.toLocaleString()
                        );
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                {/* HRA Received */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HRA Received (Annual)
                  </label>
                  <input
                    type="text"
                    value={hraReceived}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setHraReceived(num === "" ? "" : num.toLocaleString());
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                {/* Rent Paid */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent Paid (Annual)
                  </label>
                  <input
                    type="text"
                    value={rentPaid}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9\b]+$/.test(value)) {
                        const num = value === "" ? "" : parseInt(value, 10);
                        setRentPaid(num === "" ? "" : num.toLocaleString());
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                {/* City Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City Type:
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm">
                    <button
                      onClick={() => setCityType("metro")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
                        cityType === "metro"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Metro
                    </button>
                    <button
                      onClick={() => setCityType("non-metro")}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
                        cityType === "non-metro"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Non-Metro
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={calculateHRA}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
              >
                Calculate
              </button>
            </div>

            {/* Right Side: Results */}
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-center">
              <div className="mt-8 bg-green-50 p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">Exempted HRA</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{formatNumber(exemptedHRA)}
                  </p>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">Taxable HRA</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{formatNumber(taxableHRA)}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Exempted HRA is the least of:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>1. Actual HRA received:</span>
                    <span className="font-semibold">
                      ₹{formatNumber(calculationDetails.actualHRA)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>2. Rent paid - 10% of salary:</span>
                    <span className="font-semibold">
                      ₹{formatNumber(calculationDetails.rentPaidMinus10pSalary)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>
                      3. {cityType === "metro" ? "50%" : "40%"} of salary:
                    </span>
                    <span className="font-semibold">
                      ₹{formatNumber(calculationDetails.salaryPercentage)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HRACalculator;