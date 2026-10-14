import React, { useState } from "react";
import useRegion from "../../../hooks/useRegion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useMoneyState, useCalcSession } from "../lib/calcState";
import { useCalcForm } from "../lib/calcForm";
import { piePercentLabel, pieLegend } from "../lib/pieParts";
import {
  analyse,
  BENCHMARKS,
  DEFAULT_ASSUMPTIONS,
  INFRA_GROWTH_ADJ,
  LTCG_RATE_PCT,
  NET_YIELD_FACTOR,
  SCENARIO_SPREAD,
  type Analysis,
  type LocationType,
  type Status,
} from "../lib/realEstate";
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
  Legend,
} from "recharts";
import { chartGrid, chartTooltip, chartColors, chartXAxis, chartYAxis, chartBarRadius, chartMaxBarSize } from "@/components/charts/chartTheme";

const INFRA_LABELS: Record<string, string> = {
  metro: "Metro / Transit",
  airport: "Airport / Highway",
  "it-park": "IT Park / Business",
  hospital: "Hospital / University",
  road: "Road Improvement",
  none: "No Major Projects",
};

interface Snapshot {
  analysis: Analysis;
  price: number;
  location: LocationType;
  infrastructure: string;
}

const RealEstateCalculator = () => {
  const { symbol: sym } = useRegion();
  const numLocale = sym === "₹" ? "en-IN" : "en-US";
  // Input States
  const [propertyPrice, setPropertyPrice] = useMoneyState("realestate.price", "1,00,00,000");
  const [monthlyRent, setMonthlyRent] = useMoneyState("realestate.rent", "25,000");
  const [saleTime, setSaleTime] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [location, setLocation] = useState<LocationType>("metro");
  const [propertyType, setPropertyType] = useState("2bhk");

  // Advanced assumptions (kept as strings so fields can be cleared while typing).
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [adv, setAdv] = useState({
    years: String(DEFAULT_ASSUMPTIONS.years),
    growth: "", // blank = location benchmark + infrastructure
    rentIncrease: String(DEFAULT_ASSUMPTIONS.rentIncreasePct),
    vacancy: String(DEFAULT_ASSUMPTIONS.vacancyMonths),
    holding: String(DEFAULT_ASSUMPTIONS.holdingCostPct),
    buyCost: String(DEFAULT_ASSUMPTIONS.buyCostPct),
    sellCost: String(DEFAULT_ASSUMPTIONS.sellCostPct),
    fdRate: String(DEFAULT_ASSUMPTIONS.fdRatePct),
    taxSlab: String(DEFAULT_ASSUMPTIONS.taxSlabPct),
  });
  const setAdvField = (key: keyof typeof adv) => (e) => setAdv((prev) => ({ ...prev, [key]: e.target.value }));

  // Calculated Results — a snapshot, so charts do not change until Calculate is pressed again.
  const [results, setResults] = useState<Snapshot | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [chartType, setChartType] = useState("radar");

  const structuredData = generateToolData({
    name: 'Real Estate Investment Calculator',
    description: 'Analyze property investments with the 4-Filter Framework. Calculate net rental yield, price-to-rent ratio, and evaluate infrastructure & liquidity against your location, then compare with a fixed deposit after costs and tax.'
  });

  // Parse number from formatted string
  const parseNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, "")) || 0;
  };
  // Blank/invalid -> fallback (so clearing an advanced field uses its default).
  const numOr = (str: string, fallback: number) => {
    const n = parseFloat(String(str).replace(/,/g, ""));
    return Number.isFinite(n) ? n : fallback;
  };

  // Format number with Indian locale
  const formatNumber = (num) => {
    return num.toLocaleString(numLocale);
  };

  // Format currency
  const formatCurrency = (num) => {
    const sign = num < 0 ? "-" : "";
    const n = Math.abs(num);
    if (sym === "₹") {
      if (n >= 10000000) return `${sign}${sym}${(n / 10000000).toFixed(2)} Cr`;
      if (n >= 100000) return `${sign}${sym}${(n / 100000).toFixed(2)} L`;
    } else {
      if (n >= 1000000000) return `${sign}${sym}${(n / 1000000000).toFixed(2)}B`;
      if (n >= 1000000) return `${sign}${sym}${(n / 1000000).toFixed(2)}M`;
    }
    return `${sign}${sym}${formatNumber(Math.round(n))}`;
  };

  const calculateAll = () => {
    const price = parseNumber(propertyPrice);
    const rent = parseNumber(monthlyRent);

    const analysis = analyse({
      price,
      monthlyRent: rent,
      location,
      infrastructure,
      saleDays: parseNumber(saleTime),
      assumptions: {
        years: numOr(adv.years, DEFAULT_ASSUMPTIONS.years),
        growthOverride: adv.growth.trim() === "" ? null : numOr(adv.growth, DEFAULT_ASSUMPTIONS.growthOverride as any),
        rentIncreasePct: numOr(adv.rentIncrease, DEFAULT_ASSUMPTIONS.rentIncreasePct),
        vacancyMonths: numOr(adv.vacancy, DEFAULT_ASSUMPTIONS.vacancyMonths),
        holdingCostPct: numOr(adv.holding, DEFAULT_ASSUMPTIONS.holdingCostPct),
        buyCostPct: numOr(adv.buyCost, DEFAULT_ASSUMPTIONS.buyCostPct),
        sellCostPct: numOr(adv.sellCost, DEFAULT_ASSUMPTIONS.sellCostPct),
        fdRatePct: numOr(adv.fdRate, DEFAULT_ASSUMPTIONS.fdRatePct),
        taxSlabPct: numOr(adv.taxSlab, DEFAULT_ASSUMPTIONS.taxSlabPct),
      },
    });
    setResults(analysis ? { analysis, price, location, infrastructure } : null);
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'avoid': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'good': return '✓';
      case 'neutral': return '⚠';
      case 'avoid': return '✗';
      default: return '○';
    }
  };

  const clampScore = (n: number) => Math.round(Math.max(0, Math.min(100, n)));

  // Radar scores are relative to the location's benchmark: 75 = "typical for this
  // location", 100 = clearly better.
  const radarData = results ? (() => {
    const a = results.analysis;
    const bm = a.benchmark;
    return [
      { subject: 'Net Yield', value: clampScore((a.netYield / (bm.yieldGood * NET_YIELD_FACTOR)) * 75), fullMark: 100 },
      { subject: 'Price-to-Rent', value: clampScore((bm.ptrGood / a.priceToRent) * 75), fullMark: 100 },
      { subject: 'Infrastructure', value: results.infrastructure === 'metro' || results.infrastructure === 'airport' ? 100 : results.infrastructure === 'it-park' || results.infrastructure === 'hospital' ? 80 : results.infrastructure === 'road' ? 60 : results.infrastructure === 'none' ? 20 : 50, fullMark: 100 },
      { subject: 'Liquidity', value: clampScore((bm.daysGood / a.days) * 75), fullMark: 100 },
      { subject: 'Growth Outlook', value: clampScore((a.growthBasePct / 8) * 100), fullMark: 100 },
    ];
  })() : [];

  const finalRow = results ? results.analysis.projections[results.analysis.projections.length - 1] : null;
  const pieData = results && finalRow ? [
    { name: 'Price Gain', value: Math.max(0, Math.round(finalRow.propertyValue - results.price)) },
    { name: 'Net Rent (after costs & tax)', value: Math.max(0, Math.round(finalRow.totalRentalIncome)) },
  ] : [];

  const COLORS = [chartColors.positive, chartColors.series[2]];

  useCalcSession("realestate", calculateAll, !!results);

  const formProps = useCalcForm(calculateAll);

  const filterCards = results ? (() => {
    const a = results.analysis;
    const bm = a.benchmark;
    const f = a.filters;
    return [
      {
        title: 'Filter 1: Net Rental Yield',
        status: f.yield.status,
        value: `${f.yield.value.toFixed(2)}%`,
        note: `Gross ${a.grossYield.toFixed(2)}%. Typical for a ${bm.label.toLowerCase()}: ${bm.yieldGood.toFixed(1)}%+ gross.`,
        verdict: f.yield.status === 'good' ? 'Healthy income for this location' :
          f.yield.status === 'neutral' ? 'Average for this location' : 'Low income for this location',
      },
      {
        title: 'Filter 2: Price-to-Rent',
        status: f.ratio.status,
        value: `${a.priceToRent.toFixed(1)}x`,
        note: `${bm.label} range: up to ${bm.ptrGood}x is good, above ${bm.ptrAvoid}x is expensive.`,
        verdict: f.ratio.status === 'good' ? 'Fairly priced against rent' :
          f.ratio.status === 'neutral' ? 'Priced above rent; growth must make up the gap' : 'Expensive for the rent it earns',
      },
      {
        title: 'Filter 3: Infrastructure',
        status: f.infra.status,
        value: INFRA_LABELS[results.infrastructure] || 'Not Selected',
        note: results.infrastructure
          ? `Adds ${INFRA_GROWTH_ADJ[results.infrastructure] ?? 0}% a year to the growth estimate (an assumption).`
          : 'Select a project type and press Calculate.',
        verdict: f.infra.status === 'good' ? 'Major project nearby' :
          f.infra.status === 'neutral' ? 'Minor project nearby' : f.infra.status === 'avoid' ? 'No projects nearby' : '',
        small: true,
      },
      {
        title: 'Filter 4: Liquidity',
        status: f.liquidity.status,
        value: `${a.days} days`,
        note: `${a.daysAssumed ? 'Assumed typical for this location. ' : ''}${bm.label}: under ${bm.daysGood} days is good, over ${bm.daysAvoid} is slow.`,
        verdict: f.liquidity.status === 'good' ? 'Should be easy to sell' :
          f.liquidity.status === 'neutral' ? 'Moderate demand' : 'May take long to sell',
      },
    ];
  })() : [];

  const years = results?.analysis.assumptions.years ?? 10;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO
        title="Real Estate Investment Calculator - 4-Filter Property Analysis"
        description="Analyze property investments with our 4-Filter Framework. Calculate net rental yield and price-to-rent against your location, evaluate infrastructure and liquidity, and compare with a fixed deposit after costs and tax in India."
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
            <h1 className="xt-title mb-4">
              Real Estate Investment{" "}
              <span className="text-green-600">Calculator</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Make data-driven property decisions. Our 4-filter framework judges a property against its own location, then compares it with a fixed deposit after costs and tax.
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
                <h3 className="text-xl font-semibold text-gray-900 mb-1">The 4-Filter Property Investment Framework</h3>
                <p className="text-sm text-gray-500 mb-4">Each filter is judged against typical values for the location type you choose (see the benchmark table below).</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-2">🏠 Filter 1: Net Rental Yield</h4>
                    <p className="text-sm text-gray-700">(Rent after vacancy and upkeep) ÷ (Price + buying costs)</p>
                    <p className="text-xs text-gray-500 mt-1">How much income the money you put in actually earns.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Filter 2: Price-to-Rent Ratio</h4>
                    <p className="text-sm text-gray-700">Property Price ÷ Annual Rent</p>
                    <p className="text-xs text-gray-500 mt-1">Years of rent it takes to equal the price. Lower means better value.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-800 mb-2">🚇 Filter 3: Infrastructure</h4>
                    <p className="text-sm text-gray-700">Upcoming projects within 1 km</p>
                    <p className="text-xs text-gray-500 mt-1">Adds 0.5 to 2% a year to the growth estimate. This is a judgement, not data, so change the growth in advanced assumptions if you disagree.</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <h4 className="font-semibold text-orange-800 mb-2">🔄 Filter 4: Liquidity</h4>
                    <p className="text-sm text-gray-700">Average days to sell in the area</p>
                    <p className="text-xs text-gray-500 mt-1">If left blank, a typical value for your location is used.</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">💡 Note: Filters 1 and 2 are two views of the same rent, so they usually agree. Filter 1 also counts costs, which is why it can be stricter.</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Calculator Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100" {...formProps}>
                <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Property Details
                </h2>

                {/* Property Price */}
                <div className="mb-4">
                  <label htmlFor="realestate-property-price" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Price ({sym})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                    <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                      id="realestate-property-price"
                      type="text"
                      value={propertyPrice}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        if (value === "" || /^[0-9]+$/.test(value)) {
                          setPropertyPrice(value === "" ? "" : parseInt(value).toLocaleString(numLocale));
                        }
                      }}
                      placeholder="1,00,00,000"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                </div>

                {/* Monthly Rent */}
                <div className="mb-4">
                  <label htmlFor="realestate-expected-monthly-rent" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expected Monthly Rent ({sym})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-gray-500">{sym}</span>
                    <input style={{ paddingLeft: `calc(${String(sym).trim().length}ch + 1.5rem)` }}
                      id="realestate-expected-monthly-rent"
                      type="text"
                      value={monthlyRent}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        if (value === "" || /^[0-9]+$/.test(value)) {
                          setMonthlyRent(value === "" ? "" : parseInt(value).toLocaleString(numLocale));
                        }
                      }}
                      placeholder="25,000"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="mb-4">
                  <label htmlFor="realestate-property-type" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Type
                  </label>
                  <select
                    id="realestate-property-type"
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
                  <label htmlFor="realestate-location-type" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Type
                  </label>
                  <select
                    id="realestate-location-type"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as LocationType)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                  >
                    <option value="metro">Metro City (Mumbai, Delhi, Bangalore...)</option>
                    <option value="tier2">Tier 2 City (Pune, Ahmedabad, Jaipur...)</option>
                    <option value="tier3">Tier 3 / Suburban Area</option>
                  </select>
                </div>

                {/* Infrastructure */}
                <div className="mb-4">
                  <label htmlFor="realestate-upcoming-infrastructure" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upcoming Infrastructure (within 1km)
                  </label>
                  <select
                    id="realestate-upcoming-infrastructure"
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
                  <label htmlFor="realestate-avg-sale-time-in-area" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Avg. Sale Time in Area (days)
                  </label>
                  <input
                    id="realestate-avg-sale-time-in-area"
                    type="number"
                    value={saleTime}
                    onChange={(e) => setSaleTime(e.target.value)}
                    placeholder={`${BENCHMARKS[location].daysDefault} (typical)`}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to use the typical value for your location. Local property portals show real listing durations.</p>
                </div>

                {/* Advanced assumptions */}
                <div className="mb-4 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    aria-expanded={showAdvanced}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
                  >
                    Advanced assumptions
                    <span className="text-gray-400">{showAdvanced ? "−" : "+"}</span>
                  </button>
                  {showAdvanced && (
                    <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                      {[
                        ['years', 'Holding period (years)', '1-30'],
                        ['growth', 'Price growth (% / yr)', `auto: ${BENCHMARKS[location].growth}% + project`],
                        ['rentIncrease', 'Rent increase (% / yr)', ''],
                        ['vacancy', 'Vacant months / yr', ''],
                        ['holding', 'Upkeep + prop. tax (% of price / yr)', ''],
                        ['buyCost', 'Buying costs (%)', 'stamp duty + brokerage'],
                        ['sellCost', 'Selling costs (%)', ''],
                        ['fdRate', 'FD rate (%)', ''],
                        ['taxSlab', 'Your tax slab (%)', ''],
                      ].map(([key, label, hint]) => (
                        <div key={key} className={key === 'growth' ? 'col-span-2' : ''}>
                          <label htmlFor={`realestate-adv-${key}`} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                          <input
                            id={`realestate-adv-${key}`}
                            type="number"
                            step="any"
                            value={adv[key]}
                            onChange={setAdvField(key as keyof typeof adv)}
                            placeholder={hint}
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          />
                        </div>
                      ))}
                      <p className="col-span-2 text-xs text-gray-500">Defaults are typical Indian figures. Edit any of them to match your case.</p>
                    </div>
                  )}
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
                {(filterCards.length ? filterCards : [
                  { title: 'Filter 1: Net Rental Yield', status: null, value: '-', note: '', verdict: 'Enter details to calculate' },
                  { title: 'Filter 2: Price-to-Rent', status: null, value: '-', note: '', verdict: 'Enter details to calculate' },
                  { title: 'Filter 3: Infrastructure', status: null, value: 'Not Selected', note: '', verdict: 'Enter details to calculate' },
                  { title: 'Filter 4: Liquidity', status: null, value: '-', note: '', verdict: 'Enter details to calculate' },
                ] as any[]).map((card) => (
                  <div key={card.title} className={`bg-white rounded-2xl p-5 border-2 transition-all ${getStatusColor(card.status)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{card.title}</h3>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                        card.status === 'good' ? 'bg-green-500 text-white' :
                        card.status === 'neutral' ? 'bg-yellow-500 text-white' :
                        card.status === 'avoid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {getStatusIcon(card.status)}
                      </span>
                    </div>
                    <div className={`${card.small ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>{card.value}</div>
                    <p className="text-sm font-medium text-gray-700">{card.verdict}</p>
                    {card.note && <p className="text-xs text-gray-500 mt-1">{card.note}</p>}
                  </div>
                ))}
              </div>

              {/* Overall Assessment */}
              {results && (
                <div className={`rounded-2xl p-6 border-2 ${
                  results.analysis.recommendationClass === 'good' ? 'bg-green-50 border-green-300' :
                  results.analysis.recommendationClass === 'neutral' ? 'bg-yellow-50 border-yellow-300' :
                  results.analysis.recommendationClass === 'avoid' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall Assessment</h3>
                      <p className={`text-2xl font-bold ${
                        results.analysis.recommendationClass === 'good' ? 'text-green-700' :
                        results.analysis.recommendationClass === 'neutral' ? 'text-yellow-700' :
                        results.analysis.recommendationClass === 'avoid' ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {results.analysis.recommendation}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Judged against typical values for a {results.analysis.benchmark.label.toLowerCase()}.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-4 py-2 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{results.analysis.passedFilters}/{results.analysis.analyzedFilters}</div>
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
                    <h3 className="text-xl font-semibold text-gray-900">Investment Analysis</h3>
                    <div className="flex gap-2">
                      {[['radar', 'Score'], ['pie', 'Returns'], ['bar', 'Projection']].map(([id, label]) => (
                        <button
                          key={id}
                          onClick={() => setChartType(id)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                            chartType === id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={320}>
                    {chartType === "radar" ? (
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke={chartColors.positive} fill={chartColors.positive} fillOpacity={0.5} />
                        <Tooltip {...chartTooltip} />
                      </RadarChart>
                    ) : chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          isAnimationActive={false}
                          label={piePercentLabel}
                          labelLine={false}
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill={chartColors.series[2]}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend content={pieLegend} />
                        <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    ) : (
                      <BarChart data={results.analysis.projections.filter((_, i, arr) => i % 2 === 0 || i === arr.length - 1)}>
                        <CartesianGrid {...chartGrid} />
                        <XAxis dataKey="year" {...chartXAxis} />
                        <YAxis {...chartYAxis} tickFormatter={(value) => formatCurrency(value)} width={80} tick={{ fontSize: 11 }} />
                        <Tooltip {...chartTooltip} formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="propertyValue" name="Property Value" fill={chartColors.positive} radius={chartBarRadius} maxBarSize={chartMaxBarSize} />
                        <Bar dataKey="totalRentalIncome" name="Net Rent Earned (after costs & tax)" fill={chartColors.series[2]} radius={chartBarRadius} maxBarSize={chartMaxBarSize} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-3">
                    Score chart: 75 means typical for the location, 100 means clearly better. Returns and Projection use the base-case growth of {results.analysis.growthBasePct.toFixed(1)}% a year.
                  </p>
                </div>
              )}

              {/* FD Comparison */}
              {results && (() => {
                const a = results.analysis;
                const b = a.base;
                const better = a.betterInvestment === 'property';
                return (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Property vs Fixed Deposit ({years} Year Comparison)
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Same money in both: {formatCurrency(a.outlay)} (price + buying costs). Rent is reinvested at the FD rate, and both sides are after tax and costs.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">Property (base case)</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(b.profit)}</p>
                        <p className="text-xs text-gray-500 mt-1">profit, about {b.cagrPct.toFixed(1)}% a year at {b.growthPct.toFixed(1)}% price growth</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">FD ({a.assumptions.fdRatePct}%, after tax)</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(a.fdProfit)}</p>
                        <p className="text-xs text-gray-500 mt-1">profit, about {a.fdCagrPct.toFixed(1)}% a year, low risk</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">Higher Return</p>
                        <p className={`text-2xl font-bold ${better ? 'text-green-600' : 'text-blue-600'}`}>
                          {better ? 'Property' : 'Fixed Deposit'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {better
                            ? `${formatCurrency(b.finalWealth - a.fdFinal)} more than the FD (base case)`
                            : `${formatCurrency(a.fdFinal - b.finalWealth)} less than the FD (base case)`}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-700 mt-6 mb-2">If prices grow faster or slower</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-500">
                            <th className="py-2 pr-3 font-medium">Scenario</th>
                            <th className="py-2 pr-3 font-medium">Price growth</th>
                            <th className="py-2 pr-3 font-medium">Profit</th>
                            <th className="py-2 pr-3 font-medium">Per year</th>
                            <th className="py-2 font-medium">vs FD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {a.scenarios.map((sc) => (
                            <tr key={sc.key} className={sc.key === 'base' ? 'bg-green-50/50 font-medium' : ''}>
                              <td className="py-2 pr-3">{sc.label}</td>
                              <td className="py-2 pr-3">{sc.growthPct.toFixed(1)}%</td>
                              <td className="py-2 pr-3">{formatCurrency(sc.profit)}</td>
                              <td className="py-2 pr-3">{sc.cagrPct.toFixed(1)}%</td>
                              <td className={`py-2 ${sc.beatsFd ? 'text-green-600' : 'text-red-600'}`}>{sc.beatsFd ? 'Beats FD' : 'Behind FD'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Capital gains tax on the sale: {formatCurrency(a.capitalGainsTax)} ({years >= 2 ? `${LTCG_RATE_PCT}% long-term` : 'at your slab, held under 2 years'}). Conservative and optimistic move growth by {SCENARIO_SPREAD} points either way. Not modelled: home-loan interest, GST, cess and one-off repairs.
                    </p>
                  </div>
                );
              })()}

              {/* Key Insights */}
              {results && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Annual Rent (gross)', value: formatCurrency(results.analysis.grossAnnualRent), cls: 'text-green-600', bg: 'bg-green-100' },
                      { label: 'Price Growth Estimate', value: `${results.analysis.growthBasePct.toFixed(1)}% per year${results.analysis.infraAdjPct ? ` (incl. +${results.analysis.infraAdjPct}% for projects)` : ''}`, cls: 'text-blue-600', bg: 'bg-blue-100' },
                      { label: `${years}-Year Property Value`, value: formatCurrency(finalRow?.propertyValue || 0), cls: 'text-purple-600', bg: 'bg-purple-100' },
                      { label: 'Total Cost to Buy', value: formatCurrency(results.analysis.outlay), cls: 'text-orange-600', bg: 'bg-orange-100' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <span className={`text-lg font-bold ${item.cls}`}>•</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.label}</p>
                          <p className={`${item.cls} font-bold`}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Market Stats Section */}
          <div className="mt-12">
            <h2 className="xt-section mb-6 text-center">Market Statistics 2025</h2>
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

          {/* Benchmarks used */}
          <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="xt-section mb-2 text-center">Benchmarks Used</h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Rough Indian-market ballparks, not live data. Good means at or better than the first value, avoid means beyond the second. Check local listings for your exact area.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-4 py-3 text-left rounded-tl-lg">Measure</th>
                    {(Object.keys(BENCHMARKS) as LocationType[]).map((k, i, arr) => (
                      <th key={k} className={`px-4 py-3 text-center ${i === arr.length - 1 ? 'rounded-tr-lg' : ''}`}>{BENCHMARKS[k].label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Gross rental yield (good / avoid)', (b) => `${b.yieldGood}%+ / <${b.yieldAvoid}%`],
                    ['Price-to-rent (good / avoid)', (b) => `≤${b.ptrGood} / >${b.ptrAvoid}`],
                    ['Typical price growth', (b) => `${b.growth}% a year`],
                    ['Days to sell (good / avoid)', (b) => `<${b.daysGood} / >${b.daysAvoid}`],
                  ].map(([label, fmt], idx) => (
                    <tr key={label as string} className={idx % 2 ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-3 font-medium">{label as string}</td>
                      {(Object.keys(BENCHMARKS) as LocationType[]).map((k) => (
                        <td key={k} className="px-4 py-3 text-center text-gray-700">{(fmt as any)(BENCHMARKS[k])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-500 text-xs mt-4">
              Net yield is judged against {NET_YIELD_FACTOR * 100}% of the gross yield bar, to allow for vacancy, upkeep and buying costs. Infrastructure adds 0.5 to 2 points of yearly growth.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RealEstateCalculator;
