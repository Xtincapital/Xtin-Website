import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useCalcForm } from "../lib/calcForm";
import SEO, { generateToolData } from "../../../components/SEO";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const RealEstateCalculator = () => {
  const { symbol: sym } = useRegion();
  // Input States
  const [propertyPrice, setPropertyPrice] = useState("1,00,00,000");
  const [monthlyRent, setMonthlyRent] = useState("35,000");
  const [saleTime, setSaleTime] = useState("45");
  const [infrastructure, setInfrastructure] = useState("");
  const [location, setLocation] = useState("metro");
  const [propertyType, setPropertyType] = useState("2bhk");
  
  // Calculated Results
  const [results, setResults] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("radar");
  
  // Filter Pass States
  const [filterResults, setFilterResults] = useState({
    yield: { status: null, value: 0 },
    ratio: { status: null, value: 0 },
    infra: { status: null, value: "" },
    liquidity: { status: null, value: 0 }
  });

  const structuredData = generateToolData({
    name: 'Real Estate Investment Calculator',
    description: 'Analyze property investments with the 4-Filter Framework. Calculate rental yield, price-to-rent ratio, and evaluate infrastructure & liquidity factors for smart property decisions.'
  });

  // Parse number from formatted string
  const parseNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, "")) || 0;
  };

  // Format number with Indian locale
  const formatNumber = (num) => {
    return num.toLocaleString("en-IN");
  };

  // Format currency
  const formatCurrency = (num) => {
    if (num >= 10000000) {
      return `${sym}${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `${sym}${(num / 100000).toFixed(2)} L`;
    }
    return `${sym}${formatNumber(num)}`;
  };

  const calculateAll = () => {
    const price = parseNumber(propertyPrice);
    const rent = parseNumber(monthlyRent);
    const annualRent = rent * 12;
    const days = parseNumber(saleTime);

    if (price <= 0 || rent <= 0) {
      setResults(null);
      return;
    }

    // Calculate Rental Yield
    const rentalYield = (annualRent / price) * 100;
    
    // Calculate Price-to-Rent Ratio
    const priceToRent = price / annualRent;

    // Calculate 10-year projections
    const appreciationRate = getAppreciationRate();
    const projections = [];
    let currentValue = price;
    let totalRentalIncome = 0;
    
    for (let year = 1; year <= 10; year++) {
      currentValue = currentValue * (1 + appreciationRate / 100);
      totalRentalIncome += annualRent * Math.pow(1.05, year - 1); // 5% annual rent increase
      projections.push({
        year: `Year ${year}`,
        propertyValue: Math.round(currentValue),
        totalRentalIncome: Math.round(totalRentalIncome),
        totalReturns: Math.round(currentValue - price + totalRentalIncome)
      });
    }

    // Determine filter statuses
    const newFilterResults = {
      yield: {
        value: rentalYield,
        status: rentalYield > 4 ? 'good' : rentalYield >= 3 ? 'neutral' : 'avoid'
      },
      ratio: {
        value: priceToRent,
        status: priceToRent < 15 ? 'good' : priceToRent <= 20 ? 'neutral' : 'avoid'
      },
      infra: {
        value: infrastructure,
        status: infrastructure === '' ? null : infrastructure === 'none' ? 'avoid' : 'good'
      },
      liquidity: {
        value: days,
        status: days <= 0 ? null : days < 60 ? 'good' : days <= 90 ? 'neutral' : 'avoid'
      }
    };

    setFilterResults(newFilterResults);

    // Count passed filters
    const passedFilters = Object.values(newFilterResults).filter(f => f.status === 'good').length;
    const analyzedFilters = Object.values(newFilterResults).filter(f => f.status !== null).length;

    // Overall recommendation
    let recommendation = '';
    let recommendationClass = '';
    if (analyzedFilters >= 3) {
      if (passedFilters >= 3) {
        recommendation = 'Excellent Investment Opportunity';
        recommendationClass = 'good';
      } else if (passedFilters === 2) {
        recommendation = 'Moderate - Requires Further Analysis';
        recommendationClass = 'neutral';
      } else {
        recommendation = 'High Risk - Consider Alternatives';
        recommendationClass = 'avoid';
      }
    } else {
      recommendation = 'Complete all filters for assessment';
      recommendationClass = '';
    }

    // Compare with FD
    const fdRate = 7;
    const fdReturns10Year = price * Math.pow(1 + fdRate / 100, 10) - price;
    const propertyReturns10Year = projections[9]?.totalReturns || 0;
    const betterInvestment = propertyReturns10Year > fdReturns10Year ? 'property' : 'fd';

    setResults({
      rentalYield,
      priceToRent,
      annualRent,
      passedFilters,
      analyzedFilters,
      recommendation,
      recommendationClass,
      projections,
      fdReturns10Year,
      propertyReturns10Year,
      betterInvestment,
      appreciationRate,
      // Inputs used, so the charts do not change until Calculate is pressed again.
      price,
      days,
      infrastructure,
      location,
    });
  };

  const getAppreciationRate = () => {
    let baseRate = 6; // Base appreciation
    
    // Infrastructure bonus
    if (infrastructure === 'metro' || infrastructure === 'airport') baseRate += 4;
    else if (infrastructure === 'it-park' || infrastructure === 'hospital') baseRate += 3;
    else if (infrastructure === 'road') baseRate += 2;
    else if (infrastructure === 'none') baseRate -= 1;
    
    // Location bonus
    if (location === 'metro') baseRate += 2;
    else if (location === 'tier2') baseRate += 1;
    
    return baseRate;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'avoid': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✓';
      case 'neutral': return '⚠';
      case 'avoid': return '✗';
      default: return '○';
    }
  };

  const radarData = results ? [
    { subject: 'Rental Yield', value: Math.min(results.rentalYield * 12.5, 100), fullMark: 100 },
    { subject: 'Price-to-Rent', value: Math.max(100 - (results.priceToRent - 10) * 5, 0), fullMark: 100 },
    { subject: 'Infrastructure', value: results.infrastructure === 'metro' || results.infrastructure === 'airport' ? 100 : results.infrastructure === 'it-park' || results.infrastructure === 'hospital' ? 80 : results.infrastructure === 'road' ? 60 : results.infrastructure === 'none' ? 20 : 50, fullMark: 100 },
    { subject: 'Liquidity', value: results.days < 60 ? 100 : results.days <= 90 ? 60 : 30, fullMark: 100 },
    { subject: 'Location', value: results.location === 'metro' ? 100 : results.location === 'tier2' ? 70 : 40, fullMark: 100 },
  ] : [];

  const pieData = results ? [
    { name: 'Property Appreciation', value: Math.round(results.projections[9]?.propertyValue - results.price) },
    { name: 'Rental Income (10 yrs)', value: Math.round(results.projections[9]?.totalRentalIncome || 0) },
  ] : [];

  const COLORS = ['#10B981', '#3B82F6'];

  const formProps = useCalcForm(calculateAll);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO
        title="Real Estate Investment Calculator - 4-Filter Property Analysis"
        description="Analyze property investments with our advanced 4-Filter Framework. Calculate rental yield, price-to-rent ratio, evaluate infrastructure development and liquidity factors for smart real estate decisions in India."
        keywords="real estate calculator, property investment India, rental yield calculator, price to rent ratio, property ROI calculator, real estate investment analysis, 4 filter framework, property evaluation tool"
        canonicalUrl="/tools/real-estate-investment"
        structuredData={structuredData}
      />
      <Navbar />

      <main className="flex-grow mt-16 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              4-Filter Framework
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Real Estate Investment{" "}
              <span className="text-green-600">Calculator</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Make data-driven property decisions. Our 4-filter framework separates wealth-building assets from overpriced investments.
            </p>
          </div>

          {/* Info Toggle */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-5 py-2.5 bg-white border border-green-200 text-green-700 rounded-full shadow-sm hover:bg-green-50 transition font-medium"
            >
              {showInfo ? "Hide" : "Learn"} The 4-Filter Framework
            </button>
            {showInfo && (
              <div className="mt-6 p-6 bg-white shadow-lg rounded-2xl text-left max-w-4xl mx-auto border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">The 4-Filter Property Investment Framework</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-2">🏠 Filter 1: Rental Yield</h4>
                    <p className="text-sm text-gray-700">Annual Rent ÷ Property Price × 100</p>
                    <p className="text-xs text-gray-500 mt-1">&gt;4% Good | 3-4% Neutral | &lt;3% Avoid</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Filter 2: Price-to-Rent Ratio</h4>
                    <p className="text-sm text-gray-700">Property Price ÷ Annual Rent</p>
                    <p className="text-xs text-gray-500 mt-1">&lt;15 Buy | 15-20 Neutral | &gt;20 Rent</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-800 mb-2">🚇 Filter 3: Infrastructure</h4>
                    <p className="text-sm text-gray-700">5-Year Development Pipeline</p>
                    <p className="text-xs text-gray-500 mt-1">Metro/Airport = 15-30% faster appreciation</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <h4 className="font-semibold text-orange-800 mb-2">🔄 Filter 4: Liquidity</h4>
                    <p className="text-sm text-gray-700">Average Sale Time in Area</p>
                    <p className="text-xs text-gray-500 mt-1">&lt;60 days Good | 60-90 Moderate | &gt;90 Avoid</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">💡 Golden Rule: Properties passing 3+ filters typically deliver resilient returns across market cycles.</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Calculator Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100" {...formProps}>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Property Details
                </h2>

                {/* Property Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Price ({sym})
                  </label>
                  <input
                    type="text"
                    value={propertyPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9]+$/.test(value)) {
                        setPropertyPrice(value === "" ? "" : parseInt(value).toLocaleString("en-IN"));
                      }
                    }}
                    placeholder="1,00,00,000"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Monthly Rent */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expected Monthly Rent ({sym})
                  </label>
                  <input
                    type="text"
                    value={monthlyRent}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || /^[0-9]+$/.test(value)) {
                        setMonthlyRent(value === "" ? "" : parseInt(value).toLocaleString("en-IN"));
                      }
                    }}
                    placeholder="35,000"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* Property Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                  >
                    <option value="1bhk">1 BHK Apartment</option>
                    <option value="2bhk">2 BHK Apartment</option>
                    <option value="3bhk">3 BHK Apartment</option>
                    <option value="villa">Villa / Independent House</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="plot">Plot / Land</option>
                  </select>
                </div>

                {/* Location Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Type
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                  >
                    <option value="metro">Metro City (Mumbai, Delhi, Bangalore...)</option>
                    <option value="tier2">Tier 2 City (Pune, Ahmedabad, Jaipur...)</option>
                    <option value="tier3">Tier 3 / Suburban Area</option>
                  </select>
                </div>

                {/* Infrastructure */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upcoming Infrastructure (within 1km)
                  </label>
                  <select
                    value={infrastructure}
                    onChange={(e) => setInfrastructure(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                  >
                    <option value="">Select infrastructure...</option>
                    <option value="metro">Metro / Rapid Transit</option>
                    <option value="airport">Airport / Expressway</option>
                    <option value="it-park">IT Park / Business Hub</option>
                    <option value="hospital">Hospital / University</option>
                    <option value="road">Road Widening / Flyover</option>
                    <option value="none">No Major Projects</option>
                  </select>
                </div>

                {/* Sale Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Avg. Sale Time in Area (days)
                  </label>
                  <input
                    type="number"
                    value={saleTime}
                    onChange={(e) => setSaleTime(e.target.value)}
                    placeholder="45"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Check local property portals for avg. listing duration</p>
                </div>

                <button
                  onClick={calculateAll}
                  className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Calculate Analysis
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* 4 Filter Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Rental Yield Filter */}
                <div className={`bg-white rounded-2xl p-5 border-2 transition-all ${getStatusColor(filterResults.yield.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Filter 1: Rental Yield</h3>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      filterResults.yield.status === 'good' ? 'bg-green-500 text-white' :
                      filterResults.yield.status === 'neutral' ? 'bg-yellow-500 text-white' :
                      filterResults.yield.status === 'avoid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStatusIcon(filterResults.yield.status)}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {filterResults.yield.value > 0 ? `${filterResults.yield.value.toFixed(2)}%` : '-'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {filterResults.yield.status === 'good' ? 'Good value, worth exploring' :
                     filterResults.yield.status === 'neutral' ? 'Neutral zone, analyze carefully' :
                     filterResults.yield.status === 'avoid' ? 'Low yield, consider renting instead' : 'Enter details to calculate'}
                  </p>
                </div>

                {/* Price-to-Rent Filter */}
                <div className={`bg-white rounded-2xl p-5 border-2 transition-all ${getStatusColor(filterResults.ratio.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Filter 2: Price-to-Rent</h3>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      filterResults.ratio.status === 'good' ? 'bg-green-500 text-white' :
                      filterResults.ratio.status === 'neutral' ? 'bg-yellow-500 text-white' :
                      filterResults.ratio.status === 'avoid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStatusIcon(filterResults.ratio.status)}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {filterResults.ratio.value > 0 ? filterResults.ratio.value.toFixed(1) : '-'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {filterResults.ratio.status === 'good' ? 'Cheaper to buy than rent' :
                     filterResults.ratio.status === 'neutral' ? 'Compare financing options' :
                     filterResults.ratio.status === 'avoid' ? 'Cheaper to rent in this area' : 'Enter details to calculate'}
                  </p>
                </div>

                {/* Infrastructure Filter */}
                <div className={`bg-white rounded-2xl p-5 border-2 transition-all ${getStatusColor(filterResults.infra.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Filter 3: Infrastructure</h3>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      filterResults.infra.status === 'good' ? 'bg-green-500 text-white' :
                      filterResults.infra.status === 'avoid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStatusIcon(filterResults.infra.status)}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {filterResults.infra.value === 'metro' ? 'Metro / Transit' :
                     filterResults.infra.value === 'airport' ? 'Airport / Highway' :
                     filterResults.infra.value === 'it-park' ? 'IT Park / Business' :
                     filterResults.infra.value === 'hospital' ? 'Hospital / University' :
                     filterResults.infra.value === 'road' ? 'Road Improvement' :
                     filterResults.infra.value === 'none' ? 'No Major Projects' : 'Not Selected'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {filterResults.infra.status === 'good' ? '15-30% faster appreciation expected' :
                     filterResults.infra.status === 'avoid' ? 'Limited growth potential' : 'Select infrastructure type'}
                  </p>
                </div>

                {/* Liquidity Filter */}
                <div className={`bg-white rounded-2xl p-5 border-2 transition-all ${getStatusColor(filterResults.liquidity.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Filter 4: Liquidity</h3>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      filterResults.liquidity.status === 'good' ? 'bg-green-500 text-white' :
                      filterResults.liquidity.status === 'neutral' ? 'bg-yellow-500 text-white' :
                      filterResults.liquidity.status === 'avoid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStatusIcon(filterResults.liquidity.status)}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {filterResults.liquidity.value > 0 ? `${filterResults.liquidity.value} days` : '-'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {filterResults.liquidity.status === 'good' ? 'High demand, easy exit' :
                     filterResults.liquidity.status === 'neutral' ? 'Moderate demand' :
                     filterResults.liquidity.status === 'avoid' ? 'Low demand, hard to sell' : 'Enter average sale time'}
                  </p>
                </div>
              </div>

              {/* Overall Assessment */}
              {results && (
                <div className={`rounded-2xl p-6 border-2 ${
                  results.recommendationClass === 'good' ? 'bg-green-50 border-green-300' :
                  results.recommendationClass === 'neutral' ? 'bg-yellow-50 border-yellow-300' :
                  results.recommendationClass === 'avoid' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Overall Assessment</h3>
                      <p className={`text-2xl font-bold ${
                        results.recommendationClass === 'good' ? 'text-green-700' :
                        results.recommendationClass === 'neutral' ? 'text-yellow-700' :
                        results.recommendationClass === 'avoid' ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {results.recommendation}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{results.passedFilters}/{results.analyzedFilters}</div>
                        <div className="text-xs text-gray-500">Filters Passed</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              {results && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Investment Analysis</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartType("radar")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                          chartType === "radar" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Score
                      </button>
                      <button
                        onClick={() => setChartType("pie")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                          chartType === "pie" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Returns
                      </button>
                      <button
                        onClick={() => setChartType("bar")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                          chartType === "bar" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Projection
                      </button>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={320}>
                    {chartType === "radar" ? (
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.5} />
                        <Tooltip />
                      </RadarChart>
                    ) : chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    ) : (
                      <BarChart data={results.projections.filter((_, i) => i % 2 === 0 || i === 9)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `${sym}${(value / 100000).toFixed(0)}L`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="propertyValue" name="Property Value" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="totalRentalIncome" name="Total Rent Earned" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {/* FD Comparison */}
              {results && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Property vs Fixed Deposit (10 Year Comparison)
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">Property Returns</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(results.propertyReturns10Year)}</p>
                      <p className="text-xs text-gray-400 mt-1">{results.appreciationRate}% appreciation + rent</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">FD Returns (7%)</p>
                      <p className="text-2xl font-bold text-blue-400">{formatCurrency(results.fdReturns10Year)}</p>
                      <p className="text-xs text-gray-400 mt-1">Risk-free, guaranteed</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-1">Better Option</p>
                      <p className={`text-2xl font-bold ${results.betterInvestment === 'property' ? 'text-green-400' : 'text-blue-400'}`}>
                        {results.betterInvestment === 'property' ? 'Property' : 'Fixed Deposit'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {results.betterInvestment === 'property' 
                          ? `+${formatCurrency(results.propertyReturns10Year - results.fdReturns10Year)} extra` 
                          : `${formatCurrency(results.fdReturns10Year - results.propertyReturns10Year)} safer`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {results && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Annual Rental Income</p>
                        <p className="text-green-600 font-bold">{formatCurrency(results.annualRent)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Est. Appreciation Rate</p>
                        <p className="text-blue-600 font-bold">{results.appreciationRate}% per year</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">10-Year Property Value</p>
                        <p className="text-purple-600 font-bold">{formatCurrency(results.projections[9]?.propertyValue || 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Total 10-Year Returns</p>
                        <p className="text-orange-600 font-bold">{formatCurrency(results.propertyReturns10Year)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Market Stats Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Market Statistics 2025</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { value: "$952B", label: "Global RE Investment", trend: "+27%" },
                { value: `${sym}2.91T`, label: "India Rental Market", trend: "+7.4%" },
                { value: "6.5%", label: "Price Growth YoY", trend: "↑" },
                { value: "+53%", label: "Domestic Investment", trend: "H1 2025" },
                { value: "6.8%", label: "Avg. Mortgage Rate", trend: "30-yr" },
                { value: "6.9%", label: "Vacancy Rate", trend: "National" },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Matrix */}
          <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Decision Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-4 py-3 text-left rounded-tl-lg">Filter</th>
                    <th className="px-4 py-3 text-center">Criteria</th>
                    <th className="px-4 py-3 text-center bg-green-600">Good / Pass</th>
                    <th className="px-4 py-3 text-center bg-yellow-400 text-[#111827]">Caution</th>
                    <th className="px-4 py-3 text-center bg-red-500 rounded-tr-lg">Avoid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Rental Yield</td>
                    <td className="px-4 py-3 text-center text-gray-500">Annual Rent ÷ Price</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">&gt;4%</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">3-4%</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">&lt;3%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium">Price-to-Rent</td>
                    <td className="px-4 py-3 text-center text-gray-500">Price ÷ Annual Rent</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">&lt;15</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">15-20</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">&gt;20</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Infrastructure</td>
                    <td className="px-4 py-3 text-center text-gray-500">5-Year Pipeline</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">Metro/Airport</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">Road Work</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">None</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium">Liquidity</td>
                    <td className="px-4 py-3 text-center text-gray-500">Avg. Sale Time</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">&lt;60 days</td>
                    <td className="px-4 py-3 text-center text-yellow-600 font-medium">60-90 days</td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">&gt;90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              💡 <strong>Tip:</strong> Properties passing 3+ filters typically deliver resilient returns across market cycles.
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Need personalized advice for your property investment?</p>
            <Link
              to="/advisory"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Talk to a Financial Advisor
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RealEstateCalculator;
