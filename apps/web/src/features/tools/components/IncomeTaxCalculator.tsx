import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

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
        setter(Number(value));
      };

    const calculateTax = () => {
        const totalIncome = grossSalary + otherIncome;

        // Old Regime Calculation
        const oldRegimeTaxableIncome = totalIncome - homeLoanInterest - basicDeductions - npsContribution - medicalInsurance - donations - educationLoanInterest;
        setOldRegimeTax(calculateOldRegimeTax(oldRegimeTaxableIncome));

        // New Regime Calculation
        setNewRegimeTax(calculateNewRegimeTax(totalIncome));
    };

    const calculateOldRegimeTax = (income) => {
        if (!income || isNaN(income) || income <= 0) return 0;

        const slabDefs = {
            'Below 60': [250000, 500000, 1000000],
            'Senior (60-80)': [300000, 500000, 1000000],
            'Super Senior (80+)': [500000, 1000000, Infinity],
        };

        const [slab1, slab2, slab3] = slabDefs[age] || slabDefs['Below 60'];

        const t1 = Math.max(0, Math.min(income, slab2) - slab1);
        const t2 = Math.max(0, Math.min(income, slab3) - slab2);
        const t3 = Math.max(0, income - slab3);

        const tax = t1 * 0.05 + t2 * 0.2 + t3 * 0.3;

        return tax * 1.04; // 4% cess
    };

    const calculateNewRegimeTax = (income) => {
        let tax = 0;
        if (income > 300000) {
            if (income <= 600000) {
                tax = (income - 300000) * 0.05;
            } else if (income <= 900000) {
                tax = 15000 + (income - 600000) * 0.1;
            } else if (income <= 1200000) {
                tax = 45000 + (income - 900000) * 0.15;
            } else if (income <= 1500000) {
                tax = 90000 + (income - 1200000) * 0.2;
            } else {
                tax = 150000 + (income - 1500000) * 0.3;
            }
        }
        return tax * 1.04; // Adding 4% cess
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow mt-16 py-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700">
                        Income Tax Calculator
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white shadow-md rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} className="p-2 border rounded-lg">
                                    <option>2025-2026</option>
                                    <option>2024-2025</option>
                                    <option>2023-2024</option>
                                </select>
                                <select value={age} onChange={(e) => setAge(e.target.value)} className="p-2 border rounded-lg">
                                    <option>Below 60</option>
                                    <option>Senior (60-80)</option>
                                    <option>Super Senior (80+)</option>
                                </select>
                            </div>

                            {/* Income Section */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-4 text-green-700">Income</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gross salary (Basic + DA)</label>
                                        <input type="text" value={formatNumber(grossSalary)} onChange={handleInputChange(setGrossSalary)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Annual income from other sources</label>
                                        <input type="text" value={formatNumber(otherIncome)} onChange={handleInputChange(setOtherIncome)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Exemptions Section */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-4 text-green-700">Exemptions</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Annual interest paid on home loan</label>
                                    <input type="text" value={formatNumber(homeLoanInterest)} onChange={handleInputChange(setHomeLoanInterest)} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>

                            {/* Deductions Section */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-green-700">Deductions</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Basic Deductions (80C)</label>
                                        <input type="text" value={formatNumber(basicDeductions)} onChange={handleInputChange(setBasicDeductions)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contribution to NPS (80CCD)</label>
                                        <input type="text" value={formatNumber(npsContribution)} onChange={handleInputChange(setNpsContribution)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Medical Insurance Premium (80D)</label>
                                        <input type="text" value={formatNumber(medicalInsurance)} onChange={handleInputChange(setMedicalInsurance)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Donations to charity (80G)</label>
                                        <input type="text" value={formatNumber(donations)} onChange={handleInputChange(setDonations)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Interest on educational loan (80E)</label>
                                        <input type="text" value={formatNumber(educationLoanInterest)} onChange={handleInputChange(setEducationLoanInterest)} className="w-full p-2 border rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={calculateTax} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition">
                                Calculate
                            </button>
                        </div>
                        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-center items-center">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold mb-2">Total tax (Old Regime)</h3>
                                <p className="text-4xl font-bold text-green-700">₹ {formatNumber(oldRegimeTax)}</p>
                            </div>
                            <div className="text-center mt-8">
                                <h3 className="text-xl font-semibold mb-2">Total tax (New Regime)</h3>
                                <p className="text-4xl font-bold text-green-700">₹ {formatNumber(newRegimeTax)}</p>
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