import { useState, useEffect, useRef } from "react";

const PASSWORD = "profg2025";
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;
const PGM_CHANNEL_ID = "UCp4CBeq4nzeg9smAvdjPrig";

// ── Seed download data from your spreadsheet ─────────────────────────────────
const SEED_PGM = [
  {date:"3/24/2025", title:"Has a Global Market Rotation Begun? + Inside the Ultra-Luxury Hotel Industry", d7:151724, d30:158820},
  {date:"3/31/2025", title:"GameStop Buying Bitcoin, an Activist Play at Lyft, & Gen Z Unemployment", d7:142514, d30:147468},
  {date:"04/07/2025", title:"The $6.6 Trillion Sell-off", d7:172720, d30:179970},
  {date:"04/14/2025", title:"What to Do in the Wake of Trump's Tariff Pause", d7:169022, d30:175822},
  {date:"04/21/2025", title:"Global Pushback on Tariffs + Can the FTC Beat Meta?", d7:172067, d30:178257},
  {date:"04/28/2025", title:"The Trump Fold and Tesla's Brand Death", d7:172027, d30:177660},
  {date:"05/05/2025", title:"Blockbuster Week For Big Tech Earnings", d7:164081, d30:169563},
  {date:"05/12/2025", title:"Is Google a Buy? + Is Uber Recession Proof?", d7:164979, d30:171409},
  {date:"5/19/2025", title:"The GOP Tax Bill, United Health's Terrible Week", d7:170378, d30:178289},
  {date:"5/26/2025", title:"The Story of Scott's Career", d7:149061, d30:155736},
  {date:"6/2/2025", title:"Tariffs Blocked by Court, U.S. Steel's Golden Shares", d7:154508, d30:160742},
  {date:"6/9/2025", title:"Trump & Elon Break Up Over the Tax Bill", d7:215678, d30:215989},
];

const SEED_PGP = [
  {date:"06/24/2024", title:"Netflix's New Entertainment Venues & Scott's Takeaways from Cannes", d7:126220, d30:136137},
  {date:"7/8/2024", title:"How the Debate Moved the Market & Wall Street's Take on Trump", d7:121101, d30:128689},
  {date:"7/22/2024", title:"Why is Silicon Valley Backing Trump?", d7:139584, d30:148197},
  {date:"12/09/2024", title:"The UnitedHealthcare CEO Shooting, Amazon Takes On Nvidia", d7:136829, d30:144106},
  {date:"1/4/2025", title:"First Time Founders: This Former Trader Built A Luxury Clothing Brand", d7:120377, d30:125197},
  {date:"2/1/2025", title:"First Time Founders: Has Substack Changed Media For Good?", d7:135047, d30:140354},
  {date:"3/1/2025", title:"First Time Founders: Is Cohere the Next AI Powerhouse?", d7:115902, d30:120318},
  {date:"4/4/2025", title:"First Time Founders: How Partiful Is Fixing the Loneliness Crisis", d7:100532, d30:104375},
  {date:"4/21/2025", title:"Scott on AI, Loneliness, and What Matters at 60", d7:152740, d30:159100},
  {date:"2/10/2025", title:"DeepSeek Changes Everything + DOGE's Damage", d7:141280, d30:148200},
];

const SEED_RM = [
  {date:"4/22/2025", title:"Healthcare: What Both Sides Get Wrong", d7:94100, d30:98700},
  {date:"4/29/2025", title:"The National Debt: Crisis or Manageable?", d7:87300, d30:91200},
  {date:"5/6/2025", title:"Big Tech Regulation: Too Much or Too Little?", d7:96800, d30:101400},
  {date:"5/13/2025", title:"The Education Crisis: Who's to Blame?", d7:89600, d30:93800},
  {date:"5/20/2025", title:"Housing Unaffordability: Policy Failures on Both Sides", d7:98200, d30:103100},
  {date:"5/27/2025", title:"America's Foreign Policy After Trump", d7:85400, d30:89600},
  {date:"6/3/2025", title:"The Climate Debate We're Not Having", d7:92700, d30:97300},
  {date:"6/10/2025", title:"Free Speech vs. Platform Responsibility", d7:101400, d30:106200},
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
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=25&order=date&type=video&key=${YT_API_KEY}`
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
  const mature = matureEps(episodes);
  const sorted = [...mature].sort((a,b)=>episodeAgeDays(a.date)-episodeAgeDays(b.date));
  const last4 = sorted.slice(-4);
  const prior4 = sorted.slice(-8,-4);
  const last4avg = last4.length ? Math.round(last4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/last4.length) : 0;
  const prior4avg = prior4.length ? Math.round(prior4.map(e=>e.d7||0).reduce((a,b)=>a+b,0)/prior4.length) : 0;
  const trend = prior4avg ? Math.round(((last4avg-prior4avg)/prior4avg)*100) : 0;
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
function TakeawayBlock({showName, episodes, color}) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const load=async()=>{setLoading(true);const r=await generateTakeaways(showName,episodes);setData(r);setLoading(false);};
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

  const loadYT = async () => {
    setYtLoading(true);
    const videos = await fetchYouTubeData(channelId);
    setYtVideos(videos);
    setYtLoaded(true);
    setYtLoading(false);
  };

  const mature = matureEps(episodes);
  const sorted = [...episodes].sort((a,b)=>(b[sort]||0)-(a[sort]||0));
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
          {ytLoaded&&<span style={{fontSize:"11px",color:"#4CAF50"}}>✓ {ytVideos.length} YouTube episodes loaded</span>}
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

      <TakeawayBlock showName={name} episodes={episodes} color={color}/>

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
