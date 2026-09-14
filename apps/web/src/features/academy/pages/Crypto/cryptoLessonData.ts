export const cryptoLessons = [
  {
    num: 1,
    title: "What Crypto Really Is",
    subtitle: "Digital ownership and peer-to-peer value",
    duration: "12 min",
    objectives: [
      "Understand crypto as digital ownership, not just price movement",
      "Know why Bitcoin was created after the 2008 financial crisis",
      "Separate the technology, the asset, and the speculation"
    ],
    sections: [
      {
        heading: "The Basic Idea",
        body: [
          "Crypto assets are digital assets recorded on shared computer networks. Instead of one company maintaining the master database, many independent participants maintain and verify the ledger.",
          "The original promise was simple but radical: allow people to transfer value online without depending completely on a bank, payment company, or central database."
        ],
        bullets: [
          "Crypto is digital and network-based.",
          "Ownership is represented by entries on a blockchain ledger.",
          "Transfers are verified by network rules instead of manual bank approval.",
          "Prices can be highly speculative even when the technology is real."
        ],
        callout: {
          type: "principle",
          title: "Three Separate Questions",
          text: "What does the technology do? What does the token represent? Is the current price reasonable? Do not mix these into one emotional answer."
        }
      },
      {
        heading: "Why Crypto Became Popular",
        body: [
          "People were attracted to crypto for different reasons: distrust of traditional finance, desire for censorship-resistant payments, hope for open financial infrastructure, and in many cases, the chance of quick profits.",
          "Those motives are not equal. A project can have interesting technology and still be a terrible investment at the wrong price."
        ]
      }
    ],
    quiz: {
      question: "What is the healthiest way to think about crypto first?",
      options: ["As a guaranteed profit machine", "As digital networks and assets with major risks", "As a replacement for all money today"],
      correct: 1,
      explanation: "Crypto should first be understood as a technology and risk category, not as a guaranteed return product."
    },
    takeaway: "Crypto is a technology, an asset class, and a speculation zone. Treat those as separate layers."
  },
  {
    num: 2,
    title: "Blockchain Fundamentals",
    subtitle: "Blocks, hashes, ledgers, immutability",
    duration: "13 min",
    objectives: [
      "Understand what a blockchain stores",
      "Know how blocks and hashes connect",
      "Understand why old records are hard to change"
    ],
    sections: [
      {
        heading: "What a Blockchain Records",
        body: [
          "A blockchain is a ledger: a record of transactions or state changes. The ledger is grouped into blocks, and each block points back to the previous block.",
          "Because each block includes a cryptographic fingerprint of prior data, changing old data would break the chain unless the attacker also rewrites later blocks and convinces the network."
        ],
        bullets: [
          "Blocks contain transaction data.",
          "Hashes act like digital fingerprints.",
          "Nodes store and verify copies of the ledger.",
          "Consensus rules decide which chain is valid."
        ]
      },
      {
        heading: "Immutability Is Practical, Not Magical",
        body: [
          "People often say blockchain records are immutable. In practice, this means they are extremely difficult to change when the network is large, decentralized, and economically secure.",
          "Small or poorly secured chains can still be attacked. Immutability depends on network security, incentives, and decentralization."
        ],
        callout: {
          type: "warning",
          title: "Important Nuance",
          text: "A project saying 'blockchain' does not automatically make it secure. The size, design, and incentives of the network matter."
        }
      }
    ],
    quiz: {
      question: "What is a hash in blockchain context?",
      options: ["A digital fingerprint of data", "A guaranteed return", "A government license"],
      correct: 0,
      explanation: "A hash is a cryptographic fingerprint that changes if the underlying data changes."
    },
    takeaway: "A blockchain is a ledger secured by cryptography, network verification, and economic incentives."
  },
  {
    num: 3,
    title: "Bitcoin Deep Dive",
    subtitle: "Supply cap, mining, halving, proof of work",
    duration: "14 min",
    objectives: [
      "Understand Bitcoin's core design",
      "Know mining and proof of work at a practical level",
      "Understand the store-of-value narrative and its limits"
    ],
    sections: [
      {
        heading: "Bitcoin's Design",
        body: [
          "Bitcoin was designed as a peer-to-peer electronic cash system with a predictable issuance schedule and a maximum supply of 21 million coins.",
          "No central bank changes Bitcoin's supply schedule. The rules are enforced by software, nodes, miners, and the social agreement of participants running the network."
        ],
        bullets: [
          "Maximum supply: 21 million BTC.",
          "New BTC enters through mining rewards.",
          "Halving reduces block rewards roughly every four years.",
          "Proof of work secures the network through energy and computation."
        ]
      },
      {
        heading: "Strengths and Limitations",
        body: [
          "Supporters view Bitcoin as scarce digital money or digital gold. Critics point to volatility, energy use, limited transaction throughput, regulatory risk, and uncertain long-term adoption.",
          "Both sides can contain truth. Scarcity alone does not guarantee price appreciation; demand and trust still matter."
        ],
        callout: {
          type: "principle",
          title: "Balanced View",
          text: "Bitcoin is the oldest and most battle-tested crypto network, but it is still volatile and should not be treated as risk-free."
        }
      }
    ],
    quiz: {
      question: "What is Bitcoin's maximum supply?",
      options: ["21 million", "1 billion", "Unlimited"],
      correct: 0,
      explanation: "Bitcoin's protocol sets a maximum supply of 21 million BTC."
    },
    takeaway: "Bitcoin is built around scarcity and decentralization, but its price remains highly volatile."
  },
  {
    num: 4,
    title: "Ethereum Deep Dive",
    subtitle: "Smart contracts, gas fees, dApps",
    duration: "14 min",
    objectives: [
      "Understand Ethereum as programmable infrastructure",
      "Know what smart contracts and gas fees are",
      "Understand Ethereum's opportunities and risks"
    ],
    sections: [
      {
        heading: "Ethereum as a World Computer",
        body: [
          "Ethereum expanded the crypto idea from digital money to programmable agreements. Developers can deploy smart contracts: code that runs on the blockchain when conditions are met.",
          "These smart contracts power decentralized applications, tokens, NFTs, lending markets, exchanges, and many experimental financial systems."
        ],
        bullets: [
          "ETH is the native asset used to pay gas fees.",
          "Smart contracts are blockchain-based code.",
          "dApps are applications built using smart contracts.",
          "Ethereum now uses proof of stake for consensus."
        ]
      },
      {
        heading: "Gas and Smart Contract Risk",
        body: [
          "Gas is the fee paid to execute transactions or contract interactions. When demand is high, gas fees can rise sharply.",
          "Smart contracts can also contain bugs. Once deployed, flawed code can lead to loss of funds, hacks, or unexpected behavior."
        ],
        callout: {
          type: "warning",
          title: "Code Is Not Automatically Safe",
          text: "A smart contract can be transparent and still be dangerous if the code has bugs or malicious design."
        }
      }
    ],
    quiz: {
      question: "What are gas fees used for on Ethereum?",
      options: ["Paying for computation and transactions", "Buying petrol", "Avoiding all risk"],
      correct: 0,
      explanation: "Gas fees compensate validators and price the computation needed to execute transactions."
    },
    takeaway: "Ethereum is programmable crypto infrastructure, but smart contract and fee risks are real."
  },
  {
    num: 5,
    title: "Consensus Mechanisms",
    subtitle: "Proof of work, proof of stake, validators",
    duration: "12 min",
    objectives: [
      "Understand why consensus is needed",
      "Compare proof of work and proof of stake",
      "Know security tradeoffs"
    ],
    sections: [
      {
        heading: "Why Consensus Exists",
        body: [
          "A decentralized network needs a way to agree on the valid ledger without one central authority. Consensus mechanisms are the rules and incentives that help the network agree.",
          "The goal is to make cheating expensive and honest participation rewarding."
        ],
        bullets: [
          "Proof of work uses computation and energy.",
          "Proof of stake uses staked capital and validator penalties.",
          "Both designs try to secure the ledger.",
          "Both have tradeoffs around decentralization, cost, and attack resistance."
        ]
      },
      {
        heading: "Security Tradeoffs",
        body: [
          "Proof of work is battle-tested but energy intensive. Proof of stake can be more energy efficient but depends heavily on validator design, staking concentration, and slashing rules.",
          "There is no perfect mechanism. Security depends on implementation, decentralization, incentives, and network maturity."
        ],
        callout: {
          type: "principle",
          title: "Ask Better Questions",
          text: "Who validates blocks? What does it cost to attack the network? What happens if validators behave badly?"
        }
      }
    ],
    quiz: {
      question: "What does consensus help a blockchain network do?",
      options: ["Agree on the valid ledger", "Guarantee profits", "Remove volatility"],
      correct: 0,
      explanation: "Consensus mechanisms help decentralized participants agree on the current valid state."
    },
    takeaway: "Consensus is the trust engine of a blockchain. Different engines have different tradeoffs."
  },
  {
    num: 6,
    title: "Wallets, Keys and Seed Phrases",
    subtitle: "Custody, private keys, hot and cold wallets",
    duration: "15 min",
    objectives: [
      "Understand custodial and non-custodial wallets",
      "Know why seed phrases are critical",
      "Learn basic wallet safety"
    ],
    sections: [
      {
        heading: "Wallets Do Not Store Coins",
        body: [
          "A crypto wallet stores keys, not coins. The assets live as records on the blockchain. Your private key proves that you can authorize movement of those assets.",
          "If someone gets your private key or seed phrase, they can usually move your assets. Transactions are often irreversible."
        ],
        bullets: [
          "Public address: where others can send assets.",
          "Private key: authorizes spending.",
          "Seed phrase: backup that can recreate wallet keys.",
          "Hardware wallet: keeps keys offline."
        ],
        callout: {
          type: "warning",
          title: "Seed Phrase Rule",
          text: "Never type your seed phrase into random websites, forms, support chats, or screenshots. Anyone asking for it is almost certainly trying to steal from you."
        }
      },
      {
        heading: "Custodial vs Non-Custodial",
        body: [
          "A custodial wallet means an exchange or platform controls the keys for you. It can be easier, but you carry exchange failure and withdrawal risk.",
          "A non-custodial wallet gives you control, but also full responsibility. If you lose the seed phrase, there may be no recovery desk."
        ]
      }
    ],
    quiz: {
      question: "What happens if someone gets your seed phrase?",
      options: ["They may control your wallet", "They only see your profile photo", "Nothing at all"],
      correct: 0,
      explanation: "The seed phrase can recreate wallet keys, so it must be kept private and secure."
    },
    takeaway: "In crypto, control and responsibility come together. Key safety is not optional."
  },
  {
    num: 7,
    title: "Crypto Exchanges",
    subtitle: "Order books, deposits, withdrawals, exchange risk",
    duration: "12 min",
    objectives: [
      "Understand centralized exchanges",
      "Know exchange custody risk",
      "Learn safer exchange habits"
    ],
    sections: [
      {
        heading: "What Exchanges Do",
        body: [
          "A centralized exchange lets users buy, sell, deposit, and withdraw crypto. It may maintain order books, provide custody, and connect fiat payment rails.",
          "The convenience comes with risk: if the exchange fails, freezes withdrawals, is hacked, or faces regulatory issues, users may be affected."
        ],
        bullets: [
          "Use strong passwords and two-factor authentication.",
          "Avoid keeping large long-term holdings on exchanges.",
          "Understand deposit and withdrawal networks.",
          "Check fees, spreads, liquidity, and regulatory status."
        ],
        callout: {
          type: "warning",
          title: "Exchange Balance Is Not the Same as Self-Custody",
          text: "If assets are on an exchange, you depend on that exchange's solvency, security, and withdrawal policies."
        }
      }
    ],
    quiz: {
      question: "What is one key risk of keeping crypto on an exchange?",
      options: ["Exchange failure or withdrawal freeze", "Guaranteed returns", "No price movement"],
      correct: 0,
      explanation: "Centralized exchanges introduce counterparty and custody risk."
    },
    takeaway: "Exchanges are useful gateways, but they are not risk-free vaults."
  },
  {
    num: 8,
    title: "Stablecoins",
    subtitle: "Fiat-backed, crypto-backed, algorithmic",
    duration: "12 min",
    objectives: [
      "Understand what stablecoins attempt to do",
      "Know different collateral models",
      "Understand depeg risk"
    ],
    sections: [
      {
        heading: "What Stablecoins Are",
        body: [
          "Stablecoins are tokens designed to track another asset, commonly the US dollar. They are used for trading, payments, DeFi, and moving value between crypto markets.",
          "Stable does not mean risk-free. The peg can break if reserves, liquidity, market confidence, or design fail."
        ],
        bullets: [
          "Fiat-backed stablecoins claim cash or treasury reserves.",
          "Crypto-backed stablecoins use on-chain collateral.",
          "Algorithmic stablecoins rely on mechanisms and incentives.",
          "Depeg means the stablecoin trades away from its target value."
        ],
        callout: {
          type: "warning",
          title: "Stable Is a Design Goal",
          text: "Always ask what backs the stablecoin, who controls reserves, whether audits exist, and how redemptions work."
        }
      }
    ],
    quiz: {
      question: "What is depeg risk?",
      options: ["A stablecoin losing its target price", "A wallet color change", "A miner reward"],
      correct: 0,
      explanation: "A depeg happens when a stablecoin trades meaningfully away from the price it tries to track."
    },
    takeaway: "Stablecoins can be useful, but the backing and redemption design matter deeply."
  },
  {
    num: 9,
    title: "Tokens, Memecoins and Tokenomics",
    subtitle: "Supply, unlocks, FDV, red flags",
    duration: "14 min",
    objectives: [
      "Understand token types",
      "Read basic tokenomics",
      "Identify memecoin and unlock risks"
    ],
    sections: [
      {
        heading: "Token Types",
        body: [
          "A token can represent many things: utility in an app, voting power, a claim on protocol incentives, a meme, or sometimes very little at all.",
          "Do not assume every token captures value from the project. A project can be useful while its token economics are weak."
        ],
        bullets: [
          "Circulating supply: tokens currently tradable.",
          "Total supply: total created or expected.",
          "FDV: fully diluted valuation.",
          "Unlocks: scheduled release of locked tokens.",
          "Vesting: gradual release to insiders or investors."
        ]
      },
      {
        heading: "Memecoin Reality",
        body: [
          "Memecoins are often driven by community, attention, and speculation rather than cash flow or utility. They can rise quickly and fall violently.",
          "If the only thesis is 'someone else will buy higher,' the risk is extreme."
        ],
        callout: {
          type: "warning",
          title: "Supply Trap",
          text: "Low price per coin does not mean cheap. Market cap, FDV, liquidity, and unlocks matter more than the number of zeros in the price."
        }
      }
    ],
    quiz: {
      question: "What does FDV mean?",
      options: ["Fully diluted valuation", "Fixed daily value", "Free digital voucher"],
      correct: 0,
      explanation: "FDV estimates valuation if all tokens are counted, including locked or future supply."
    },
    takeaway: "Tokenomics can make or break a crypto investment case. Read supply and incentives before price."
  },
  {
    num: 10,
    title: "DeFi Basics",
    subtitle: "AMMs, lending, liquidity pools, yield",
    duration: "15 min",
    objectives: [
      "Understand decentralized finance basics",
      "Know liquidity pools and AMMs",
      "Understand smart contract and yield risk"
    ],
    sections: [
      {
        heading: "What DeFi Tries to Do",
        body: [
          "Decentralized finance uses smart contracts to provide financial services such as trading, lending, borrowing, and yield strategies without traditional intermediaries.",
          "The promise is open access and automation. The risk is that code, incentives, and liquidity can fail."
        ],
        bullets: [
          "AMM: automated market maker.",
          "Liquidity pool: assets supplied by users for trading.",
          "Yield farming: moving assets to earn incentives.",
          "Collateralized borrowing: borrowing against deposited assets.",
          "Liquidation: forced sale when collateral value falls."
        ]
      },
      {
        heading: "Yield Is Not Free Money",
        body: [
          "High yields can come from trading fees, token emissions, leverage, risk transfer, or unsustainable incentives. You must understand the source of yield.",
          "Smart contract hacks, oracle failures, impermanent loss, and liquidity crashes are real risks."
        ],
        callout: {
          type: "warning",
          title: "Ask Where Yield Comes From",
          text: "If you cannot explain the yield source, assume you are the yield source."
        }
      }
    ],
    quiz: {
      question: "What is a liquidity pool?",
      options: ["Assets supplied for decentralized trading", "A bank branch", "A guaranteed income plan"],
      correct: 0,
      explanation: "Liquidity pools hold assets that traders can swap against in DeFi protocols."
    },
    takeaway: "DeFi can be powerful, but high yields often hide high complexity and high risk."
  },
  {
    num: 11,
    title: "NFTs and Digital Ownership",
    subtitle: "Metadata, royalties, collectibles, gaming",
    duration: "11 min",
    objectives: [
      "Understand what NFTs represent",
      "Know metadata and ownership limitations",
      "Understand NFT risks"
    ],
    sections: [
      {
        heading: "What an NFT Is",
        body: [
          "An NFT is a unique token on a blockchain. It can point to art, game items, membership rights, tickets, domain names, or other digital records.",
          "Owning an NFT does not automatically mean you own copyright, commercial rights, or the underlying file. The terms matter."
        ],
        bullets: [
          "Token ID proves ownership of a token.",
          "Metadata describes the asset.",
          "Files may be stored on-chain, IPFS, or centralized servers.",
          "Marketplace liquidity can vanish quickly."
        ],
        callout: {
          type: "warning",
          title: "Ownership Nuance",
          text: "Buying an NFT usually buys the token, not automatically all intellectual property rights."
        }
      }
    ],
    quiz: {
      question: "Does buying an NFT always give copyright ownership?",
      options: ["No, terms decide rights", "Yes, always", "Only if gas is high"],
      correct: 0,
      explanation: "NFT ownership and copyright ownership are different unless terms explicitly grant rights."
    },
    takeaway: "NFTs are digital ownership primitives, but rights, storage, and liquidity need careful reading."
  },
  {
    num: 12,
    title: "Crypto Risks and Scams",
    subtitle: "Rug pulls, phishing, leverage, fake airdrops",
    duration: "16 min",
    objectives: [
      "Identify common crypto scams",
      "Understand volatility and leverage risk",
      "Build a defensive mindset"
    ],
    sections: [
      {
        heading: "Common Scam Patterns",
        body: [
          "Crypto scams often use urgency, social proof, fake authority, and technical confusion. Scammers know that irreversible transactions create a perfect environment for theft.",
          "The most dangerous messages are the ones that make you act fast before thinking."
        ],
        bullets: [
          "Fake support asking for seed phrase.",
          "Rug pulls where insiders drain liquidity.",
          "Pump-and-dump groups.",
          "Fake airdrop links.",
          "Romance or influencer scams.",
          "Leverage platforms promising easy income."
        ],
        callout: {
          type: "warning",
          title: "Golden Rule",
          text: "No legitimate support team needs your seed phrase. No guaranteed high return is safe just because it uses crypto words."
        }
      },
      {
        heading: "Volatility and Leverage",
        body: [
          "Crypto can move violently in both directions. Leverage can liquidate positions even when your long-term view eventually proves right.",
          "Most beginners should avoid leverage entirely. Surviving matters more than looking smart."
        ]
      }
    ],
    quiz: {
      question: "What should you do if support asks for your seed phrase?",
      options: ["Stop immediately; it is likely a scam", "Send it quickly", "Post it publicly"],
      correct: 0,
      explanation: "A seed phrase gives control of the wallet and should never be shared."
    },
    takeaway: "Crypto safety begins with skepticism, slow decisions, and refusing urgency."
  },
  {
    num: 13,
    title: "Crypto Tax and Regulation in India",
    subtitle: "VDA tax, TDS, records, uncertainty",
    duration: "13 min",
    objectives: [
      "Understand India-specific crypto tax awareness",
      "Know why records matter",
      "Recognize regulatory uncertainty"
    ],
    sections: [
      {
        heading: "India Tax Awareness",
        body: [
          "In India, crypto assets are generally discussed under Virtual Digital Assets. Tax treatment has included high tax rates on gains and TDS requirements on certain transactions.",
          "Rules can change, and individual circumstances differ, so use professional tax advice for actual filing decisions."
        ],
        bullets: [
          "Maintain transaction history.",
          "Track buy price, sell price, fees, and dates.",
          "Track transfers between wallets and exchanges.",
          "Do not assume losses can always offset gains.",
          "Keep exchange statements and wallet records."
        ],
        callout: {
          type: "warning",
          title: "Compliance Mindset",
          text: "Crypto being digital does not mean it is invisible. Poor records can create tax stress later."
        }
      },
      {
        heading: "Regulatory Uncertainty",
        body: [
          "Crypto regulation is still evolving across countries. Exchange access, banking support, taxation, reporting, and product legality can change.",
          "Regulatory uncertainty is part of the risk profile and should affect position sizing."
        ]
      }
    ],
    quiz: {
      question: "Why keep detailed crypto records?",
      options: ["For tax reporting and clarity", "To increase volatility", "To avoid all regulation"],
      correct: 0,
      explanation: "Records help track gains, losses, fees, dates, transfers, and reporting obligations."
    },
    takeaway: "In India, crypto requires tax awareness, records, and respect for changing regulation."
  },
  {
    num: 14,
    title: "How to Evaluate a Crypto Project",
    subtitle: "Whitepaper, tokenomics, team, liquidity, audits",
    duration: "15 min",
    objectives: [
      "Use a project evaluation framework",
      "Check tokenomics and liquidity",
      "Identify red flags"
    ],
    sections: [
      {
        heading: "Evaluation Framework",
        body: [
          "A serious crypto evaluation starts with purpose: what problem does this project solve, and why does it need a token?",
          "Then examine the team, code, audits, users, revenue, liquidity, token supply, unlocks, governance, and risks."
        ],
        bullets: [
          "Problem and use case",
          "Token necessity",
          "Team and history",
          "Code activity and audits",
          "Token supply, unlocks, and FDV",
          "Liquidity and exchange depth",
          "Community quality, not just size",
          "Regulatory and security risks"
        ]
      },
      {
        heading: "Red Flags",
        body: [
          "Red flags include anonymous teams with no track record, guaranteed returns, vague whitepapers, locked withdrawals, aggressive referral schemes, and supply controlled by a few wallets.",
          "Hype can hide weak fundamentals for a while, but liquidity eventually tests every story."
        ],
        callout: {
          type: "warning",
          title: "Token Question",
          text: "If the project works without the token, ask why the token should have long-term value."
        }
      }
    ],
    quiz: {
      question: "What is a key question when evaluating a token?",
      options: ["Why does this project need a token?", "Is the logo shiny?", "Can it only go up?"],
      correct: 0,
      explanation: "Token necessity is central. A useful product does not automatically make a token valuable."
    },
    takeaway: "Evaluate crypto projects like a skeptic: use case, tokenomics, liquidity, security, and incentives."
  },
  {
    num: 15,
    title: "Crypto Safety Checklist",
    subtitle: "Position sizing, no leverage, wallet hygiene",
    duration: "14 min",
    objectives: [
      "Create a personal crypto safety plan",
      "Know when to avoid crypto",
      "Use responsible position sizing"
    ],
    sections: [
      {
        heading: "Before You Touch Crypto",
        body: [
          "Crypto should come after basics: emergency fund, insurance, high-interest debt control, and core investing plan. If those are missing, crypto can amplify financial stress.",
          "A responsible crypto allocation, if any, should be small enough that a total loss does not damage your life."
        ],
        bullets: [
          "No emergency fund: avoid crypto.",
          "High-interest debt: fix that first.",
          "No health insurance: protect first.",
          "Cannot handle volatility: avoid or keep exposure tiny.",
          "Do not use leverage.",
          "Do not chase tips or influencers."
        ]
      },
      {
        heading: "Operational Checklist",
        body: [
          "Security habits matter as much as market views. Use strong passwords, two-factor authentication, withdrawal whitelists where available, careful wallet backups, and small test transactions.",
          "Document your holdings, wallets, exchanges, and tax records. Make sure trusted family members know how to find records if needed without exposing seed phrases."
        ],
        bullets: [
          "Use unique passwords and 2FA.",
          "Never share seed phrases.",
          "Test small transfers first.",
          "Avoid unknown links and fake airdrops.",
          "Record transactions for taxes.",
          "Cap position size."
        ],
        callout: {
          type: "principle",
          title: "Final Rule",
          text: "If you do not understand it, cannot secure it, or cannot afford to lose it, do not buy it."
        }
      }
    ],
    quiz: {
      question: "What is the safest beginner stance toward leverage in crypto?",
      options: ["Avoid it", "Use maximum leverage", "Borrow to trade"],
      correct: 0,
      explanation: "Leverage can liquidate positions quickly in volatile crypto markets and is unsuitable for most beginners."
    },
    takeaway: "Crypto participation is optional. Safety, sizing, and skepticism come before opportunity."
  }
];
