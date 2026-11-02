import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useCalcForm } from '../lib/calcForm';
import { useGuestGate } from '../../../lib/guestGate';
import { oldRegimeTax as computeOldRegimeTax, newRegimeTax as computeNewRegimeTax, type AgeGroup } from '../lib/incomeTax';

const IncomeTaxCalculator = () => {
    const [financialYear, setFinancialYear] = useState('2025-2026');
    const [age, setAge] = useState('Below 60');
    const [grossSalary, setGrossSalary] = useState(800000);
    const [otherIncome, setOtherIncome] = useState(0);
    const [homeLoanInterest, setHomeLoanInterest] = useState(0);
    const [basicDeductions, setBasicDeductions] = useState(150000);
    const [npsContribution, setNpsContribution] = useState(0);
    const [medicalInsurance, setMedicalInsurance] = useState(0);
    const [donations, setDonations] = useState(0);
    const [educationLoanInterest, setEducationLoanInterest] = useState(0);
    const [oldRegimeTax, setOldRegimeTax] = useState(0);
    const [newRegimeTax, setNewRegimeTax] = useState(0);

    const formatNumber = (num) => {
        if (num === null || isNaN(num)) return "0";
        return new Intl.NumberFormat("en-IN", {
          maximumFractionDigits: 0,
        }).format(num);
      };
    
      const handleInputChange = (setter) => (e) => {
        const value = e.target.value.replace(/,/g, "");
        setter(Number(value.replace(/\D/g, "")));
      };

    const calculateTax = () => {
        setOldRegimeTax(computeOldRegimeTax({
            grossSalary, otherIncome, homeLoanInterest, basicDeductions,
            npsContribution, medicalInsurance, donations, educationLoanInterest,
            age: age as AgeGroup,
        }));
        setNewRegimeTax(computeNewRegimeTax(grossSalary, otherIncome, financialYear));
    };

    // Guests get a few free calculations (lib/guestGate.ts).
    const { gate } = useGuestGate();
    const onCalculate = gate(calculateTax);
    const formProps = useCalcForm(onCalculate);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="xt-title text-center mb-8">
                        Income Tax Calculator
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white shadow-md rounded-xl p-6" {...formProps}>
                            <div className="flex justify-between items-center mb-6">
                                <select aria-label="Financial year" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} className="p-2 border rounded-lg">
                                    <option>2025-2026</option>
                                    <option>2024-2025</option>
                                    <option>2023-2024</option>
                                </select>
                                <select aria-label="Age group" value={age} onChange={(e) => setAge(e.target.value)} className="p-2 border rounded-lg">
                                    <option>Below 60</option>
                                    <option>Senior (60-80)</option>
                                    <option>Super Senior (80+)</option>
                                </select>
                            </div>

                            {/* Income Section */}
                            <div className="mb-6">
                                <h3 className="xt-section mb-4">Income</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="incometax-gross-salary" className="block text-sm font-medium text-gray-700">Gross salary (Basic + DA)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-gross-salary" type="text" value={formatNumber(grossSalary)} onChange={handleInputChange(setGrossSalary)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="incometax-annual-income-from-other-sources" className="block text-sm font-medium text-gray-700">Annual income from other sources</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-annual-income-from-other-sources" type="text" value={formatNumber(otherIncome)} onChange={handleInputChange(setOtherIncome)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exemptions Section */}
                            <div className="mb-6">
                                <h3 className="xt-section mb-4">Exemptions</h3>
                                <div>
                                    <label htmlFor="incometax-annual-interest-paid-on-home-loan" className="block text-sm font-medium text-gray-700">Annual interest paid on home loan</label>
                                    <div className="relative">
                                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                      <input id="incometax-annual-interest-paid-on-home-loan" type="text" value={formatNumber(homeLoanInterest)} onChange={handleInputChange(setHomeLoanInterest)} className="w-full p-2 border rounded-lg pl-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Section */}
                            <div>
                                <h3 className="xt-section mb-4">Deductions</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="incometax-basic-deductions" className="block text-sm font-medium text-gray-700">Basic Deductions (80C)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-basic-deductions" type="text" value={formatNumber(basicDeductions)} onChange={handleInputChange(setBasicDeductions)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="incometax-contribution-to-nps" className="block text-sm font-medium text-gray-700">Contribution to NPS (80CCD)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-contribution-to-nps" type="text" value={formatNumber(npsContribution)} onChange={handleInputChange(setNpsContribution)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="incometax-medical-insurance-premium" className="block text-sm font-medium text-gray-700">Medical Insurance Premium (80D)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-medical-insurance-premium" type="text" value={formatNumber(medicalInsurance)} onChange={handleInputChange(setMedicalInsurance)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="incometax-donations-to-charity" className="block text-sm font-medium text-gray-700">Donations to charity (80G)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-donations-to-charity" type="text" value={formatNumber(donations)} onChange={handleInputChange(setDonations)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="incometax-interest-on-educational-loan" className="block text-sm font-medium text-gray-700">Interest on educational loan (80E)</label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">₹</span>
                                          <input id="incometax-interest-on-educational-loan" type="text" value={formatNumber(educationLoanInterest)} onChange={handleInputChange(setEducationLoanInterest)} className="w-full p-2 border rounded-lg pl-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onCalculate} className="w-full mt-6 bg-brand-fill hover:bg-brand-hover text-white py-3 rounded-lg transition">
                                Calculate
                            </button>
                        </div>
                        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-center items-center">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold mb-2">Total tax (Old Regime)</h3>
                                <p className="text-4xl font-bold text-brand">₹ {formatNumber(oldRegimeTax)}</p>
                            </div>
                            <div className="text-center mt-8">
                                <h3 className="text-xl font-semibold mb-2">Total tax (New Regime)</h3>
                                <p className="text-4xl font-bold text-brand">₹ {formatNumber(newRegimeTax)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default IncomeTaxCalculator;