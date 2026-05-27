import { useState, useEffect, useRef } from "react";

const PASSWORD = "profg2025";
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;
const SHEET_ID = process.env.REACT_APP_SHEET_ID || "18P2XCl0oi2_B-xpb3SgW2qUopbv-Vbzqp4sB9v7Zsn8";
const PGM_CHANNEL_ID = "UCp4CBeq4nzeg9smAvdjPrig";

// ── Seed download data from your spreadsheet ─────────────────────────────────
const SEED_PGM = [
  {date:"07/18/2022",title:"Inflation, Interest Rates, Twitter, and AckSPAC",d7:82714,d30:101021},
  {date:"07/25/2022",title:"U.S. Equity Market, Strong Dollar, and Semiconductors",d7:79473,d30:98083},
  {date:"08/01/2022",title:"Productive Congress, Social Media Earnings, Crypto Floor, and Cloud",d7:90570,d30:109786},
  {date:"08/08/2022",title:"Uber and Airbnb Earnings, Apple’s Debt",d7:88834,d30:106870},
  {date:"08/15/2022",title:"Elon sells Tesla (stock), the Inflation Reduction Act, Coinbase and Stock-based ",d7:89729,d30:106835},
  {date:"08/22/2022",title:"Adam Neumann returns, cotton futures, and tax credits for EVs",d7:86299,d30:104147},
  {date:"08/29/2022",title:"AMC APE, Private equity and Twitter’s whistleblower",d7:80230,d30:97074},
  {date:"09/05/2022",title:"Snap Layoffs, the IPO Drought, and Options Trading",d7:84348,d30:102203},
  {date:"09/12/2022",title:"The Ethereum Merge, Porsche’s IPO, and Dividends",d7:88077,d30:105606},
  {date:"09/19/2022",title:"Peloton’s Management Shake-up, SoftBank’s Vision Funds, and Walmart’s Banking Pl",d7:87744,d30:104505},
  {date:"09/26/2022",title:"The Demise of Chamath’s SPACs, Citrix’s Debt Deal, and Adobe’s Figma Acquisition",d7:86694,d30:104699},
  {date:"10/03/2022",title:"The Merits of ETFs, Boring vs. Sexy Investments, and the UK’s Monetary Crisis",d7:85699,d30:102402},
  {date:"10/10/2022",title:"Twitter’s Path to Super App Status, Liquid Death’s Brand Strategy, and America’s",d7:90995,d30:108197},
  {date:"10/17/2022",title:"Margin Calls, Private Jets, Meta Teams Up With Microsoft, and Unpacking the Fed",d7:92391,d30:110401},
  {date:"10/24/2022",title:"Goldman Sachs Restructures its Businesses + Restaurant NFTs, and Nikola’s Securi",d7:90864,d30:109091},
  {date:"10/31/2022",title:"Adidas’ Crisis Management, Google and Meta Earnings, and Market Moving Fed Speec",d7:98514,d30:116874},
  {date:"11/07/2022",title:"Upheaval at Twitter, Airbnb and Uber Earnings, and the Chinese Markets",d7:100271,d30:118345},
  {date:"11/14/2022",title:"The Failure of FTX, Why HBO Will be Acquired, and the Cannabis Industry",d7:106505,d30:123702},
  {date:"11/21/2022",title:"Target and Walmart Earnings, Hedge Funds and Pinterest, and Estée Lauder Buys To",d7:98972,d30:117489},
  {date:"11/28/2022",title:"Black Friday, Cyber Monday, and Consumer Culture",d7:97189,d30:111531},
  {date:"12/05/2022",title:"Tesla’s Value Destruction, Crowdstrike and Cybersecurity, and Bankruptcies",d7:104556,d30:120979},
  {date:"12/12/2022",title:"Robinhood’s Retirement Accounts and Disney’s Next Move — with Aswath Damodaran",d7:94639,d30:111780},
  {date:"12/19/2022",title:"The Biggest Stories of 2022",d7:92501,d30:117838},
  {date:"01/09/2023",title:"What is a Stock?",d7:95556,d30:113914},
  {date:"01/16/2023",title:"Microsoft and OpenAI, Wash Trading, and European Tech Regulations",d7:105215,d30:122097},
  {date:"01/23/2023",title:"Disney’s Proxy War, Goldman’s Guidance Miss, and the Dating App Market",d7:105317,d30:123096},
  {date:"01/30/2023",title:"Tesla’s Earnings Beat, Chevron’s Share Buybacks, and Elliott’s Salesforce Stake",d7:105807,d30:121807},
  {date:"02/06/2023",title:"Meta’s Year of Efficiency, the Adani Short, OpenAI’s Market Pull, and SoFi’s Win",d7:107930,d30:125400},
  {date:"02/13/2023",title:"The AI Wars, Bed Bath & Beyond’s Share Sale, and Scott’s Options Trade",d7:111756,d30:130058},
  {date:"02/20/2023",title:"Airbnb’s Record Revenue, Buying Football Teams, and Testing Bing’s AI Search",d7:113687,d30:132610},
  {date:"02/27/2023",title:"Home Depot and the Housing Crisis, Stellantis Beats Tesla, and the Lithium Marke",d7:116446,d30:135842},
  {date:"03/06/2023",title:"Virgin Galactic is Going to Zero, Stock as Collateral + Instacart & the IPO Mark",d7:114343,d30:130593},
  {date:"03/13/2023",title:"Scott’s NJOY Stake, the JetBlue/Spirit Merger, and WeightWatchers Buys Ozempic M",d7:117685,d30:134894},
  {date:"03/20/2023",title:"SVB’s Collapse, the U.S. Banking System, Venture Catastrophists, and What’s Next",d7:132420,d30:149730},
  {date:"03/27/2023",title:"Why TikTok Will Be Spun, Credit Suisse, the Big Bitcoin Bet, and Blank Street Co",d7:131217,d30:148031},
  {date:"04/03/2023",title:"First Citizens Acquires SVB, Hindenburg Shorts Block, and Nike vs. Hermès",d7:120308,d30:136716},
  {date:"04/10/2023",title:"Liquidity and Portfolio Management in an Inflationary Decade — With Lyn Alden",d7:123065,d30:141290},
  {date:"04/17/2023",title:"Paying for Crypto’s Sins — with Mike Novogratz",d7:113474,d30:129804},
  {date:"04/24/2023",title:"Apple\'s High Yield Savings Accounts, Shifting to Bonds, and AI vs. IP",d7:126293,d30:143695},
  {date:"05/01/2023",title:"Fox’s Stock After Tucker Carlson, J\&J’s IPO Roadshow, and Google and Meta’s Ear",d7:123934,d30:139921},
  {date:"05/08/2023",title:"The FDIC Limit, the Coinbase Lawsuit, and the Business of Formula 1",d7:118599,d30:134250},
  {date:"05/15/2023",title:"The Writers\' Strike, the Art of the Earnings Call, & Microsoft’s Nuclear Fusion",d7:121720,d30:138225},
  {date:"05/22/2023",title:"Alibaba and Mercado Libre, Share Buybacks vs. Dividends, and National Credit Rat",d7:117982,d30:134498},
  {date:"05/29/2023",title:"(HBO) Max, Chipotle & Cava’s IPO, Private Equity’s Public Sales, and the TikTok ",d7:128746,d30:146120},
  {date:"06/05/2023",title:"NVIDIA’s $1 Trillion Valuation, Pairs Trading, and Understanding Analyst Estimat",d7:123957,d30:140921},
  {date:"06/12/2023",title:"Apple’s Headset Bet, Sequoia’s Big Breakup, and Hypocrisy at the PGA Tour",d7:121987,d30:139293},
  {date:"06/19/2023",title:"The Demise of Bud Light, the Fed Pause, and Andreessen Horowitz’s London Office",d7:126717,d30:143418},
  {date:"06/26/2023",title:"Mutiny in Russia, Adobe’s AI Rally, and the Threat of a UPS Strike",d7:130750,d30:149739},
  {date:"07/10/2023",title:"The Nasdaq’s Rally, Threads vs. Twitter, and Yahoo’s Return to the Public Market",d7:133014,d30:150467},
  {date:"07/17/2023",title:"Inflation’s Descent, Sam Altman’s SPAC, and Private Equity’s Latest Target",d7:129262,d30:147000},
  {date:"07/24/2023",title:"Carvana and Corporate Governance, Hollywood vs. Microsoft, and Oddity’s IPO",d7:127869,d30:145801},
  {date:"07/31/2023",title:"Twitter’s Rebrand to X, Mattel’s IP Playbook, and What’s Next for Snap",d7:130671,d30:149157},
  {date:"08/07/2023",title:"Jerome Powell, Disinflation, and Gauging the Recession Threat — with Catherine R",d7:127511,d30:145644},
  {date:"08/14/2023",title:"NVIDIA’s Valuation and AI’s Negative Sum Game — with Aswath Damodaran",d7:131288,d30:151126},
  {date:"08/21/2023",title:"How Scott Manages His Money",d7:144849,d30:171911},
  {date:"08/28/2023",title:"First Time Founders with Ed Elson — ft. Eli Wachs of Footprint",d7:118507,d30:140090},
  {date:"9/11/2023",title:"Arm’s IPO, Instacart’s Valuation, and Salesforce’s Year of Efficiency",d7:124280,d30:140353},
  {date:"09/18/2023",title:"Google’s Antitrust Trial, Birkenstock’s IPO, and Surge Pricing at the Pub",d7:124096,d30:140074},
  {date:"09/25/2023",title:"The Broken IPO Market, Disney’s Parks Investment, and Buying FTX Bankruptcy Clai",d7:122717,d30:137889},
  {date:"10/02/2023",title:"OpenAI’s $90 Billion Valuation, FTC Takes on Amazon, and The Recession is Coming",d7:135523,d30:165755},
  {date:"10/09/2023",title:"Ozempic’s Market Impacts and Surging Bond Yields — with Downtown Josh Brown",d7:131410,d30:148380},
  {date:"10/16/2023",title:"Exxon Buys Pioneer, Private Credit, and Ireland’s Sovereign Wealth Fund",d7:131443,d30:145361},
  {date:"10/23/2023",title:"Goldman’s Earnings Slump, an ETF for Options Trading, and Fractional Jet Ownersh",d7:133088,d30:147146},
  {date:"10/30/2023",title:"Meta’s Monster Quarter, Buying Elon’s Twitter Debt, and America’s Deficit",d7:137209,d30:148877},
  {date:"11/06/2023",title:"Third Quarter Review — with Aswath Damodaran",d7:143460,d30:156993},
  {date:"11/13/2023",title:"OpenAI’s Dev Day, Disney vs. Warner Bros. Discovery, and Uber’s Branding Turnaro",d7:131325,d30:141378},
  {date:"11/20/2023",title:"ByteDance’s Black Box, Target’s Inventory Turnaround, and the Resale Watch Marke",d7:133091,d30:148919},
  {date:"11/27/2023",title:"Scott\'s Nine Businesses",d7:133824,d30:144594},
  {date:"12/04/2023",title:"Goldman and Apple Part Ways, Shein and Temu, and Charlie Munger’s Legacy",d7:126546,d30:136427},
  {date:"12/11/2023",title:"Bitcoin’s Rally, Elon’s xAI Fundraising, and Alaska Airlines Acquires Hawaiian",d7:124826,d30:134742},
  {date:"12/18/2023",title:"Epic Defeats Google, Ohtani’s Dodgers Contract, and Argentina Devalues the Peso",d7:122161,d30:136766},
  {date:"01/08/2024",title:"Breaking Down 2024 Predictions + Audience Comments and Pushback",d7:125799,d30:137205},
  {date:"1/15/2024",title:"Carta and the Secondary Market, Bitcoin ETFs, and Scott’s 2024 Investment Strate",d7:131819,d30:142597},
  {date:"1/22/2024",title:"The Most Profitable Year in Banking History, Elon’s Tesla Stake, and Firing Peop",d7:130221,d30:140057},
  {date:"1/29/2024",title:"Why Netflix Dominates, China’s Economic Strife, and a Year of Reckoning for Star",d7:138074,d30:147237},
  {date:"02/05/2024",title:"Paramount’s Suitors, Nepo Babies on the LVMH Board, and Elon’s Voided Pay Plan",d7:132854,d30:142150},
  {date:"02/12/2024",title:"Fourth Quarter Review — with Aswath Damodaran",d7:138404,d30:151165},
  {date:"02/19/2024",title:"Arm’s AI Rally, Lyft’s Earnings Mistake, and Airbnb’s Trading Premium",d7:128134,d30:135954},
  {date:"02/26/2024",title:"Nvidia’s Superpower, Reddit’s Democratized IPO, & the Capital One-Discover Deal",d7:136049,d30:143964},
  {date:"03/04/2024",title:"What Killed the Apple Car? Shein Eyes a London IPO, and The Granolas",d7:138282,d30:148025},
  {date:"03/11/2024",title:"Live From SXSW",d7:127363,d30:135590},
  {date:"03/18/2024",title:"Is Boeing a Buy? AI Picks & Shovels (and Scott’s Ketamine Trip)",d7:139382,d30:148979},
  {date:"03/25/2024",title:"Reddit Reignites the IPO Market, Microsoft’s AI All-Stars, and Private Equity Pe",d7:131422,d30:140547},
  {date:"04/01/2024",title:"Trump’s Memestock Goes Public, the Problem with DEI, and Daniel Kahneman’s Legac",d7:131217,d30:139455},
  {date:"04/08/2024",title:"Scott’s Investment Portfolio — a Breakdown",d7:129803,d30:141332},
  {date:"04/15/2024",title:"ByteDance’s Blowout Profit, Kalshi & Events Betting, and Dude Perfect’s Big Deal",d7:120238,d30:127271},
  {date:"04/22/2024",title:"Will Tesla Reward Elon and Move to Texas? + Bank Earnings and Basel Endgame",d7:130608,d30:138598},
  {date:"04/29/2024",title:"Tesla’s Terrible Earnings, the FTC’s Noncompete Ban, and 24/7 Trading at the NYS",d7:132786,d30:140588},
  {date:"05/06/2024",title:"First Quarter Review — with Aswath Damodaran",d7:140994,d30:153208},
  {date:"05/13/2024",title:"Bob Iger’s Bad Day, Trump Media’s Fraudulent Auditor, and Uber’s Venture Investm",d7:136806,d30:145096},
  {date:"05/20/2024",title:"GameStop & Market Manipulation + Is AI Becoming a Bubble, and Is Nvidia Safe?",d7:137387,d30:147843},
  {date:"05/27/2024",title:"Nvidia’s Blowout Earnings & Stock Split + Britain’s Damaged Economy",d7:130166,d30:139359},
  {date:"06/03/2024",title:"OpenAI’s New Content Deals + Latin America’s Most Valuable Financial Institution",d7:125151,d30:132458},
  {date:"06/10/2024",title:"The Texas Stock Exchange + Is Short Selling a Dying Strategy?",d7:126223,d30:135194},
  {date:"06/17/2024",title:"Raspberry Pi’s London IPO & Mistral’s $640M Funding Round",d7:118995,d30:126341},
  {date:"07/01/2024",title:"Rivian and Volkswagen’s New Partnership + Scott’s Tax Strategy",d7:124694,d30:140873},
  {date:"07/15/2024",title:"Nike’s Dramatic Downfall & Britain’s Road to Economic Recovery",d7:132180,d30:141987},
  {date:"7/29/2024",title:"Will Tesla’s Robotaxi Ever Arrive? + Sin Stocks and Zyn Nicotine Pouches",d7:133513,d30:140618},
  {date:"8/5/2024",title:"Is AI CapEx Out of Control? + Bill Ackman’s IPO Failure",d7:124302,d30:131975},
  {date:"8/12/2024",title:"Breaking Down the Google Monopoly Ruling --- ft. Rebecca Allensworth",d7:133572,d30:143516},
  {date:"8/19/2024",title:"How Scott Navigates Money with His Family",d7:127993,d30:142545},
  {date:"8/26/2024",title:"Ask Us Anything — Scott and Ed Answer Your Questions",d7:124745,d30:135871},
  {date:"09/09/2024",title:"Why Are Millionaires Moving Abroad? + The Biggest Deals in Podcasting",d7:118392,d30:124787},
  {date:"09/16/2024",title:"Takeaways from the Second Debate + Does the US Need a Sovereign Wealth Fund?",d7:128612,d30:134407},
  {date:"09/23/2024",title:"Is AI the Hollywood Killer? + Amazon’s New Return to Work Policy",d7:127826,d30:136694},
  {date:"09/30/2024",title:"OpenAI’s Exodus, the Rise of Palantir, and the Longshoremen’s Strike",d7:122757,d30:128805},
  {date:"10/07/2024",title:"An Nvidia Challenger Files For An IPO + Can A New CEO Turn Nike Around?",d7:120509,d30:126882},
  {date:"10/14/2024",title:"Hindenburg Shorts Roblox + Germany’s Shrinking Economy",d7:119184,d30:124481},
  {date:"10/21/2024",title:"Can A Podcast Change Southwest Airlines? + The College Consulting Business",d7:119816,d30:125181},
  {date:"10/28/2024",title:"Perplexity’s Fourth Funding Round + Lessons From Boeing in Long-Term Thinking",d7:115989,d30:119728},
  {date:"11/01/2024",title:"Will Boeing and Intel Recover? — ft. Aswath Damodaran",d7:100144,d30:103287},
  {date:"11/04/2024",title:"Meta’s AI Promise, Microsoft’s Disappointing Beat & Why Google Should Spin Youtu",d7:118086,d30:123094},
  {date:"11/11/2024",title:"Winners and Losers Under Trump’s Second Term",d7:146893,d30:154283},
  {date:"11/18/2024",title:"ChatGPT’s First Victim + The Department of Government Efficiency (DOGE)",d7:139210,d30:145442},
  {date:"11/25/2024",title:"Is Target a Leveraged Buyout Candidate? + Comcast Cuts the Cord",d7:126608,d30:133576},
  {date:"12/2/2024",title:"The Art of Spending Money",d7:134228,d30:142445},
  {date:"12/16/2024",title:"Google’s Quantum Breakthrough & The World Cup Goes to Saudi Arabia",d7:132851,d30:141437},
  {date:"12/23/2024",title:"Ask Us Anything — Forgiveness, The Manosphere, Parasocial Relationships & More",d7:126965,d30:145899},
  {date:"1/6/2025",title:"Predictions for 2025",d7:133476,d30:143820},
  {date:"1/13/2025",title:"The DOJ’s Landlord Lawsuit + Can Trump Buy Greenland?",d7:135320,d30:140811},
  {date:"1/20/2025",title:"The TikTok Showdown, UnitedHealth’s First Earnings Post-Shooting, and a Banking ",d7:146741,d30:151804},
  {date:"1/27/2025",title:"Project Stargate & The Rise of Oracle + Scott’s Stake in La Equidad Football Clu",d7:138432,d30:143221},
  {date:"2/3/2025",title:"Meta & Microsoft Brush Off DeepSeek + Starbucks Stages a Comeback",d7:138904,d30:144130},
  {date:"2/10/2025",title:"Spotify’s First Year of Profitability + Is Google Losing its Edge?",d7:135674,d30:141883},
  {date:"2/17/2025",title:"Is Reddit Undervalued? + Netflix Goes After Podcasts",d7:135461,d30:141278},
  {date:"2/24/2025",title:"Is Breaking Up Intel The Right Move? + The New Gold Rush",d7:137509,d30:142508},
  {date:"3/3/2025",title:"Nvidia Earnings are the Super Bowl of Business + Trump’s $5 Million Gold Card",d7:136143,d30:141527},
  {date:"3/10/2025",title:"Has Apple Lost Its Mojo? + BlackRock’s $23B Bet on the Panama Canal",d7:139943,d30:146178},
  {date:"3/17/2025",title:"The S\&P 500 Enters Correction Territory",d7:151927,d30:158725},
  {date:"3/24/2025",title:"Has a Global Market Rotation Begun? + Inside the Ultra-Luxury Hotel Industry",d7:151724,d30:158820},
  {date:"3/31/2025",title:"GameStop Buying Bitcoin, an Activist Play at Lyft, & Gen Z Unemployment",d7:142514,d30:147468},
  {date:"04/07/2025",title:"The $6.6 Trillion Sell-off",d7:172720,d30:179970},
  {date:"04/14/2025",title:"What to Do in the Wake of Trump’s Tariff Pause",d7:169022,d30:175822},
  {date:"04/21/2025",title:"Global Pushback on Tariffs + Can the FTC Beat Meta?",d7:172067,d30:178257},
  {date:"04/28/2025",title:"The Trump Fold and Tesla\'s Brand Death",d7:172027,d30:177660},
  {date:"05/05/2025",title:"Blockbuster Week For Big Tech Earnings + Can the U.S. Fix Its Student Debt Crisi",d7:164081,d30:169563},
  {date:"05/12/2025",title:"Is Google a Buy? + Is Uber Recession Proof?",d7:164979,d30:171409},
  {date:"5/19/2025",title:"The GOP Tax Bill, United Health’s Terrible Week, & Chinese Tech Earnings",d7:170378,d30:178289},
  {date:"5/26/2025",title:"The Story of Scott’s Career",d7:149061,d30:155736},
  {date:"6/2/2025",title:"Tariffs Blocked by Court, U.S. Steel’s Golden Shares & Neuralink’s Funding Round",d7:154508,d30:160742},
  {date:"6/9/2025",title:"Trump & Elon Break Up Over the Tax Bill",d7:215678,d30:215989},
];

const SEED_PGP = [
  {date:"03/31/2025",title:"Monday | GameStop Buying Bitcoin, an Activist Play at Lyft, & Gen Z Unemployment",d7:110020,d30:117197},
  {date:"04/03/2025",title:"Thursday | A Nightmare Tariff Scenario for the Auto Industry — ft. Tim Higgins",d7:126898,d30:134118},
  {date:"04/07/2025",title:"Monday | The $6.6 Trillion Sell-off",d7:149685,d30:158369},
  {date:"04/10/2025",title:"Thursday | Tariff Chaos & Trading on Inequality — ft. Gary Stevenson",d7:142710,d30:153612},
  {date:"04/14/2025",title:"Monday | What to Do in the Wake of Trump’s Tariff Pause",d7:136560,d30:144892},
  {date:"04/17/2025",title:"Thursday | Breaking Down Warning Signals from the Bond Market — ft. William Coha",d7:141670,d30:150103},
  {date:"04/21/2025",title:"Monday | Global Pushback on Tariffs + Can the FTC Beat Meta?",d7:138279,d30:145903},
  {date:"04/24/2025",title:"Thursday | Why Trump Will Back Down on China Tariffs — ft. Ryan Petersen",d7:151974,d30:162228},
  {date:"04/28/2025",title:"Monday | The Trump Fold and Tesla\'s Brand Death",d7:142421,d30:150870},
  {date:"5/1/2025",title:"Thursday | What to Buy When the Tech Sector is On Sale — ft. Mark Mahaney",d7:138881,d30:149137},
  {date:"05/05/2025",title:"Monday | Blockbuster Week For Big Tech Earnings + Can the U.S. Fix Its Student D",d7:138879,d30:146920},
  {date:"05/08/2025",title:"Thursday | The Sell America Thesis — ft. JPMorgan’s Michael Cembalest",d7:144289,d30:155310},
  {date:"05/12/2025",title:"Monday | Is Google a Buy? + Is Uber Recession Proof?",d7:135325,d30:145139},
  {date:"05/15/2025",title:"Thursday | Why the U.S. Can’t Break Up with China — ft. Alice Han",d7:135070,d30:145426},
  {date:"5/19/2025",title:"Monday | The GOP Tax Bill, United Health’s Terrible Week, & Chinese Tech Earning",d7:143313,d30:153528},
  {date:"5/22/2025",title:"Thursday | Why America’s Credit Rating Dropped — ft. Scott Goodwin",d7:143505,d30:154784},
  {date:"5/26/2025",title:"Monday | The Story of Scott’s Career",d7:121320,d30:130793},
  {date:"5/29/2025",title:"Thursday | Is the Market Calling Trump’s Bluff? — ft. Aswath Damodaran",d7:148029,d30:160614},
  {date:"6/2/2025",title:"Monday | Tariffs Blocked by Court, U.S. Steel’s Golden Shares & Neuralink’s Fund",d7:137668,d30:146115},
  {date:"6/5/2025",title:"Thursday | Why the TACO Trade Matters — ft. Robert Armstrong",d7:160083,d30:164183},
  {date:"6/9/2025",title:"Monday | Trump & Elon Break Up Over the Tax Bill",d7:152086,d30:153642},
  {date:"6/10/2025",title:"Tuesday | Warner Bros. Discovery Splits In Two, Apple’s WWDC Flops, & Tesla Gets",d7:128017,d30:130684},
  {date:"6/11/2025",title:"Wednesday | World Bank Cuts U.S. Growth Outlook, Meta Invests in Scale AI, & Smu",d7:127652,d30:129405},
  {date:"6/12/2025",title:"Thursday | Do the U.S. and China Have a Deal? + May Inflation Data & Tesla Delay",d7:122270,d30:124131},
  {date:"6/13/2025",title:"Friday | Warning Signs From the Labor Market — ft. Kathryn Anne Edwards",d7:160641,d30:162737},
  {date:"6/16/2025",title:"Monday | What the Air India Crash Means for Boeing, Google Buyouts & Private Equ",d7:152012,d30:153459},
  {date:"6/17/2025",title:"Tuesday | Israel-Iran Conflict Drives Oil Prices, Meta Monetizes WhatsApp, & Tro",d7:132764,d30:134831},
  {date:"6/18/2025",title:"Wednesday | OpenAI & Microsoft Feud, Homebuilder Vibes Slump, and WBD Cuts Zasla",d7:128605,d30:131033},
  {date:"6/19/2025",title:"Thursday | Nippon & U.S. Steel Deal Closes, Fed Holds Steady, and YouTube Wins O",d7:119419,d30:121863},
  {date:"6/20/2025",title:"Friday | Doing the Math on Trump’s Economic Impact — ft. Justin Wolfers",d7:148904,d30:159122},
  {date:"6/23/2025",title:"Monday | What the Falling Dollar Means for America",d7:154550,d30:159988},
  {date:"6/24/2025",title:"Tuesday | Oil Falls on Israel-Iran De-Escalation, Tesla Rolls Out the Robotaxi, ",d7:127601,d30:130668},
  {date:"6/25/2025",title:"Wednesday | Markets Shrug Off Israel-Iran Conflict, Polymarket’s $200M Round & a",d7:130992,d30:134191},
  {date:"6/26/2025",title:"Thursday | Wall Street Panics Over NYC Mayor, Layoffs at Bumble & BNPL Debt Hits",d7:140059,d30:144947},
  {date:"6/27/2025",title:"Friday | The Dangerously Irresponsible Tax Bill — ft. Maya MacGuineas",d7:153106,d30:160312},
  {date:"6/30/2025",title:"Monday | Markets 2025 Halftime Report",d7:148679,d30:155929},
  {date:"7/1/2025",title:"Tuesday | The Meta-OpenAI Talent War, Canada Drops its Tech Tax & a GOP Blow to ",d7:123497,d30:128283},
  {date:"7/2/2025",title:"Wednesday | Trump-Elon Feud Reignites, Manufacturing Activity Contracts (Again) ",d7:132952,d30:137810},
  {date:"7/3/2025",title:"Thursday | Paramount’s $16M Trump Settlement, Tesla’s Worst-Ever Delivery Drop &",d7:133694,d30:138499},
  {date:"7/7/2025",title:"Monday | How the Big Beautiful Bill’s Passage Will Reshape the Economy",d7:155600,d30:162877},
  {date:"7/8/2025",title:"Tuesday | Trump Unveils Steep New Tariffs, TikTok Develops App for U.S. & CoreWe",d7:124367,d30:127242},
  {date:"7/9/2025",title:"Wednesday | Shein’s Hong Kong IPO, 50% Tariffs on Copper? & Why China is Winning",d7:120636,d30:123413},
  {date:"7/10/2025",title:"Thursday | Nvidia Hits $4T, Yaccarino Steps Down from X & SpaceX Eyes $400 Billi",d7:123757,d30:127301},
  {date:"7/11/2025",title:"Friday | State of Play in the Rideshare Wars — ft. David Risher, CEO of Lyft",d7:130259,d30:135229},
  {date:"7/14/2025",title:"Monday | Liberation Day 2.0 Is Here — When Will We See the Tariff Fallout?",d7:144707,d30:148798},
  {date:"7/15/2025",title:"Tuesday | Crypto Week Kicks Off in Congress, Will Tesla Invest in xAI? & Google’",d7:117466,d30:120109},
  {date:"7/16/2025",title:"Wednesday | Inflation Ticks Up, U.S. Lifts China Chip Ban & The Department of De",d7:119977,d30:122780},
  {date:"7/17/2025",title:"Thursday | Will Trump Fire Powell? ASML Sinks on Tariff Fears & An Interview wit",d7:118674,d30:123236},
  {date:"7/18/2025",title:"Friday | The Biggest Risks and Opportunities in Latin America — ft. Monica de Bo",d7:127691,d30:133976},
  {date:"7/21/2025",title:"Monday | Buy-The-Dip Mindset Fuels Historic Quarter For Stock Trading",d7:145419,d30:154506},
  {date:"7/22/2025",title:"Tuesday | Is Netflix Overvalued? LVMH Bets on Private Jets & Crypto Custody Firm",d7:120009,d30:124498},
  {date:"7/23/2025",title:"Wednesday | Will Anti-Woke Free Press Join CBS? Philip Morris Falls on ZYN Slowd",d7:112059,d30:115941},
  {date:"7/24/2025",title:"Thursday | Do Japan & the U.S. Have a Deal? Google’s Q2 Earnings & Home Prices H",d7:121319,d30:125847},
  {date:"7/25/2025",title:"Friday | Why Scott Invested In Vertical Aerospace — ft. Stuart Simpson",d7:124562,d30:129419},
  {date:"7/28/2025",title:"Monday | Meme Stocks are Back — What’s Fueling the Resurgence?",d7:142091,d30:146797},
  {date:"7/29/2025",title:"Tuesday | Who Wins in the U.S.-EU “Deal”? Wall Street Turns Bullish on Nike & An",d7:123901,d30:127070},
  {date:"7/30/2025",title:"Wednesday | Novo Nordisk Tanks 30%, P\&G Takes a Tariff Hit & SoFi’s Monster Sec",d7:120444,d30:123793},
  {date:"7/31/2025",title:"Thursday | Figma’s IPO is Finally Here, Fed Holds Rates Steady & Amazon’s $20M A",d7:118181,d30:122115},
  {date:"8/1/2025",title:"Friday | The 2025 Rally: Real Strength or Market Mirage? — ft. Kevin Gordon",d7:138252,d30:145106},
  {date:"8/4/2025",title:"Monday | Big Tech Breaks Away From the Pack as Markets Stumble on Tariff Blitz",d7:142843,d30:151299},
  {date:"8/5/2025",title:"Tuesday | Trump Fires BLS Chief, Elon’s $29B Pay Day & American Eagle Stock Soar",d7:118719,d30:126349},
  {date:"8/6/2025",title:"Wednesday | Who Will Replace Jerome Powell? Tesla Hit with Securities Fraud Suit",d7:118609,d30:128087},
  {date:"8/7/2025",title:"Thursday | OpenAI’s $500B Valuation + Key Takeaways from Disney and Uber Earning",d7:123299,d30:137309},
  {date:"8/8/2025",title:"Friday | Country Risk, Tech Valuations, & How the Markets Lost their Predictive ",d7:166037,d30:210664},
  {date:"8/25/2025",title:"Monday | AI Bubble Watch: Has the Hype Gone Too Far? — ft. Josh Brown",d7:141353,d30:147926},
  {date:"8/26/2025",title:"Tuesday | U.S. Takes 10% Stake in Intel, Powell’s Jackson Hole Speech + OnlyFans",d7:120172,d30:123995},
  {date:"8/27/2025",title:"Wednesday | Trump Fires Fed Governor Cook, Eli Lilly’s Weight Loss Pill & How to",d7:113419,d30:117514},
  {date:"8/28/2025",title:"Thursday | Nvidia’s Record $46.7B Quarter, Trump’s 50% Tariff on India & Can Tax",d7:114999,d30:119336},
  {date:"8/29/2025",title:"Friday | Why the U.S. is on the Precipice of a Recession — ft. Mark Zandi",d7:142020,d30:153219},
  {date:"9/2/2025",title:"Tuesday | Federal Appeals Court Strikes Down Trump’s Tariffs & De Minimis Loopho",d7:111883,d30:114517},
  {date:"9/3/2025",title:"Wednesday | Stocks Fall to Start September, Kraft Heinz Breaks Up & Why Constell",d7:119710,d30:122932},
  {date:"9/4/2025",title:"Thursday | Google Dodges a Breakup, China’s Growing Trade With Africa & Anthropi",d7:114691,d30:117703},
  {date:"9/5/2025",title:"Friday | How America Goes Broke — ft. Ray Dalio",d7:141429,d30:150005},
  {date:"9/8/2025",title:"Monday | Navigating The Most Top-Heavy S\&P 500 in History",d7:139414,d30:144708},
  {date:"9/9/2025",title:"Tuesday | Silicon Valley Dines with Trump, August Jobs Slump & Elon’s $1T Pay Pa",d7:118185,d30:121308},
  {date:"9/10/2025",title:"Wednesday | Why China is Rearing For a Bull Run & The Largest Jobs Revision Ever",d7:118634,d30:122480},
  {date:"9/11/2025",title:"Thursday | Oracle Stock Roars 36%, Apple’s New Product Flop & Judge Blocks Lisa ",d7:130044,d30:134054},
  {date:"9/12/2025",title:"Friday | Why the AI Revolution Could Make or Break the Economy — ft. Justin Wolf",d7:144407,d30:152136},
  {date:"9/15/2025",title:"Monday | The Fed’s September Dilemma: Is it Really Time to Cut Rates?",d7:140912,d30:146699},
  {date:"9/16/2025",title:"Tuesday | U.S. & China Strike TikTok Deal? Paramount’s WBD Bid & Robinhood’s New",d7:110717,d30:119860},
  {date:"9/17/2025",title:"Wednesday | Retail Sales Rise on Strength of the Rich & Senate Confirms Stephen ",d7:115415,d30:117821},
  {date:"9/18/2025",title:"Thursday | Fed Cuts Rates For First Time This Year & Winners and Losers of a Tik",d7:125756,d30:129055},
  {date:"9/19/2025",title:"Friday | Why Britain’s Economy Is Broken — ft. Jagjit Chadha",d7:132450,d30:137714},
  {date:"9/22/2025",title:"Monday | TikTok, Warner Bros, and the Rise of the Ellison Empire",d7:139402,d30:143874},
  {date:"9/23/2025",title:"Tuesday | What the $100K H-1B Visa Fee Means for Big Tech + TikTok Deal Details ",d7:125494,d30:129173},
  {date:"9/24/2025",title:"Wednesday | $100B Nvidia-OpenAI Deal: Growth or Financial Engineering? & Oura Ri",d7:118128,d30:122236},
  {date:"9/25/2025",title:"Thursday | What’s Driving 2025’s Gold Rush? & The Incredible Risk of Perpetual F",d7:117121,d30:121252},
  {date:"9/26/2025",title:"Friday | AI, TikTok, and the Battle for Media’s Future — ft. Mark Cuban",d7:139695,d30:148746},
  {date:"9/29/2025",title:"Monday | How The AI Economy Could Collapse",d7:149053,d30:162567},
  {date:"9/30/2025",title:"Tuesday | EA Goes Private for $55B in Biggest LBO Ever, U.S. TikTok Valued at $1",d7:118603,d30:123139},
  {date:"10/1/2025",title:"Wednesday | The Economic Fallout of a Government Shutdown & Why Fermi Will Be th",d7:119236,d30:123180},
  {date:"10/2/2025",title:"Thursday | EV Tax Credit Comes to an End & Why Trump Rx Will Not Fix High Drug C",d7:115962,d30:119919},
  {date:"10/3/2025",title:"Friday | What Happens if the Fed is Compromised — ft. Claudia Sahm",d7:123830,d30:129257},
  {date:"10/6/2025",title:"Monday | The Great Sloppification of OpenAI",d7:142826,d30:150432},
  {date:"10/7/2025",title:"Tuesday | AMD Rallies 24% on OpenAI Deal & Bari Weiss Takes Over CBS News",d7:116652,d30:121206},
  {date:"10/8/2025",title:"Wednesday | Japan Stocks Hit Record on New Prime Minister & Emerging Markets Pos",d7:113616,d30:117538},
  {date:"10/9/2025",title:"Thursday | xAI Teams Up with Nvidia in $20B Funding Round & Chinese Tech Stocks ",d7:112798,d30:116464},
  {date:"10/10/2025",title:"Friday | How Policy is Failing the American Workforce — ft. Kathryn Anne Edwards",d7:131891,d30:152601},
  {date:"10/13/2025",title:"Monday | The AI Bubble Is Real — Here’s How to Prepare for the Pop",d7:157949,d30:176151},
  {date:"10/14/2025",title:"Tuesday | Markets Rebound from China Tariff Threats, OpenAI’s Broadcom Deal & JP",d7:117923,d30:122269},
  {date:"10/15/2025",title:"Wednesday | China-U.S. Tensions Flare in Volatile Trading Day & Why Big Bank Pro",d7:114979,d30:119424},
  {date:"10/16/2025",title:"Thursday | Inside ASML’s Earnings Beat, Netflix’s Podcasting Move & the Largest ",d7:114357,d30:119004},
  {date:"10/17/2025",title:"Friday | Why AI Needs Antitrust Intervention — ft. Jonathan Kanter",d7:122251,d30:128512},
  {date:"10/20/2025",title:"Monday | AI is Running Up America’s Energy Costs — Who’s Footing the Bill?",d7:130233,d30:136817},
  {date:"10/21/2025",title:"Tuesday | Is Amazon Losing Its Edge? What the AWS Outage Means for the Cloud War",d7:115527,d30:118904},
  {date:"10/22/2025",title:"Wednesday | Netflix Stumbles on Earnings — While Warner Bros. Looks for a Buyer",d7:112644,d30:115590},
  {date:"10/23/2025",title:"Thursday | Tesla Profits Plunge 37% Despite Record Sales — Here’s Why",d7:117309,d30:120449},
  {date:"10/24/2025",title:"Friday | Are We Building AI for Progress or Power? — ft. Daron Acemoglu",d7:123878,d30:128802},
  {date:"10/27/2025",title:"Monday | How China’s AI Efficiency Could Gut the U.S. Economy",d7:134640,d30:140222},
  {date:"10/28/2025",title:"Tuesday | How Milei’s Surprise Win in Argentina Defied the Market",d7:109441,d30:112160},
  {date:"10/29/2025",title:"Wednesday | What OpenAI’s Restructuring Means for Microsoft, AGI — and a Future ",d7:109671,d30:112517},
  {date:"10/30/2025",title:"Thursday | Nvidia Just Hit $5 Trillion — Is the Stock Unstoppable?",d7:110012,d30:113263},
  {date:"10/31/2025",title:"Friday | Are We Reliving 1929? Parallels to Today’s Market Mania — ft. Andrew Ro",d7:138183,d30:147439},
  {date:"11/3/2025",title:"Monday | AI is Taking Jobs — Here’s How to Stay Indispensable",d7:139777,d30:147084},
  {date:"11/4/2025",title:"Tuesday | Amazon’s $38 Billion OpenAI Deal — And Why We Were Already Bullish on ",d7:113227,d30:116540},
  {date:"11/5/2025",title:"Wednesday | Zohran Mamdani Wins — Why NYC’s Mayor Race Was a Referendum on Inequ",d7:121667,d30:124994},
  {date:"11/6/2025",title:"Thursday | Is Palantir Overvalued? Stock Drops 10% on Michael Burry’s Bearish Be",d7:115278,d30:118739},
  {date:"11/7/2025",title:"Friday | Is Zohran Mamdani\'s Plan for New York Economically Possible? — ft. Bra",d7:134922,d30:140993},
  {date:"11/10/2025",title:"Monday | Red Flags at OpenAI — How One Company Could Burst the AI Bubble",d7:147429,d30:154108},
  {date:"11/11/2025",title:"Tuesday | Inside Elon Musk’s $1 Trillion Tesla Payday — And Why It’s a Governanc",d7:113554,d30:116279},
  {date:"11/12/2025",title:"Wednesday | Trump’s $2,000 Tariff Dividend Doesn’t Add Up — Here’s Why",d7:114786,d30:118020},
  {date:"11/13/2025",title:"Thursday | Government Shutdown Ends — But the Damage Doesn’t",d7:118192,d30:121169},
  {date:"11/14/2025",title:"Friday | Aswath Damodaran Says There’s No Place to Hide in Stocks",d7:154319,d30:165350},
  {date:"11/05/2023",title:"First Time Founders with Ed Elson — ft. Andrew Benin and Allen Dushi of Graza",d7:101969,d30:112697},
  {date:"12/03/2023",title:"First Time Founders with Ed Elson – ft. Ryan Petersen of Flexport",d7:91786,d30:99868},
  {date:"01/07/2024",title:"First Time Founders with Ed Elson – ft. Tyler Denk of Beehiiv",d7:87061,d30:94360},
  {date:"02/04/2024",title:"First Time Founders with Ed Elson – Why Caroline Spiegel Built an Audio Erotica ",d7:92644,d30:100048},
  {date:"03/03/2024",title:"First Time Founders with Ed Elson – Could this AI Founder Replace Investment Ban",d7:95942,d30:103085},
  {date:"04/07/2024",title:"First Time Founders with Ed Elson – A Founder’s Mission to Solve Hunger in Ameri",d7:89505,d30:95397},
  {date:"05/05/2024",title:"First Time Founders with Ed Elson – This Animal Rights Activist is Changing the ",d7:97210,d30:103420},
  {date:"06/02/2024",title:"First Time Founders with Ed Elson – This Founder Hit $100M in Revenue Without Ra",d7:103893,d30:111525},
  {date:"07/07/2024",title:"First Time Founder with Ed Elson - This Founder Raised $900M To Power The Grid",d7:99448,d30:105827},
  {date:"08/04/2024",title:"First Time Founders with Ed Elson – The AI Company That Codes For You",d7:106396,d30:112195},
  {date:"09/08/2024",title:"First Time Founder with Ed Elson - This Mother-Daughter Duo Created a Leadership",d7:97966,d30:101953},
  {date:"10/06/2024",title:"First Time Founders with Ed Elson - This Founder Makes Viral TV Shows for TikTok",d7:105324,d30:110006},
  {date:"11/03/2024",title:"First Time Founders with Ed Elson - How Kalshi Made It Legal To Bet On This Elec",d7:103750,d30:107281},
  {date:"12/01/2024",title:"First Time Founder with Ed Elson - Reed Hastings: Life After Netflix",d7:116782,d30:121702},
  {date:"01/05/2025",title:"First Time Founders with Ed Elson - How This German Founder Built the Nation\'s ",d7:105569,d30:110746},
  {date:"02/02/2025",title:"First Time Founders with Ed Elson - This Founder Wants To Help Men Have More Sex",d7:119224,d30:123817},
  {date:"03/02/2025",title:"First Time Founds with Ed Elson - How Bobbi Brown Built A Beauty Empire",d7:114870,d30:119202},
  {date:"04/06/2025",title:"First Time Founders with Ed Elson - This Non Profit Raised $1 Billion To Bring C",d7:120628,d30:125094},
  {date:"05/04/2025",title:"First Time Founders with Ed Elson - The Story of Reddit",d7:145189,d30:151504},
  {date:"06/01/2025",title:"First Time Founders with Ed Elson - This Company Uses AI To Help 911 Save Lives",d7:134582,d30:154125},
  {date:"07/06/2025",title:"First Time Founders with Ed Elson - This Founder is Disrupting Our Addiction to ",d7:154813,d30:162054},
  {date:"08/03/2025",title:"First Time Founders with Ed Elson - The Billionaire Who Built His Fortune on Inf",d7:151797,d30:160398},
  {date:"09/07/2025",title:"First Time Founders with Ed Elson - How Airbnb Scaled from 3 Guests to 20 Billio",d7:129347,d30:134660},
  {date:"10/05/2025",title:"First Time Founders with Ed Elson – How Anthony Scaramucci Became The Mooch",d7:142819,d30:149846},
  {date:"11/02/2025",title:"First Time Founders with Ed Elson – This Physicist Is Building AI Droids",d7:123856,d30:128205},
  {date:"12/07/2025",title:"First Time Founders: Figma’s Founder on Post-IPO Life & the Road Ahead",d7:118537,d30:122627},
  {date:"1/4/2025",title:"First Time Founders: This Former Trader Built A Luxury Clothing Brand",d7:120377,d30:125197},
  {date:"2/1/2026",title:"First Time Founders: Has Substack Changed Media For Good?",d7:135047,d30:140354},
  {date:"3/1/2026",title:"First Time Founders: Is Cohere the Next AI Powerhouse?",d7:115902,d30:120318},
  {date:"4/4/2026",title:"First Time Founders: How Partiful Is Fixing the Loneliness Crisis",d7:100532,d30:104375},
  {date:"01/02/2023",title:"Predictions Part 1",d7:105949,d30:127257},
  {date:"03/11/2023",title:"Special Episode: Silicon Valley Banks Goes Bust",d7:131101,d30:149152},
  {date:"06/24/2024",title:"Netflix\'s New Entertainment Venues & Scott\'s Takeaways from Cannes",d7:126220,d30:136137},
  {date:"7/8/2024",title:"How the Debate Moved the Market & Wall Street’s Take on Trump - with Josh Brown",d7:121101,d30:128689},
  {date:"7/22/2024",title:"Why is Silicon Valley Backing Trump? + A Glasses Company Acquires Supreme",d7:139584,d30:148197},
  {date:"12/09/2024",title:"The UnitedHealthcare CEO Shooting, Amazon Takes On Nvidia, & 12 Days of OpenAI",d7:136829,d30:144106},
];

const SEED_RM = [
  {date:"7/30/2024",title:"Trump's Trade Win or Spin?",d7:129829,d30:170415},
  {date:"09/10/2024",title:"Should We Care about Polling Data? Trump vs. Harris on Economic Policies, and Predictions for the Debate",d7:90366,d30:133729},
  {date:"09/17/2024",title:"Another Assassination Attempt, Trump Refuses Future Debates, and the Pros and Cons of Tim Walz",d7:101039,d30:139051},
  {date:"09/24/2024",title:"Tight Polls, North Carolina Governor's Scandal, and Millionaires Are Renting Homes",d7:92739,d30:119883},
  {date:"09/25/2024",title:"Dan Senor Breaks Down the Israel-Hezbollah Conflict",d7:91887,d30:124838},
  {date:"10/01/2024",title:"VP Showdown, Harris's Border Visit, Mayor Adams Indicted, and Hogan on the GOP",d7:93228,d30:119579},
  {date:"10/08/2024",title:"October Surprises and the Final Campaign Stretch",d7:93807,d30:126968},
  {date:"10/15/2024",title:"The Gender Gap, Media Blitzes and Misinformation",d7:93338,d30:128540},
  {date:"10/22/2024",title:"Kamala on Fox News, Elon's Election Gamble, and an Endorsement",d7:96080,d30:130413},
  {date:"11/05/2024",title:"The Final Stretch and What To Look for on Election Night",d7:98485,d30:123747},
  {date:"11/12/2024",title:"Democrats Point Fingers as Trump Assembles Cabinet",d7:108798,d30:146122},
  {date:"12/10/2024",title:"Trump's Day One Agenda, Syria's Civil War, and 2025 Predictions",d7:99631,d30:133613},
  {date:"1/7/2025",title:"The Shadow of January 6th, Johnson's Speakership, and Jimmy Carter's Legacy",d7:87799,d30:117985},
  {date:"1/14/2025",title:"LA's Wildfires, Trump's Bold Agenda, and Historic Sentencing",d7:102118,d30:140116},
  {date:"1/21/2025",title:"Trump's First Moves, Biden's Final Words",d7:85979,d30:139751},
  {date:"1/28/2025",title:"Trump's Immigration Crackdown and the Democrats' Muted Response",d7:106535,d30:143278},
  {date:"2/4/2025",title:"Trump's Short-Lived Trade War",d7:108111,d30:145366},
  {date:"2/11/2025",title:"Elon Musk's Federal Government Takeover",d7:107112,d30:147885},
  {date:"2/18/2025",title:"What's Trump's Endgame in Ukraine?",d7:104684,d30:144513},
  {date:"2/25/2025",title:"Trump Ditches Ukraine and Cozies Up to Putin",d7:104462,d30:144793},
  {date:"3/4/2025",title:"The Real Housewives of the Oval Office (Feat. Anthony Scaramucci & Gov. JB Pritzker)",d7:110437,d30:153307},
  {date:"3/11/2025",title:"Newsom's Centrist Approach and Kamala's Political Future",d7:104328,d30:141080},
  {date:"3/18/2025",title:"Trump's Deportation Plans Backfire as Dems Hit Record Low",d7:105576,d30:142208},
  {date:"3/25/2025",title:"How Social Security and Education Are Being Reshaped",d7:104909,d30:140853},
  {date:"4/1/2025",title:"The Possibility of a Third Trump Term (feat. Kellyanne Conway)",d7:109332,d30:145325},
  {date:"4/8/2025",title:"The Price of Trump's Trade War",d7:119657,d30:160754},
  {date:"4/15/2025",title:"The Art of the Trade War",d7:120863,d30:166778},
  {date:"4/22/2025",title:"SCOTUS Blocks Trump's Deportation Efforts",d7:126009,d30:168788},
  {date:"4/29/2025",title:"Trump's 100 Days of Power Grabs",d7:90132,d30:174905},
  {date:"5/6/2025",title:"Trump's Trade War vs. Hollywood (feat. Sen. Chris Murphy)",d7:120636,d30:162743},
  {date:"5/13/2025",title:"Trump Blinks on China",d7:135472,d30:181060},
  {date:"5/20/2025",title:"Biden's Cancer Diagnosis",d7:120335,d30:159486},
  {date:"5/27/2025",title:"The Death of the American Dream (feat. Rahm Emanuel)",d7:125214,d30:166485},
  {date:"6/3/2025",title:"Trump's Trade War in Limbo",d7:116281,d30:161284},
  {date:"6/10/2025",title:"Are Protestors Playing Into Trump's Hands?",d7:145149,d30:187206},
  {date:"6/18/2025",title:"Is Israel the Superpower of the Middle East?",d7:143170,d30:185270},
  {date:"6/25/2025",title:"A Shaky Ceasefire (ft. Rep. Jim Himes)",d7:138450,d30:169661},
  {date:"7/2/2025",title:"The GOP's Unpopular and Harmful Bill (ft. Galen Druke)",d7:132448,d30:175344},
  {date:"7/16/2025",title:"Trump's Epstein Problem",d7:139072,d30:184077},
  {date:"7/23/2025",title:"Trump's Desperate Epstein Distractions",d7:132289,d30:174026},
  {date:"8/6/2025",title:"The 2028 Democratic Bench for President (ft. James Carville)",d7:126939,d30:167849},
  {date:"8/13/2025",title:"Trump's Military Occupation Comes to DC (ft. Shane Goldmacher)",d7:125445,d30:163951},
  {date:"8/20/2025",title:"How Obamaworld is Elevating Zohran Mamdani (ft. David Axelrod)",d7:119325,d30:155164},
  {date:"8/27/2025",title:"Things Are Getting Real Fascist (ft. Aaron Parnas)",d7:113404,d30:148044},
  {date:"9/3/2025",title:"How Trump is Setting Back Public Health",d7:116893,d30:150693},
  {date:"9/10/2025",title:"The Trump Epstein Doodle Bombshell",d7:115021,d30:145957},
  {date:"9/17/2025",title:"Trump Targets the Left After Kirk Murder",d7:124639,d30:176083},
  {date:"9/24/2025",title:"Why Jimmy Kimmel Returned",d7:127926,d30:165041},
  {date:"10/1/2025",title:"Why the Government Shut Down and How Democrats Claim Victory",d7:126108,d30:159183},
  {date:"10/6/2025",title:"Why the Manosphere Is Breaking up With Trump",d7:124195,d30:160425},
  {date:"10/15/2025",title:"Trump Has Completed Half of Project 2025",d7:121837,d30:157437},
  {date:"10/22/2025",title:"Why Progressives Won't WIN in the 2026 Midterms (ft. David Frum)",d7:118202,d30:154464},
  {date:"10/29/2025",title:"Why Politicians are Launching Podcasts Ahead of 2028",d7:107543,d30:135904},
  {date:"11/5/2025",title:"Trump's K-Shaped Economy: Why the Economy Feels Broken",d7:114278,d30:149637},
  {date:"11/12/2025",title:"Trump's Affordability Agenda: A Masterclass in Backward Economics",d7:111587,d30:147260},
  {date:"11/19/2025",title:"The MAGA Civil War Begins",d7:122483,d30:160139},
  {date:"11/26/2025",title:"MAGA in Turmoil: MTG Out, Mamdani In, and Major Legal Blow",d7:110519,d30:169890},
  {date:"12/3/2025",title:"How Rage Bait Runs Our Economy",d7:110580,d30:142018},
  {date:"12/10/2025",title:"The Affordability Crisis Trump Can't Spin",d7:106621,d30:140453},
  {date:"12/17/2025",title:"How Trump Remade America in Just One Year",d7:107677,d30:139535},
  {date:"1/7/2026",title:"Can Democrats Criticize Trump's Invasion Without Defending Maduro?",d7:101696,d30:132454},
  {date:"1/14/2026",title:"Is This a Turning Point for America? (ft. Sarah Longwell)",d7:111737,d30:146125},
  {date:"1/21/2026",title:"A Year of Trump 2.0; A Decade of the War on Truth (ft. Heather Cox Richardson)",d7:115442,d30:150704},
  {date:"1/28/2026",title:"Trump Pulls Back in Minneapolis as Democrats Turn Up Pressure on ICE",d7:118224,d30:149892},
  {date:"2/4/2026",title:"Confronting the Ethical Vacuum Exposed by Trump and Epstein",d7:118965,d30:156331},
  {date:"2/11/2026",title:"Trump's Sparking Culture War Fights to Bury the Epstein Scandal",d7:116306,d30:151483},
  {date:"2/18/2026",title:"Censoring Stephen Colbert Backfires",d7:118293,d30:155784},
  {date:"2/25/2026",title:"Trump's Forgettable State of the Union",d7:35874,d30:119475},
  {date:"3/4/2026",title:"War in Iran Backfires as MAGA Turns on Trump",d7:125171,d30:169228},
  {date:"3/11/2026",title:"The Trump Administration Can't Get Their Iran War Story Straight",d7:114783,d30:148259},
  {date:"3/18/2026",title:"Trump's Iran War Plan Falls Apart as Allies Walk Away",d7:119314,d30:156505},
  {date:"3/25/2026",title:"Did Trump Already LOSE the War in Iran? (ft. Ian Bremmer and Dan Senor)",d7:112455,d30:150296},
  {date:"4/1/2026",title:"Trump and Pentagon Now Completely Delusional on War Strategy",d7:99511,d30:127065},
  {date:"4/8/2026",title:"Trump Threatens to WIPE OUT Iran and Triggers 25th Amendment Calls",d7:99469,d30:127412},
  {date:"4/15/2026",title:"Trump Spirals as Iran Blockade Triggers Recession Fears (ft. Sen. Chris Murphy)",d7:108830,d30:140304},
  {date:"4/22/2026",title:"How Trump's Iran War Could Break the GOP (ft. Ben Shapiro)",d7:97051,d30:126211},
  {date:"4/29/2026",title:"Trump Blames Democrats, Demands His Ballroom, and Attacks Jimmy Kimmel Again",d7:91757,d30:117943},
];

const SHOWS = {
  pgm: {id:"pgm", name:"Prof G Markets", color:"#E8481C", data:SEED_PGM, channelId:PGM_CHANNEL_ID},
  pgp: {id:"pgp", name:"Prof G Pod", color:"#ffffff", data:SEED_PGP, channelId:"UC1E1SVcVyU3ntWMSQEp38Yw"},
  rm:  {id:"rm",  name:"Raging Moderates", color:"#4A6FA5", data:SEED_RM, channelId:"UCcvDWzvxz6Kn1iPQHMl2teA"},
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000) return Math.round(n/1000)+"K";
  return n;
}
function showAvg(eps, key) {
  const v = eps.map(e=>e[key]).filter(Boolean);
  return v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : 0;
}
function topEp(eps) { return [...eps].sort((a,b)=>(b.d7||0)-(a.d7||0))[0]; }
function engRate(ep) {
  if (!ep.ytViews) return null;
  return (((ep.ytLikes||0)+(ep.ytComments||0))/ep.ytViews*100).toFixed(1);
}
function episodeAgeDays(dateStr) {
  try {
    const p = dateStr.split("/");
    const d = new Date(parseInt(p[2]||2025), parseInt(p[0])-1, parseInt(p[1]));
    return Math.floor((Date.now()-d.getTime())/(1000*60*60*24));
  } catch { return 999; }
}
function matureEps(episodes) { return episodes.filter(e=>episodeAgeDays(e.date)>=7); }

// ── YouTube API ───────────────────────────────────────────────────────────────
async function fetchYouTubeData(channelId) {
  if (!YT_API_KEY || !channelId) return [];
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${YT_API_KEY}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0) return [];
    
    const ids = searchData.items.map(v=>v.id.videoId).filter(Boolean).join(",");
    if (!ids) return [];
    
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${YT_API_KEY}`
    );
    const statsData = await statsRes.json();
    if (!statsData.items) return [];
    
    return statsData.items.map(v => {
      const desc = v.snippet.description || "";
      const guestMatch = desc.match(/(?:speaks? with|joined? by|guest[:\s]+|interview[:\s]+|with guest)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i);
      const titleGuestMatch = v.snippet.title.match(/(?:with|ft\.?|feat\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      return {
        ytId: v.id,
        ytTitle: v.snippet.title,
        ytDate: v.snippet.publishedAt?.split("T")[0] || "",
        ytViews: parseInt(v.statistics.viewCount)||0,
        ytLikes: parseInt(v.statistics.likeCount)||0,
        ytComments: parseInt(v.statistics.commentCount)||0,
        ytDescription: desc.slice(0, 400),
        guest: guestMatch?.[1] || titleGuestMatch?.[1] || null,
      };
    });
  } catch(e) {
    console.error("YouTube API error:", e);
    return [];
  }
}


// ── Google Sheet Live Fetch ───────────────────────────────────────────────────
async function fetchSheetData(sheetId, sheetName="Sheet1") {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${YT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.values || data.values.length < 2) return [];
    
    const [headers, ...rows] = data.values;
    const dateIdx = headers.findIndex(h => h.toLowerCase().includes("date") || h.toLowerCase().includes("release"));
    const titleIdx = headers.findIndex(h => h.toLowerCase().includes("episode") || h.toLowerCase().includes("title"));
    const d7Idx = headers.findIndex(h => h.toLowerCase().includes("7") && (h.toLowerCase().includes("day") || h.toLowerCase().includes("download")));
    const d30Idx = headers.findIndex(h => h.toLowerCase().includes("30") && (h.toLowerCase().includes("day") || h.toLowerCase().includes("download")));
    
    if (dateIdx === -1 || titleIdx === -1) return [];
    
    return rows
      .filter(r => r[dateIdx] && r[titleIdx])
      .map(r => ({
        date: r[dateIdx]?.trim() || "",
        title: r[titleIdx]?.trim() || "",
        d7: parseInt((r[d7Idx]||"0").replace(/[^0-9]/g,""))||0,
        d30: parseInt((r[d30Idx]||"0").replace(/[^0-9]/g,""))||0,
      }))
      .filter(e => e.d7 > 0);
  } catch(e) {
    console.error("Sheet fetch error:", e);
    return [];
  }
}

// ── Claude API ────────────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens=800) {
  try {
    const res = await fetch("/api/claude", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({prompt, maxTokens})
    });
    const data = await res.json();
    return data.text || "";
  } catch(e) { return ""; }
}

async function generateTakeaways(showName, episodes) {
  // Only use last 8 mature episodes (approx 4-8 weeks) for recency
  const allMature = matureEps(episodes);
  // Sort by age ascending (oldest first), take last 8 = most recent 8
  const mature = [...allMature].sort((a,b) => episodeAgeDays(a.date) - episodeAgeDays(b.date)).slice(0,8);
  const sorted = [...mature].sort((a,b)=>episodeAgeDays(a.date)-episodeAgeDays(b.date));
  const last4 = sorted.slice(-4);
  const prior4 = sorted.slice(-8,-4);
  const last4avg = last4.length ? Math.round(last4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/last4.length) : 0;
  const prior4avg = prior4.length ? Math.round(prior4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/prior4.length) : 0;
  const trend = prior4avg ? Math.round(((last4avg-prior4avg)/prior4avg)*100) : 0;
  const metric = hasYT ? "YouTube views" : "7-day downloads";
  const top3 = [...mature].sort((a,b)=>(b.d7||0)-(a.d7||0)).slice(0,3);
  const bottom3 = [...mature].sort((a,b)=>(a.d7||0)-(b.d7||0)).slice(0,3);
  const recent = episodes.filter(e=>episodeAgeDays(e.date)<7);

  const prompt = `You are a podcast strategy analyst for ${showName}.
Analysis period: last ${mature.length} episodes with full 7-day data.
${recent.length>0?`Note: ${recent.length} episode(s) excluded — too recent for 7-day comparison.`:""}
Top 3: ${top3.map(e=>`"${e.title}" (${fmt(e.d7)} 7d, ${episodeAgeDays(e.date)} days ago)`).join(" | ")}
Bottom 3: ${bottom3.map(e=>`"${e.title}" (${fmt(e.d7)} 7d)`).join(" | ")}
Rolling 4-week avg: ${fmt(last4avg)} | Prior 4-week avg: ${fmt(prior4avg)} | Trend: ${trend>0?"+":""}${trend}%

Give 3 specific actionable recommendations. Reference actual titles/topics. Not generic advice.
Respond ONLY in JSON (no markdown):
{"takeaways":[{"title":"<action>","detail":"<2 sentences with specific evidence>"},{"title":"","detail":""},{"title":"","detail":""}],"period":"last ${mature.length} episodes","trend":"${trend>0?"+":""}${trend}% vs prior 4 weeks"}`;

  try {
    const raw = await callClaude(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function analyzeSentiment(episode, showName) {
  const prompt = `Podcast episode analysis for ${showName}: "${episode.title}"
Stats: ${fmt(episode.d7)} 7-day downloads${episode.ytViews?`, ${fmt(episode.ytViews)} YT views, ${engRate(episode)}% engagement`:""}
Generate realistic audience sentiment based on the performance data and topic.
Respond ONLY in JSON (no markdown):
{"score":<1-10>,"summary":"<3-4 sentences>","consensus":["<point 1>","<point 2>","<point 3>"]}`;
  try {
    const raw = await callClaude(prompt, 500);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function runGuestAnalysis(showName, seedEpisodes, ytVideos) {
  // Use YouTube videos for guest analysis since they have descriptions
  const hasYT = ytVideos && ytVideos.length > 0;
  const ytAvg = hasYT ? Math.round(ytVideos.map(v=>v.ytViews).reduce((a,b)=>a+b,0)/ytVideos.length) : 0;
  const episodeList = hasYT
    ? ytVideos.map(v=>`"${v.ytTitle}" — ${fmt(v.ytViews)} YT views — DESC: ${v.ytDescription.slice(0,150)}${v.guest?` — DETECTED GUEST: ${v.guest}`:""}`)
    : seedEpisodes.map(e=>`"${e.title}" — ${fmt(e.d7)} 7d downloads`);
  const metric = hasYT ? "YouTube views" : "7-day downloads";

  const prompt = `You are analyzing podcast guest performance for ${showName}.

${hasYT?`Live YouTube data (${ytVideos.length} episodes, avg ${fmt(ytAvg)} views):`:"Podcast episode data:"}
${episodeList.join("\n")}

Tasks:
1. Identify ALL episodes featuring named guests (from "speaks with", "joined by", "ft.", guest names in descriptions/titles)
2. Calculate avg ${metric} for guest vs solo episodes
3. Rank guests by performance

Respond ONLY in JSON (no markdown):
{"guestEpisodes":[{"title":"<ep title>","guest":"<guest name>","views":<yt views or 0>,"d7":<downloads or 0>}],"soloAvg":<avg ${metric} non-guest>,"guestAvg":<avg ${metric} guest>,"delta":"<e.g. +23% vs baseline>","topGuests":["<name1>","<name2>"],"insight":"<1-2 sentence finding with numbers>","metric":"${metric}"}`;

  try {
    const raw = await callClaude(prompt, 800);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function runTopicAnalysis(showName, episodes, ytVideos) {
  const mature = matureEps(episodes);
  const hasYT = ytVideos && ytVideos.length > 0;
  const ytAvg = hasYT ? Math.round(ytVideos.map(v=>v.ytViews).reduce((a,b)=>a+b,0)/ytVideos.length) : 0;
  const episodeData = hasYT
    ? ytVideos.map(v=>`"${v.ytTitle}" — ${fmt(v.ytViews)} YT views`)
    : mature.map(e=>`"${e.title}" — ${fmt(e.d7)} 7d downloads`);
  const metric = hasYT ? "YouTube views" : "7-day downloads";
  const avg = hasYT ? fmt(ytAvg) : fmt(showAvg(mature,"d7"));
  const prompt = `You are analyzing topic performance for ${showName}.
Episodes by ${metric}: 
${episodeData.join("\n")}
Show avg: ${avg} ${metric}

Tag each episode with 1-3 topics and calculate avg performance by topic vs show baseline.
Respond ONLY in JSON (no markdown):
{"topicPerformance":[{"topic":"<topic>","avgD7":<number>,"episodeCount":<number>,"vsBaseline":"<e.g. +18%>"}],"topTopic":"<best topic>","weakTopic":"<worst topic>","insight":"<1-2 sentence finding with numbers>","metric":"${metric}"}`;
  try {
    const raw = await callClaude(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function runTitleAnalysis(showName, episodes, ytVideos) {
  const mature = matureEps(episodes);
  const hasYT = ytVideos && ytVideos.length > 0;
  const ytAvg = hasYT ? Math.round(ytVideos.map(v=>v.ytViews).reduce((a,b)=>a+b,0)/ytVideos.length) : 0;
  const episodeData = hasYT
    ? ytVideos.map(v=>`"${v.ytTitle}" — ${fmt(v.ytViews)} YT views`)
    : mature.map(e=>`"${e.title}" — ${fmt(e.d7)} 7d downloads`);
  const metric = hasYT ? "YouTube views" : "7-day downloads";
  const avg = hasYT ? fmt(ytAvg) : fmt(showAvg(mature,"d7"));
  const prompt = `Analyze title patterns for ${showName}.
Episodes by ${metric}:
${episodeData.join("\n")}
Show avg: ${avg} ${metric}

Analyze: questions vs statements, titles with numbers, titles with "&" or "+", title length (<6 words vs longer), guest name in title.
Respond ONLY in JSON (no markdown):
{"patterns":[{"pattern":"<pattern>","avgD7":<number>,"count":<number>,"vsBaseline":"<e.g. +12%>","examples":["<title1>","<title2>"]}],"bestPattern":"<winner>","insight":"<1-2 sentence actionable finding>","metric":"${metric}"}`;
  try {
    const raw = await callClaude(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false); const [shake,setShake]=useState(false);
  const submit=()=>{if(pw===PASSWORD){onLogin();}else{setErr(true);setShake(true);setTimeout(()=>setShake(false),600);}};
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D0D0D",fontFamily:"'DM Mono',monospace"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        .lb{background:#141414;border:1px solid #2a2a2a;border-radius:2px;padding:48px;width:360px;text-align:center;}
        .ll{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#fff;margin-bottom:4px;}
        .ls{font-size:11px;color:#555;letter-spacing:.15em;text-transform:uppercase;margin-bottom:36px;}
        .li{width:100%;background:#0D0D0D;border:1px solid #2a2a2a;color:#fff;padding:12px 16px;font-family:'DM Mono',monospace;font-size:14px;border-radius:2px;outline:none;box-sizing:border-box;}
        .li:focus{border-color:#E8481C;}
        .lbt{width:100%;margin-top:12px;background:#E8481C;color:#fff;border:none;padding:13px;font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;}
        .le{font-size:12px;color:#E8481C;margin-top:10px;}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        .shake{animation:shake .3s ease;}`}</style>
      <div className={`lb${shake?" shake":""}`}>
        <div className="ll">PROF G</div>
        <div className="ls">Intelligence Dashboard</div>
        <input className="li" type="password" placeholder="Enter password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus/>
        {err&&<div className="le">Incorrect password</div>}
        <button className="lbt" onClick={submit}>Enter</button>
      </div>
    </div>
  );
}

// ── Takeaway Block ────────────────────────────────────────────────────────────
function TakeawayBlock({showName, episodes, color, ytVideos}) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const load=async()=>{setLoading(true);const r=await generateTakeaways(showName,episodes,ytVideos||[]);setData(r);setLoading(false);};
  return (
    <div style={{background:"#141414",border:`1px solid ${color}33`,borderRadius:"2px",padding:"20px 24px",marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"3px",height:"20px",background:color,borderRadius:"1px"}}/>
          <span style={{fontSize:"12px",fontWeight:"500",color:color,letterSpacing:".1em",textTransform:"uppercase"}}>{showName} — Weekly Takeaways</span>
          {data?.period&&<span style={{fontSize:"10px",color:"#444"}}>({data.period})</span>}
        </div>
        <button onClick={load} disabled={loading} style={{background:"transparent",border:`1px solid ${color}55`,color:color,padding:"5px 14px",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading?0.5:1}}>
          {loading?"Analyzing…":data?"Refresh":"Generate with AI"}
        </button>
      </div>
      {!data&&!loading&&<div style={{fontSize:"13px",color:"#444",fontStyle:"italic"}}>Click "Generate with AI" for this week's recommendations.</div>}
      {loading&&<div style={{fontSize:"13px",color:"#555"}}>Analyzing episodes…</div>}
      {data?.takeaways?.map((t,i)=>(
        <div key={i} style={{marginBottom:"12px",paddingLeft:"12px",borderLeft:`2px solid ${color}44`}}>
          <div style={{fontSize:"13px",fontWeight:"500",color:"#e0e0e0",marginBottom:"3px"}}>→ {t.title}</div>
          <div style={{fontSize:"13px",color:"#888",lineHeight:"1.6"}}>{t.detail}</div>
        </div>
      ))}
      {data?.trend&&<div style={{fontSize:"11px",color:"#555",marginTop:"8px"}}>Trend: {data.trend}</div>}
    </div>
  );
}

// ── Sentiment Button ──────────────────────────────────────────────────────────
function SentimentBtn({episode, showName, color}) {
  const [s,setS]=useState(null); const [loading,setLoading]=useState(false); const [open,setOpen]=useState(false);
  const load=async()=>{if(s){setOpen(!open);return;}setLoading(true);const r=await analyzeSentiment(episode,showName);setS(r);setLoading(false);setOpen(true);};
  return (
    <div>
      <button onClick={load} disabled={loading} style={{background:"transparent",border:"1px solid #333",color:s?color:"#666",padding:"4px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
        {loading?"…":s?`${s.score}/10`:"Analyze"}
      </button>
      {open&&s&&(
        <div style={{marginTop:"8px",background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"12px 14px"}}>
          <div style={{fontSize:"18px",fontWeight:"700",color,marginBottom:"6px",fontFamily:"'Playfair Display',serif"}}>{s.score}/10</div>
          <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px"}}>{s.summary}</div>
          {s.consensus?.map((c,i)=><div key={i} style={{fontSize:"12px",color:"#aaa",marginBottom:"5px",paddingLeft:"10px",borderLeft:`2px solid ${color}55`}}>"{c}"</div>)}
          <button onClick={()=>setOpen(false)} style={{marginTop:"8px",background:"transparent",border:"none",color:"#444",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>close ↑</button>
        </div>
      )}
    </div>
  );
}

// ── Insights Panel ────────────────────────────────────────────────────────────
function InsightsPanel({show, seedEpisodes, ytVideos}) {
  const {name, color} = show;
  const mature = matureEps(seedEpisodes);
  const [guests,setGuests]=useState(null);
  const [topics,setTopics]=useState(null);
  const [titles,setTitles]=useState(null);
  const [loading,setLoading]=useState({guests:false,topics:false,titles:false});

  const load = async (type) => {
    setLoading(prev=>({...prev,[type]:true}));
    if (type==="guests") { const r=await runGuestAnalysis(name,mature,ytVideos); setGuests(r); }
    if (type==="topics") { const r=await runTopicAnalysis(name,mature,ytVideos); setTopics(r); }
    if (type==="titles") { const r=await runTitleAnalysis(name,mature,ytVideos); setTitles(r); }
    setLoading(prev=>({...prev,[type]:false}));
  };

  const Block = ({title, type, result}) => (
    <div style={{background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px",marginBottom:"10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <span style={{fontSize:"11px",color,letterSpacing:".1em",textTransform:"uppercase",fontWeight:"500"}}>{title}</span>
        <button onClick={()=>load(type)} disabled={loading[type]} style={{background:"transparent",border:`1px solid ${color}44`,color,padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading[type]?0.5:1}}>
          {loading[type]?"Analyzing…":result?"Refresh":"Run Analysis"}
        </button>
      </div>
      {!result&&!loading[type]&&<div style={{fontSize:"12px",color:"#444",fontStyle:"italic"}}>
        {type==="guests"?ytVideos.length>0?`Using ${ytVideos.length} live YouTube episodes with descriptions.`:"Load Live YouTube Stats first for best results — will use spreadsheet titles only otherwise.":ytVideos.length>0?`Using ${ytVideos.length} live YouTube episodes as primary data source.`:"Click Run Analysis — or load YouTube stats first for richer data."}
      </div>}
      {loading[type]&&<div style={{fontSize:"12px",color:"#555"}}>Analyzing{type==="guests"&&ytVideos.length>0?` ${ytVideos.length} YouTube episodes`:""}…</div>}
      
      {result&&type==="guests"&&(
        <div>
          <div style={{fontSize:"10px",color:"#444",marginBottom:"10px"}}>Guest ep avg uses spreadsheet download data. "—" = recent YouTube episode not yet in your downloads sheet.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[
              {label:`Guest ep avg ${result.metric==="YouTube views"?"(YT views)":"(7d DL)"}`,val:result.guestAvg>0?fmt(result.guestAvg):"—"},
              {label:`Solo ep avg ${result.metric==="YouTube views"?"(YT views)":"(7d DL)"}`,val:result.soloAvg>0?fmt(result.soloAvg):"—"},
              {label:"Guest vs solo",val:result.delta||"N/A",accent:result.delta?.includes("+")?"#4CAF50":result.delta?.includes("-")?"#E8481C":"#888"},
            ].map((m,i)=>(
              <div key={i} style={{background:"#141414",borderRadius:"2px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"4px"}}>{m.label}</div>
                <div style={{fontSize:"16px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
              </div>
            ))}
          </div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",marginBottom:"6px",padding:"4px 0"}}>
            <div style={{fontSize:"10px",color:"#555",flex:1}}>GUEST</div>
            <div style={{fontSize:"10px",color:"#555",width:"180px"}}>EPISODE</div>
            <div style={{fontSize:"10px",color:"#555",width:"80px",textAlign:"right"}}>{result.metric==="YouTube views"?"YT VIEWS":"7D DL"}</div>
          </div>
          {result.guestEpisodes?.filter(e=>e.guest).slice(0,6).map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{color:"#ccc",flex:1,fontWeight:"500"}}>{e.guest}</span>
              <span style={{color:"#555",width:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"11px"}}>{e.title?.slice(0,35)}</span>
              <span style={{color:"#e0e0e0",width:"80px",textAlign:"right",whiteSpace:"nowrap"}}>{e.views>0?fmt(e.views):e.d7>0?fmt(e.d7):"—"}</span>
            </div>
          ))}
        </div>
      )}
      {result&&type==="topics"&&(
        <div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"12px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",padding:"6px 10px",background:"#141414",borderRadius:"2px"}}>
            <div style={{fontSize:"10px",color:"#555",flex:1}}>TOPIC</div>
            <div style={{fontSize:"10px",color:"#555",width:"40px",textAlign:"center"}}>EPS</div>
            <div style={{fontSize:"10px",color:"#555",width:"60px",textAlign:"right"}}>AVG {(result.metric||"7d DL").toUpperCase().replace("7-DAY DOWNLOADS","7D DL").replace("YOUTUBE VIEWS","YT VIEWS")}</div>
            <div style={{fontSize:"10px",color:"#555",width:"60px",textAlign:"right"}}>VS AVG</div>
          </div>
          {result.topicPerformance?.slice(0,6).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 10px",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{flex:1,fontSize:"12px",color:"#ccc"}}>{t.topic}</div>
              <div style={{fontSize:"12px",color:"#888",width:"40px",textAlign:"center"}}>{t.episodeCount}</div>
              <div style={{fontSize:"12px",color:"#e0e0e0",width:"60px",textAlign:"right"}}>{fmt(t.avgD7)}</div>
              <div style={{fontSize:"11px",fontWeight:"500",color:t.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",width:"60px",textAlign:"right"}}>{t.vsBaseline}</div>
            </div>
          ))}
        </div>
      )}
      {result&&type==="titles"&&(
        <div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"12px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px",padding:"6px 10px",background:"#141414",borderRadius:"2px"}}>
            <div style={{fontSize:"10px",color:"#555",flex:1}}>TITLE PATTERN</div>
            <div style={{fontSize:"10px",color:"#555",width:"80px",textAlign:"right"}}>AVG {(result.metric||"7d DL").toUpperCase().replace("7-DAY DOWNLOADS","7D DL").replace("YOUTUBE VIEWS","YT VIEWS")}</div>
            <div style={{fontSize:"10px",color:"#555",width:"60px",textAlign:"right"}}>VS AVG</div>
          </div>
          {result.patterns?.map((p,i)=>(
            <div key={i} style={{marginBottom:"8px",paddingBottom:"8px",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"0 10px"}}>
                <span style={{fontSize:"12px",color:"#ccc",fontWeight:"500",flex:1}}>{p.pattern}</span>
                <span style={{fontSize:"12px",color:"#888",width:"80px",textAlign:"right"}}>{fmt(p.avgD7)} · {p.count} eps</span>
                <span style={{fontSize:"12px",color:p.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",fontWeight:"500",width:"60px",textAlign:"right"}}>{p.vsBaseline}</span>
              </div>
              {p.examples?.[0]&&<div style={{fontSize:"10px",color:"#444",marginTop:"3px",padding:"0 10px"}}>e.g. "{p.examples[0].slice(0,55)}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{marginTop:"20px"}}>
      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"12px"}}>Deep Insights</div>
      <Block title="Guest Performance" type="guests" result={guests}/>
      <Block title="Topic Performance Index" type="topics" result={topics}/>
      <Block title="Title Pattern Analysis" type="titles" result={titles}/>
    </div>
  );
}

// ── Show Page ─────────────────────────────────────────────────────────────────
function ShowPage({show}) {
  const {name,color,data,channelId}=show;
  const [ytVideos,setYtVideos]=useState([]);
  const [ytLoading,setYtLoading]=useState(false);
  const [ytLoaded,setYtLoaded]=useState(false);
  const [sort,setSort]=useState("d7");
  const [episodes]=useState(data);
  const [liveEpisodes,setLiveEpisodes]=useState(data);

  const loadYT = async () => {
    setYtLoading(true);
    // Fetch YouTube and Sheet in parallel
    const [videos, sheetEps] = await Promise.all([
      fetchYouTubeData(channelId),
      fetchSheetData(SHEET_ID)
    ]);
    setYtVideos(videos);
    // Merge sheet data: sheet episodes not already in seed data
    if (sheetEps.length > 0) {
      const seedTitles = new Set(data.map(e => e.title.toLowerCase().slice(0,30)));
      const newEps = sheetEps.filter(e => !seedTitles.has(e.title.toLowerCase().slice(0,30)));
      if (newEps.length > 0) {
        setLiveEpisodes([...data, ...newEps].sort((a,b) => {
          const da = new Date(a.date.split("/").length===3?`${a.date.split("/")[2]}-${a.date.split("/")[0].padStart(2,"0")}-${a.date.split("/")[1].padStart(2,"0")}`:a.date);
          const db = new Date(b.date.split("/").length===3?`${b.date.split("/")[2]}-${b.date.split("/")[0].padStart(2,"0")}-${b.date.split("/")[1].padStart(2,"0")}`:b.date);
          return da - db;
        }));
      }
    }
    setYtLoaded(true);
    setYtLoading(false);
  };

  const mature = matureEps(liveEpisodes);
  const sorted = [...liveEpisodes].sort((a,b)=>(b[sort]||0)-(a[sort]||0));
  const last4 = [...mature].sort((a,b)=>episodeAgeDays(a.date)-episodeAgeDays(b.date)).slice(-4);
  const prior4 = [...mature].sort((a,b)=>episodeAgeDays(a.date)-episodeAgeDays(b.date)).slice(-8,-4);
  const last4avg = last4.length?Math.round(last4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/last4.length):0;
  const prior4avg = prior4.length?Math.round(prior4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/prior4.length):0;
  const trend = prior4avg?Math.round(((last4avg-prior4avg)/prior4avg)*100):0;
  const best = topEp(episodes);
  const ytAvgViews = ytVideos.length?Math.round(ytVideos.map(v=>v.ytViews).reduce((a,b)=>a+b,0)/ytVideos.length):0;
  const ytAvgEng = ytVideos.length?(ytVideos.map(v=>v.ytViews>0?((v.ytLikes+v.ytComments)/v.ytViews*100):0).reduce((a,b)=>a+b,0)/ytVideos.length).toFixed(1):"—";

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <div style={{width:"4px",height:"28px",background:color,borderRadius:"2px"}}/>
          <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",margin:0}}>{name}</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginLeft:"16px"}}>
          <div style={{fontSize:"12px",color:"#555"}}>{episodes.length} episodes from your sheet</div>
          {!ytLoaded&&<button onClick={loadYT} disabled={ytLoading} style={{background:"transparent",border:`1px solid ${color}55`,color,padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",textTransform:"uppercase",letterSpacing:".08em"}}>
            {ytLoading?"Loading…":"Load Live YouTube Stats"}
          </button>}
          {ytLoaded&&<span style={{fontSize:"11px",color:"#4CAF50"}}>✓ {ytVideos.length} YT episodes + live sheet data loaded ({liveEpisodes.length} total)</span>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Rolling 4-wk avg",val:fmt(last4avg),sub:prior4avg?`${trend>=0?"+":""}${trend}% vs prior 4wk`:null,subColor:trend>=0?"#4CAF50":"#E8481C"},
          {label:"Best episode",val:fmt(best?.d7),sub:best?.title?.slice(0,28)+"…",accent:color},
          {label:"Avg YT views",val:ytLoaded?fmt(ytAvgViews):"—",sub:ytLoaded?"live from YouTube":"click Load YT"},
          {label:"Avg YT engagement",val:ytLoaded?`${ytAvgEng}%`:"—",sub:"likes+comments/views"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px"}}>
            <div style={{fontSize:"11px",color:"#555",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{m.label}</div>
            <div style={{fontSize:"22px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
            {m.sub&&<div style={{fontSize:"11px",color:m.subColor||"#555",marginTop:"4px"}}>{m.sub}</div>}
          </div>
        ))}
      </div>

      <TakeawayBlock showName={name} episodes={episodes} color={color} ytVideos={ytVideos}/>

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px",marginBottom:"0"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          {["d7","d30"].map(k=>(
            <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?color:"transparent",border:`1px solid ${sort===k?color:"#333"}`,color:sort===k?"#fff":"#555",padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
              {k==="d7"?"7-day DL":"30-day DL"}
            </button>
          ))}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",fontFamily:"'DM Mono',monospace"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #222"}}>
                {["Date","Episode","7d DL","30d DL","Age","Sentiment"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep,i)=>{
                const age = episodeAgeDays(ep.date);
                return (
                  <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px",color:"#555",whiteSpace:"nowrap"}}>{ep.date.split("/").slice(0,2).join("/")}</td>
                    <td style={{padding:"10px",color:"#ccc",maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title}</td>
                    <td style={{padding:"10px",color:"#e0e0e0",whiteSpace:"nowrap"}}>{fmt(ep.d7)}</td>
                    <td style={{padding:"10px",color:"#888",whiteSpace:"nowrap"}}>{fmt(ep.d30)}</td>
                    <td style={{padding:"10px",color:age<7?"#E8481C":"#555",whiteSpace:"nowrap"}}>{age<7?"<7d":`${age}d`}</td>
                    <td style={{padding:"10px"}}><SentimentBtn episode={ep} showName={name} color={color}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {ytLoaded&&ytVideos.length>0&&(
        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px",marginTop:"10px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>Live YouTube Episodes ({ytVideos.length})</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",fontFamily:"'DM Mono',monospace"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #222"}}>
                  {["Date","Episode","Views","Likes","Comments","Guest"].map(h=>(
                    <th key={h} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ytVideos.map((v,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px",color:"#555",whiteSpace:"nowrap"}}>{v.ytDate}</td>
                    <td style={{padding:"10px",color:"#ccc",maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.ytTitle}</td>
                    <td style={{padding:"10px",color:"#e0e0e0"}}>{fmt(v.ytViews)}</td>
                    <td style={{padding:"10px",color:"#888"}}>{fmt(v.ytLikes)}</td>
                    <td style={{padding:"10px",color:"#888"}}>{fmt(v.ytComments)}</td>
                    <td style={{padding:"10px",color:v.guest?color:"#333"}}>{v.guest||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InsightsPanel show={show} seedEpisodes={episodes} ytVideos={ytVideos}/>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage() {
  const shows = Object.values(SHOWS);
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const [ytData, setYtData] = useState({});
  const [ytLoading, setYtLoading] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      setYtLoading(true);
      const results = {};
      for (const show of shows) {
        if (show.channelId) {
          const videos = await fetchYouTubeData(show.channelId);
          if (videos.length > 0) {
            results[show.id] = {
              avgViews: Math.round(videos.map(v=>v.ytViews).reduce((a,b)=>a+b,0)/videos.length),
              topVideo: [...videos].sort((a,b)=>b.ytViews-a.ytViews)[0],
              count: videos.length
            };
          }
        }
      }
      setYtData(results);
      setYtLoading(false);
    };
    loadAll();
  }, []);

  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".15em",textTransform:"uppercase",marginBottom:"4px"}}>{today}</div>
        <h1 style={{fontSize:"28px",fontWeight:"900",color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 6px"}}>Weekly Snapshot</h1>
        <div style={{fontSize:"13px",color:"#666"}}>All three shows · AI-powered recommendations{ytLoading?" · loading YouTube data…":""}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"28px"}}>
        {shows.map(s=>{
          const mature=matureEps(s.data);
          const sorted=[...mature].sort((a,b)=>episodeAgeDays(a.date)-episodeAgeDays(b.date));
          const last4=sorted.slice(-4); const prior4=sorted.slice(-8,-4);
          const last4avg=last4.length?Math.round(last4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/last4.length):0;
          const prior4avg=prior4.length?Math.round(prior4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/prior4.length):0;
          const trend=prior4avg?Math.round(((last4avg-prior4avg)/prior4avg)*100):0;
          const best=topEp(s.data);
          const recentCount=s.data.filter(e=>episodeAgeDays(e.date)<7).length;
          return (
            <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{width:"3px",height:"16px",background:s.color,borderRadius:"1px"}}/>
                <span style={{fontSize:"12px",fontWeight:"500",color:s.color}}>{s.name}</span>
              </div>
              <div style={{fontSize:"24px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{fmt(last4avg)}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                <div style={{fontSize:"11px",color:"#555"}}>rolling 4-week avg</div>
                {prior4avg>0&&<div style={{fontSize:"11px",fontWeight:"500",color:trend>=0?"#4CAF50":"#E8481C"}}>{trend>=0?"+":""}{trend}% vs prior</div>}
              </div>
              {recentCount>0&&<div style={{fontSize:"11px",color:"#666",marginBottom:"8px"}}>⚠ {recentCount} ep too recent for 7d comparison</div>}
              {ytData[s.id]&&<div style={{fontSize:"11px",color:"#555",marginBottom:"8px"}}>{fmt(ytData[s.id].avgViews)} avg YT views · {ytData[s.id].count} recent eps</div>}
              <div style={{fontSize:"12px",color:"#ccc",lineHeight:"1.5",marginBottom:"4px"}}>{best?.title?.slice(0,55)}{(best?.title?.length||0)>55?"…":""}</div>
              <div style={{fontSize:"11px",color:"#555"}}>{fmt(best?.d7)} 7d · top episode</div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>AI Recommendations</div>
      {shows.map(s=><TakeawayBlock key={s.id} showName={s.name} episodes={s.data} color={s.color}/>)}
    </div>
  );
}

// ── Trends Page ───────────────────────────────────────────────────────────────
function TrendsPage() {
  const shows = Object.values(SHOWS);
  const [activeShow, setActiveShow] = useState("pgm");
  const show = SHOWS[activeShow];

  // Build monthly data
  const months = {};
  show.data.forEach(e => {
    const p = e.date.split("/");
    const yr = p[2]||"2025";
    const k = `${yr}-${p[0].padStart(2,"0")}`;
    if (!months[k]) months[k] = [];
    if (e.d7) months[k].push({d7: e.d7, title: e.title});
  });
  const monthKeys = Object.keys(months).sort();
  const monthAvgs = monthKeys.map(k => ({
    key: k,
    avg: Math.round(months[k].map(e=>e.d7).reduce((a,b)=>a+b,0)/months[k].length),
    count: months[k].length,
    top: [...months[k]].sort((a,b)=>b.d7-a.d7)[0]
  }));
  const maxAvg = Math.max(...monthAvgs.map(m=>m.avg));
  const overallAvg = Math.round(monthAvgs.map(m=>m.avg).reduce((a,b)=>a+b,0)/monthAvgs.length);

  // Top 10 all time
  const top10 = [...show.data].sort((a,b)=>(b.d7||0)-(a.d7||0)).slice(0,10);

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px"}}>Trends</h2>
        <div style={{fontSize:"13px",color:"#555"}}>Historical performance by show</div>
      </div>

      <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
        {shows.map(s=>(
          <button key={s.id} onClick={()=>setActiveShow(s.id)} style={{background:activeShow===s.id?s.color:"transparent",border:`1px solid ${activeShow===s.id?s.color:"#333"}`,color:activeShow===s.id?"#fff":s.color,padding:"6px 16px",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",letterSpacing:".04em"}}>
            {s.name}
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Overall avg 7d", val:fmt(overallAvg), sub:"across all episodes"},
          {label:"Best month", val:fmt(Math.max(...monthAvgs.map(m=>m.avg))), sub:monthAvgs.find(m=>m.avg===maxAvg)?.key.split("-").reverse().join("/")},
          {label:"Total episodes", val:show.data.length, sub:"in dataset"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px"}}>
            <div style={{fontSize:"11px",color:"#555",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{m.label}</div>
            <div style={{fontSize:"22px",fontWeight:"500",color:show.color,fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
            <div style={{fontSize:"11px",color:"#555",marginTop:"4px"}}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 24px",marginBottom:"14px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"16px"}}>Monthly avg 7-day downloads</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:"4px",height:"120px",marginBottom:"8px"}}>
          {monthAvgs.map((m,i)=>{
            const h = Math.round((m.avg/maxAvg)*120);
            const isRecent = i >= monthAvgs.length - 3;
            return (
              <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",minWidth:0}} title={`${m.key}: ${fmt(m.avg)} avg (${m.count} eps)`}>
                <div style={{fontSize:"8px",color:isRecent?show.color:"#444",whiteSpace:"nowrap"}}>{fmt(m.avg)}</div>
                <div style={{width:"100%",height:`${h}px`,background:show.color,opacity:isRecent?1:.5,borderRadius:"2px 2px 0 0",transition:"opacity .2s"}}/>
                <div style={{fontSize:"8px",color:"#333",transform:"rotate(-45deg)",transformOrigin:"center",marginTop:"4px",whiteSpace:"nowrap"}}>{m.key.split("-")[1]+"/"+m.key.split("-")[0].slice(-2)}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:"10px",color:"#333",textAlign:"right"}}>brighter bars = last 3 months</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>All-time top 10 episodes</div>
          {top10.map((ep,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{fontSize:"12px",color:show.color,minWidth:"20px",fontWeight:"500"}}>#{i+1}</div>
              <div style={{flex:1,fontSize:"12px",color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title}</div>
              <div style={{fontSize:"12px",color:"#e0e0e0",whiteSpace:"nowrap",fontWeight:"500"}}>{fmt(ep.d7)}</div>
            </div>
          ))}
        </div>

        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>Month by month</div>
          <div style={{maxHeight:"380px",overflowY:"auto"}}>
            {[...monthAvgs].reverse().map((m,i)=>{
              const prev = monthAvgs[monthAvgs.length - i - 2];
              const delta = prev ? Math.round(((m.avg-prev.avg)/prev.avg)*100) : null;
              return (
                <div key={m.key} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{fontSize:"12px",color:"#555",minWidth:"50px"}}>{m.key.split("-")[1]+"/"+m.key.split("-")[0].slice(-2)}</div>
                  <div style={{flex:1,fontSize:"12px",color:"#e0e0e0",fontWeight:"500"}}>{fmt(m.avg)}</div>
                  <div style={{fontSize:"11px",color:"#555"}}>{m.count} eps</div>
                  {delta!==null&&<div style={{fontSize:"11px",fontWeight:"500",color:delta>=0?"#4CAF50":"#E8481C",minWidth:"45px",textAlign:"right"}}>{delta>=0?"+":""}{delta}%</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed,setAuthed]=useState(false);
  const [page,setPage]=useState("home");
  if (!authed) return <LoginScreen onLogin={()=>setAuthed(true)}/>;
  const nav=[{id:"home",label:"Home"},{id:"pgm",label:"Prof G Markets"},{id:"pgp",label:"Prof G Pod"},{id:"rm",label:"Raging Moderates"},{id:"trends",label:"Trends"}];
  return (
    <div style={{minHeight:"100vh",background:"#0D0D0D",fontFamily:"'DM Mono',monospace",color:"#e0e0e0"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0D0D0D}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}`}</style>
      <div style={{position:"fixed",top:0,left:0,width:"200px",height:"100vh",background:"#0D0D0D",borderRight:"1px solid #1a1a1a",padding:"28px 0",display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"0 20px",marginBottom:"32px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:"900",color:"#fff"}}>PROF G</div>
          <div style={{fontSize:"9px",color:"#444",letterSpacing:".15em",textTransform:"uppercase",marginTop:"2px"}}>Intelligence</div>
        </div>
        {nav.map(n=>{
          const active=page===n.id; const show=SHOWS[n.id];
          return <button key={n.id} onClick={()=>setPage(n.id)} style={{background:"transparent",border:"none",textAlign:"left",padding:"9px 20px",fontSize:"12px",color:active?(show?.color||"#fff"):"#555",cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:".04em",borderLeft:`2px solid ${active?(show?.color||"#E8481C"):"transparent"}`,width:"100%"}}>{n.label}</button>;
        })}
        <div style={{marginTop:"auto",padding:"20px 20px 0",borderTop:"1px solid #1a1a1a"}}>
          <div style={{fontSize:"10px",color:"#333",lineHeight:"1.6"}}>profg2025<br/>profg-dashboard.vercel.app</div>
        </div>
      </div>
      <div style={{marginLeft:"200px",padding:"32px 36px",minHeight:"100vh"}}>
        <div style={{maxWidth:"900px"}}>
          {page==="home"&&<HomePage/>}
          {page==="pgm"&&<ShowPage show={SHOWS.pgm}/>}
          {page==="pgp"&&<ShowPage show={SHOWS.pgp}/>}
          {page==="rm"&&<ShowPage show={SHOWS.rm}/>}
          {page==="trends"&&<TrendsPage/>}
        </div>
      </div>
    </div>
  );
}
