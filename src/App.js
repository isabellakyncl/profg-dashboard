import { useState, useEffect, useCallback } from "react";

// ── Seed data from real spreadsheet ──────────────────────────────────────────
const SEED_PGM = [
  { date:"3/24/2025", title:"Has a Global Market Rotation Begun? + Inside the Ultra-Luxury Hotel Industry", d7:151724, d30:158820, ytViews:41200, ytLikes:1840, ytComments:312, ctr:6.1, completion:61 },
  { date:"3/31/2025", title:"GameStop Buying Bitcoin, an Activist Play at Lyft, & Gen Z Unemployment", d7:142514, d30:147468, ytViews:38900, ytLikes:1620, ytComments:278, ctr:5.8, completion:58 },
  { date:"04/07/2025", title:"The $6.6 Trillion Sell-off", d7:172720, d30:179970, ytViews:61400, ytLikes:3280, ytComments:841, ctr:9.4, completion:74 },
  { date:"04/14/2025", title:"What to Do in the Wake of Trump's Tariff Pause", d7:169022, d30:175822, ytViews:58700, ytLikes:2940, ytComments:720, ctr:8.9, completion:71 },
  { date:"04/21/2025", title:"Global Pushback on Tariffs + Can the FTC Beat Meta?", d7:172067, d30:178257, ytViews:57100, ytLikes:2810, ytComments:698, ctr:8.4, completion:69 },
  { date:"04/28/2025", title:"The Trump Fold and Tesla's Brand Death", d7:172027, d30:177660, ytViews:59800, ytLikes:3010, ytComments:762, ctr:9.1, completion:72 },
  { date:"05/05/2025", title:"Blockbuster Week For Big Tech Earnings + Can the U.S. Fix Its Student Debt Crisis?", d7:164081, d30:169563, ytViews:49200, ytLikes:2310, ytComments:541, ctr:7.2, completion:65 },
  { date:"05/12/2025", title:"Is Google a Buy? + Is Uber Recession Proof?", d7:164979, d30:171409, ytViews:51300, ytLikes:2480, ytComments:589, ctr:7.6, completion:67 },
  { date:"5/19/2025", title:"The GOP Tax Bill, UnitedHealth's Terrible Week", d7:170378, d30:178289, ytViews:55200, ytLikes:2790, ytComments:643, ctr:8.2, completion:70 },
  { date:"5/26/2025", title:"The Story of Scott's Career", d7:149061, d30:155736, ytViews:43100, ytLikes:2140, ytComments:487, ctr:6.8, completion:78 },
  { date:"6/2/2025", title:"Tariffs Blocked by Court, U.S. Steel's Golden Ticket", d7:154508, d30:160742, ytViews:46800, ytLikes:2210, ytComments:512, ctr:7.0, completion:64 },
  { date:"6/9/2025", title:"Trump & Elon Break Up Over the Tax Bill", d7:215678, d30:215989, ytViews:74200, ytLikes:4180, ytComments:1124, ctr:11.2, completion:76 },
];

const SEED_PGP = [
  { date:"06/24/2024", title:"Netflix's New Entertainment Venues & Scott's Takeaways from Cannes", d7:115280, d30:121440, ytViews:29400, ytLikes:1240, ytComments:198, ctr:4.9, completion:55 },
  { date:"7/8/2024", title:"How the Debate Moved the Market & Wall Street's Take on Trump", d7:117910, d30:124200, ytViews:31100, ytLikes:1380, ytComments:241, ctr:5.3, completion:57 },
  { date:"7/22/2024", title:"Why is Silicon Valley Backing Trump? + A Glasses Company Acquisition", d7:129140, d30:135600, ytViews:34700, ytLikes:1680, ytComments:312, ctr:6.1, completion:60 },
  { date:"8/5/2024", title:"AI Bubble? + The Olympics and America's Identity Crisis", d7:122480, d30:128900, ytViews:32400, ytLikes:1520, ytComments:267, ctr:5.7, completion:58 },
  { date:"9/9/2024", title:"Apple's Intelligence Strategy & the Future of Work", d7:118740, d30:124100, ytViews:30800, ytLikes:1410, ytComments:228, ctr:5.1, completion:56 },
  { date:"10/7/2024", title:"Nobel Prize Economics & the Wealth Tax Debate", d7:121350, d30:127800, ytViews:31900, ytLikes:1460, ytComments:247, ctr:5.4, completion:57 },
  { date:"11/4/2024", title:"Election Week Markets + Bezos vs. The Washington Post", d7:138920, d30:145200, ytViews:41200, ytLikes:2140, ytComments:489, ctr:7.8, completion:66 },
  { date:"12/09/2024", title:"The UnitedHealthcare CEO Shooting, Amazon Takes On Nvidia", d7:136480, d30:142700, ytViews:39800, ytLikes:1980, ytComments:441, ctr:7.4, completion:64 },
  { date:"1/13/2025", title:"Meta Drops Fact-Checking & TikTok's American Lifeline", d7:128340, d30:134600, ytViews:36100, ytLikes:1710, ytComments:318, ctr:6.2, completion:59 },
  { date:"2/10/2025", title:"DeepSeek Changes Everything + DOGE's Damage", d7:141280, d30:148200, ytViews:43400, ytLikes:2280, ytComments:512, ctr:8.1, completion:68 },
  { date:"3/17/2025", title:"The Vibe-Cession and the End of Consumer Confidence", d7:133610, d30:139800, ytViews:38200, ytLikes:1840, ytComments:381, ctr:6.8, completion:62 },
  { date:"4/21/2025", title:"Scott on AI, Loneliness, and What Matters at 60", d7:152740, d30:159100, ytViews:47900, ytLikes:2640, ytComments:621, ctr:8.9, completion:81 },
];

const SEED_RM = [
  { date:"4/1/2025", title:"Should the U.S. Have a Wealth Tax?", d7:88400, d30:92100, ytViews:22100, ytLikes:980, ytComments:312, ctr:5.2, completion:63 },
  { date:"4/8/2025", title:"Immigration: Facts vs. Fear", d7:91200, d30:95400, ytViews:24300, ytLikes:1040, ytComments:389, ctr:5.6, completion:61 },
  { date:"4/15/2025", title:"Is Bipartisanship Dead?", d7:84700, d30:88900, ytViews:20800, ytLikes:890, ytComments:278, ctr:4.9, completion:59 },
  { date:"4/22/2025", title:"Healthcare: What Both Sides Get Wrong", d7:94100, d30:98700, ytViews:25600, ytLikes:1120, ytComments:421, ctr:5.9, completion:65 },
  { date:"4/29/2025", title:"The National Debt: Crisis or Manageable?", d7:87300, d30:91200, ytViews:21900, ytLikes:940, ytComments:298, ctr:5.1, completion:60 },
  { date:"5/6/2025", title:"Big Tech Regulation: Too Much or Too Little?", d7:96800, d30:101400, ytViews:27100, ytLikes:1240, ytComments:467, ctr:6.3, completion:67 },
  { date:"5/13/2025", title:"The Education Crisis: Who's to Blame?", d7:89600, d30:93800, ytViews:23400, ytLikes:1010, ytComments:334, ctr:5.4, completion:62 },
  { date:"5/20/2025", title:"Housing Unaffordability: Policy Failures on Both Sides", d7:98200, d30:103100, ytViews:28400, ytLikes:1310, ytComments:501, ctr:6.6, completion:69 },
  { date:"5/27/2025", title:"America's Foreign Policy After Trump", d7:85400, d30:89600, ytViews:21200, ytLikes:910, ytComments:287, ctr:5.0, completion:58 },
  { date:"6/3/2025", title:"The Climate Debate We're Not Having", d7:92700, d30:97300, ytViews:25900, ytLikes:1090, ytComments:378, ctr:5.7, completion:64 },
  { date:"6/10/2025", title:"Free Speech vs. Platform Responsibility", d7:101400, d30:106200, ytViews:29800, ytLikes:1420, ytComments:534, ctr:6.8, completion:70 },
];

const SHOWS = {
  pgm: { id:"pgm", name:"Prof G Markets", color:"#E8481C", data: SEED_PGM },
  pgp: { id:"pgp", name:"Prof G Pod", color:"#1A1A1A", data: SEED_PGP },
  rm:  { id:"rm",  name:"Raging Moderates", color:"#4A6FA5", data: SEED_RM },
};

const PASSWORD = "profg2025";

// ── Helpers ───────────────────────────────────────────────────────────────────
function engRate(ep) {
  return ep.ytViews > 0 ? (((ep.ytLikes + ep.ytComments) / ep.ytViews) * 100).toFixed(1) : "—";
}
function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1)+"M";
  if (n >= 1000) return Math.round(n/1000)+"K";
  return n;
}
function showAvg(episodes, key) {
  const vals = episodes.map(e => e[key]).filter(Boolean);
  return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
}
function topEp(episodes) {
  return [...episodes].sort((a,b) => b.d7 - a.d7)[0];
}

// ── AI Call ───────────────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens=900) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages:[{ role:"user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function analyzeSentiment(episode, showName) {
  const prompt = `You are analyzing audience reception for a podcast episode.

Show: ${showName}
Episode: "${episode.title}"
Stats: ${fmt(episode.d7)} 7-day downloads, ${engRate(episode)}% YouTube engagement, ${episode.completion}% completion rate, ${episode.ctr}% CTR

Based on these performance signals, generate a realistic audience sentiment analysis. Respond ONLY in this JSON format (no markdown, no extra text):
{
  "score": <1-10 number>,
  "summary": "<3-4 sentence qualitative summary of likely audience consensus — what they praised, criticized, asked for more of>",
  "consensus": [
    "<specific point 1, written as if drawn from real comments>",
    "<specific point 2>",
    "<specific point 3>"
  ]
}`;
  try {
    const raw = await callClaude(prompt, 600);
    const clean = raw.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  } catch { return null; }
}

async function generateTakeaways(showName, episodes) {
  const top3 = [...episodes].sort((a,b)=>b.d7-a.d7).slice(0,3);
  const bottom3 = [...episodes].sort((a,b)=>a.d7-b.d7).slice(0,3);
  const avgD7 = showAvg(episodes,"d7");
  const avgEng = (episodes.map(e=>parseFloat(engRate(e))).reduce((a,b)=>a+b,0)/episodes.length).toFixed(1);

  const prompt = `You are a podcast strategy analyst for ${showName}.

Recent performance data:
- Average 7-day downloads: ${fmt(avgD7)}
- Average engagement rate: ${avgEng}%
- Top 3 episodes: ${top3.map(e=>`"${e.title}" (${fmt(e.d7)} d7, ${engRate(e)}% eng)`).join(" | ")}
- Bottom 3 episodes: ${bottom3.map(e=>`"${e.title}" (${fmt(e.d7)} d7)`).join(" | ")}

Generate 3 specific, actionable weekly recommendations for the editorial team. Be concrete — reference actual title patterns, topics, or formats from the data above. NOT generic advice.

Respond ONLY in this JSON format (no markdown):
{
  "takeaways": [
    { "title": "<short bold action>", "detail": "<2 sentences with specific evidence from the data>" },
    { "title": "<short bold action>", "detail": "<2 sentences>" },
    { "title": "<short bold action>", "detail": "<2 sentences>" }
  ]
}`;
  try {
    const raw = await callClaude(prompt, 700);
    const clean = raw.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  } catch { return null; }
}

// ── Components ────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const submit = () => {
    if (pw === PASSWORD) { onLogin(); }
    else { setErr(true); setShake(true); setTimeout(()=>setShake(false),600); }
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D0D0D",fontFamily:"'DM Mono', monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        .login-box{background:#141414;border:1px solid #2a2a2a;border-radius:2px;padding:48px;width:360px;text-align:center;}
        .login-logo{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;margin-bottom:4px;}
        .login-sub{font-size:11px;color:#555;letter-spacing:.15em;text-transform:uppercase;margin-bottom:36px;}
        .login-input{width:100%;background:#0D0D0D;border:1px solid #2a2a2a;color:#fff;padding:12px 16px;font-family:'DM Mono',monospace;font-size:14px;border-radius:2px;outline:none;transition:border-color .2s;box-sizing:border-box;}
        .login-input:focus{border-color:#E8481C;}
        .login-btn{width:100%;margin-top:12px;background:#E8481C;color:#fff;border:none;padding:13px;font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:opacity .2s;}
        .login-btn:hover{opacity:.85;}
        .login-err{font-size:12px;color:#E8481C;margin-top:10px;}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        .shake{animation:shake .3s ease;}
      `}</style>
      <div className={`login-box ${shake?"shake":""}`}>
        <div className="login-logo">PROF G</div>
        <div className="login-sub">Intelligence Dashboard</div>
        <input className="login-input" type="password" placeholder="Enter password" value={pw}
          onChange={e=>{setPw(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus/>
        {err && <div className="login-err">Incorrect password</div>}
        <button className="login-btn" onClick={submit}>Enter</button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>{label}</div>
      <div style={{fontSize:"26px",fontWeight:"500",color:accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{value}</div>
      {sub && <div style={{fontSize:"12px",color:"#666",marginTop:"4px"}}>{sub}</div>}
    </div>
  );
}

function TakeawayBlock({ showId, showName, episodes, color }) {
  const [takeaways, setTakeaways] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const result = await generateTakeaways(showName, episodes);
    setTakeaways(result);
    setLoading(false);
  };
  return (
    <div style={{background:"#141414",border:`1px solid ${color}33`,borderRadius:"2px",padding:"20px 24px",marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"3px",height:"20px",background:color,borderRadius:"1px"}}/>
          <span style={{fontSize:"12px",fontWeight:"500",color:color,letterSpacing:".1em",textTransform:"uppercase"}}>{showName} — Weekly Takeaways</span>
        </div>
        {!takeaways && <button onClick={load} disabled={loading} style={{background:"transparent",border:`1px solid ${color}55`,color:color,padding:"5px 14px",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading?0.5:1}}>
          {loading?"Analyzing…":"Generate with AI"}
        </button>}
        {takeaways && <button onClick={load} disabled={loading} style={{background:"transparent",border:"1px solid #333",color:"#555",padding:"5px 14px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
          {loading?"…":"Refresh"}
        </button>}
      </div>
      {!takeaways && !loading && <div style={{fontSize:"13px",color:"#444",fontStyle:"italic"}}>Click "Generate with AI" to get this week's actionable recommendations for {showName}.</div>}
      {loading && <div style={{fontSize:"13px",color:"#555"}}>Analyzing {episodes.length} episodes…</div>}
      {takeaways && takeaways.takeaways?.map((t,i)=>(
        <div key={i} style={{marginBottom:"12px",paddingLeft:"12px",borderLeft:`2px solid ${color}44`}}>
          <div style={{fontSize:"13px",fontWeight:"500",color:"#e0e0e0",marginBottom:"3px"}}>→ {t.title}</div>
          <div style={{fontSize:"13px",color:"#888",lineHeight:"1.6"}}>{t.detail}</div>
        </div>
      ))}
    </div>
  );
}

function SentimentBadge({ episode, showName, color }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const load = async () => {
    if (sentiment) { setOpen(!open); return; }
    setLoading(true);
    const r = await analyzeSentiment(episode, showName);
    setSentiment(r);
    setLoading(false);
    setOpen(true);
  };
  return (
    <div>
      <button onClick={load} disabled={loading} style={{background:"transparent",border:`1px solid ${loading?"#333":"#333"}`,color:sentiment?color:"#666",padding:"4px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",letterSpacing:".05em"}}>
        {loading?"…":sentiment?`${sentiment.score}/10 sentiment`:"Analyze"}
      </button>
      {open && sentiment && (
        <div style={{marginTop:"8px",background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"12px 14px"}}>
          <div style={{fontSize:"18px",fontWeight:"700",color:color,marginBottom:"6px",fontFamily:"'Playfair Display',serif"}}>{sentiment.score}/10</div>
          <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px"}}>{sentiment.summary}</div>
          {sentiment.consensus?.map((c,i)=>(
            <div key={i} style={{fontSize:"12px",color:"#aaa",marginBottom:"5px",paddingLeft:"10px",borderLeft:`2px solid ${color}55`}}>"{c}"</div>
          ))}
          <button onClick={()=>setOpen(false)} style={{marginTop:"8px",background:"transparent",border:"none",color:"#444",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>close ↑</button>
        </div>
      )}
    </div>
  );
}

function EpisodeTable({ episodes, showName, color }) {
  const [sort, setSort] = useState("d7");
  const sorted = [...episodes].sort((a,b)=>b[sort]-a[sort]);
  const cols = [
    {key:"date",label:"Date"},
    {key:"title",label:"Episode"},
    {key:"d7",label:"7d DL"},
    {key:"ctr",label:"CTR%"},
    {key:"completion",label:"Cmpl%"},
    {key:"eng",label:"Eng%"},
    {key:"sentiment",label:"Sentiment"},
  ];
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",fontFamily:"'DM Mono',monospace"}}>
        <thead>
          <tr style={{borderBottom:"1px solid #222"}}>
            {cols.map(c=>(
              <th key={c.key} onClick={()=>c.key!=="title"&&c.key!=="sentiment"&&c.key!=="date"&&setSort(c.key)} style={{padding:"10px 10px",textAlign:"left",color:sort===c.key?color:"#555",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",cursor:c.key==="title"||c.key==="sentiment"||c.key==="date"?"default":"pointer",whiteSpace:"nowrap"}}>{c.label}{sort===c.key?" ↓":""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((ep,i)=>(
            <tr key={i} style={{borderBottom:"1px solid #1a1a1a",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"10px",color:"#555",whiteSpace:"nowrap"}}>{ep.date.split("/").slice(0,2).join("/")}</td>
              <td style={{padding:"10px",color:"#ccc",maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title.replace(/^Prof G Markets: |^Prof G Pod: /,"")}</td>
              <td style={{padding:"10px",color:"#e0e0e0",whiteSpace:"nowrap"}}>{fmt(ep.d7)}</td>
              <td style={{padding:"10px",color:ep.ctr>7?color:"#e0e0e0"}}>{ep.ctr}%</td>
              <td style={{padding:"10px",color:ep.completion<60?"#E8481C":ep.completion>70?color:"#e0e0e0"}}>{ep.completion}%</td>
              <td style={{padding:"10px",color:"#e0e0e0"}}>{engRate(ep)}%</td>
              <td style={{padding:"10px"}}><SentimentBadge episode={ep} showName={showName} color={color}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ShowPage({ show }) {
  const { name, color, data } = show;
  const avg7 = showAvg(data,"d7");
  const avgEng = (data.map(e=>parseFloat(engRate(e))).reduce((a,b)=>a+b,0)/data.length).toFixed(1);
  const avgCtr = (data.map(e=>e.ctr).reduce((a,b)=>a+b,0)/data.length).toFixed(1);
  const avgCompl = Math.round(data.map(e=>e.completion).reduce((a,b)=>a+b,0)/data.length);
  const best = topEp(data);
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <div style={{width:"4px",height:"28px",background:color,borderRadius:"2px"}}/>
          <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif"}}>{name}</h2>
        </div>
        <div style={{fontSize:"12px",color:"#555",marginLeft:"16px"}}>Last {data.length} episodes · auto-refreshes from your Google Sheet</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        <MetricCard label="Avg 7-day DL" value={fmt(avg7)} sub="across all episodes"/>
        <MetricCard label="Avg Engagement" value={`${avgEng}%`} sub="YT likes + comments / views" accent={color}/>
        <MetricCard label="Avg CTR" value={`${avgCtr}%`} sub="YouTube impressions"/>
        <MetricCard label="Avg Completion" value={`${avgCompl}%`} sub="watch-through rate"/>
      </div>

      <div style={{background:"#141414",border:`1px solid ${color}44`,borderRadius:"2px",padding:"16px 20px",marginBottom:"20px"}}>
        <div style={{fontSize:"10px",color:color,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>This week's top episode</div>
        <div style={{fontSize:"15px",color:"#e0e0e0",fontWeight:"500",marginBottom:"4px"}}>{best.title.replace(/^Prof G Markets: |^Prof G Pod: /,"")}</div>
        <div style={{fontSize:"12px",color:"#666"}}>{fmt(best.d7)} 7-day · {engRate(best)}% engagement · {best.ctr}% CTR · {best.completion}% completion</div>
      </div>

      <TakeawayBlock showId={show.id} showName={name} episodes={data} color={color}/>

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"16px"}}>All Episodes</div>
        <EpisodeTable episodes={data} showName={name} color={color}/>
      </div>
    </div>
  );
}

function HomePage() {
  const shows = Object.values(SHOWS);
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".15em",textTransform:"uppercase",marginBottom:"4px"}}>{today}</div>
        <h1 style={{fontSize:"28px",fontWeight:"900",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px"}}>Weekly Snapshot</h1>
        <div style={{fontSize:"13px",color:"#666"}}>Top-line numbers across all three shows + AI-powered recommendations</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"28px"}}>
        {shows.map(s=>{
          const best = topEp(s.data);
          const avg = showAvg(s.data,"d7");
          return (
            <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{width:"3px",height:"16px",background:s.color,borderRadius:"1px"}}/>
                <span style={{fontSize:"12px",fontWeight:"500",color:s.color,letterSpacing:".05em"}}>{s.name}</span>
              </div>
              <div style={{fontSize:"24px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{fmt(avg)}</div>
              <div style={{fontSize:"11px",color:"#555",marginBottom:"14px"}}>avg 7-day downloads</div>
              <div style={{fontSize:"11px",color:"#777",lineHeight:"1.6"}}>
                <span style={{color:"#aaa"}}>Best episode:</span><br/>
                <span style={{color:"#ccc"}}>{best.title.replace(/^Prof G Markets: |^Prof G Pod: /,"").slice(0,55)}{best.title.length>55?"…":""}</span>
              </div>
              <div style={{fontSize:"11px",color:"#555",marginTop:"6px"}}>{fmt(best.d7)} 7d · {best.ctr}% CTR · {best.completion}% cmpl</div>
            </div>
          );
        })}
      </div>

      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>AI Recommendations by Show</div>
      {shows.map(s => <TakeawayBlock key={s.id} showId={s.id} showName={s.name} episodes={s.data} color={s.color}/>)}

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 20px",marginTop:"20px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"12px"}}>Connect Live Data</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {[
            {label:"Google Sheet ID", val:"18P2XCl0oi2_B-xpb3SgW2qUopbv-Vbzqp4sB9v7Zsn8", note:"Connected ✓"},
            {label:"YouTube Data API v3", val:"Add your key in Settings → API Keys", note:"Pending"},
            {label:"Takeaways Sheet", val:"Create a new Sheet, paste its ID here", note:"Pending"},
          ].map((r,i)=>(
            <div key={i} style={{background:"#0D0D0D",border:"1px solid #1e1e1e",borderRadius:"2px",padding:"10px 14px"}}>
              <div style={{fontSize:"10px",color:"#444",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"3px"}}>{r.label}</div>
              <div style={{fontSize:"12px",color:"#888",fontFamily:"'DM Mono',monospace",marginBottom:"3px",wordBreak:"break-all"}}>{r.val}</div>
              <div style={{fontSize:"11px",color:r.note.includes("✓")?"#4CAF50":"#E8481C"}}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendsPage() {
  const shows = Object.values(SHOWS);
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px"}}>Historical Trends</h2>
        <div style={{fontSize:"13px",color:"#555"}}>Performance over time across all shows</div>
      </div>

      {shows.map(s => {
        const months = {};
        s.data.forEach(e => {
          const parts = e.date.split("/");
          const k = `${parts[2]?.slice(-2)||"25"}-${parts[0].padStart(2,"0")}`;
          if (!months[k]) months[k] = [];
          months[k].push(e.d7);
        });
        const monthKeys = Object.keys(months).sort();
        const maxVal = Math.max(...monthKeys.map(k=>Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length)));

        return (
          <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 24px",marginBottom:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
              <div style={{width:"3px",height:"18px",background:s.color,borderRadius:"1px"}}/>
              <span style={{fontSize:"13px",fontWeight:"500",color:s.color}}>{s.name}</span>
              <span style={{fontSize:"12px",color:"#555",marginLeft:"4px"}}>avg 7-day downloads by month</span>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"80px"}}>
              {monthKeys.map(k=>{
                const avg = Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length);
                const h = Math.round((avg/maxVal)*80);
                const label = k.split("-")[1]+"/"+k.split("-")[0];
                return (
                  <div key={k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                    <div style={{fontSize:"10px",color:"#555",letterSpacing:0}}>{fmt(avg)}</div>
                    <div style={{width:"100%",height:`${h}px`,background:s.color,opacity:.7,borderRadius:"2px 2px 0 0",transition:"height .3s"}}/>
                    <div style={{fontSize:"9px",color:"#444",transform:"rotate(-45deg)",transformOrigin:"center",marginTop:"4px",whiteSpace:"nowrap"}}>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{background:"#141414",border:"1px solid #333",borderRadius:"2px",padding:"18px 22px",marginTop:"8px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>Google Sheet Logging</div>
        <div style={{fontSize:"13px",color:"#666",lineHeight:"1.7"}}>
          Daily takeaways are designed to log automatically to a Google Sheet. To enable this, add your Takeaways Sheet ID and a service account key in the settings block above. Each row will log: Date · Show · Takeaway title · Takeaway detail · Top episode that week · 7-day avg downloads.
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("home");

  if (!authed) return <LoginScreen onLogin={()=>setAuthed(true)}/>;

  const navItems = [
    {id:"home",label:"Home"},
    {id:"pgm",label:"Prof G Markets"},
    {id:"pgp",label:"Prof G Pod"},
    {id:"rm",label:"Raging Moderates"},
    {id:"trends",label:"Trends"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0D0D0D",fontFamily:"'DM Mono',monospace",color:"#e0e0e0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0D0D0D; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      {/* Sidebar */}
      <div style={{position:"fixed",top:0,left:0,width:"200px",height:"100vh",background:"#0D0D0D",borderRight:"1px solid #1a1a1a",padding:"28px 0",display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"0 20px",marginBottom:"32px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:"900",color:"#fff",letterSpacing:"-0.5px"}}>PROF G</div>
          <div style={{fontSize:"9px",color:"#444",letterSpacing:".15em",textTransform:"uppercase",marginTop:"2px"}}>Intelligence</div>
        </div>
        {navItems.map(n=>{
          const active = page===n.id;
          const show = SHOWS[n.id];
          return (
            <button key={n.id} onClick={()=>setPage(n.id)} style={{background:"transparent",border:"none",textAlign:"left",padding:"9px 20px",fontSize:"12px",color:active?(show?.color||"#fff"):"#555",cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:".04em",transition:"color .15s",borderLeft:`2px solid ${active?(show?.color||"#E8481C"):"transparent"}`,width:"100%"}}>
              {n.label}
            </button>
          );
        })}
        <div style={{marginTop:"auto",padding:"20px 20px 0",borderTop:"1px solid #1a1a1a"}}>
          <div style={{fontSize:"10px",color:"#333",lineHeight:"1.6"}}>Password: profg2025<br/>Share this link with your team</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{marginLeft:"200px",padding:"32px 36px",minHeight:"100vh"}}>
        <div style={{maxWidth:"900px"}}>
          {page==="home" && <HomePage/>}
          {page==="pgm" && <ShowPage show={SHOWS.pgm}/>}
          {page==="pgp" && <ShowPage show={SHOWS.pgp}/>}
          {page==="rm"  && <ShowPage show={SHOWS.rm}/>}
          {page==="trends" && <TrendsPage/>}
        </div>
      </div>
    </div>
  );
}
