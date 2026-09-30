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

    // New-regime rules per financial year: slabs as [upper limit, rate],
    // standard deduction on salary, and the Section 87A rebate limit (tax is
    // nil up to this taxable income, with marginal relief just above it).
    const NEW_REGIME = {
        '2025-2026': {
            slabs: [[400000, 0], [800000, 0.05], [1200000, 0.1], [1600000, 0.15], [2000000, 0.2], [2400000, 0.25], [Infinity, 0.3]],
            standardDeduction: 75000,
            rebateLimit: 1200000,
        },
        '2024-2025': {
            slabs: [[300000, 0], [700000, 0.05], [1000000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
            standardDeduction: 75000,
            rebateLimit: 700000,
        },
        '2023-2024': {
            slabs: [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]],
            standardDeduction: 50000,
            rebateLimit: 700000,
        },
    };
    const OLD_REGIME_STANDARD_DEDUCTION = 50000;
    const OLD_REGIME_REBATE_LIMIT = 500000;

    const taxOnSlabs = (income, slabs) => {
        let tax = 0;
        let lower = 0;
        for (const [upper, rate] of slabs) {
            if (income <= lower) break;
            tax += (Math.min(income, upper) - lower) * rate;
            lower = upper;
        }
        return tax;
    };

    const calculateTax = () => {
        const salaryDeduction = (amount) => Math.min(grossSalary, amount);

        // Old Regime: standard deduction + Chapter VI-A deductions (80C capped
        // at ₹1.5L, 80CCD(1B) NPS at ₹50k, Sec 24 home-loan interest at ₹2L).
        const oldRegimeTaxableIncome = grossSalary + otherIncome
            - salaryDeduction(OLD_REGIME_STANDARD_DEDUCTION)
            - Math.min(homeLoanInterest, 200000)
            - Math.min(basicDeductions, 150000)
            - Math.min(npsContribution, 50000)
            - medicalInsurance - donations - educationLoanInterest;
        setOldRegimeTax(calculateOldRegimeTax(oldRegimeTaxableIncome));

        // New Regime: only the standard deduction is allowed.
        const rules = NEW_REGIME[financialYear] || NEW_REGIME['2025-2026'];
        const newRegimeTaxableIncome = grossSalary + otherIncome - salaryDeduction(rules.standardDeduction);
        setNewRegimeTax(calculateNewRegimeTax(newRegimeTaxableIncome, rules));
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

        const tax = income <= OLD_REGIME_REBATE_LIMIT ? 0 : t1 * 0.05 + t2 * 0.2 + t3 * 0.3;

        return tax * 1.04; // 4% cess
    };

    const calculateNewRegimeTax = (income, rules) => {
        if (!income || isNaN(income) || income <= 0) return 0;

        let tax = taxOnSlabs(income, rules.slabs);
        if (income <= rules.rebateLimit) {
            tax = 0;
        } else {
            // Marginal relief: tax can't exceed the income above the rebate limit.
            tax = Math.min(tax, income - rules.rebateLimit);
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