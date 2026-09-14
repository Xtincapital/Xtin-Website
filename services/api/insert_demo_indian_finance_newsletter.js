import supabase from './supabase/index.mjs';

const demoNewsletter = {
  title: "Indian Finance Newsletter - January 4, 2026",
  heading_1: "Stock Market Updates",
  heading_1_subheading_1: "Sensex and Nifty Performance",
  heading_1_subheading_1_content: "The Sensex closed at 72,500, up 1.2% from the previous day, driven by strong IT and banking stocks. Nifty 50 ended at 22,100, showing resilience amid global market volatility.",
  heading_1_subheading_2: "Key Sector Movements",
  heading_1_subheading_2_content: "IT sector led gains with Infosys and TCS up 2.5% each. Banking stocks remained stable despite rate concerns, while energy stocks faced pressure due to crude oil fluctuations.",
  heading_1_subheading_3: "Market Outlook",
  heading_1_subheading_3_content: "Analysts predict continued upward momentum in Q1 2026, with focus on earnings season. Foreign institutional investors have shown renewed interest in Indian equities.",
  heading_1_subheading_4: "Trading Volumes",
  heading_1_subheading_4_content: "Daily trading volumes hit record highs at ₹8.5 lakh crores, indicating strong market participation. Retail investors continue to drive momentum in mid-cap stocks.",
  heading_1_subheading_5: "Currency Impact",
  heading_1_subheading_5_content: "Rupee strengthened against dollar, closing at 82.30, providing additional support to export-oriented companies and boosting investor sentiment.",
  heading_2: "Banking and Monetary Policy",
  heading_2_subheading_1: "RBI Policy Meeting",
  heading_2_subheading_1_content: "Reserve Bank of India maintained status quo on key rates, keeping repo rate at 6.5%. The decision was widely expected by market participants.",
  heading_2_subheading_2: "Banking Sector Health",
  heading_2_subheading_2_content: "Major banks reported healthy balance sheets with NPAs declining to 2.1%. Digital banking adoption continues to accelerate across public and private sector banks.",
  heading_2_subheading_3: "Credit Growth Trends",
  heading_2_subheading_3_content: "Overall credit growth stands at 15.2%, with MSME sector showing robust expansion. Personal loan disbursements have slowed due to higher interest rates.",
  heading_2_subheading_4: "Digital Payment Surge",
  heading_2_subheading_4_content: "UPI transactions crossed 15 billion in December 2025, representing 8x growth year-over-year. Fintech companies are expanding rural penetration rapidly.",
  heading_2_subheading_5: "Regulatory Developments",
  heading_2_subheading_5_content: "New guidelines for NBFCs expected in Q1 2026, focusing on risk management and capital adequacy. Cybersecurity measures being strengthened across the sector.",
  heading_3: "Corporate and Business News",
  heading_3_subheading_1: "Major Mergers and Acquisitions",
  heading_3_subheading_1_content: "Reliance Industries announced $25 billion investment in renewable energy sector. Tata Group completed acquisition of European tech firm for €2.1 billion.",
  heading_3_subheading_2: "Earnings Season Highlights",
  heading_3_subheading_2_content: "ITC reported 12% YoY profit growth, beating estimates. Hindustan Unilever maintained strong performance despite inflationary pressures.",
  heading_3_subheading_3: "Start-up Funding",
  heading_3_subheading_3_content: "Indian start-ups raised $8.2 billion in 2025, with fintech and healthtech leading. Government initiatives supporting innovation ecosystem growth.",
  heading_3_subheading_4: "Export Performance",
  heading_3_subheading_4_content: "Exports grew 18% in December, driven by IT services and pharmaceuticals. Trade deficit narrowed to $12 billion, better than expected.",
  heading_3_subheading_5: "Sustainability Initiatives",
  heading_3_subheading_5_content: "Over 200 companies committed to net-zero targets by 2050. Green finance market expected to reach $1 trillion by 2030.",
  heading_4: "Economic Indicators",
  heading_4_subheading_1: "GDP Growth Forecast",
  heading_4_subheading_1_content: "RBI revised GDP growth estimate to 7.2% for FY26, citing strong consumption and investment recovery. Services sector leading the growth momentum.",
  heading_4_subheading_2: "Inflation Trends",
  heading_4_subheading_2_content: "CPI inflation moderated to 4.8% in December, within RBI's comfort zone. Core inflation remains elevated at 5.2% due to supply-side constraints.",
  heading_4_subheading_3: "Employment Data",
  heading_4_subheading_3_content: "Formal sector employment grew 8% YoY, with IT and manufacturing sectors leading. Unemployment rate declined to 6.2% in urban areas.",
  heading_4_subheading_4: "Foreign Investment",
  heading_4_subheading_4_content: "FDI inflows reached $45 billion in 2025, highest in five years. Singapore and Mauritius remain top investment sources.",
  heading_4_subheading_5: "Fiscal Position",
  heading_4_subheading_5_content: "Government achieved fiscal deficit target of 5.1% for FY25. Tax collections exceeded budgeted amounts by 8%.",
  heading_5: "Regulatory and Policy Updates",
  heading_5_subheading_1: "SEBI Reforms",
  heading_5_subheading_1_content: "New regulations for algorithmic trading implemented, enhancing market transparency. Retail investor protection measures strengthened.",
  heading_5_subheading_2: "Crypto Regulation",
  heading_5_subheading_2_content: "Government preparing comprehensive crypto framework. Central bank digital currency pilot expected in Q2 2026.",
  heading_5_subheading_3: "Tax Policy Changes",
  heading_5_subheading_3_content: "Long-term capital gains tax exemption extended for infrastructure bonds. Angel tax provisions simplified for start-ups.",
  heading_5_subheading_4: "Environmental Policies",
  heading_5_subheading_4_content: "Carbon credit trading platform launched. Stringent emission norms for industries implemented across major states.",
  heading_5_subheading_5: "Labor Reforms",
  heading_5_subheading_5_content: "New labor codes implementation accelerated. Social security coverage expanded to 45 crore workers."
};

async function insertDemoNewsletter() {
  try {
    const { data, error } = await supabase
      .from('indian_finance_newsletter')
      .insert([demoNewsletter])
      .select();

    if (error) {
      console.error('Error inserting demo newsletter:', error);
    } else {
      console.log('Demo newsletter inserted successfully:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

insertDemoNewsletter();