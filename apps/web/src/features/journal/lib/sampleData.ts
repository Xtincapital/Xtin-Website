// Journal sample datasets — port of the standalone app's "Load Sample Data"
// (features-incoming/journal/app.js: `createSampleTrades()`,
// `createSampleData1..7()`, `buildExpandedSampleSet()`,
// `remapTradesToRecentTimeline()`, `calculatePnLSnapshot()`). Same 86-trade
// template and the same seven variants, mapped onto this app's snake_case
// `Trade` shape. Preview-only — see ../../../lib/sampleMode.ts.
import { createSampleModeStore, sampleCrud, sampleId, SAMPLE_USER_ID } from '../../../lib/sampleMode';
import type { Goal, Strategy, Trade } from './api';

export interface JournalSampleData {
  trades: Trade[];
  goals: Goal[];
  strategies: Strategy[];
}

export const journalSampleMode = createSampleModeStore<JournalSampleData>('xtin.journal.sampleData');

/** A trade in the original app's camelCase shape. */
interface RawTrade {
  date: string;
  entryTime?: string;
  exitTime?: string;
  type: string;
  market: string;
  asset: string;
  quantity: number;
  entryPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  exitPrice: number;
  brokerage?: number;
  strategy: string;
  margin?: number;
  buySell: string;
  strikePrice?: number;
  optionType?: string;
  impliedVolatility?: number;
  daysToExpiry?: number;
  notes?: string;
  tags?: string[];
  emotion?: string;
}

// prettier-ignore
const TEMPLATE: RawTrade[] = [
  { date: '2025-11-21', entryTime: '09:15', exitTime: '10:45', type: 'Intraday', market: 'Equity', asset: 'Reliance Industries', quantity: 15, entryPrice: 2850, targetPrice: 2900, stopLoss: 2820, exitPrice: 2895, brokerage: 75, strategy: 'Breakout', margin: 28000, buySell: 'Buy', notes: 'Strong opening momentum after positive news', tags: ['momentum', 'large-cap'], emotion: 'confident' },
  { date: '2025-11-21', entryTime: '11:20', exitTime: '12:50', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 3, entryPrice: 23520, targetPrice: 23580, stopLoss: 23480, exitPrice: 23565, brokerage: 60, strategy: 'Breakout', margin: 71000, buySell: 'Buy', notes: 'Mid-session breakout trade', tags: ['futures', 'scalping'], emotion: 'excited' },
  { date: '2025-11-21', entryTime: '14:30', exitTime: '15:15', type: 'Intraday', market: 'Equity', asset: 'TCS', quantity: 8, entryPrice: 3980, targetPrice: 4020, stopLoss: 3950, exitPrice: 3975, brokerage: 40, strategy: 'Double Bottom', margin: 32000, buySell: 'Buy', notes: 'Failed breakout, cut early', tags: ['it-sector'], emotion: 'frustrated' },
  { date: '2025-11-20', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'HDFC Bank', quantity: 10, entryPrice: 1645, targetPrice: 1670, stopLoss: 1630, exitPrice: 1668, brokerage: 50, strategy: 'M Pattern', margin: 16500, buySell: 'Buy', notes: 'Banking sector strength', tags: ['banking', 'momentum'], emotion: 'confident' },
  { date: '2025-11-20', entryTime: '12:45', exitTime: '14:20', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 2, entryPrice: 47800, targetPrice: 47900, stopLoss: 47750, exitPrice: 47890, brokerage: 45, strategy: 'Breakout', margin: 96000, buySell: 'Buy', notes: 'Afternoon momentum trade', tags: ['futures', 'banking'], emotion: 'neutral' },
  { date: '2025-11-19', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Infosys', quantity: 12, entryPrice: 1820, targetPrice: 1850, stopLoss: 1800, exitPrice: 1842, brokerage: 55, strategy: 'Breakout', margin: 22000, buySell: 'Buy', notes: 'IT sector rally continuation', tags: ['it-sector', 'momentum'], emotion: 'confident' },
  { date: '2025-11-19', entryTime: '13:15', exitTime: '14:45', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 3, entryPrice: 180, targetPrice: 220, stopLoss: 160, exitPrice: 210, brokerage: 30, strategy: 'Iron Condor', margin: 550, buySell: 'Buy', strikePrice: 23500, optionType: 'Call', impliedVolatility: 16, daysToExpiry: 3, notes: 'Theta decay play worked well', tags: ['options', 'theta'], emotion: 'excited' },
  { date: '2025-10-31', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'ITC', quantity: 25, entryPrice: 465, targetPrice: 475, stopLoss: 460, exitPrice: 473, brokerage: 58, strategy: 'Head & shoulder', margin: 11700, buySell: 'Buy', notes: 'FMCG sector strength', tags: ['fmcg', 'defensive'], emotion: 'confident' },
  { date: '2025-10-30', entryTime: '10:20', exitTime: '12:00', type: 'Swing Trading', market: 'Commodities', asset: 'Gold', quantity: 4, entryPrice: 61200, targetPrice: 61500, stopLoss: 61000, exitPrice: 61450, brokerage: 120, strategy: 'Hammer Candle', margin: 24500, buySell: 'Buy', notes: 'Gold rally on Fed speculation', tags: ['gold', 'safe-haven'], emotion: 'neutral' },
  { date: '2025-10-29', entryTime: '11:00', exitTime: '13:30', type: 'Intraday', market: 'Equity', asset: 'Wipro', quantity: 20, entryPrice: 540, targetPrice: 555, stopLoss: 532, exitPrice: 535, brokerage: 54, strategy: 'Breakout', margin: 10900, buySell: 'Buy', notes: 'Weak follow-through, stopped out', tags: ['it-sector'], emotion: 'uncertain' },
  { date: '2025-10-28', entryTime: '09:30', exitTime: '10:45', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 4, entryPrice: 23180, targetPrice: 23240, stopLoss: 23150, exitPrice: 23225, brokerage: 80, strategy: 'M Pattern', margin: 93000, buySell: 'Buy', notes: 'Quick scalp on opening range breakout', tags: ['futures', 'scalping'], emotion: 'excited' },
  { date: '2025-10-25', entryTime: '14:00', exitTime: '15:20', type: 'Intraday', market: 'Equity', asset: 'Tata Motors', quantity: 18, entryPrice: 895, targetPrice: 920, stopLoss: 880, exitPrice: 915, brokerage: 65, strategy: 'Breakout', margin: 16200, buySell: 'Buy', notes: 'Auto sector momentum', tags: ['auto', 'momentum'], emotion: 'confident' },
  { date: '2025-10-24', entryTime: '10:30', exitTime: '12:00', type: 'Intraday', market: 'Forex', asset: 'USD/INR', quantity: 100, entryPrice: 83.25, targetPrice: 83.40, stopLoss: 83.15, exitPrice: 83.38, brokerage: 42, strategy: 'Breakout', margin: 4200, buySell: 'Buy', notes: 'Dollar strength on US data', tags: ['forex', 'usd'], emotion: 'neutral' },
  { date: '2025-10-23', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Equity', asset: 'Bajaj Finance', quantity: 6, entryPrice: 7350, targetPrice: 7450, stopLoss: 7300, exitPrice: 7420, brokerage: 88, strategy: 'Double Bottom', margin: 44200, buySell: 'Buy', notes: 'NBFC sector rally', tags: ['nbfc', 'financial'], emotion: 'excited' },
  { date: '2025-10-22', entryTime: '09:15', exitTime: '10:30', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 3, entryPrice: 47200, targetPrice: 47300, stopLoss: 47150, exitPrice: 47280, brokerage: 67, strategy: 'Breakout', margin: 142000, buySell: 'Buy', notes: 'Morning gap-up continuation', tags: ['futures', 'banking'], emotion: 'confident' },
  { date: '2025-10-21', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 4, entryPrice: 250, targetPrice: 300, stopLoss: 230, exitPrice: 285, brokerage: 40, strategy: 'Iron Condor', margin: 1020, buySell: 'Buy', strikePrice: 47500, optionType: 'Put', impliedVolatility: 19, daysToExpiry: 4, notes: 'Volatility expansion trade', tags: ['options', 'volatility'], emotion: 'neutral' },
  { date: '2025-10-18', entryTime: '10:00', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Asian Paints', quantity: 14, entryPrice: 2920, targetPrice: 2970, stopLoss: 2890, exitPrice: 2960, brokerage: 82, strategy: 'Head & shoulder', margin: 41000, buySell: 'Buy', notes: 'Paint sector strength', tags: ['consumer'], emotion: 'confident' },
  { date: '2025-10-17', entryTime: '14:15', exitTime: '15:25', type: 'Scalping', market: 'Crypto_Currency', asset: 'Bitcoin (BTC)', quantity: 0.8, entryPrice: 65200, targetPrice: 65800, stopLoss: 64900, exitPrice: 65650, brokerage: 130, strategy: 'Breakout', margin: 8300, buySell: 'Buy', notes: 'Crypto afternoon pump', tags: ['crypto', 'btc'], emotion: 'excited' },
  { date: '2025-10-16', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Maruti Suzuki', quantity: 7, entryPrice: 11200, targetPrice: 11350, stopLoss: 11100, exitPrice: 11320, brokerage: 157, strategy: 'M Pattern', margin: 78600, buySell: 'Buy', notes: 'Auto sector breakout', tags: ['auto', 'large-cap'], emotion: 'confident' },
  { date: '2025-09-30', entryTime: '10:45', exitTime: '12:15', type: 'Intraday', market: 'Equity', asset: 'ICICI Bank', quantity: 13, entryPrice: 1120, targetPrice: 1145, stopLoss: 1105, exitPrice: 1140, brokerage: 58, strategy: 'Breakout', margin: 14600, buySell: 'Buy', notes: 'Banking rally on rate pause', tags: ['banking', 'momentum'], emotion: 'excited' },
  { date: '2025-09-27', entryTime: '11:30', exitTime: '13:00', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 5, entryPrice: 22850, targetPrice: 22920, stopLoss: 22800, exitPrice: 22905, brokerage: 100, strategy: 'Breakout', margin: 114500, buySell: 'Buy', notes: 'Pre-weekend momentum', tags: ['futures'], emotion: 'neutral' },
  { date: '2025-09-26', entryTime: '09:15', exitTime: '10:45', type: 'Scalping', market: 'Equity', asset: 'Sun Pharma', quantity: 16, entryPrice: 1510, targetPrice: 1540, stopLoss: 1495, exitPrice: 1535, brokerage: 96, strategy: 'Double Bottom', margin: 24200, buySell: 'Buy', notes: 'Pharma sector rotation', tags: ['pharma', 'healthcare'], emotion: 'confident' },
  { date: '2025-09-25', entryTime: '13:45', exitTime: '15:10', type: 'Intraday', market: 'Commodities', asset: 'Silver', quantity: 6, entryPrice: 77500, targetPrice: 78200, stopLoss: 77000, exitPrice: 78100, brokerage: 155, strategy: 'Hammer Candle', margin: 46600, buySell: 'Buy', notes: 'Silver rally on industrial demand', tags: ['silver', 'commodities'], emotion: 'excited' },
  { date: '2025-09-24', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Axis Bank', quantity: 11, entryPrice: 1085, targetPrice: 1110, stopLoss: 1070, exitPrice: 1105, brokerage: 60, strategy: 'Head & shoulder', margin: 12000, buySell: 'Buy', notes: 'Private bank strength', tags: ['banking'], emotion: 'confident' },
  { date: '2025-09-23', entryTime: '14:20', exitTime: '15:20', type: 'Scalping', market: 'Options', asset: 'Nifty', quantity: 5, entryPrice: 145, targetPrice: 175, stopLoss: 130, exitPrice: 165, brokerage: 50, strategy: 'Iron Condor', margin: 750, buySell: 'Buy', strikePrice: 22800, optionType: 'Call', impliedVolatility: 17, daysToExpiry: 2, notes: 'End of day volatility trade', tags: ['options', 'theta'], emotion: 'neutral' },
  { date: '2025-09-20', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Bharti Airtel', quantity: 19, entryPrice: 1450, targetPrice: 1480, stopLoss: 1435, exitPrice: 1475, brokerage: 69, strategy: 'Breakout', margin: 27600, buySell: 'Buy', notes: 'Telecom sector breakout', tags: ['telecom', 'momentum'], emotion: 'excited' },
  { date: '2025-09-19', entryTime: '12:00', exitTime: '13:30', type: 'Intraday', market: 'Forex', asset: 'EUR/USD', quantity: 150, entryPrice: 1.0920, targetPrice: 1.0950, stopLoss: 1.0900, exitPrice: 1.0945, brokerage: 38, strategy: 'M Pattern', margin: 3280, buySell: 'Buy', notes: 'Euro strength on ECB comments', tags: ['forex', 'eur'], emotion: 'confident' },
  { date: '2025-09-18', entryTime: '10:15', exitTime: '11:45', type: 'Swing Trading', market: 'Crypto_Currency', asset: 'Ethereum (ETH)', quantity: 2.5, entryPrice: 2580, targetPrice: 2680, stopLoss: 2520, exitPrice: 2650, brokerage: 162, strategy: 'Breakout', margin: 6500, buySell: 'Buy', notes: 'Crypto market reversal', tags: ['crypto', 'eth'], emotion: 'excited' },
  { date: '2025-09-17', entryTime: '13:30', exitTime: '14:50', type: 'Intraday', market: 'Equity', asset: 'Coal India', quantity: 35, entryPrice: 425, targetPrice: 440, stopLoss: 418, exitPrice: 437, brokerage: 75, strategy: 'Breakout', margin: 14900, buySell: 'Buy', notes: 'PSU momentum', tags: ['psu', 'energy'], emotion: 'neutral' },
  { date: '2025-09-16', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Futures', asset: 'BankNifty', quantity: 4, entryPrice: 46850, targetPrice: 46950, stopLoss: 46800, exitPrice: 46930, brokerage: 85, strategy: 'Double Bottom', margin: 187600, buySell: 'Buy', notes: 'Banking sector recovery', tags: ['futures', 'banking'], emotion: 'confident' },
  { date: '2025-09-13', entryTime: '11:00', exitTime: '12:30', type: 'Scalping', market: 'Equity', asset: 'Power Grid', quantity: 28, entryPrice: 285, targetPrice: 295, stopLoss: 280, exitPrice: 293, brokerage: 41, strategy: 'Head & shoulder', margin: 8000, buySell: 'Buy', notes: 'Utility sector play', tags: ['utility', 'defensive'], emotion: 'neutral' },
  { date: '2025-09-12', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Commodities', asset: 'Crude Oil', quantity: 8, entryPrice: 6820, targetPrice: 6900, stopLoss: 6780, exitPrice: 6880, brokerage: 137, strategy: 'Hammer Candle', margin: 54800, buySell: 'Buy', notes: 'Oil rally on supply cuts', tags: ['oil', 'energy'], emotion: 'excited' },
  { date: '2025-08-30', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Equity', asset: 'HCL Tech', quantity: 17, entryPrice: 1680, targetPrice: 1720, stopLoss: 1660, exitPrice: 1715, brokerage: 114, strategy: 'M Pattern', margin: 28600, buySell: 'Buy', notes: 'IT sector strength on dollar weakness', tags: ['it-sector', 'large-cap'], emotion: 'confident' },
  { date: '2025-08-29', entryTime: '11:45', exitTime: '13:15', type: 'Scalping', market: 'Futures', asset: 'Nifty-50', quantity: 6, entryPrice: 22450, targetPrice: 22510, stopLoss: 22410, exitPrice: 22495, brokerage: 120, strategy: 'Breakout', margin: 135000, buySell: 'Buy', notes: 'Mid-day range breakout', tags: ['futures', 'scalping'], emotion: 'excited' },
  { date: '2025-08-28', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 6, entryPrice: 320, targetPrice: 370, stopLoss: 300, exitPrice: 355, brokerage: 72, strategy: 'Iron Condor', margin: 1960, buySell: 'Buy', strikePrice: 46500, optionType: 'Call', impliedVolatility: 20, daysToExpiry: 5, notes: 'Volatility spike opportunity', tags: ['options', 'volatility'], emotion: 'neutral' },
  { date: '2025-08-27', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Equity', asset: 'Titan Company', quantity: 9, entryPrice: 3420, targetPrice: 3480, stopLoss: 3390, exitPrice: 3470, brokerage: 123, strategy: 'Breakout', margin: 30900, buySell: 'Buy', notes: 'Consumer discretionary rally', tags: ['consumer', 'jewelry'], emotion: 'confident' },
  { date: '2025-08-26', entryTime: '14:15', exitTime: '15:20', type: 'Scalping', market: 'Crypto_Currency', asset: 'Ripple (XRP)', quantity: 500, entryPrice: 54.2, targetPrice: 56.8, stopLoss: 52.8, exitPrice: 56.3, brokerage: 108, strategy: 'Double Bottom', margin: 2750, buySell: 'Buy', notes: 'Altcoin momentum', tags: ['crypto', 'altcoin'], emotion: 'excited' },
  { date: '2025-08-23', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Adani Ports', quantity: 24, entryPrice: 1240, targetPrice: 1275, stopLoss: 1220, exitPrice: 1268, brokerage: 149, strategy: 'Head & shoulder', margin: 29800, buySell: 'Buy', notes: 'Infrastructure play', tags: ['infrastructure', 'adani'], emotion: 'neutral' },
  { date: '2025-08-22', entryTime: '12:30', exitTime: '14:00', type: 'Intraday', market: 'Forex', asset: 'GBP/INR', quantity: 80, entryPrice: 105.8, targetPrice: 106.3, stopLoss: 105.4, exitPrice: 106.2, brokerage: 42, strategy: 'Breakout', margin: 4240, buySell: 'Buy', notes: 'Pound strength on UK data', tags: ['forex', 'gbp'], emotion: 'confident' },
  { date: '2025-08-21', entryTime: '10:45', exitTime: '12:15', type: 'Swing Trading', market: 'Commodities', asset: 'Natural Gas', quantity: 15, entryPrice: 215, targetPrice: 228, stopLoss: 208, exitPrice: 225, brokerage: 81, strategy: 'Hammer Candle', margin: 3250, buySell: 'Buy', notes: 'Winter demand speculation', tags: ['gas', 'energy'], emotion: 'excited' },
  { date: '2025-08-20', entryTime: '13:45', exitTime: '15:10', type: 'Intraday', market: 'Equity', asset: 'Dr Reddy', quantity: 5, entryPrice: 6280, targetPrice: 6380, stopLoss: 6230, exitPrice: 6360, brokerage: 126, strategy: 'M Pattern', margin: 31500, buySell: 'Buy', notes: 'Pharma sector strength', tags: ['pharma', 'large-cap'], emotion: 'confident' },
  { date: '2025-08-19', entryTime: '09:15', exitTime: '10:45', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 5, entryPrice: 46200, targetPrice: 46300, stopLoss: 46150, exitPrice: 46285, brokerage: 106, strategy: 'Breakout', margin: 231500, buySell: 'Buy', notes: 'Opening range breakout', tags: ['futures', 'banking'], emotion: 'excited' },
  { date: '2025-07-31', entryTime: '11:20', exitTime: '12:50', type: 'Intraday', market: 'Equity', asset: 'Kotak Bank', quantity: 8, entryPrice: 1850, targetPrice: 1890, stopLoss: 1830, exitPrice: 1882, brokerage: 59, strategy: 'Double Bottom', margin: 14900, buySell: 'Buy', notes: 'Private banking strength', tags: ['banking', 'private'], emotion: 'confident' },
  { date: '2025-07-30', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 7, entryPrice: 190, targetPrice: 230, stopLoss: 175, exitPrice: 220, brokerage: 70, strategy: 'Iron Condor', margin: 1360, buySell: 'Buy', strikePrice: 22200, optionType: 'Put', impliedVolatility: 18, daysToExpiry: 3, notes: 'End of month theta decay', tags: ['options', 'theta'], emotion: 'neutral' },
  { date: '2025-07-29', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'Dabur India', quantity: 31, entryPrice: 565, targetPrice: 580, stopLoss: 558, exitPrice: 577, brokerage: 71, strategy: 'Breakout', margin: 17600, buySell: 'Buy', notes: 'FMCG sector rally', tags: ['fmcg', 'consumer'], emotion: 'excited' },
  { date: '2025-07-26', entryTime: '12:00', exitTime: '13:30', type: 'Scalping', market: 'Crypto_Currency', asset: 'Solana (SOL)', quantity: 18, entryPrice: 2280, targetPrice: 2380, stopLoss: 2230, exitPrice: 2360, brokerage: 164, strategy: 'Head & shoulder', margin: 4140, buySell: 'Buy', notes: 'Alt season momentum', tags: ['crypto', 'altcoin'], emotion: 'excited' },
  { date: '2025-07-25', entryTime: '10:30', exitTime: '12:00', type: 'Intraday', market: 'Forex', asset: 'USD/JPY', quantity: 200, entryPrice: 143.8, targetPrice: 144.3, stopLoss: 143.5, exitPrice: 144.2, brokerage: 80, strategy: 'M Pattern', margin: 5750, buySell: 'Buy', notes: 'Yen weakness continues', tags: ['forex', 'jpy'], emotion: 'confident' },
  { date: '2025-07-24', entryTime: '13:15', exitTime: '14:45', type: 'Intraday', market: 'Equity', asset: 'Vedanta', quantity: 22, entryPrice: 395, targetPrice: 410, stopLoss: 388, exitPrice: 407, brokerage: 45, strategy: 'Breakout', margin: 8750, buySell: 'Buy', notes: 'Metal sector rotation', tags: ['metals', 'commodity'], emotion: 'neutral' },
  { date: '2025-07-23', entryTime: '09:20', exitTime: '10:50', type: 'Swing Trading', market: 'Commodities', asset: 'Copper', quantity: 9, entryPrice: 738, targetPrice: 755, stopLoss: 728, exitPrice: 752, brokerage: 133, strategy: 'Hammer Candle', margin: 6680, buySell: 'Buy', notes: 'Base metal demand pickup', tags: ['copper', 'metals'], emotion: 'confident' },
  { date: '2025-07-22', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 7, entryPrice: 21950, targetPrice: 22010, stopLoss: 21910, exitPrice: 21995, brokerage: 140, strategy: 'Double Bottom', margin: 154000, buySell: 'Buy', notes: 'Mid-week consolidation breakout', tags: ['futures'], emotion: 'excited' },
  { date: '2025-07-19', entryTime: '14:20', exitTime: '15:25', type: 'Scalping', market: 'Equity', asset: 'Grasim Industries', quantity: 26, entryPrice: 2140, targetPrice: 2180, stopLoss: 2120, exitPrice: 2172, brokerage: 166, strategy: 'Head & shoulder', margin: 55800, buySell: 'Buy', notes: 'Cement sector play', tags: ['cement', 'infrastructure'], emotion: 'neutral' },
  { date: '2025-07-18', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 8, entryPrice: 280, targetPrice: 330, stopLoss: 265, exitPrice: 315, brokerage: 80, strategy: 'Iron Condor', margin: 2280, buySell: 'Buy', strikePrice: 45800, optionType: 'Call', impliedVolatility: 21, daysToExpiry: 6, notes: 'Banking volatility trade', tags: ['options', 'banking'], emotion: 'confident' },
  { date: '2025-07-17', entryTime: '12:30', exitTime: '14:00', type: 'Intraday', market: 'Equity', asset: 'JSW Steel', quantity: 19, entryPrice: 845, targetPrice: 870, stopLoss: 832, exitPrice: 865, brokerage: 80, strategy: 'M Pattern', margin: 16100, buySell: 'Buy', notes: 'Steel sector momentum', tags: ['steel', 'metals'], emotion: 'excited' },
  { date: '2025-07-16', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Crypto_Currency', asset: 'Cardano (ADA)', quantity: 850, entryPrice: 38.5, targetPrice: 41.2, stopLoss: 37.0, exitPrice: 40.8, brokerage: 138, strategy: 'Breakout', margin: 3300, buySell: 'Buy', notes: 'Altcoin rally', tags: ['crypto', 'altcoin'], emotion: 'excited' },
  { date: '2025-07-15', entryTime: '13:45', exitTime: '15:10', type: 'Scalping', market: 'Forex', asset: 'AUD/USD', quantity: 180, entryPrice: 0.6720, targetPrice: 0.6755, stopLoss: 0.6700, exitPrice: 0.6748, brokerage: 72, strategy: 'Double Bottom', margin: 2420, buySell: 'Buy', notes: 'Aussie strength on commodities', tags: ['forex', 'aud'], emotion: 'confident' },
  { date: '2025-08-15', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Hindalco', quantity: 29, entryPrice: 615, targetPrice: 635, stopLoss: 605, exitPrice: 630, brokerage: 90, strategy: 'Breakout', margin: 17900, buySell: 'Buy', notes: 'Aluminum demand surge', tags: ['metals', 'aluminum'], emotion: 'excited' },
  { date: '2025-08-14', entryTime: '14:00', exitTime: '15:15', type: 'Scalping', market: 'Futures', asset: 'BankNifty', quantity: 6, entryPrice: 45650, targetPrice: 45750, stopLoss: 45600, exitPrice: 45730, brokerage: 127, strategy: 'Head & shoulder', margin: 274200, buySell: 'Buy', notes: 'Afternoon scalp', tags: ['futures', 'banking'], emotion: 'neutral' },
  { date: '2025-08-13', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Commodities', asset: 'Zinc', quantity: 12, entryPrice: 265, targetPrice: 275, stopLoss: 260, exitPrice: 273, brokerage: 64, strategy: 'Hammer Candle', margin: 3200, buySell: 'Buy', notes: 'Base metal strength', tags: ['metals', 'zinc'], emotion: 'confident' },
  { date: '2025-08-12', entryTime: '11:30', exitTime: '13:00', type: 'Intraday', market: 'Equity', asset: 'L&T', quantity: 11, entryPrice: 3580, targetPrice: 3640, stopLoss: 3550, exitPrice: 3628, brokerage: 159, strategy: 'M Pattern', margin: 39500, buySell: 'Buy', notes: 'Infrastructure capex play', tags: ['infrastructure', 'large-cap'], emotion: 'confident' },
  { date: '2025-08-09', entryTime: '13:15', exitTime: '14:45', type: 'Swing Trading', market: 'Crypto_Currency', asset: 'Polygon (MATIC)', quantity: 420, entryPrice: 52.3, targetPrice: 56.8, stopLoss: 50.2, exitPrice: 55.9, brokerage: 93, strategy: 'Double Bottom', margin: 2210, buySell: 'Buy', notes: 'Layer 2 momentum', tags: ['crypto', 'defi'], emotion: 'excited' },
  { date: '2025-08-08', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 9, entryPrice: 165, targetPrice: 200, stopLoss: 152, exitPrice: 192, brokerage: 90, strategy: 'Iron Condor', margin: 1520, buySell: 'Buy', strikePrice: 21800, optionType: 'Call', impliedVolatility: 19, daysToExpiry: 4, notes: 'Theta decay strategy', tags: ['options', 'theta'], emotion: 'neutral' },
  { date: '2025-08-07', entryTime: '14:30', exitTime: '15:20', type: 'Scalping', market: 'Equity', asset: 'UltraTech Cement', quantity: 4, entryPrice: 9850, targetPrice: 10000, stopLoss: 9780, exitPrice: 9975, brokerage: 199, strategy: 'Breakout', margin: 39600, buySell: 'Buy', notes: 'Cement demand uptick', tags: ['cement', 'construction'], emotion: 'confident' },
  { date: '2025-08-06', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Forex', asset: 'EUR/GBP', quantity: 160, entryPrice: 0.8620, targetPrice: 0.8655, stopLoss: 0.8600, exitPrice: 0.8648, brokerage: 64, strategy: 'Head & shoulder', margin: 2760, buySell: 'Buy', notes: 'Cross-currency opportunity', tags: ['forex', 'eur'], emotion: 'excited' },
  { date: '2025-08-05', entryTime: '12:45', exitTime: '14:15', type: 'Intraday', market: 'Equity', asset: 'Eicher Motors', quantity: 3, entryPrice: 4820, targetPrice: 4920, stopLoss: 4770, exitPrice: 4905, brokerage: 73, strategy: 'Breakout', margin: 14500, buySell: 'Buy', notes: 'Premium auto segment strength', tags: ['auto', 'premium'], emotion: 'confident' },
  { date: '2025-08-02', entryTime: '10:45', exitTime: '12:15', type: 'Swing Trading', market: 'Commodities', asset: 'Platinum', quantity: 7, entryPrice: 28400, targetPrice: 29100, stopLoss: 27900, exitPrice: 28950, brokerage: 406, strategy: 'Hammer Candle', margin: 20000, buySell: 'Buy', notes: 'Precious metal rotation', tags: ['platinum', 'precious-metal'], emotion: 'neutral' },
  { date: '2025-08-01', entryTime: '13:00', exitTime: '14:30', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 8, entryPrice: 21550, targetPrice: 21620, stopLoss: 21510, exitPrice: 21605, brokerage: 160, strategy: 'Double Bottom', margin: 172600, buySell: 'Buy', notes: 'Month-start momentum', tags: ['futures'], emotion: 'excited' },
  { date: '2025-06-28', entryTime: '09:30', exitTime: '11:00', type: 'Intraday', market: 'Equity', asset: 'Nestle India', quantity: 2, entryPrice: 24500, targetPrice: 24850, stopLoss: 24300, exitPrice: 24800, brokerage: 248, strategy: 'M Pattern', margin: 49200, buySell: 'Buy', notes: 'Defensive FMCG play', tags: ['fmcg', 'defensive'], emotion: 'confident' },
  { date: '2025-06-27', entryTime: '11:45', exitTime: '13:15', type: 'Scalping', market: 'Crypto_Currency', asset: 'Litecoin (LTC)', quantity: 35, entryPrice: 7250, targetPrice: 7480, stopLoss: 7150, exitPrice: 7445, brokerage: 255, strategy: 'Breakout', margin: 25500, buySell: 'Buy', notes: 'Crypto recovery trade', tags: ['crypto', 'ltc'], emotion: 'excited' },
  { date: '2025-06-26', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 10, entryPrice: 350, targetPrice: 400, stopLoss: 335, exitPrice: 385, brokerage: 100, strategy: 'Iron Condor', margin: 3580, buySell: 'Buy', strikePrice: 45000, optionType: 'Put', impliedVolatility: 22, daysToExpiry: 7, notes: 'Banking vol expansion', tags: ['options', 'volatility'], emotion: 'neutral' },
  { date: '2025-06-25', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Equity', asset: 'Bajaj Auto', quantity: 12, entryPrice: 8950, targetPrice: 9100, stopLoss: 8880, exitPrice: 9075, brokerage: 217, strategy: 'Head & shoulder', margin: 107600, buySell: 'Buy', notes: 'Two-wheeler demand surge', tags: ['auto', '2w'], emotion: 'confident' },
  { date: '2025-06-24', entryTime: '12:30', exitTime: '14:00', type: 'Scalping', market: 'Forex', asset: 'CHF/JPY', quantity: 140, entryPrice: 162.5, targetPrice: 163.2, stopLoss: 162.1, exitPrice: 163.0, brokerage: 70, strategy: 'Breakout', margin: 4560, buySell: 'Buy', notes: 'Safe-haven cross trade', tags: ['forex', 'chf'], emotion: 'neutral' },
  { date: '2025-06-21', entryTime: '09:45', exitTime: '11:15', type: 'Intraday', market: 'Equity', asset: 'Hero MotoCorp', quantity: 16, entryPrice: 4680, targetPrice: 4780, stopLoss: 4640, exitPrice: 4765, brokerage: 299, strategy: 'Double Bottom', margin: 75100, buySell: 'Buy', notes: 'Auto sector rally', tags: ['auto', '2w'], emotion: 'excited' },
  { date: '2025-06-20', entryTime: '13:15', exitTime: '14:45', type: 'Swing Trading', market: 'Commodities', asset: 'Lead', quantity: 18, entryPrice: 185, targetPrice: 195, stopLoss: 180, exitPrice: 193, brokerage: 70, strategy: 'Hammer Candle', margin: 3360, buySell: 'Buy', notes: 'Industrial metal demand', tags: ['metals', 'industrial'], emotion: 'confident' },
  { date: '2025-06-19', entryTime: '10:00', exitTime: '11:30', type: 'Intraday', market: 'Futures', asset: 'BankNifty', quantity: 7, entryPrice: 44800, targetPrice: 44900, stopLoss: 44750, exitPrice: 44880, brokerage: 148, strategy: 'M Pattern', margin: 314200, buySell: 'Buy', notes: 'Banking index strength', tags: ['futures', 'banking'], emotion: 'confident' },
  { date: '2025-06-18', entryTime: '14:30', exitTime: '15:20', type: 'Scalping', market: 'Equity', asset: 'Shree Cement', quantity: 5, entryPrice: 27200, targetPrice: 27550, stopLoss: 27050, exitPrice: 27500, brokerage: 550, strategy: 'Breakout', margin: 136500, buySell: 'Buy', notes: 'Cement sector breakout', tags: ['cement', 'construction'], emotion: 'excited' },
  { date: '2025-06-17', entryTime: '09:20', exitTime: '10:50', type: 'Intraday', market: 'Crypto_Currency', asset: 'Avalanche (AVAX)', quantity: 65, entryPrice: 2840, targetPrice: 2980, stopLoss: 2760, exitPrice: 2950, brokerage: 383, strategy: 'Head & shoulder', margin: 18600, buySell: 'Buy', notes: 'DeFi platform rally', tags: ['crypto', 'defi'], emotion: 'neutral' },
  { date: '2025-06-14', entryTime: '11:45', exitTime: '13:15', type: 'Intraday', market: 'Options', asset: 'Nifty', quantity: 11, entryPrice: 210, targetPrice: 250, stopLoss: 198, exitPrice: 240, brokerage: 110, strategy: 'Iron Condor', margin: 2360, buySell: 'Buy', strikePrice: 21200, optionType: 'Call', impliedVolatility: 20, daysToExpiry: 5, notes: 'Weekly options play', tags: ['options', 'weekly'], emotion: 'confident' },
  { date: '2025-06-13', entryTime: '12:00', exitTime: '13:30', type: 'Intraday', market: 'Forex', asset: 'NZD/USD', quantity: 190, entryPrice: 0.6240, targetPrice: 0.6280, stopLoss: 0.6220, exitPrice: 0.6272, brokerage: 76, strategy: 'Breakout', margin: 2370, buySell: 'Buy', notes: 'Kiwi commodity strength', tags: ['forex', 'nzd'], emotion: 'excited' },
  { date: '2025-06-12', entryTime: '13:45', exitTime: '15:10', type: 'Scalping', market: 'Equity', asset: 'Tata Steel', quantity: 38, entryPrice: 142, targetPrice: 148, stopLoss: 139, exitPrice: 147, brokerage: 108, strategy: 'Double Bottom', margin: 5430, buySell: 'Buy', notes: 'Steel sector rotation', tags: ['steel', 'metals'], emotion: 'confident' },
  { date: '2025-06-11', entryTime: '10:30', exitTime: '12:00', type: 'Swing Trading', market: 'Commodities', asset: 'Aluminum', quantity: 24, entryPrice: 215, targetPrice: 226, stopLoss: 210, exitPrice: 224, brokerage: 108, strategy: 'Hammer Candle', margin: 5200, buySell: 'Buy', notes: 'Base metal recovery', tags: ['aluminum', 'metals'], emotion: 'neutral' },
  { date: '2025-06-10', entryTime: '09:15', exitTime: '10:45', type: 'Intraday', market: 'Equity', asset: 'Indraprastha Gas', quantity: 41, entryPrice: 485, targetPrice: 505, stopLoss: 475, exitPrice: 502, brokerage: 103, strategy: 'M Pattern', margin: 20000, buySell: 'Buy', notes: 'Gas utility play', tags: ['utility', 'gas'], emotion: 'confident' },
  { date: '2025-06-07', entryTime: '14:00', exitTime: '15:15', type: 'Intraday', market: 'Futures', asset: 'Nifty-50', quantity: 9, entryPrice: 20850, targetPrice: 20920, stopLoss: 20810, exitPrice: 20905, brokerage: 180, strategy: 'Breakout', margin: 188100, buySell: 'Buy', notes: 'Friday momentum', tags: ['futures'], emotion: 'excited' },
  { date: '2025-06-06', entryTime: '11:00', exitTime: '12:30', type: 'Scalping', market: 'Crypto_Currency', asset: 'Chainlink (LINK)', quantity: 110, entryPrice: 1280, targetPrice: 1340, stopLoss: 1250, exitPrice: 1330, brokerage: 293, strategy: 'Head & shoulder', margin: 14200, buySell: 'Buy', notes: 'Oracle network pump', tags: ['crypto', 'oracle'], emotion: 'excited' },
  { date: '2025-06-05', entryTime: '12:45', exitTime: '14:15', type: 'Intraday', market: 'Equity', asset: 'Mahindra & Mahindra', quantity: 13, entryPrice: 2420, targetPrice: 2480, stopLoss: 2390, exitPrice: 2470, brokerage: 128, strategy: 'Double Bottom', margin: 31600, buySell: 'Buy', notes: 'Auto and tractor strength', tags: ['auto', 'tractor'], emotion: 'confident' },
  { date: '2025-06-04', entryTime: '13:30', exitTime: '15:00', type: 'Intraday', market: 'Options', asset: 'BankNifty', quantity: 12, entryPrice: 390, targetPrice: 440, stopLoss: 375, exitPrice: 425, brokerage: 120, strategy: 'Iron Condor', margin: 4760, buySell: 'Buy', strikePrice: 44200, optionType: 'Call', impliedVolatility: 23, daysToExpiry: 8, notes: 'Banking volatility trade', tags: ['options', 'banking'], emotion: 'neutral' },
  { date: '2025-06-03', entryTime: '10:15', exitTime: '11:45', type: 'Intraday', market: 'Forex', asset: 'CAD/JPY', quantity: 170, entryPrice: 106.8, targetPrice: 107.4, stopLoss: 106.5, exitPrice: 107.3, brokerage: 85, strategy: 'Breakout', margin: 3640, buySell: 'Buy', notes: 'Loonie commodity play', tags: ['forex', 'cad'], emotion: 'confident' }
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const contractLabel = (dateString: string) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'CURRENT' : `${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

const shiftDateByDays = (dateString: string, daysBack: number) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().slice(0, 10);
};

const pnlOf = (trade: RawTrade) => {
  const brokerage = trade.brokerage || 0;
  const move = trade.buySell === 'Sell' ? trade.entryPrice - trade.exitPrice : trade.exitPrice - trade.entryPrice;
  return move * trade.quantity - brokerage;
};

/** Spread the template's dates evenly over the last ~12 weeks so the sample
 *  always looks current (original's `remapTradesToRecentTimeline`). */
function remapToRecentTimeline(list: RawTrade[]): RawTrade[] {
  const sortedAsc = Array.from(new Set(list.map((t) => t.date))).sort();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const spanDays = Math.max(84, sortedAsc.length * 2);
  const stepDays = sortedAsc.length > 1 ? Math.max(1, Math.floor(spanDays / (sortedAsc.length - 1))) : 0;
  const dateMap: Record<string, string> = {};
  sortedAsc.forEach((original, index) => {
    const mapped = new Date(today);
    mapped.setDate(mapped.getDate() - (sortedAsc.length - 1 - index) * stepDays);
    dateMap[original] = formatDate(mapped);
  });
  return list.map((t) => ({ ...t, date: dateMap[t.date] || t.date }));
}

const baseTrades = (): RawTrade[] => remapToRecentTimeline(TEMPLATE);

interface ExpandConfig {
  rounds: number;
  qtyMultiplier: number;
  brokerageMultiplier: number;
  movePattern: number[];
  directionPattern: string[];
  typePattern: string[];
  strategyPattern: string[];
  marketPattern: string[];
  dateShiftPerRound: number;
}

function buildExpandedSet(base: RawTrade[], config: ExpandConfig): RawTrade[] {
  const expanded: RawTrade[] = [];
  for (let round = 0; round < config.rounds; round++) {
    base.forEach((trade, index) => {
      const seq = round * base.length + index;
      const move = config.movePattern[seq % config.movePattern.length];
      const direction = config.directionPattern[seq % config.directionPattern.length] === 'Sell' ? 'Sell' : 'Buy';
      expanded.push({
        ...trade,
        buySell: direction,
        type: config.typePattern[seq % config.typePattern.length],
        strategy: config.strategyPattern[seq % config.strategyPattern.length],
        market: config.marketPattern[seq % config.marketPattern.length],
        quantity: Math.max(1, parseFloat((trade.quantity * config.qtyMultiplier).toFixed(2))),
        exitPrice: parseFloat((trade.entryPrice * (direction === 'Sell' ? 1 - move : 1 + move)).toFixed(4)),
        brokerage: parseFloat(((trade.brokerage || 0) * config.brokerageMultiplier + round * 2).toFixed(2)),
        date: shiftDateByDays(trade.date, round * config.dateShiftPerRound),
      });
    });
  }
  return expanded;
}

const GENERATORS: Record<string, () => RawTrade[]> = {
  '1': baseTrades,
  '2': () =>
    baseTrades()
      .filter((_, i) => i % 2 === 0)
      .map((trade, i) => ({
        ...trade,
        buySell: 'Buy',
        type: i % 3 === 0 ? 'Positional Trading' : 'Swing Trading',
        quantity: Math.max(1, Math.round(trade.quantity * 0.65)),
        exitPrice: parseFloat((trade.entryPrice * (1 + (i % 5 === 0 ? -0.006 : 0.012))).toFixed(4)),
        brokerage: parseFloat(((trade.brokerage || 0) * 0.8).toFixed(2)),
        strategy: i % 2 === 0 ? 'W Pattern' : 'Hammer Candle',
      })),
  '3': () => {
    const times = ['09:20', '09:40', '10:05', '10:35', '11:10', '12:00', '13:15', '14:05'];
    return baseTrades().map((trade, i) => {
      const direction = i % 3 === 0 ? 'Sell' : 'Buy';
      const move = [0.0035, 0.0028, -0.0022, 0.0015][i % 4];
      return {
        ...trade,
        buySell: direction,
        type: 'Scalping',
        market: i % 2 === 0 ? 'Futures' : 'Options',
        quantity: Math.max(1, Math.round(trade.quantity * 1.25)),
        entryTime: times[i % times.length],
        exitTime: times[(i + 1) % times.length],
        exitPrice: parseFloat((trade.entryPrice * (direction === 'Sell' ? 1 - move : 1 + move)).toFixed(4)),
        brokerage: parseFloat(((trade.brokerage || 0) * 1.05).toFixed(2)),
        strategy: i % 2 === 0 ? 'Breakout' : 'M Pattern',
      };
    });
  },
  '4': () =>
    buildExpandedSet(baseTrades(), {
      rounds: 2, qtyMultiplier: 1.35, brokerageMultiplier: 1.1,
      movePattern: [0.011, 0.014, -0.007, 0.009, 0.012],
      directionPattern: ['Buy', 'Buy', 'Buy', 'Sell'],
      typePattern: ['Intraday', 'Swing Trading', 'Scalping', 'Positional Trading'],
      strategyPattern: ['Breakout', 'M Pattern', 'Double Bottom', 'Head & shoulder'],
      marketPattern: ['Equity', 'Futures', 'Options', 'Commodities', 'Forex'],
      dateShiftPerRound: 12,
    }),
  '5': () =>
    buildExpandedSet(baseTrades(), {
      rounds: 2, qtyMultiplier: 0.9, brokerageMultiplier: 0.95,
      movePattern: [0.0065, 0.008, -0.0045, 0.0055, -0.0035],
      directionPattern: ['Buy', 'Buy', 'Sell', 'Buy'],
      typePattern: ['Swing Trading', 'Positional Trading', 'Intraday'],
      strategyPattern: ['W Pattern', 'Hammer Candle', 'Iron Condor', 'Breakout'],
      marketPattern: ['Equity', 'Commodities', 'Forex', 'Options'],
      dateShiftPerRound: 14,
    }),
  '6': () =>
    buildExpandedSet(baseTrades(), {
      rounds: 2, qtyMultiplier: 1.6, brokerageMultiplier: 1.2,
      movePattern: [0.015, -0.01, 0.0125, 0.009, -0.0075],
      directionPattern: ['Sell', 'Buy', 'Sell', 'Buy'],
      typePattern: ['Scalping', 'Intraday', 'Swing Trading'],
      strategyPattern: ['Iron Condor', 'Breakout', 'M Pattern', 'Head & shoulder'],
      marketPattern: ['Futures', 'Options', 'Futures', 'Options', 'Equity'],
      dateShiftPerRound: 10,
    }),
  '7': () =>
    buildExpandedSet(baseTrades(), {
      rounds: 3, qtyMultiplier: 1.05, brokerageMultiplier: 1,
      movePattern: [0.01, -0.012, 0.014, -0.009, 0.007, 0.011],
      directionPattern: ['Buy', 'Sell', 'Buy', 'Sell'],
      typePattern: ['Intraday', 'Scalping', 'Swing Trading', 'Positional Trading'],
      strategyPattern: ['Breakout', 'Double Bottom', 'Hammer Candle', 'W Pattern'],
      marketPattern: ['Equity', 'Futures', 'Options', 'Commodities', 'Crypto_Currency', 'Forex'],
      dateShiftPerRound: 18,
    }),
};

export const JOURNAL_SAMPLE_OPTIONS = [
  { id: '1', name: 'Beginner Balanced', description: 'Clean multi-market history with steady, mixed results.' },
  { id: '2', name: 'Intermediate Conservative', description: 'Lower-risk swing and positional trades with smaller sizing.' },
  { id: '3', name: 'Intermediate Scalper', description: 'High-frequency futures and options scalps, long and short.' },
  { id: '4', name: 'Advanced Momentum', description: 'Larger momentum book across five markets.' },
  { id: '5', name: 'Advanced Defensive Swing', description: 'Defensive swing trading with tight moves.' },
  { id: '6', name: 'Expert Derivatives', description: 'Aggressive futures and options, both directions.' },
  { id: '7', name: 'Stress Test Regime Mix', description: 'Three regimes of mixed wins and drawdowns across six markets.' },
];

function toTrade(raw: RawTrade, index: number, createdAt: string): Trade {
  return {
    id: `sample-trade-${index + 1}`,
    user_id: SAMPLE_USER_ID,
    date: raw.date,
    exit_date: raw.date,
    entry_time: raw.entryTime ?? null,
    exit_time: raw.exitTime ?? null,
    time_zone: 'Asia/Kolkata',
    type: raw.type,
    market: raw.market,
    asset: raw.asset,
    currency: 'INR',
    quantity: raw.quantity,
    entry_price: raw.entryPrice,
    target_price: raw.targetPrice ?? null,
    stop_loss: raw.stopLoss ?? null,
    exit_price: raw.exitPrice,
    brokerage: raw.brokerage ?? 0,
    pnl: parseFloat(pnlOf(raw).toFixed(2)),
    strategy: raw.strategy,
    margin: raw.margin ?? null,
    buy_sell: raw.buySell === 'Sell' ? 'sell' : 'buy',
    contract: contractLabel(raw.date),
    strike_price: raw.strikePrice ?? null,
    option_type: raw.optionType === 'Put' ? 'put' : raw.optionType === 'Call' ? 'call' : null,
    notes: raw.notes ?? null,
    tags: raw.tags ?? [],
    emotion: raw.emotion ?? 'neutral',
    underlying_price: null,
    implied_volatility: raw.impliedVolatility ?? null,
    days_to_expiry: raw.daysToExpiry ?? null,
    greeks: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

/** Build a full sample dataset (trades + a couple of goals + the strategies
 *  those trades use). */
export function buildJournalSample(datasetId: string): JournalSampleData {
  const createdAt = new Date().toISOString();
  const generate = GENERATORS[datasetId] ?? GENERATORS['1'];
  const trades = generate()
    .map((raw, i) => toTrade(raw, i, createdAt))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.entry_time ?? '').localeCompare(a.entry_time ?? ''));
  const goal = (title: string, metric: string, timeframe: string, target_value: number): Goal => ({
    id: sampleId('goal'), user_id: SAMPLE_USER_ID, title, metric, timeframe, target_value, created_at: createdAt, updated_at: createdAt,
  });
  return {
    trades,
    goals: [
      goal('Make ₹25,000 this month', 'total_pnl', 'this_month', 25000),
      goal('Keep win rate above 60%', 'win_rate', 'all_time', 60),
      goal('Log 20 trades this month', 'trade_count', 'this_month', 20),
    ],
    strategies: Array.from(new Set(trades.map((t) => t.strategy).filter((s): s is string => !!s))).map((name) => ({
      id: sampleId('strategy'), user_id: SAMPLE_USER_ID, name, created_at: createdAt,
    })),
  };
}

/** Trade count and net P&L for the dataset chooser. */
export function previewJournalSample(datasetId: string) {
  const trades = (GENERATORS[datasetId] ?? GENERATORS['1'])();
  const pnls = trades.map(pnlOf);
  return {
    count: trades.length,
    winRate: trades.length ? (pnls.filter((p) => p > 0).length / trades.length) * 100 : 0,
    pnl: pnls.reduce((sum, p) => sum + p, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// In-memory implementations of ./api.ts's modules, used while sample mode
// is on. Same method names and return shapes as the real ones.
// ─────────────────────────────────────────────────────────────────────────
const tradeRows = sampleCrud(journalSampleMode, (d) => d.trades, 'trade');
const goalRows = sampleCrud(journalSampleMode, (d) => d.goals, 'goal');

const withPnl = <T extends Partial<Trade>>(input: T): T => {
  const qty = input.quantity ?? 0;
  const entry = input.entry_price ?? 0;
  const exit = input.exit_price;
  if (exit == null || input.pnl != null) return input;
  const move = input.buy_sell === 'sell' ? entry - exit : exit - entry;
  return { ...input, pnl: parseFloat((move * qty - (input.brokerage ?? 0)).toFixed(2)) };
};

export const sampleTrades = {
  createTrade: async (data: Partial<Trade>) => tradeRows.create(withPnl(data)),
  getTrades: async (params?: { limit?: number; offset?: number }) => {
    const all = await tradeRows.list();
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;
    return { data: all.slice(offset, offset + limit), pagination: { total: all.length, limit, offset } };
  },
  getTrade: tradeRows.get,
  updateTrade: async (id: string, data: Partial<Trade>) => tradeRows.update(id, withPnl(data)),
  deleteTrade: tradeRows.remove,
  clearTrades: async () => {
    const deleted = journalSampleMode.data().trades.length;
    journalSampleMode.update((d) => {
      d.trades = [];
    });
    return { success: true, deleted };
  },
};

export const sampleGoals = {
  createGoal: goalRows.create,
  getGoals: goalRows.list,
  getGoal: goalRows.get,
  updateGoal: goalRows.update,
  deleteGoal: goalRows.remove,
};

export const sampleStrategies = {
  getStrategies: async () => journalSampleMode.data().strategies.map((s) => ({ ...s })),
  createStrategy: async (name: string) => {
    const existing = journalSampleMode.data().strategies.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (existing) return { ...existing };
    const row: Strategy = { id: sampleId('strategy'), user_id: SAMPLE_USER_ID, name, created_at: new Date().toISOString() };
    journalSampleMode.update((d) => {
      d.strategies.push(row);
    });
    return { ...row };
  },
  deleteStrategy: async (id: string) => {
    journalSampleMode.update((d) => {
      d.strategies = d.strategies.filter((s) => s.id !== id);
    });
    return { success: true, message: 'Deleted (sample data — not saved)' };
  },
};
