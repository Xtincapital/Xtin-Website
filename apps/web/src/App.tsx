import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import PurchaseReceiptHost from './features/billing/components/PurchaseReceiptHost';
const LandingPage = lazy(() => import('./features/marketing/pages/LandingPages'));
const AlgosPage = lazy(() => import('./features/algos/pages/AlgosPage'));
const ToolsPage = lazy(() => import('./features/tools/pages/tools'));
const LearnPage = lazy(() => import('./features/academy/pages/LearnPage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const Newsletter = lazy(() => import('./features/newsletter/pages/Newsletter'));
const NewsletterDisplay = lazy(() => import('./features/newsletter/pages/NewsletterDisplay'));
const SubstackArticle = lazy(() => import('./features/newsletter/pages/SubstackArticle'));
const FundakamentalApp = lazy(() => import('./features/fundakamental/FundakamentalApp'));

const AboutPage = lazy(() => import('./features/marketing/pages/AboutPage'));
const ProductsPage = lazy(() => import('./features/marketing/pages/ProductsPage'));
const AlgorithmsIntro = lazy(() => import('./features/algos/pages/AlgorithmsIntro'));
const DashboardIntro = lazy(() => import('./features/dashboard/pages/DashboardIntro'));
const ModuleVideoPage = lazy(() => import('./features/academy/pages/ModuleVideoPage'));
const LearnIntro = lazy(() => import('./features/academy/pages/LearnIntro'));
const NewsletterIntro = lazy(() => import('./features/newsletter/pages/NewsletterIntro'));
const ToolsIntro = lazy(() => import('./features/tools/pages/ToolsIntro'));
const JournalIntro = lazy(() => import('./features/journal/pages/JournalIntro'));
const JournalApp = lazy(() => import('./features/journal/JournalApp'));
const GiniIntro = lazy(() => import('./features/gini/pages/GiniIntro'));
const GiniApp = lazy(() => import('./features/gini/GiniApp'));
const FundakamentalIntro = lazy(() => import('./features/fundakamental/pages/FundakamentalIntro'));
const Terms = lazy(() => import('./features/marketing/pages/Terms'));

const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200">
      <p className="text-lg font-semibold">Redirecting to {url}...</p>
    </div>
  );
};
const VerifyReport = lazy(() => import('./features/reports/pages/VerifyReport'));
const AlgoTerms = lazy(() => import('./features/algos/pages/AlgoTerms'));
const PublisherTerms = lazy(() => import('./features/marketing/pages/PublisherTerms'));
const RevenueShareAgreement = lazy(() => import('./features/marketing/pages/RevenueShareAgreement'));
const Privacy = lazy(() => import('./features/marketing/pages/Privacy'));
const Contact = lazy(() => import('./features/marketing/pages/Contact'));
const RefundPolicy = lazy(() => import('./features/marketing/pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('./features/marketing/pages/ShippingPolicy'));
const HelpCenter = lazy(() => import('./features/marketing/pages/HelpCenter'));
const NotFound = lazy(() => import('./features/marketing/pages/NotFound'));
const VerifyCertificate = lazy(() => import('./features/certificates/pages/VerifyCertificate'));
const AdminCertificates = lazy(() => import('./features/certificates/pages/AdminCertificates'));
const AdminAlgoApplications = lazy(() => import('./features/algos/pages/AdminAlgoApplications'));
const AdminNewsletters = lazy(() => import('./features/newsletter/pages/AdminNewsletters'));
const StepUpSIPCalculator = lazy(() => import('./features/tools/components/step-up-sip'));
const ELSSCalculator = lazy(() => import('./features/tools/components/elss'));
const LumpsumCalculator = lazy(() => import('./features/tools/components/lumpsum'));
const SWPCalculator = lazy(() => import('./features/tools/components/swp'));
const SIPCalculator = lazy(() => import('./features/tools/components/sip'));
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));
const Billing = lazy(() => import('./features/billing/pages/Billing'));
const CAGRCalculator = lazy(() => import('./features/tools/components/cagr'));
const FDCalculator = lazy(() => import('./features/tools/components/fd'));
const RDCalculator = lazy(() => import('./features/tools/components/rd'));
const CompoundInterestCalculator = lazy(() => import('./features/tools/components/compound-interest'));
const SimpleInterestCalculator = lazy(() => import('./features/tools/components/simple-interest'));
const SSYCalculator = lazy(() => import('./features/tools/components/ssy'));
const RetirementCalculator = lazy(() => import('./features/tools/components/RetirementCalculator'));
const PPFCalculator = lazy(() => import('./features/tools/components/PPFCalculator'));
const NPSCalculator = lazy(() => import('./features/tools/components/NPSCalculator'));
const EPFCalculator = lazy(() => import('./features/tools/components/EPFCalculator'));
const GratuityCalculator = lazy(() => import('./features/tools/components/GratuityCalculator'));
const IncomeTaxCalculator = lazy(() => import('./features/tools/components/IncomeTaxCalculator'));
const InflationCalculator = lazy(() => import('./features/tools/components/InflationCalculator'));
const HRACalculator = lazy(() => import('./features/tools/components/HRACalculator'));
const RealEstateCalculator = lazy(() => import('./features/tools/components/RealEstateCalculator'));
const CourseDetail = lazy(() => import('./features/academy/components/CourseDetail'));
const PurchasePage = lazy(() => import('./features/academy/components/PurchasePage'));
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedModuleRoute from './components/ProtectedModuleRoute';
import ProtectedPageRoute from './components/ProtectedPageRoute';
import LessonProgressTracker from './features/academy/components/LessonProgressTracker';
import CertificateManager from './features/certificates/components/CertificateManager';
const BacktestLanding = lazy(() => import('./features/algos/pages/BacktestLanding'));
const BacktestApp = lazy(() => import('./features/backtest/BacktestApp'));
const PersonalFinanceLesson1 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson1'));
const PersonalFinanceLesson2 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson2'));
const PersonalFinanceLesson3 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson3'));
const PersonalFinanceLesson4 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson4'));
const PersonalFinanceLesson5 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson5'));
const PersonalFinanceLesson6 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson6'));
const PersonalFinanceLesson7 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson7'));
const PersonalFinanceLesson8 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson8'));
const PersonalFinanceLesson9 = lazy(() => import('./features/academy/pages/PersonalFinance/PersonalFinanceLesson9'));
const EmergencyFundOverview = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundOverview'));
const EmergencyFundLesson1 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson1'));
const EmergencyFundLesson2 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson2'));
const EmergencyFundLesson3 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson3'));
const EmergencyFundLesson4 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson4'));
const EmergencyFundLesson5 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson5'));
const EmergencyFundLesson6 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson6'));
const EmergencyFundLesson7 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson7'));
const EmergencyFundLesson8 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson8'));
const EmergencyFundLesson9 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson9'));
const EmergencyFundLesson10 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson10'));
const EmergencyFundLesson11 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson11'));
const EmergencyFundLesson12 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson12'));
const EmergencyFundLesson13 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson13'));
const EmergencyFundLesson14 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson14'));
const EmergencyFundLesson15 = lazy(() => import('./features/academy/pages/EmergencyFund/EmergencyFundLesson15'));
const MoneyMindsetOverview = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetOverview'));
const MoneyMindsetLesson1 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson1'));
const MoneyMindsetLesson2 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson2'));
const MoneyMindsetLesson3 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson3'));
const MoneyMindsetLesson4 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson4'));
const MoneyMindsetLesson5 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson5'));
const MoneyMindsetLesson6 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson6'));
const MoneyMindsetLesson7 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson7'));
const MoneyMindsetLesson8 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson8'));
const MoneyMindsetLesson9 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson9'));
const MoneyMindsetLesson10 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson10'));
const MoneyMindsetLesson11 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson11'));
const MoneyMindsetLesson12 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson12'));
const MoneyMindsetLesson13 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson13'));
const MoneyMindsetLesson14 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson14'));
const MoneyMindsetLesson15 = lazy(() => import('./features/academy/pages/MoneyMindset/MoneyMindsetLesson15'));
const FinancialPlanningOverview = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningOverview'));
const FinancialPlanningLesson1 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson1'));
const FinancialPlanningLesson2 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson2'));
const FinancialPlanningLesson3 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson3'));
const FinancialPlanningLesson4 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson4'));
const FinancialPlanningLesson5 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson5'));
const FinancialPlanningLesson6 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson6'));
const FinancialPlanningLesson7 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson7'));
const FinancialPlanningLesson8 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson8'));
const FinancialPlanningLesson9 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson9'));
const FinancialPlanningLesson10 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson10'));
const FinancialPlanningLesson11 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson11'));
const FinancialPlanningLesson12 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson12'));
const FinancialPlanningLesson13 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson13'));
const FinancialPlanningLesson14 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson14'));
const FinancialPlanningLesson15 = lazy(() => import('./features/academy/pages/FinancialPlanning/FinancialPlanningLesson15'));
const StockMarketOverview = lazy(() => import('./features/academy/pages/StockMarket/StockMarketOverview'));
const StockMarketLesson1 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson1'));
const StockMarketLesson2 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson2'));
const StockMarketLesson3 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson3'));
const StockMarketLesson4 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson4'));
const StockMarketLesson5 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson5'));
const StockMarketLesson6 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson6'));
const StockMarketLesson7 = lazy(() => import('./features/academy/pages/StockMarket/StockMarketLesson7'));
const TradingBasicsOverview = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsOverview'));
const TradingBasicsLesson1 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson1'));
const TradingBasicsLesson2 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson2'));
const TradingBasicsLesson3 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson3'));
const TradingBasicsLesson4 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson4'));
const TradingBasicsLesson5 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson5'));
const TradingBasicsLesson6 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson6'));
const TradingBasicsLesson7 = lazy(() => import('./features/academy/pages/TradingBasics/TradingBasicsLesson7'));
const TechnicalAnalysisOverview = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisOverview'));
const TechnicalAnalysisLesson2 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson2'));
const TechnicalAnalysisLesson3 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson3'));
const TechnicalAnalysisLesson4 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson4'));
const TechnicalAnalysisLesson5 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson5'));
const TechnicalAnalysisLesson6 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson6'));
const TechnicalAnalysisLesson7 = lazy(() => import('./features/academy/pages/TechnicalAnalysis/TechnicalAnalysisLesson7'));
const AlgorithmicTradingOverview = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgorithmicTradingOverview'));
const AlgoTradingLesson1 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson1'));
const AlgoTradingLesson2 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson2'));
const AlgoTradingLesson3 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson3'));
const AlgoTradingLesson4 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson4'));
const AlgoTradingLesson5 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson5'));
const AlgoTradingLesson6 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson6'));
const AlgoTradingLesson7 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson7'));
const AlgoTradingLesson8 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson8'));
const AlgoTradingLesson9 = lazy(() => import('./features/academy/pages/AlgorithemicTrading/AlgoTradingLesson9'));
const RiskManagementOverview = lazy(() => import('./features/academy/pages/RiskManagement/RiskManagementOverview'));
const RiskLesson1 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson1'));
const RiskLesson2 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson2'));
const RiskLesson3 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson3'));
const RiskLesson4 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson4'));
const RiskLesson5 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson5'));
const RiskLesson6 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson6'));
const RiskLesson7 = lazy(() => import('./features/academy/pages/RiskManagement/RiskLesson7'));
const LongTermInvestingOverview = lazy(() => import('./features/academy/pages/LongTermInvesting/LongTermInvestingOverview'));
const LTILesson1 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson1'));
const LTILesson2 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson2'));
const LTILesson3 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson3'));
const LTILesson4 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson4'));
const LTILesson5 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson5'));
const LTILesson6 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson6'));
const LTILesson7 = lazy(() => import('./features/academy/pages/LongTermInvesting/LTILesson7'));
const PortfolioConstructionOverview = lazy(() => import('./features/academy/pages/PortfolioConstruction/PortfolioConstructionOverview'));
const PCLesson1 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson1'));
const PCLesson2 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson2'));
const PCLesson3 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson3'));
const PCLesson4 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson4'));
const PCLesson5 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson5'));
const PCLesson6 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson6'));
const PCLesson7 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson7'));
const PCLesson8 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson8'));
const PCLesson9 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson9'));
const PCLesson10 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson10'));
const PCLesson11 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson11'));
const PCLesson12 = lazy(() => import('./features/academy/pages/PortfolioConstruction/PCLesson12'));
const DerivativesOverview = lazy(() => import('./features/academy/pages/Derivatives/DerivativesOverview'));
const DerivLesson1 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson1'));
const DerivLesson2 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson2'));
const DerivLesson3 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson3'));
const DerivLesson4 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson4'));
const DerivLesson5 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson5'));
const DerivLesson6 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson6'));
const DerivLesson7 = lazy(() => import('./features/academy/pages/Derivatives/DerivLesson7'));
const FOLesson1 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson1'));
const FOLesson2 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson2'));
const FOLesson3 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson3'));
const FOLesson4 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson4'));
const FOLesson5 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson5'));
const FOLesson6 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson6'));
const FOLesson7 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson7'));
const FOLesson8 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson8'));
const FOLesson9 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson9'));
const FOLesson10 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson10'));
const FOLesson11 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson11'));
const FOLesson12 = lazy(() => import('./features/academy/pages/FOlesson/FOLesson12'));
const TaxOverview = lazy(() => import('./features/academy/pages/TaxBasics/TaxOverview'));
const TaxLesson1 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson1'));
const TaxLesson2 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson2'));
const TaxLesson3 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson3'));
const TaxLesson4 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson4'));
const TaxLesson5 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson5'));
const TaxLesson6 = lazy(() => import('./features/academy/pages/TaxBasics/TaxLesson6'));
const DebtOverview = lazy(() => import('./features/academy/pages/DebtManagement/DebtOverview'));
const DebtLesson1 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson1'));
const DebtLesson2 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson2'));
const DebtLesson3 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson3'));
const DebtLesson4 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson4'));
const DebtLesson5 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson5'));
const DebtLesson6 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson6'));
const DebtLesson7 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson7'));
const DebtLesson8 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson8'));
const DebtLesson9 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson9'));
const DebtLesson10 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson10'));
const DebtLesson11 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson11'));
const DebtLesson12 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson12'));
const DebtLesson13 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson13'));
const DebtLesson14 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson14'));
const DebtLesson15 = lazy(() => import('./features/academy/pages/DebtManagement/DebtLesson15'));
const InsuranceOverview = lazy(() => import('./features/academy/pages/Insurance/InsuranceOverview'));
const InsuranceLesson1 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson1'));
const InsuranceLesson2 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson2'));
const InsuranceLesson3 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson3'));
const InsuranceLesson4 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson4'));
const InsuranceLesson5 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson5'));
const InsuranceLesson6 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson6'));
const InsuranceLesson7 = lazy(() => import('./features/academy/pages/Insurance/InsuranceLesson7'));
const RetirementOverview = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementOverview'));
const RetirementLesson1 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson1'));
const RetirementLesson2 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson2'));
const RetirementLesson3 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson3'));
const RetirementLesson4 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson4'));
const RetirementLesson5 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson5'));
const RetirementLesson6 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson6'));
const RetirementLesson7 = lazy(() => import('./features/academy/pages/RetirementPlanning/RetirementLesson7'));
const RealEstateOverview = lazy(() => import('./features/academy/pages/RealEstate/RealEstateOverview'));
const RealEstateLesson1 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson1'));
const RealEstateLesson2 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson2'));
const RealEstateLesson3 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson3'));
const RealEstateLesson4 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson4'));
const RealEstateLesson5 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson5'));
const RealEstateLesson6 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson6'));
const RealEstateLesson7 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson7'));
const RealEstateLesson8 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson8'));
const RealEstateLesson9 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson9'));
const RealEstateLesson10 = lazy(() => import('./features/academy/pages/RealEstate/RealEstateLesson10'));
const CryptoOverview = lazy(() => import('./features/academy/pages/Crypto/CryptoOverview'));
const CryptoLesson1 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson1'));
const CryptoLesson2 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson2'));
const CryptoLesson3 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson3'));
const CryptoLesson4 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson4'));
const CryptoLesson5 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson5'));
const CryptoLesson6 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson6'));
const CryptoLesson7 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson7'));
const CryptoLesson8 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson8'));
const CryptoLesson9 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson9'));
const CryptoLesson10 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson10'));
const CryptoLesson11 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson11'));
const CryptoLesson12 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson12'));
const CryptoLesson13 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson13'));
const CryptoLesson14 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson14'));
const CryptoLesson15 = lazy(() => import('./features/academy/pages/Crypto/CryptoLesson15'));
const EstatePlanningOverview = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningOverview'));
const EstatePlanningLesson1 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson1'));
const EstatePlanningLesson2 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson2'));
const EstatePlanningLesson3 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson3'));
const EstatePlanningLesson4 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson4'));
const EstatePlanningLesson5 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson5'));
const EstatePlanningLesson6 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson6'));
const EstatePlanningLesson7 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson7'));
const EstatePlanningLesson8 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson8'));
const EstatePlanningLesson9 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson9'));
const EstatePlanningLesson10 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson10'));
const EstatePlanningLesson11 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson11'));
const EstatePlanningLesson12 = lazy(() => import('./features/academy/pages/EstatePlanning/EstatePlanningLesson12'));
import { ThemeProvider } from './contexts/ThemeContext';
import { RouteMetaFallback } from './components/SEO';

// Fallback shown while a lazy-loaded route chunk is fetched.
const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600" />
  </div>
);

// ScrollToTop component - scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <Router>
          <ScrollToTop />
          <LessonProgressTracker />
          <CertificateManager />
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tools" element={<ProtectedPageRoute><ToolsPage /></ProtectedPageRoute>} />
        <Route path="/tools/index" element={<Navigate to="/tools" replace />} />
        <Route path="/tools/cagr" element={<ProtectedPageRoute><CAGRCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/compound-interest" element={<ProtectedPageRoute><CompoundInterestCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/elss" element={<ProtectedPageRoute><ELSSCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/epf" element={<ProtectedPageRoute><EPFCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/fd" element={<ProtectedPageRoute><FDCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/gratuity" element={<ProtectedPageRoute><GratuityCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/hra" element={<ProtectedPageRoute><HRACalculator /></ProtectedPageRoute>} />
        <Route path="/tools/income-tax" element={<ProtectedPageRoute><IncomeTaxCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/inflation" element={<ProtectedPageRoute><InflationCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/lumpsum" element={<ProtectedPageRoute><LumpsumCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/nps" element={<ProtectedPageRoute><NPSCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/ppf" element={<ProtectedPageRoute><PPFCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/rd" element={<ProtectedPageRoute><RDCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/retirement" element={<ProtectedPageRoute><RetirementCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/simple-interest" element={<ProtectedPageRoute><SimpleInterestCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/sip" element={<ProtectedPageRoute><SIPCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/ssy" element={<Navigate to="/tools/ssy-calculator" replace />} />
        <Route path="/tools/ssy-calculator" element={<ProtectedPageRoute><SSYCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/step-up-sip" element={<ProtectedPageRoute><StepUpSIPCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/swp" element={<ProtectedPageRoute><SWPCalculator /></ProtectedPageRoute>} />
        <Route path="/tools/real-estate-investment" element={<ProtectedPageRoute><RealEstateCalculator /></ProtectedPageRoute>} />
        <Route path="/learn/watch/:slug" element={<ModuleVideoPage />} />
        <Route path="/learn" element={<ProtectedPageRoute><LearnPage /></ProtectedPageRoute>} />
        <Route path="/learn/personal-finance-basics" element={<ProtectedModuleRoute><PersonalFinanceLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-1" element={<ProtectedModuleRoute><PersonalFinanceLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-2" element={<ProtectedModuleRoute><PersonalFinanceLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-3" element={<ProtectedModuleRoute><PersonalFinanceLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-4" element={<ProtectedModuleRoute><PersonalFinanceLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-5" element={<ProtectedModuleRoute><PersonalFinanceLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-6" element={<ProtectedModuleRoute><PersonalFinanceLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-7" element={<ProtectedModuleRoute><PersonalFinanceLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-8" element={<ProtectedModuleRoute><PersonalFinanceLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/personal-finance-lesson-9" element={<ProtectedModuleRoute><PersonalFinanceLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund" element={<ProtectedModuleRoute><EmergencyFundOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-1" element={<ProtectedModuleRoute><EmergencyFundLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-2" element={<ProtectedModuleRoute><EmergencyFundLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-3" element={<ProtectedModuleRoute><EmergencyFundLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-4" element={<ProtectedModuleRoute><EmergencyFundLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-5" element={<ProtectedModuleRoute><EmergencyFundLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-6" element={<ProtectedModuleRoute><EmergencyFundLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-7" element={<ProtectedModuleRoute><EmergencyFundLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-8" element={<ProtectedModuleRoute><EmergencyFundLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-9" element={<ProtectedModuleRoute><EmergencyFundLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-10" element={<ProtectedModuleRoute><EmergencyFundLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-11" element={<ProtectedModuleRoute><EmergencyFundLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-12" element={<ProtectedModuleRoute><EmergencyFundLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-13" element={<ProtectedModuleRoute><EmergencyFundLesson13 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-14" element={<ProtectedModuleRoute><EmergencyFundLesson14 /></ProtectedModuleRoute>} />
        <Route path="/learn/emergency-fund-lesson-15" element={<ProtectedModuleRoute><EmergencyFundLesson15 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset" element={<ProtectedModuleRoute><MoneyMindsetOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-1" element={<ProtectedModuleRoute><MoneyMindsetLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-2" element={<ProtectedModuleRoute><MoneyMindsetLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-3" element={<ProtectedModuleRoute><MoneyMindsetLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-4" element={<ProtectedModuleRoute><MoneyMindsetLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-5" element={<ProtectedModuleRoute><MoneyMindsetLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-6" element={<ProtectedModuleRoute><MoneyMindsetLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-7" element={<ProtectedModuleRoute><MoneyMindsetLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-8" element={<ProtectedModuleRoute><MoneyMindsetLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-9" element={<ProtectedModuleRoute><MoneyMindsetLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-10" element={<ProtectedModuleRoute><MoneyMindsetLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-11" element={<ProtectedModuleRoute><MoneyMindsetLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-12" element={<ProtectedModuleRoute><MoneyMindsetLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-13" element={<ProtectedModuleRoute><MoneyMindsetLesson13 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-14" element={<ProtectedModuleRoute><MoneyMindsetLesson14 /></ProtectedModuleRoute>} />
        <Route path="/learn/money-mindset-lesson-15" element={<ProtectedModuleRoute><MoneyMindsetLesson15 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning" element={<ProtectedModuleRoute><FinancialPlanningOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-1" element={<ProtectedModuleRoute><FinancialPlanningLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-2" element={<ProtectedModuleRoute><FinancialPlanningLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-3" element={<ProtectedModuleRoute><FinancialPlanningLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-4" element={<ProtectedModuleRoute><FinancialPlanningLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-5" element={<ProtectedModuleRoute><FinancialPlanningLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-6" element={<ProtectedModuleRoute><FinancialPlanningLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-7" element={<ProtectedModuleRoute><FinancialPlanningLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-8" element={<ProtectedModuleRoute><FinancialPlanningLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-9" element={<ProtectedModuleRoute><FinancialPlanningLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-10" element={<ProtectedModuleRoute><FinancialPlanningLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-11" element={<ProtectedModuleRoute><FinancialPlanningLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-12" element={<ProtectedModuleRoute><FinancialPlanningLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-13" element={<ProtectedModuleRoute><FinancialPlanningLesson13 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-14" element={<ProtectedModuleRoute><FinancialPlanningLesson14 /></ProtectedModuleRoute>} />
        <Route path="/learn/financial-planning-lesson-15" element={<ProtectedModuleRoute><FinancialPlanningLesson15 /></ProtectedModuleRoute>} />
        <Route path="/learn/mutual-funds" element={<Navigate to="/learn" replace />} />
        <Route path="/learn/mutual-funds-lesson-*" element={<Navigate to="/learn" replace />} />
        <Route path="/learn/stock-market" element={<ProtectedModuleRoute><StockMarketOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-1" element={<ProtectedModuleRoute><StockMarketLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-2" element={<ProtectedModuleRoute><StockMarketLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-3" element={<ProtectedModuleRoute><StockMarketLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-4" element={<ProtectedModuleRoute><StockMarketLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-5" element={<ProtectedModuleRoute><StockMarketLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-6" element={<ProtectedModuleRoute><StockMarketLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/stock-market-lesson-7" element={<ProtectedModuleRoute><StockMarketLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics" element={<ProtectedModuleRoute><TradingBasicsOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-1" element={<ProtectedModuleRoute><TradingBasicsLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-2" element={<ProtectedModuleRoute><TradingBasicsLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-3" element={<ProtectedModuleRoute><TradingBasicsLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-4" element={<ProtectedModuleRoute><TradingBasicsLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-5" element={<ProtectedModuleRoute><TradingBasicsLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-6" element={<ProtectedModuleRoute><TradingBasicsLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/trading-basics-lesson-7" element={<ProtectedModuleRoute><TradingBasicsLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis" element={<ProtectedModuleRoute><TechnicalAnalysisOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-2" element={<ProtectedModuleRoute><TechnicalAnalysisLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-3" element={<ProtectedModuleRoute><TechnicalAnalysisLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-4" element={<ProtectedModuleRoute><TechnicalAnalysisLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-5" element={<ProtectedModuleRoute><TechnicalAnalysisLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-6" element={<ProtectedModuleRoute><TechnicalAnalysisLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/technical-analysis-lesson-7" element={<ProtectedModuleRoute><TechnicalAnalysisLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/algorithmic-trading" element={<ProtectedModuleRoute><AlgorithmicTradingOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-1" element={<ProtectedModuleRoute><AlgoTradingLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-2" element={<ProtectedModuleRoute><AlgoTradingLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-3" element={<ProtectedModuleRoute><AlgoTradingLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-4" element={<ProtectedModuleRoute><AlgoTradingLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-5" element={<ProtectedModuleRoute><AlgoTradingLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-6" element={<ProtectedModuleRoute><AlgoTradingLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-7" element={<ProtectedModuleRoute><AlgoTradingLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-8" element={<ProtectedModuleRoute><AlgoTradingLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/algo-trading-lesson-9" element={<ProtectedModuleRoute><AlgoTradingLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-management" element={<ProtectedModuleRoute><RiskManagementOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-1" element={<ProtectedModuleRoute><RiskLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-2" element={<ProtectedModuleRoute><RiskLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-3" element={<ProtectedModuleRoute><RiskLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-4" element={<ProtectedModuleRoute><RiskLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-5" element={<ProtectedModuleRoute><RiskLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-6" element={<ProtectedModuleRoute><RiskLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/risk-lesson-7" element={<ProtectedModuleRoute><RiskLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/long-term-investing" element={<ProtectedModuleRoute><LongTermInvestingOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-1" element={<ProtectedModuleRoute><LTILesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-2" element={<ProtectedModuleRoute><LTILesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-3" element={<ProtectedModuleRoute><LTILesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-4" element={<ProtectedModuleRoute><LTILesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-5" element={<ProtectedModuleRoute><LTILesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-6" element={<ProtectedModuleRoute><LTILesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/lti-lesson-7" element={<ProtectedModuleRoute><LTILesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/portfolio-construction" element={<ProtectedModuleRoute><PortfolioConstructionOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-1" element={<ProtectedModuleRoute><PCLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-2" element={<ProtectedModuleRoute><PCLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-3" element={<ProtectedModuleRoute><PCLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-4" element={<ProtectedModuleRoute><PCLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-5" element={<ProtectedModuleRoute><PCLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-6" element={<ProtectedModuleRoute><PCLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-7" element={<ProtectedModuleRoute><PCLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-8" element={<ProtectedModuleRoute><PCLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-9" element={<ProtectedModuleRoute><PCLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-10" element={<ProtectedModuleRoute><PCLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-11" element={<ProtectedModuleRoute><PCLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/pc-lesson-12" element={<ProtectedModuleRoute><PCLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives" element={<ProtectedModuleRoute><DerivativesOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-1" element={<ProtectedModuleRoute><DerivLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-2" element={<ProtectedModuleRoute><DerivLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-3" element={<ProtectedModuleRoute><DerivLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-4" element={<ProtectedModuleRoute><DerivLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-5" element={<ProtectedModuleRoute><DerivLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-6" element={<ProtectedModuleRoute><DerivLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/deriv-lesson-7" element={<ProtectedModuleRoute><DerivLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-1" element={<ProtectedModuleRoute><FOLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-2" element={<ProtectedModuleRoute><FOLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-3" element={<ProtectedModuleRoute><FOLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-4" element={<ProtectedModuleRoute><FOLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-5" element={<ProtectedModuleRoute><FOLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-6" element={<ProtectedModuleRoute><FOLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-7" element={<ProtectedModuleRoute><FOLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-8" element={<ProtectedModuleRoute><FOLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-9" element={<ProtectedModuleRoute><FOLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-10" element={<ProtectedModuleRoute><FOLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-11" element={<ProtectedModuleRoute><FOLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/derivatives/lesson-12" element={<ProtectedModuleRoute><FOLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/taxes" element={<ProtectedModuleRoute><TaxOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-1" element={<ProtectedModuleRoute><TaxLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-2" element={<ProtectedModuleRoute><TaxLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-3" element={<ProtectedModuleRoute><TaxLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-4" element={<ProtectedModuleRoute><TaxLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-5" element={<ProtectedModuleRoute><TaxLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/tax-lesson-6" element={<ProtectedModuleRoute><TaxLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management" element={<ProtectedModuleRoute><DebtOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-1" element={<ProtectedModuleRoute><DebtLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-2" element={<ProtectedModuleRoute><DebtLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-3" element={<ProtectedModuleRoute><DebtLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-4" element={<ProtectedModuleRoute><DebtLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-5" element={<ProtectedModuleRoute><DebtLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-6" element={<ProtectedModuleRoute><DebtLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-7" element={<ProtectedModuleRoute><DebtLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-8" element={<ProtectedModuleRoute><DebtLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-9" element={<ProtectedModuleRoute><DebtLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-10" element={<ProtectedModuleRoute><DebtLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-11" element={<ProtectedModuleRoute><DebtLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-12" element={<ProtectedModuleRoute><DebtLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-13" element={<ProtectedModuleRoute><DebtLesson13 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-14" element={<ProtectedModuleRoute><DebtLesson14 /></ProtectedModuleRoute>} />
        <Route path="/learn/debt-management-lesson-15" element={<ProtectedModuleRoute><DebtLesson15 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance" element={<ProtectedModuleRoute><InsuranceOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-1" element={<ProtectedModuleRoute><InsuranceLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-2" element={<ProtectedModuleRoute><InsuranceLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-3" element={<ProtectedModuleRoute><InsuranceLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-4" element={<ProtectedModuleRoute><InsuranceLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-5" element={<ProtectedModuleRoute><InsuranceLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-6" element={<ProtectedModuleRoute><InsuranceLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/insurance-lesson-7" element={<ProtectedModuleRoute><InsuranceLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning" element={<ProtectedModuleRoute><RetirementOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-1" element={<ProtectedModuleRoute><RetirementLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-2" element={<ProtectedModuleRoute><RetirementLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-3" element={<ProtectedModuleRoute><RetirementLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-4" element={<ProtectedModuleRoute><RetirementLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-5" element={<ProtectedModuleRoute><RetirementLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-6" element={<ProtectedModuleRoute><RetirementLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/retirement-planning-lesson-7" element={<ProtectedModuleRoute><RetirementLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate" element={<ProtectedModuleRoute><RealEstateOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-1" element={<ProtectedModuleRoute><RealEstateLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-2" element={<ProtectedModuleRoute><RealEstateLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-3" element={<ProtectedModuleRoute><RealEstateLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-4" element={<ProtectedModuleRoute><RealEstateLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-5" element={<ProtectedModuleRoute><RealEstateLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-6" element={<ProtectedModuleRoute><RealEstateLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-7" element={<ProtectedModuleRoute><RealEstateLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-8" element={<ProtectedModuleRoute><RealEstateLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-9" element={<ProtectedModuleRoute><RealEstateLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/real-estate-lesson-10" element={<ProtectedModuleRoute><RealEstateLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto" element={<ProtectedModuleRoute><CryptoOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-1" element={<ProtectedModuleRoute><CryptoLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-2" element={<ProtectedModuleRoute><CryptoLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-3" element={<ProtectedModuleRoute><CryptoLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-4" element={<ProtectedModuleRoute><CryptoLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-5" element={<ProtectedModuleRoute><CryptoLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-6" element={<ProtectedModuleRoute><CryptoLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-7" element={<ProtectedModuleRoute><CryptoLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-8" element={<ProtectedModuleRoute><CryptoLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-9" element={<ProtectedModuleRoute><CryptoLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-10" element={<ProtectedModuleRoute><CryptoLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-11" element={<ProtectedModuleRoute><CryptoLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-12" element={<ProtectedModuleRoute><CryptoLesson12 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-13" element={<ProtectedModuleRoute><CryptoLesson13 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-14" element={<ProtectedModuleRoute><CryptoLesson14 /></ProtectedModuleRoute>} />
        <Route path="/learn/crypto-lesson-15" element={<ProtectedModuleRoute><CryptoLesson15 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning" element={<ProtectedModuleRoute><EstatePlanningOverview /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-1" element={<ProtectedModuleRoute><EstatePlanningLesson1 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-2" element={<ProtectedModuleRoute><EstatePlanningLesson2 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-3" element={<ProtectedModuleRoute><EstatePlanningLesson3 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-4" element={<ProtectedModuleRoute><EstatePlanningLesson4 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-5" element={<ProtectedModuleRoute><EstatePlanningLesson5 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-6" element={<ProtectedModuleRoute><EstatePlanningLesson6 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-7" element={<ProtectedModuleRoute><EstatePlanningLesson7 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-8" element={<ProtectedModuleRoute><EstatePlanningLesson8 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-9" element={<ProtectedModuleRoute><EstatePlanningLesson9 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-10" element={<ProtectedModuleRoute><EstatePlanningLesson10 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-11" element={<ProtectedModuleRoute><EstatePlanningLesson11 /></ProtectedModuleRoute>} />
        <Route path="/learn/estate-planning-lesson-12" element={<ProtectedModuleRoute><EstatePlanningLesson12 /></ProtectedModuleRoute>} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/courses/:courseId/purchase" element={<PurchasePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/algos" element={<ProtectedPageRoute><AlgosPage /></ProtectedPageRoute>} />
        {/* Retired feature routes -> redirect home */}
        <Route path="/advisory" element={<Navigate to="/" replace />} />
        <Route path="/advisory/submissions" element={<Navigate to="/" replace />} />
        <Route path="/advisor/login" element={<Navigate to="/" replace />} />
        <Route path="/advisor/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/intro/advisory" element={<Navigate to="/" replace />} />
        <Route path="/mutualfunds" element={<Navigate to="/" replace />} />
        <Route path="/mutalfunds" element={<Navigate to="/" replace />} />
        <Route path="/intro/mutualfunds" element={<Navigate to="/" replace />} />
        <Route path="/intro/mutalfunds" element={<Navigate to="/" replace />} />

        {/* Product routes & Intros */}
        <Route path="/journal/*" element={<ProtectedPageRoute><JournalApp /></ProtectedPageRoute>} />
        <Route path="/intro/journal" element={<JournalIntro />} />
        <Route path="/gini/*" element={<ProtectedPageRoute><GiniApp /></ProtectedPageRoute>} />
        <Route path="/intro/gini" element={<GiniIntro />} />
        <Route path="/fundakamental/*" element={<ProtectedPageRoute><FundakamentalApp /></ProtectedPageRoute>} />
        <Route path="/intro/fundakamental" element={<FundakamentalIntro />} />

        <Route path="/newsletter" element={<ProtectedPageRoute><Newsletter /></ProtectedPageRoute>} />
        <Route path="/newsletter/article/:slug" element={<ProtectedPageRoute><SubstackArticle /></ProtectedPageRoute>} />
        <Route path="/newsletter/:id" element={<ProtectedPageRoute><NewsletterDisplay /></ProtectedPageRoute>} />
        <Route path="/backtest" element={<ProtectedPageRoute><BacktestLanding /></ProtectedPageRoute>} />
        <Route path="/backtest/app/*" element={<ProtectedPageRoute><BacktestApp /></ProtectedPageRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/intro/algorithms" element={<AlgorithmsIntro />} />
        <Route path="/intro/dashboard" element={<DashboardIntro />} />
        <Route path="/intro/learn" element={<LearnIntro />} />
        <Route path="/intro/newsletter" element={<NewsletterIntro />} />
        <Route path="/intro/tools" element={<ToolsIntro />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/algo-terms" element={<AlgoTerms />} />
        <Route path="/verify" element={<VerifyReport />} />
        <Route path="/publisher-terms" element={<PublisherTerms />} />
        <Route path="/revenue-share" element={<RevenueShareAgreement />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/help" element={<HelpCenter />} />
        {/* Certificate Verification Route — Public */}
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

        {/* Admin Certificate Management */}
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute adminOnly>
              <AdminCertificates />
            </ProtectedRoute>
          }
        />

        {/* Admin: send the daily newsletters manually */}
        <Route
          path="/admin/newsletters"
          element={
            <ProtectedRoute adminOnly>
              <AdminNewsletters />
            </ProtectedRoute>
          }
        />

        {/* Admin: review algo publisher applications */}
        <Route
          path="/admin/algo-applications"
          element={
            <ProtectedRoute adminOnly>
              <AdminAlgoApplications />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for 404s - Must be last */}
        <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
          {/* Post-checkout receipt-printer animation, triggered by showPurchaseReceipt(). */}
          <PurchaseReceiptHost />
          {/* After <Routes> so a page's own <SEO> effect runs first. */}
          <RouteMetaFallback />
        </Router>
        </CurrencyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
