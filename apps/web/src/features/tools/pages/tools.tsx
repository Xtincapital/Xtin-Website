import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SEO, { generateToolData, generateBreadcrumbData } from "../../../components/SEO";
import useRegion from "../../../hooks/useRegion";

// Professional SVG Icons for each calculator
const icons = {
	gini: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="4" y="8" width="40" height="32" rx="4" fill="#10B981"/>
			<rect x="8" y="12" width="14" height="10" rx="2" fill="#fff"/>
			<path d="M12 26h8M12 30h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="34" cy="20" r="6" fill="#fff"/>
			<path d="M34 18v4l2 1" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
			<path d="M28 32h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),
	sip: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="20" fill="#10B981" fillOpacity="0.15"/>
			<path d="M14 32l6-8 6 4 8-12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
			<circle cx="14" cy="32" r="2" fill="#10B981"/>
			<circle cx="20" cy="24" r="2" fill="#10B981"/>
			<circle cx="26" cy="28" r="2" fill="#10B981"/>
			<circle cx="34" cy="16" r="2" fill="#10B981"/>
			<path d="M32 14l4-2M34 12v4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),
	lumpsum: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="6" y="14" width="36" height="24" rx="3" fill="#10B981" fillOpacity="0.15"/>
			<rect x="10" y="18" width="28" height="16" rx="2" fill="#10B981"/>
			<circle cx="24" cy="26" r="6" fill="#fff"/>
			<text x="24" y="29" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold">₹</text>
			<rect x="12" y="20" width="4" height="4" rx="1" fill="#fff" fillOpacity="0.5"/>
			<rect x="32" y="28" width="4" height="4" rx="1" fill="#fff" fillOpacity="0.5"/>
		</svg>
	),
	swp: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="18" stroke="#10B981" strokeWidth="3" fill="#10B981" fillOpacity="0.1"/>
			<path d="M24 14v10l6 6" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
			<path d="M32 8l4 4-4 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M36 12H28" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),
	stepUp: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<path d="M8 40h8v-8H8v8zM18 40h8V24h-8v16zM28 40h8V16h-8v24z" fill="#10B981" fillOpacity="0.3"/>
			<path d="M8 40h8v-8H8v8zM18 40h8V24h-8v16zM28 40h8V16h-8v24z" stroke="#10B981" strokeWidth="2"/>
			<path d="M34 12l6-4M38 8l2 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="38" cy="10" r="3" fill="#10B981"/>
		</svg>
	),
	cagr: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="16" fill="#10B981" fillOpacity="0.15"/>
			<path d="M16 28c0-8 4-12 8-12s8 4 8 12" stroke="#10B981" strokeWidth="3" fill="none"/>
			<path d="M24 16v-4M24 12l-2 2M24 12l2 2" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<text x="24" y="34" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold">%</text>
		</svg>
	),
	elss: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<path d="M24 6l16 10v12c0 8-6 14-16 18-10-4-16-10-16-18V16L24 6z" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2"/>
			<path d="M18 24l4 4 8-8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),
	fd: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="8" y="12" width="32" height="24" rx="4" fill="#10B981"/>
			<rect x="12" y="16" width="8" height="6" rx="1" fill="#fff"/>
			<path d="M12 28h24M12 32h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="34" cy="20" r="4" fill="#fff" fillOpacity="0.3"/>
			<path d="M34 18v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
		</svg>
	),
	rd: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="28" r="14" fill="#10B981" fillOpacity="0.15"/>
			<ellipse cx="24" cy="20" rx="12" ry="4" fill="#10B981"/>
			<path d="M12 20v12c0 2.2 5.4 4 12 4s12-1.8 12-4V20" stroke="#10B981" strokeWidth="2"/>
			<ellipse cx="24" cy="26" rx="12" ry="4" fill="none" stroke="#10B981" strokeWidth="2"/>
			<path d="M20 10l4-4 4 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M24 6v8" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
		</svg>
	),
	compound: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="18" fill="#10B981" fillOpacity="0.1"/>
			<path d="M12 32Q18 24 24 24T36 16" stroke="#10B981" strokeWidth="3" strokeLinecap="round" fill="none"/>
			<circle cx="12" cy="32" r="3" fill="#10B981"/>
			<circle cx="24" cy="24" r="3" fill="#10B981"/>
			<circle cx="36" cy="16" r="3" fill="#10B981"/>
			<text x="24" y="40" textAnchor="middle" fill="#10B981" fontSize="6" fontWeight="bold">n times</text>
		</svg>
	),
	simple: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="8" y="12" width="32" height="24" rx="2" fill="#10B981" fillOpacity="0.15"/>
			<path d="M12 30l24-12" stroke="#10B981" strokeWidth="3" strokeLinecap="round"/>
			<circle cx="12" cy="30" r="3" fill="#10B981"/>
			<circle cx="36" cy="18" r="3" fill="#10B981"/>
			<text x="24" y="40" textAnchor="middle" fill="#10B981" fontSize="6" fontWeight="bold">P×R×T</text>
		</svg>
	),
	ssy: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="18" r="8" fill="#10B981" fillOpacity="0.3"/>
			<circle cx="24" cy="18" r="8" stroke="#10B981" strokeWidth="2"/>
			<path d="M24 26c-8 0-14 4-14 8v4h28v-4c0-4-6-8-14-8z" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2"/>
			<path d="M20 16l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),
	retirement: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="14" r="6" fill="#10B981" fillOpacity="0.3" stroke="#10B981" strokeWidth="2"/>
			<path d="M16 38V26a8 8 0 0116 0v12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<path d="M20 38v-8M28 38v-8" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="38" cy="28" r="6" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2"/>
			<path d="M36 28h4M38 26v4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
		</svg>
	),
	ppf: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="10" y="8" width="28" height="32" rx="3" fill="#10B981" fillOpacity="0.15"/>
			<rect x="14" y="12" width="20" height="4" rx="1" fill="#10B981"/>
			<path d="M14 22h20M14 28h14M14 34h16" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="36" cy="36" r="6" fill="#10B981"/>
			<text x="36" y="39" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">G</text>
		</svg>
	),
	nps: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="16" fill="#10B981" fillOpacity="0.1"/>
			<path d="M24 8v32" stroke="#10B981" strokeWidth="2"/>
			<path d="M16 16h16M12 24h24M16 32h16" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="24" cy="24" r="4" fill="#10B981"/>
			<path d="M38 10l2 4h-4l2-4z" fill="#10B981"/>
		</svg>
	),
	epf: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="8" y="10" width="32" height="28" rx="4" fill="#10B981" fillOpacity="0.15"/>
			<path d="M16 18h16M16 24h12M16 30h14" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="36" cy="32" r="8" fill="#10B981"/>
			<path d="M33 32l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	),
	gratuity: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="20" r="12" fill="#10B981" fillOpacity="0.15"/>
			<path d="M18 20l4 4 8-8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
			<rect x="14" y="34" width="20" height="6" rx="2" fill="#10B981"/>
			<path d="M24 32v2" stroke="#10B981" strokeWidth="2"/>
		</svg>
	),
	tax: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<rect x="10" y="6" width="28" height="36" rx="2" fill="#10B981" fillOpacity="0.15"/>
			<rect x="14" y="10" width="20" height="6" rx="1" fill="#10B981"/>
			<path d="M14 22h20M14 28h16M14 34h12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			<circle cx="36" cy="36" r="6" fill="#10B981"/>
			<text x="36" y="39" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">%</text>
		</svg>
	),
	inflation: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<circle cx="24" cy="24" r="16" fill="#10B981" fillOpacity="0.1"/>
			<path d="M14 30l6-6 6 4 8-14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M30 14h8v8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
			<text x="24" y="42" textAnchor="middle" fill="#10B981" fontSize="6" fontWeight="bold">↑ CPI</text>
		</svg>
	),
	hra: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<path d="M8 22l16-12 16 12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
			<rect x="12" y="22" width="24" height="18" fill="#10B981" fillOpacity="0.15"/>
			<rect x="20" y="28" width="8" height="12" fill="#10B981"/>
			<rect x="14" y="26" width="6" height="6" rx="1" fill="#10B981" fillOpacity="0.5"/>
			<rect x="28" y="26" width="6" height="6" rx="1" fill="#10B981" fillOpacity="0.5"/>
		</svg>
	),
	realEstate: (
		<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
			<path d="M6 24l18-14 18 14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
			<rect x="10" y="24" width="28" height="18" rx="2" fill="#10B981" fillOpacity="0.15"/>
			<rect x="18" y="30" width="12" height="12" rx="1" fill="#10B981"/>
			<path d="M24 30v12" stroke="#fff" strokeWidth="1.5"/>
			<path d="M18 36h12" stroke="#fff" strokeWidth="1.5"/>
			<circle cx="38" cy="12" r="6" fill="#10B981"/>
			<path d="M36 12h4M38 10v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
			<rect x="12" y="26" width="4" height="4" rx="0.5" fill="#10B981" fillOpacity="0.5"/>
			<rect x="32" y="26" width="4" height="4" rx="0.5" fill="#10B981" fillOpacity="0.5"/>
		</svg>
	),
};

const sections = [
	{
		title: "Featured Financial Planner",
		description: "Expert AI guidance for your financial journey.",
		items: [
			{ path: "/gini", label: "Xtin Gini", icon: icons.gini, description: "Get personalized financial advice from our AI-powered expert planner Xtin Gini.", featured: true },
		],
	},
	{
		title: "Most Useful Calculators",
		description: "Popular calculators traders and investors use every day.",
		items: [
			{ path: "/tools/real-estate-investment", label: "Real Estate Calculator", icon: icons.realEstate, description: "Analyze property investments with 4-Filter Framework for smart decisions." },
			{ path: "/tools/sip", label: "SIP Calculator", renameKey: "sip", icon: icons.sip, description: "Calculate returns on regular, periodic investments into mutual funds." },
			{ path: "/tools/lumpsum", label: "Lumpsum Calculator", icon: icons.lumpsum, description: "Estimate returns from a one-time lump sum investment." },
			{ path: "/tools/swp", label: "SWP Calculator", renameKey: "swp", icon: icons.swp, description: "Plan systematic withdrawals from your investment portfolio." },
			{ path: "/tools/step-up-sip", label: "Step-up SIP", renameKey: "stepUp", icon: icons.stepUp, description: "Calculate growth with increasing monthly investments." },
			{ path: "/tools/cagr", label: "CAGR Calculator", icon: icons.cagr, description: "Compute Compound Annual Growth Rate for investments." },
			{ path: "/tools/elss", label: "ELSS Calculator", indiaOnly: true, icon: icons.elss, description: "Estimate tax savings and returns from Equity Linked Savings Schemes." },
		],
	},
	{
		title: "Deposit Calculators",
		description: "Bank and savings product calculators.",
		items: [
			{ path: "/tools/fd", label: "FD Calculator", indiaOnly: true, icon: icons.fd, description: "Calculate interest earnings on Fixed Deposits." },
			{ path: "/tools/rd", label: "RD Calculator", indiaOnly: true, icon: icons.rd, description: "Estimate maturity amount for Recurring Deposits." },
			{ path: "/tools/compound-interest", label: "Compound Interest", icon: icons.compound, description: "Calculate compounded interest on principal amounts." },
			{ path: "/tools/simple-interest", label: "Simple Interest", icon: icons.simple, description: "Calculate basic interest on loans or deposits." },
			{ path: "/tools/ssy-calculator", label: "SSY Calculator", indiaOnly: true, icon: icons.ssy, description: "Plan for Sukanya Samriddhi Yojana savings for girls." },
		],
	},
	{
		title: "Retirement Calculators",
		description: "Plan long-term wealth and retirement goals.",
		items: [
			{ path: "/tools/retirement", label: "Retirement Calculator", icon: icons.retirement, description: "Plan your retirement corpus and savings needed." },
			{ path: "/tools/ppf", label: "PPF Calculator", indiaOnly: true, icon: icons.ppf, description: "Estimate returns from Public Provident Fund accounts." },
			{ path: "/tools/nps", label: "NPS Calculator", indiaOnly: true, icon: icons.nps, description: "Calculate pension benefits from National Pension Scheme." },
			{ path: "/tools/epf", label: "EPF Calculator", indiaOnly: true, icon: icons.epf, description: "Estimate Employee Provident Fund balance at retirement." },
			{ path: "/tools/gratuity", label: "Gratuity Calculator", indiaOnly: true, icon: icons.gratuity, description: "Calculate gratuity benefits from employment." },
		],
	},
	{
		title: "Tax & Inflation Tools",
		description: "Other helpful personal finance tools.",
		items: [
			{ path: "/tools/income-tax", label: "Income Tax Calculator", indiaOnly: true, icon: icons.tax, description: "Estimate your income tax liability (Indian slabs)." },
			{ path: "/tools/inflation", label: "Inflation Calculator", icon: icons.inflation, description: "Adjust values for inflation over time." },
			{ path: "/tools/hra", label: "HRA Calculator", indiaOnly: true, icon: icons.hra, description: "Calculate House Rent Allowance exemptions." },
		],
	},
];

// India-specific schemes (PPF, ELSS, tax slabs, …) only make sense for Indian
// users; for other regions we hide them and rename India-idiom calculators.
function localizeSections(rawSections, region, jargon) {
	const isIN = region === 'IN';
	return rawSections
		.map((section) => {
			const items = section.items
				.filter((item) => isIN || !item.indiaOnly)
				.map((item) => (item.renameKey && jargon[item.renameKey]
					? { ...item, label: jargon[item.renameKey] }
					: item));
			return { ...section, items };
		})
		.filter((section) => section.items.length > 0);
}

const ToolsPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const { region, config } = useRegion();

	// Region-aware catalogue: hide India-only schemes and rename India-idiom
	// calculators for non-Indian visitors.
	const displayedSections = useMemo(
		() => localizeSections(sections, region, config.jargon),
		[region, config.jargon]
	);

	// Get all calculators from the displayed sections for search
	const allCalculators = useMemo(() => {
		return displayedSections.flatMap(section =>
			section.items.map(item => ({
				...item,
				sectionTitle: section.title
			}))
		);
	}, [displayedSections]);

	// Filter calculators based on search query
	const filteredCalculators = useMemo(() => {
		if (!searchQuery.trim()) return [];
		const query = searchQuery.toLowerCase();
		return allCalculators.filter(item => 
			item.label.toLowerCase().includes(query) ||
			item.description.toLowerCase().includes(query) ||
			item.path.toLowerCase().includes(query)
		);
	}, [searchQuery, allCalculators]);

	// Check if search is active
	const isSearchActive = searchQuery.trim().length > 0;

	const breadcrumbData = generateBreadcrumbData([
		{ name: 'Home', url: '/' },
		{ name: 'Financial Calculators', url: '/tools' }
	]);

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'name': 'Financial Calculators - Xtin Capital',
		'description': 'Free online financial calculators including SIP, Lumpsum, FD, RD, PPF, NPS, EPF, Income Tax, and more. Plan your investments with precision.',
		'url': 'https://www.xtincapital.com/tools',
		'mainEntity': {
			'@type': 'ItemList',
			'numberOfItems': 19,
			'itemListElement': [
				{ '@type': 'SoftwareApplication', 'name': 'SIP Calculator', 'applicationCategory': 'FinanceApplication' },
				{ '@type': 'SoftwareApplication', 'name': 'Lumpsum Calculator', 'applicationCategory': 'FinanceApplication' },
				{ '@type': 'SoftwareApplication', 'name': 'FD Calculator', 'applicationCategory': 'FinanceApplication' },
				{ '@type': 'SoftwareApplication', 'name': 'PPF Calculator', 'applicationCategory': 'FinanceApplication' },
				{ '@type': 'SoftwareApplication', 'name': 'NPS Calculator', 'applicationCategory': 'FinanceApplication' },
				{ '@type': 'SoftwareApplication', 'name': 'Income Tax Calculator', 'applicationCategory': 'FinanceApplication' }
			]
		}
	};

	return (
		<div className="bg-white text-gray-900">
			<SEO
				title="Free Financial Calculators - SIP, FD, PPF, Income Tax & More"
				description="Use Xtin Capital's free financial calculators to plan your investments. Calculate SIP returns, FD interest, PPF maturity, income tax, retirement corpus, and more with accurate results."
				keywords="SIP calculator, lumpsum calculator, FD calculator, RD calculator, PPF calculator, NPS calculator, EPF calculator, income tax calculator, retirement calculator, financial planning tools, investment calculator India"
				canonicalUrl="/tools"
				structuredData={structuredData}
			/>
			<Navbar />

			{/* Hero Section with SVG Illustration */}
			<section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 px-6 md:px-12 lg:px-24 mt-16">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
						<defs>
							<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
								<path d="M 10 0 L 0 0 0 10" fill="none" stroke="#10B981" strokeWidth="0.5"/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)"/>
					</svg>
				</div>
				
				{/* Floating Elements */}
				<div className="absolute top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
				<div className="absolute bottom-20 right-20 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 right-1/4 w-16 h-16 bg-teal-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
				
				<div className="max-w-7xl mx-auto relative z-10">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<div className="text-center lg:text-left">
							<div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
								</svg>
								19+ Free Calculators
							</div>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6">
								Financial{' '}
								<span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
									Calculators
								</span>
							</h1>
							<p className="text-xl text-gray-300 mb-8 max-w-xl">
								Plan your investments, calculate returns, and optimize your financial future with our comprehensive suite of professional tools.
							</p>
							
							{/* Quick Stats */}
							<div className="flex flex-wrap justify-center lg:justify-start gap-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-400">19+</div>
									<div className="text-sm text-gray-400">Calculators</div>
								</div>
								<div className="w-px bg-gray-700 hidden sm:block"></div>
								<div className="text-center">
									<div className="text-3xl font-bold text-green-400">Instant</div>
									<div className="text-sm text-gray-400">Results</div>
								</div>
							</div>
						</div>
						
						{/* Right SVG Illustration */}
						<div className="hidden lg:flex justify-center">
							<svg className="w-full max-w-md" viewBox="0 0 400 350" fill="none">
								{/* Calculator Body */}
								<rect x="100" y="40" width="200" height="270" rx="20" fill="#1F2937"/>
								<rect x="100" y="40" width="200" height="270" rx="20" stroke="#10B981" strokeWidth="2"/>
								
								{/* Screen */}
								<rect x="120" y="60" width="160" height="60" rx="8" fill="#111827"/>
								<text x="260" y="100" textAnchor="end" fill="#10B981" fontSize="24" fontFamily="monospace">₹12,45,678</text>
								<text x="260" y="80" textAnchor="end" fill="#6B7280" fontSize="12" fontFamily="monospace">Total Returns</text>
								
								{/* Buttons Row 1 */}
								<rect x="120" y="140" width="35" height="35" rx="6" fill="#374151"/>
								<text x="137.5" y="163" textAnchor="middle" fill="#D1D5DB" fontSize="14">7</text>
								<rect x="162.5" y="140" width="35" height="35" rx="6" fill="#374151"/>
								<text x="180" y="163" textAnchor="middle" fill="#D1D5DB" fontSize="14">8</text>
								<rect x="205" y="140" width="35" height="35" rx="6" fill="#374151"/>
								<text x="222.5" y="163" textAnchor="middle" fill="#D1D5DB" fontSize="14">9</text>
								<rect x="247.5" y="140" width="35" height="35" rx="6" fill="#10B981"/>
								<text x="265" y="163" textAnchor="middle" fill="#fff" fontSize="14">÷</text>
								
								{/* Buttons Row 2 */}
								<rect x="120" y="182" width="35" height="35" rx="6" fill="#374151"/>
								<text x="137.5" y="205" textAnchor="middle" fill="#D1D5DB" fontSize="14">4</text>
								<rect x="162.5" y="182" width="35" height="35" rx="6" fill="#374151"/>
								<text x="180" y="205" textAnchor="middle" fill="#D1D5DB" fontSize="14">5</text>
								<rect x="205" y="182" width="35" height="35" rx="6" fill="#374151"/>
								<text x="222.5" y="205" textAnchor="middle" fill="#D1D5DB" fontSize="14">6</text>
								<rect x="247.5" y="182" width="35" height="35" rx="6" fill="#10B981"/>
								<text x="265" y="205" textAnchor="middle" fill="#fff" fontSize="14">×</text>
								
								{/* Buttons Row 3 */}
								<rect x="120" y="224" width="35" height="35" rx="6" fill="#374151"/>
								<text x="137.5" y="247" textAnchor="middle" fill="#D1D5DB" fontSize="14">1</text>
								<rect x="162.5" y="224" width="35" height="35" rx="6" fill="#374151"/>
								<text x="180" y="247" textAnchor="middle" fill="#D1D5DB" fontSize="14">2</text>
								<rect x="205" y="224" width="35" height="35" rx="6" fill="#374151"/>
								<text x="222.5" y="247" textAnchor="middle" fill="#D1D5DB" fontSize="14">3</text>
								<rect x="247.5" y="224" width="35" height="35" rx="6" fill="#10B981"/>
								<text x="265" y="247" textAnchor="middle" fill="#fff" fontSize="14">−</text>
								
								{/* Buttons Row 4 */}
								<rect x="120" y="266" width="77.5" height="35" rx="6" fill="#374151"/>
								<text x="158.75" y="289" textAnchor="middle" fill="#D1D5DB" fontSize="14">0</text>
								<rect x="205" y="266" width="35" height="35" rx="6" fill="#374151"/>
								<text x="222.5" y="289" textAnchor="middle" fill="#D1D5DB" fontSize="14">.</text>
								<rect x="247.5" y="266" width="35" height="35" rx="6" fill="#10B981"/>
								<text x="265" y="289" textAnchor="middle" fill="#fff" fontSize="14">+</text>
								
								{/* Floating Charts */}
								<g transform="translate(30, 80)">
									<rect width="60" height="80" rx="8" fill="#1F2937" stroke="#10B981" strokeWidth="1"/>
									<path d="M10 60 L20 45 L30 55 L40 30 L50 40" stroke="#10B981" strokeWidth="2" fill="none"/>
									<circle cx="20" cy="45" r="3" fill="#10B981"/>
									<circle cx="40" cy="30" r="3" fill="#10B981"/>
								</g>
								
								<g transform="translate(310, 150)">
									<rect width="60" height="80" rx="8" fill="#1F2937" stroke="#10B981" strokeWidth="1"/>
									<rect x="10" y="50" width="8" height="20" fill="#10B981" rx="2"/>
									<rect x="22" y="35" width="8" height="35" fill="#10B981" rx="2" fillOpacity="0.7"/>
									<rect x="34" y="20" width="8" height="50" fill="#10B981" rx="2" fillOpacity="0.5"/>
									<rect x="46" y="10" width="8" height="60" fill="#10B981" rx="2" fillOpacity="0.3"/>
								</g>
								
								{/* Percentage Badge */}
								<g transform="translate(320, 60)">
									<rect width="50" height="30" rx="15" fill="#10B981"/>
									<text x="25" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">+15%</text>
								</g>
							</svg>
						</div>
					</div>
				</div>
			</section>

			{/* Sectioned Calculators */}
			<section className="py-16 px-6 md:px-12 lg:px-24 bg-gray-50">
				<div className="max-w-7xl mx-auto space-y-20">
					{/* Search Bar - Above Most Useful Calculators */}
					<div className="max-w-2xl mx-auto mb-12">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<input
								type="text"
								placeholder="Search all calculators..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow bg-white"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
								>
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
						
						{/* Search Results */}
						{isSearchActive && (
							<div className="mt-6">
								{filteredCalculators.length > 0 ? (
									<div>
										<p className="text-sm text-gray-500 mb-4">
											Found <span className="font-semibold text-green-600">{filteredCalculators.length}</span> {filteredCalculators.length === 1 ? 'calculator' : 'calculators'}
										</p>
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
											{filteredCalculators.map((item) => (
												<div 
													key={item.path} 
													className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
												>
													<div className="p-6">
														<div className="flex items-start gap-4">
															<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-all duration-300">
																{item.icon}
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
																	{item.label}
																</h3>
																<p className="text-gray-500 text-xs mt-0.5">
																	{item.sectionTitle}
																</p>
																<p className="text-gray-600 text-sm mt-1 line-clamp-2">
																	{item.description}
																</p>
															</div>
														</div>
														<div className="mt-4">
															<Link 
																to={item.path}
																className="inline-flex items-center justify-center w-full font-medium text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300"
															>
																Open Calculator
																<svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
																</svg>
															</Link>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">No calculators found</h3>
										<p className="text-gray-500">Try searching with different keywords</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Calculator Sections - Hidden when search is active */}
					{!isSearchActive && displayedSections.map((section, sectionIdx) => (
						<div key={section.title}>
							{/* Section Header */}
							<div className="mb-10 text-center">
								<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
									{section.title}
								</h2>
								<p className="text-gray-600 text-lg max-w-2xl mx-auto">{section.description}</p>
							</div>
							
							{/* Calculator Cards Grid */}
							<div className={`grid gap-6 ${section.title === "Featured Financial Planner" ? "grid-cols-1 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
								{section.items.map((item) => (
									<div 
										key={item.path} 
										className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
											item.featured 
												? 'border-2 border-green-500 shadow-xl shadow-green-500/10' 
												: 'border border-gray-200 hover:border-green-300 hover:shadow-xl'
										}`}
									>
										{item.featured && (
											<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
										)}
										
										<div className="p-6">
											<div className="flex items-start gap-4">
												{/* Icon Container */}
												<div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
													item.featured 
														? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30' 
														: 'bg-green-50 group-hover:bg-green-100'
												}`}>
													<div className={item.featured ? 'text-white [&_svg]:w-8 [&_svg]:h-8' : ''}>
														{item.featured ? (
															<svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
																<rect x="4" y="8" width="40" height="32" rx="4" fill="#fff"/>
																<rect x="8" y="12" width="14" height="10" rx="2" fill="#10B981"/>
																<path d="M12 26h8M12 30h6" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
																<circle cx="34" cy="20" r="6" fill="#10B981" fillOpacity="0.3"/>
																<path d="M34 18v4l2 1" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
															</svg>
														) : item.icon}
													</div>
												</div>
												
												{/* Content */}
												<div className="flex-1 min-w-0">
													<h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
														{item.label}
													</h3>
													<p className="text-gray-600 text-sm mt-1 line-clamp-2">
														{item.description}
													</p>
												</div>
											</div>
											
											{/* Action Button */}
											<div className="mt-5">
												{item.isExternal ? (
													<a 
														href={item.path}
														target="_blank"
														rel="noopener noreferrer"
														className={`inline-flex items-center justify-center w-full font-semibold px-5 py-3 rounded-xl transition-all duration-300 ${
															item.featured
																? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20'
																: 'bg-green-600 hover:bg-green-700 text-white'
														}`}
													>
														{section.title === "Featured Financial Planner" ? "Consult Now" : "Open Calculator"}
														<svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
														</svg>
													</a>
												) : (
													<Link 
														to={item.path}
														className={`inline-flex items-center justify-center w-full font-semibold px-5 py-3 rounded-xl transition-all duration-300 ${
															item.featured
																? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20'
																: 'bg-green-600 hover:bg-green-700 text-white'
														}`}
													>
														{section.title === "Featured Financial Planner" ? "Consult Now" : "Open Calculator"}
														<svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
														</svg>
													</Link>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
			
			{/* Bottom CTA Section */}
			<section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-r from-green-600 to-emerald-600">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Need Personalized Financial Guidance?
					</h2>
					<p className="text-green-100 text-lg mb-8">
						Our AI-powered financial planner Xtin Gini can help you create a customized investment strategy.
					</p>
					<Link
						to="/gini"
						className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-xl"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
						</svg>
						Chat with Xtin Gini
					</Link>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default ToolsPage; 
