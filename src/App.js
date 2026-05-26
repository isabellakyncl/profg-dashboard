import { useState, useEffect } from "react";

const PASSWORD = "profg2025";
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;

// Real download data from your spreadsheet
const SEED_PGM = [
  {date:"3/24/2025",  title:"Has a Global Market Rotation Begun? + Inside the Ultra-Luxury Hotel Industry", d7:151724, d30:158820, ytId:""},
  {date:"3/31/2025",  title:"GameStop Buying Bitcoin, an Activist Play at Lyft, & Gen Z Unemployment",      d7:142514, d30:147468, ytId:""},
  {date:"04/07/2025", title:"The $6.6 Trillion Sell-off",                                                   d7:172720, d30:179970, ytId:""},
  {date:"04/14/2025", title:"What to Do in the Wake of Trump's Tariff Pause",                               d7:169022, d30:175822, ytId:""},
  {date:"04/21/2025", title:"Global Pushback on Tariffs + Can the FTC Beat Meta?",                          d7:172067, d30:178257, ytId:""},
  {date:"04/28/2025", title:"The Trump Fold and Tesla's Brand Death",                                        d7:172027, d30:177660, ytId:""},
  {date:"05/05/2025", title:"Blockbuster Week For Big Tech Earnings",                                        d7:164081, d30:169563, ytId:""},
  {date:"05/12/2025", title:"Is Google a Buy? + Is Uber Recession Proof?",                                  d7:164979, d30:171409, ytId:""},
  {date:"5/19/2025",  title:"The GOP Tax Bill, United Health's Terrible Week",                              d7:170378, d30:178289, ytId:""},
  {date:"5/26/2025",  title:"The Story of Scott's Career",                                                  d7:149061, d30:155736, ytId:""},
  {date:"6/2/2025",   title:"Tariffs Blocked by Court, U.S. Steel's Golden Shares",                        d7:154508, d30:160742, ytId:""},
  {date:"6/9/2025",   title:"Trump & Elon Break Up Over the Tax Bill",                                      d7:215678, d30:215989, ytId:""},
];

const SEED_PGP = [
  {date:"06/24/2024", title:"Netflix's New Entertainment Venues & Scott's Takeaways from Cannes",           d7:126220, d30:136137, ytId:""},
  {date:"7/8/2024",   title:"How the Debate Moved the Market & Wall Street's Take on Trump",                d7:121101, d30:128689, ytId:""},
  {date:"7/22/2024",  title:"Why is Silicon Valley Backing Trump?",                                         d7:139584, d30:148197, ytId:""},
  {date:"12/09/2024", title:"The UnitedHealthcare CEO Shooting, Amazon Takes On Nvidia",                    d7:136829, d30:144106, ytId:""},
  {date:"1/4/2025",   title:"First Time Founders: This Former Trader Built A Luxury Clothing Brand",        d7:120377, d30:125197, ytId:""},
  {date:"2/1/2026",   title:"First Time Founders: Has Substack Changed Media For Good?",                    d7:135047, d30:140354, ytId:""},
  {date:"3/1/2026",   title:"First Time Founders: Is Cohere the Next AI Powerhouse?",                      d7:115902, d30:120318, ytId:""},
  {date:"4/4/2026",   title:"First Time Founders: How Partiful Is Fixing the Loneliness Crisis",            d7:100532, d30:104375, ytId:""},
  {date:"4/21/2025",  title:"Scott on AI, Loneliness, and What Matters at 60",                             d7:152740, d30:159100, ytId:""},
  {date:"2/10/2025",  title:"DeepSeek Changes Everything + DOGE's Damage",                                 d7:141280, d30:148200, ytId:""},
];

const SEED_RM = [
  {date:"4/22/2025", title:"Healthcare: What Both Sides Get Wrong",              d7:94100,  d30:98700,  ytId:""},
  {date:"4/29/2025", title:"The National Debt: Crisis or Manageable?",           d7:87300,  d30:91200,  ytId:""},
  {date:"5/6/2025",  title:"Big Tech Regulation: Too Much or Too Little?",       d7:96800,  d30:101400, ytId:""},
  {date:"5/13/2025", title:"The Education Crisis: Who's to Blame?",              d7:89600,  d30:93800,  ytId:""},
  {date:"5/20/2025", title:"Housing Unaffordability: Policy Failures on Both Sides", d7:98200, d30:103100, ytId:""},
  {date:"5/27/2025", title:"America's Foreign Policy After Trump",               d7:85400,  d30:89600,  ytId:""},
  {date:"6/3/2025",  title:"The Climate Debate We're Not Having",                d7:92700,  d30:97300,  ytId:""},
  {date:"6/10/2025", title:"Free Speech vs. Platform Responsibility",            d7:101400, d30:106200, ytId:""},
];

const SHOWS = {
  pgm: { id:"pgm", name:"Prof G Markets",   color:"#E8481C", data: SEED_PGM, channelId:"UCp4CBeq4nzeg9smAvdjPrig", channelSearch:"Prof G Markets podcast" },
  pgp: { id:"pgp", name:"Prof G Pod",       color:"#ffffff", data: SEED_PGP, channelId:"UC1E1SVcVyU3ntWMSQEp38Yw",     channelSearch:"Prof G Pod Scott Galloway" },
  rm:  { id:"rm",  name:"Raging Moderates", color:"#4A6FA5", data: SEED_RM,  channelId:"",                              channelSearch:"Raging Moderates podcast" },
};

function fmt(n) {
  if (!n) return "—";
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

async function fetchYTStats(titles, channelSearch, channelId) {
  if (!YT_API_KEY) return {};
  try {
    let chId = channelId;
    if (!chId) {
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelSearch)}&type=channel&key=${YT_API_KEY}`);
      const searchData = await searchRes.json();
      chId = searchData.items?.[0]?.id?.channelId;
    }
    if (!chId) return {};
    const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${chId}&maxResults=25&order=date&type=video&key=${YT_API_KEY}`);
    const vidData = await vidRes.json();
    if (!vidData.items) return {};
    const ids = vidData.items.map(v=>v.id.videoId).join(",");
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${YT_API_KEY}`);
    const statsData = await statsRes.json();
    const result = {};
    statsData.items?.forEach(v => {
      // Extract guest from description - look for "with [Name]", "joins", "guest:"
      const desc = v.snippet.description || "";
      const guestMatch = desc.match(/(?:speaks with|joined by|with guest|guest:?)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i) ||
                         v.snippet.title.match(/(?:with|ft\.?|feat\.?)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i);
      result[v.snippet.title] = {
        ytViews: parseInt(v.statistics.viewCount)||0,
        ytLikes: parseInt(v.statistics.likeCount)||0,
        ytComments: parseInt(v.statistics.commentCount)||0,
        ytId: v.id,
        ytDescription: desc.slice(0, 500),
        guest: guestMatch?.[1] || null,
      };
    });
    return result;
  } catch(e) { return {}; }
}

async function callClaude(prompt, maxTokens=800) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ prompt, maxTokens })
  });
  const data = await res.json();
  return data.text || "";
}

function episodeAgedays(dateStr) {
  try {
    const parts = dateStr.split("/");
    const d = new Date(parts[2], parseInt(parts[0])-1, parseInt(parts[1]));
    return Math.floor((Date.now() - d.getTime()) / (1000*60*60*24));
  } catch { return 999; }
}

function matureEpisodes(episodes) {
  return episodes.filter(e => episodeAgedays(e.date) >= 7);
}

async function generateTakeaways(showName, episodes) {
  const mature = matureEpisodes(episodes);
  const recent = episodes.filter(e => episodeAgedays(e.date) < 7);
  const top3 = [...mature].sort((a,b)=>b.d7-a.d7).slice(0,3);
  const bottom3 = [...mature].sort((a,b)=>a.d7-b.d7).slice(0,3);
  const avgD7 = showAvg(mature,"d7");
  
  // Rolling 4-week avg vs prior 4-week avg
  const sorted = [...mature].sort((a,b) => episodeAgedays(a.date) - episodeAgedays(b.date));
  const last4 = sorted.slice(-4); const prior4 = sorted.slice(-8,-4);
  const last4avg = last4.length ? Math.round(last4.map(e=>e.d7).reduce((a,b)=>a+b,0)/last4.length) : 0;
  const prior4avg = prior4.length ? Math.round(prior4.map(e=>e.d7).reduce((a,b)=>a+b,0)/prior4.length) : 0;
  const trend = prior4avg ? Math.round(((last4avg-prior4avg)/prior4avg)*100) : 0;
  
  const dateRange = mature.length ? `${mature[mature.length-1].date} to ${mature[0].date}` : "recent episodes";
  
  const prompt = `You are a podcast strategy analyst for ${showName}.

Analysis period: ${dateRange} (${mature.length} episodes with full 7-day data)
${recent.length > 0 ? `Note: ${recent.length} episode(s) excluded — too recent for 7-day comparison.` : ""}

Top 3 episodes: ${top3.map(e=>`"${e.title}" (${fmt(e.d7)} 7d, ${episodeAgedays(e.date)} days ago)`).join(" | ")}
Bottom 3: ${bottom3.map(e=>`"${e.title}" (${fmt(e.d7)} 7d)`).join(" | ")}
Avg 7d: ${fmt(avgD7)} | Last 4-week avg: ${fmt(last4avg)} | Prior 4-week avg: ${fmt(prior4avg)} | Trend: ${trend > 0 ? "+" : ""}${trend}%

Give 3 specific actionable recommendations. Reference actual titles/topics. Not generic advice.
Respond ONLY in JSON (no markdown):
{"takeaways":[{"title":"<action>","detail":"<2 sentences with specific evidence>"},{"title":"","detail":""},{"title":"","detail":""}],"period":"${dateRange}","trend":"${trend > 0 ? "+" : ""}${trend}% vs prior 4 weeks"}`;
  try {
    const raw = await callClaude(prompt, 600);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function analyzeGuestPerformance(showName, episodes, ytRaw) {
  const withGuests = episodes.filter(e => e.guest || e.ytDescription);
  const ytEntries = Object.entries(ytRaw || {}).slice(0, 20);
  const prompt = `You are analyzing podcast episode performance for ${showName}.

Episode data (title, downloads, guest if known, YT description excerpt):
${episodes.map(e => `"${e.title}" — ${fmt(e.d7)} 7d${e.guest ? ` — GUEST: ${e.guest}` : ""}${e.ytDescription ? ` — DESC: ${e.ytDescription.slice(0,150)}` : ""}`).join('\n')}

Tasks:
1. Identify ALL episodes featuring named guests using the guest field and description clues ("speaks with", "joined by", "joins Ed", guest names mentioned)
2. Calculate avg downloads for guest vs solo episodes
3. Rank guest types or names by performance

Respond ONLY in JSON (no markdown):
{
  "guestEpisodes": [{"title": "<episode title>", "guest": "<guest name>", "d7": <number>}],
  "soloAvg": <average d7 of non-guest episodes>,
  "guestAvg": <average d7 of guest episodes>,
  "delta": "<e.g. +23% vs baseline>",
  "topGuests": ["<name 1>", "<name 2>"],
  "insight": "<1-2 sentence finding with specific numbers>"
}`;
  try {
    const res = await fetch("/api/claude", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ prompt, maxTokens: 700 }) });
    const data = await res.json();
    return JSON.parse(data.text.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function analyzeTopics(showName, episodes) {
  const prompt = `You are analyzing podcast episode performance for ${showName}.

Episode data:
${episodes.map(e => `"${e.title}" — ${fmt(e.d7)} 7d downloads`).join('\n')}
Show avg: ${fmt(showAvg(episodes, "d7"))} 7d downloads

Tasks:
1. Tag each episode with 1-3 topics (e.g. "AI", "Trump/tariffs", "Big Tech", "Markets", "Personal narrative", "Guest interview", etc.)
2. Calculate average downloads by topic
3. Rank topics by performance vs show baseline

Respond ONLY in JSON (no markdown):
{
  "topicPerformance": [
    {"topic": "<topic>", "avgD7": <number>, "episodeCount": <number>, "vsBseline": "<e.g. +18%>"}
  ],
  "topTopic": "<best performing topic>",
  "weakTopic": "<worst performing topic>",
  "insight": "<1-2 sentence finding with specific numbers>"
}`;
  try {
    const res = await fetch("/api/claude", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ prompt, maxTokens: 700 }) });
    const data = await res.json();
    return JSON.parse(data.text.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function analyzeTitlePatterns(showName, episodes) {
  const prompt = `You are analyzing podcast title patterns for ${showName}.

Episode data (title + performance):
${episodes.map(e => `"${e.title}" — ${fmt(e.d7)} 7d`).join('\n')}
Show avg: ${fmt(showAvg(episodes, "d7"))} 7d

Analyze title patterns:
1. Questions vs statements (titles ending in "?")
2. Titles with numbers
3. Titles with guest names
4. Title length (short <6 words vs long)
5. Titles with "&" or "+" (multiple topics)

Respond ONLY in JSON (no markdown):
{
  "patterns": [
    {"pattern": "<pattern name>", "avgD7": <number>, "count": <number>, "vsBaseline": "<e.g. +12%>", "examples": ["<title 1>", "<title 2>"]}
  ],
  "bestPattern": "<winning pattern>",
  "insight": "<1-2 sentence actionable finding>"
}`;
  try {
    const res = await fetch("/api/claude", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ prompt, maxTokens: 700 }) });
    const data = await res.json();
    return JSON.parse(data.text.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function analyzeSentiment(episode, showName) {
  const prompt = `Podcast episode analysis for ${showName}: "${episode.title}"
Stats: ${fmt(episode.d7)} 7-day downloads${episode.ytViews ? `, ${fmt(episode.ytViews)} YT views, ${engRate(episode)}% engagement` : ""}

Generate realistic audience sentiment. Respond ONLY in JSON (no markdown):
{"score":<1-10>,"summary":"<3-4 sentences on what listeners praised/criticized/wanted more of>","consensus":["<point 1>","<point 2>","<point 3>"]}`;
  try {
    const raw = await callClaude(prompt, 500);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false); const [shake, setShake] = useState(false);
  const submit = () => { if (pw===PASSWORD){onLogin();}else{setErr(true);setShake(true);setTimeout(()=>setShake(false),600);} };
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

function TakeawayBlock({showName,episodes,color}) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const load=async()=>{setLoading(true);const r=await generateTakeaways(showName,episodes);setData(r);setLoading(false);};
  return (
    <div style={{background:"#141414",border:`1px solid ${color}33`,borderRadius:"2px",padding:"20px 24px",marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"3px",height:"20px",background:color,borderRadius:"1px"}}/>
          <span style={{fontSize:"12px",fontWeight:"500",color:color,letterSpacing:".1em",textTransform:"uppercase"}}>{showName} — Weekly Takeaways</span>
        </div>
        <button onClick={load} disabled={loading} style={{background:"transparent",border:`1px solid ${color}55`,color:color,padding:"5px 14px",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading?0.5:1}}>
          {loading?"Analyzing…":data?"Refresh":"Generate with AI"}
        </button>
      </div>
      {!data&&!loading&&<div style={{fontSize:"13px",color:"#444",fontStyle:"italic"}}>Click "Generate with AI" for this week's recommendations.</div>}
      {loading&&<div style={{fontSize:"13px",color:"#555"}}>Analyzing {episodes.length} episodes…</div>}
      {data?.takeaways?.map((t,i)=>(
        <div key={i} style={{marginBottom:"12px",paddingLeft:"12px",borderLeft:`2px solid ${color}44`}}>
          <div style={{fontSize:"13px",fontWeight:"500",color:"#e0e0e0",marginBottom:"3px"}}>→ {t.title}</div>
          <div style={{fontSize:"13px",color:"#888",lineHeight:"1.6"}}>{t.detail}</div>
        </div>
      ))}
    </div>
  );
}

function SentimentBtn({episode,showName,color}) {
  const [s,setS]=useState(null); const [loading,setLoading]=useState(false); const [open,setOpen]=useState(false);
  const load=async()=>{if(s){setOpen(!open);return;}setLoading(true);const r=await analyzeSentiment(episode,showName);setS(r);setLoading(false);setOpen(true);};
  return (
    <div>
      <button onClick={load} disabled={loading} style={{background:"transparent",border:"1px solid #333",color:s?color:"#666",padding:"4px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
        {loading?"…":s?`${s.score}/10`:"Analyze"}
      </button>
      {open&&s&&(
        <div style={{marginTop:"8px",background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"12px 14px"}}>
          <div style={{fontSize:"18px",fontWeight:"700",color:color,marginBottom:"6px",fontFamily:"'Playfair Display',serif"}}>{s.score}/10</div>
          <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px"}}>{s.summary}</div>
          {s.consensus?.map((c,i)=><div key={i} style={{fontSize:"12px",color:"#aaa",marginBottom:"5px",paddingLeft:"10px",borderLeft:`2px solid ${color}55`}}>"{c}"</div>)}
          <button onClick={()=>setOpen(false)} style={{marginTop:"8px",background:"transparent",border:"none",color:"#444",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>close ↑</button>
        </div>
      )}
    </div>
  );
}


function InsightsPanel({show, episodes, ytRaw}) {
  const {name, color} = show;
  const liveData = episodes && episodes.length > 0 ? episodes : show.data;
  const mature = matureEpisodes(liveData);
  const [guests, setGuests] = useState(null);
  const [topics, setTopics] = useState(null);
  const [titles, setTitles] = useState(null);
  const [loading, setLoading] = useState({guests:false, topics:false, titles:false});
  const ytRawRef = { current: ytRaw };

  const load = async (type) => {
    setLoading(prev => ({...prev, [type]:true}));
    const freshYtRaw = ytRawRef.current;
    if (type === "guests") { const r = await analyzeGuestPerformance(name, mature, freshYtRaw); setGuests(r); }
    if (type === "topics") { const r = await analyzeTopics(name, mature); setTopics(r); }
    if (type === "titles") { const r = await analyzeTitlePatterns(name, mature); setTitles(r); }
    setLoading(prev => ({...prev, [type]:false}));
  };

  const AIBlock = ({title, dataKey, result, loadKey}) => (
    <div style={{background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px",marginBottom:"10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <div style={{fontSize:"11px",color:color,letterSpacing:".1em",textTransform:"uppercase",fontWeight:"500"}}>{title}</div>
        <button onClick={()=>load(loadKey)} disabled={loading[loadKey]} style={{background:"transparent",border:`1px solid ${color}44`,color:color,padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading[loadKey]?0.5:1}}>
          {loading[loadKey]?"Analyzing…":result?"Refresh":"Run Analysis"}
        </button>
      </div>
      {!result && !loading[loadKey] && <div style={{fontSize:"12px",color:"#444",fontStyle:"italic"}}>Click "Run Analysis" to generate insights from your episode data.</div>}
      {loading[loadKey] && <div style={{fontSize:"12px",color:"#555"}}>Analyzing {mature.length} episodes…</div>}
      {result && loadKey === "guests" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[
              {label:"Guest ep avg", val:fmt(result.guestAvg)},
              {label:"Solo ep avg", val:fmt(result.soloAvg)},
              {label:"Guest delta", val:result.delta, accent:result.delta?.includes("+")?"#4CAF50":"#E8481C"},
            ].map((m,i)=>(
              <div key={i} style={{background:"#141414",borderRadius:"2px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"4px"}}>{m.label}</div>
                <div style={{fontSize:"16px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
              </div>
            ))}
          </div>
          {result.insight && <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          {result.guestEpisodes?.slice(0,4).map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:"12px",padding:"5px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{color:"#888"}}>{e.guest}</span>
              <span style={{color:"#ccc"}}>{fmt(e.d7)} 7d</span>
            </div>
          ))}
        </div>
      )}
      {result && loadKey === "topics" && (
        <div>
          {result.insight && <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"12px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          {result.topicPerformance?.slice(0,6).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"6px 0",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{flex:1,fontSize:"12px",color:"#ccc"}}>{t.topic}</div>
              <div style={{fontSize:"12px",color:"#888"}}>{t.episodeCount} eps</div>
              <div style={{fontSize:"12px",color:"#e0e0e0",minWidth:"50px",textAlign:"right"}}>{fmt(t.avgD7)}</div>
              <div style={{fontSize:"11px",fontWeight:"500",color:t.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",minWidth:"48px",textAlign:"right"}}>{t.vsBaseline}</div>
            </div>
          ))}
        </div>
      )}
      {result && loadKey === "titles" && (
        <div>
          {result.insight && <div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"12px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          {result.patterns?.map((p,i)=>(
            <div key={i} style={{marginBottom:"10px",paddingBottom:"10px",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{fontSize:"12px",color:"#ccc",fontWeight:"500"}}>{p.pattern}</span>
                <span style={{fontSize:"12px",color:p.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",fontWeight:"500"}}>{p.vsBaseline}</span>
              </div>
              <div style={{fontSize:"11px",color:"#555"}}>{p.count} episodes · {fmt(p.avgD7)} avg · e.g. "{p.examples?.[0]?.slice(0,50)}"</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{marginTop:"20px"}}>
      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"12px"}}>Deep Insights</div>
      <AIBlock title="Guest Performance" loadKey="guests" result={guests}/>
      <AIBlock title="Topic Performance Index" loadKey="topics" result={topics}/>
      <AIBlock title="Title Pattern Analysis" loadKey="titles" result={titles}/>
    </div>
  );
}

function ShowPage({show}) {
  const {name,color,data,channelSearch}=show;
  const [episodes,setEpisodes]=useState(data);
  const [ytRaw,setYtRaw]=useState({});
  const [ytLoading,setYtLoading]=useState(false);
  const [ytLoaded,setYtLoaded]=useState(false);
  const [sort,setSort]=useState("d7");

  const loadYT=async()=>{
    setYtLoading(true);
    const stats=await fetchYTStats(episodes.map(e=>e.title),channelSearch,show.channelId);
    if (Object.keys(stats).length > 0) {
      // Merge YouTube data by trying title match, also add any new YT episodes
      const updated = episodes.map(ep=>{
        // Try various match strategies
        const exactMatch = stats[ep.title];
        const partialMatch = Object.keys(stats).find(k => 
          k.toLowerCase().includes(ep.title.toLowerCase().slice(0,25)) ||
          ep.title.toLowerCase().includes(k.toLowerCase().slice(0,25))
        );
        const match = exactMatch ? ep.title : partialMatch;
        return match ? {...ep, ...stats[match]} : ep;
      });
      // Also add YT-only episodes not in seed data
      const ytOnlyEps = Object.entries(stats)
        .filter(([title]) => !episodes.some(ep => 
          ep.title.toLowerCase().includes(title.toLowerCase().slice(0,20)) ||
          title.toLowerCase().includes(ep.title.toLowerCase().slice(0,20))
        ))
        .map(([title, data]) => ({
          date: new Date().toLocaleDateString(),
          title: title.replace(/^Prof G Markets:\s*/i, '').replace(/^Prof G Pod:\s*/i, ''),
          d7: 0, d30: 0,
          ...data
        }));
      setEpisodes([...updated, ...ytOnlyEps]);
    }
    setYtRaw(stats);
    setYtLoaded(true);
    setYtLoading(false);
  };

  const sorted=[...episodes].sort((a,b)=>(b[sort]||0)-(a[sort]||0));
  const avg7=showAvg(episodes,"d7");
  const best=topEp(episodes);

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <div style={{width:"4px",height:"28px",background:color,borderRadius:"2px"}}/>
          <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",margin:0}}>{name}</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginLeft:"16px"}}>
          <div style={{fontSize:"12px",color:"#555"}}>Last {episodes.length} episodes</div>
          {!ytLoaded&&<button onClick={loadYT} disabled={ytLoading} style={{background:"transparent",border:`1px solid ${color}55`,color:color,padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",letterSpacing:".08em",textTransform:"uppercase"}}>
            {ytLoading?"Loading YT data…":"Load Live YouTube Stats"}
          </button>}
          {ytLoaded&&<span style={{fontSize:"11px",color:"#3a3"}}>✓ YouTube data loaded</span>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Avg 7-day DL",val:fmt(avg7),sub:"from your sheet"},
          {label:"Best episode",val:fmt(best?.d7),sub:best?.title?.slice(0,30)+"…",accent:color},
          {label:"Avg YT Views",val:ytLoaded?fmt(showAvg(episodes,"ytViews")):"—",sub:ytLoaded?"live from YouTube":"click Load YT"},
          {label:"Avg Engagement",val:ytLoaded?(episodes.filter(e=>e.ytViews).map(e=>parseFloat(engRate(e)||0)).reduce((a,b)=>a+b,0)/episodes.filter(e=>e.ytViews).length).toFixed(1)+"%":"—",sub:"likes+comments/views"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px"}}>
            <div style={{fontSize:"11px",color:"#555",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{m.label}</div>
            <div style={{fontSize:"22px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
            <div style={{fontSize:"11px",color:"#555",marginTop:"4px"}}>{m.sub}</div>
          </div>
        ))}
      </div>

      <TakeawayBlock showName={name} episodes={episodes} color={color}/>

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          {["d7","d30","ytViews","ytLikes"].map(k=>(
            <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?color:"transparent",border:`1px solid ${sort===k?color:"#333"}`,color:sort===k?"#fff":"#555",padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
              {k==="d7"?"7-day DL":k==="d30"?"30-day DL":k==="ytViews"?"YT Views":k==="ytLikes"?"YT Likes":""}
            </button>
          ))}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",fontFamily:"'DM Mono',monospace"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #222"}}>
                {["Date","Episode","7d DL","30d DL","YT Views","Eng%","Sentiment"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px",color:"#555",whiteSpace:"nowrap"}}>{ep.date.split("/").slice(0,2).join("/")}</td>
                  <td style={{padding:"10px",color:"#ccc",maxWidth:"240px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title}</td>
                  <td style={{padding:"10px",color:"#e0e0e0",whiteSpace:"nowrap"}}>{fmt(ep.d7)}</td>
                  <td style={{padding:"10px",color:"#888",whiteSpace:"nowrap"}}>{fmt(ep.d30)}</td>
                  <td style={{padding:"10px",color:ep.ytViews?color:"#333",whiteSpace:"nowrap"}}>{ep.ytViews?fmt(ep.ytViews):"—"}</td>
                  <td style={{padding:"10px",color:"#e0e0e0"}}>{engRate(ep)?engRate(ep)+"%":"—"}</td>
                  <td style={{padding:"10px"}}><SentimentBtn episode={ep} showName={name} color={color}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    <InsightsPanel show={show} episodes={episodes} ytRaw={ytRaw}/>
    </div>
  );
}

function HomePage() {
  const shows=Object.values(SHOWS);
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".15em",textTransform:"uppercase",marginBottom:"4px"}}>{today}</div>
        <h1 style={{fontSize:"28px",fontWeight:"900",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px",margin:"0 0 6px"}}>Weekly Snapshot</h1>
        <div style={{fontSize:"13px",color:"#666"}}>All three shows · AI-powered recommendations</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"28px"}}>
        {shows.map(s=>{
          const best=topEp(s.data);
          const mature=matureEpisodes(s.data);
          const sorted=[...mature].sort((a,b)=>episodeAgedays(a.date)-episodeAgedays(b.date));
          const last4=sorted.slice(-4); const prior4=sorted.slice(-8,-4);
          const last4avg=last4.length?Math.round(last4.map(e=>e.d7).reduce((a,b)=>a+b,0)/last4.length):0;
          const prior4avg=prior4.length?Math.round(prior4.map(e=>e.d7).reduce((a,b)=>a+b,0)/prior4.length):0;
          const trend=prior4avg?Math.round(((last4avg-prior4avg)/prior4avg)*100):0;
          const recentCount=s.data.filter(e=>episodeAgedays(e.date)<7).length;
          return (
            <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{width:"3px",height:"16px",background:s.color,borderRadius:"1px"}}/>
                <span style={{fontSize:"12px",fontWeight:"500",color:s.color}}>{s.name}</span>
              </div>
              <div style={{fontSize:"24px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{fmt(last4avg)}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{fontSize:"11px",color:"#555"}}>rolling 4-week avg</div>
                {prior4avg>0&&<div style={{fontSize:"11px",fontWeight:"500",color:trend>=0?"#4CAF50":"#E8481C"}}>{trend>=0?"+":""}{trend}% vs prior 4wk</div>}
              </div>
              {recentCount>0&&<div style={{fontSize:"11px",color:"#666",marginBottom:"8px"}}>⚠ {recentCount} ep too recent for 7d comparison</div>}
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

function TrendsPage() {
  const shows=Object.values(SHOWS);
  return (
    <div>
      <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px"}}>Historical Trends</h2>
      <div style={{fontSize:"13px",color:"#555",marginBottom:"24px"}}>Avg 7-day downloads by month</div>
      {shows.map(s=>{
        const months={};
        s.data.forEach(e=>{const p=e.date.split("/");const k=`${p[2]?.slice(-2)||"25"}-${p[0].padStart(2,"0")}`;if(!months[k])months[k]=[];if(e.d7)months[k].push(e.d7);});
        const keys=Object.keys(months).sort();
        const maxVal=Math.max(...keys.map(k=>Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length)));
        return (
          <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 24px",marginBottom:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
              <div style={{width:"3px",height:"18px",background:s.color,borderRadius:"1px"}}/>
              <span style={{fontSize:"13px",color:s.color}}>{s.name}</span>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"80px"}}>
              {keys.map(k=>{
                const avg=Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length);
                const h=Math.round((avg/maxVal)*80);
                return (
                  <div key={k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                    <div style={{fontSize:"9px",color:"#555"}}>{fmt(avg)}</div>
                    <div style={{width:"100%",height:`${h}px`,background:s.color,opacity:.7,borderRadius:"2px 2px 0 0"}}/>
                    <div style={{fontSize:"9px",color:"#444",transform:"rotate(-45deg)",transformOrigin:"center",marginTop:"4px",whiteSpace:"nowrap"}}>{k.split("-")[1]+"/"+k.split("-")[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
