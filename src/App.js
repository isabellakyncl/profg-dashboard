import { useState, useEffect } from "react";

const PASSWORD = "profg2025";
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;
const SHEET_ID = "18P2XCl0oi2_B-xpb3SgW2qUopbv-Vbzqp4sB9v7Zsn8";

const CHANNELS = {
  pgm: { id:"pgm", name:"Prof G Markets",   color:"#E8481C", channelId:"UCp4CBeq4nzeg9smAvdjPrig" },
  pgp: { id:"pgp", name:"Prof G Pod",       color:"#ffffff", channelId:"UC1E1SVcVyU3ntWMSQEp38Yw" },
  rm:  { id:"rm",  name:"Raging Moderates", color:"#4A6FA5", channelId:"UCcvDWzvxz6Kn1iPQHMl2teA" },
};

// Fallback spreadsheet data — used only when YouTube fails
const FALLBACK = {
  pgm: [
    {date:"6/9/2025",title:"Trump & Elon Break Up Over the Tax Bill",d7:158325,d30:215989},
    {date:"6/2/2025",title:"Tariffs Blocked by Court, U.S. Steel's Golden Shares",d7:118781,d30:160742},
    {date:"5/26/2025",title:"The Story of Scott's Career",d7:107827,d30:155736},
    {date:"5/19/2025",title:"The GOP Tax Bill, United Health's Terrible Week",d7:128342,d30:178289},
    {date:"05/12/2025",title:"Is Google a Buy? + Is Uber Recession Proof?",d7:127142,d30:171409},
    {date:"05/05/2025",title:"Blockbuster Week For Big Tech Earnings",d7:125789,d30:169563},
    {date:"04/28/2025",title:"The Trump Fold and Tesla's Brand Death",d7:131819,d30:177660},
    {date:"04/21/2025",title:"Global Pushback on Tariffs + Can the FTC Beat Meta?",d7:129750,d30:178257},
    {date:"04/14/2025",title:"What to Do in the Wake of Trump's Tariff Pause",d7:129244,d30:175822},
    {date:"04/07/2025",title:"The $6.6 Trillion Sell-off",d7:130941,d30:179970},
  ],
  pgp: [
    {date:"4/21/2025",title:"Scott on AI, Loneliness, and What Matters at 60",d7:152740,d30:159100},
    {date:"2/10/2025",title:"DeepSeek Changes Everything + DOGE's Damage",d7:141280,d30:148200},
    {date:"12/09/2024",title:"The UnitedHealthcare CEO Shooting, Amazon Takes On Nvidia",d7:136829,d30:144106},
    {date:"7/22/2024",title:"Why is Silicon Valley Backing Trump?",d7:139584,d30:148197},
    {date:"1/4/2025",title:"First Time Founders: This Former Trader Built A Luxury Clothing Brand",d7:120377,d30:125197},
  ],
  rm: [
    {date:"4/29/2026",title:"Trump Blames Democrats, Demands His Ballroom",d7:91757,d30:117943},
    {date:"4/22/2026",title:"How Trump's Iran War Could Break the GOP (ft. Ben Shapiro)",d7:97051,d30:126211},
    {date:"4/15/2026",title:"Trump Spirals as Iran Blockade Triggers Recession Fears",d7:108830,d30:140304},
    {date:"4/8/2026",title:"Trump Threatens to WIPE OUT Iran",d7:99469,d30:127412},
    {date:"4/1/2026",title:"Trump & Pentagon Now Completely Delusional on War Strategy",d7:99511,d30:127065},
    {date:"3/25/2026",title:"Did Trump Already LOSE the War in Iran?",d7:112455,d30:150296},
    {date:"3/18/2026",title:"Trump's Iran War Plan Falls Apart as Allies Walk Away",d7:119314,d30:156505},
    {date:"3/11/2026",title:"The Trump Administration Can't Get Their Iran War Story Straight",d7:114783,d30:148259},
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => {
  if (!n && n!==0) return "—";
  if (n>=1000000) return (n/1000000).toFixed(1)+"M";
  if (n>=1000) return Math.round(n/1000)+"K";
  return String(n);
};

function parseDate(s) {
  if (!s) return new Date(0);
  // Handle YYYY-MM-DD from YouTube
  if (s.includes("-") && s.length >= 8) return new Date(s);
  // Handle M/D/YYYY
  const p = s.split("/");
  if (p.length === 3) return new Date(parseInt(p[2]), parseInt(p[0])-1, parseInt(p[1]));
  return new Date(0);
}

function ageDays(dateStr) {
  const d = parseDate(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000*60*60*24));
}

// ── YouTube API ───────────────────────────────────────────────────────────────
async function fetchYT(channelId) {
  if (!YT_API_KEY || !channelId) return [];
  try {
    const s = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${YT_API_KEY}`);
    const sd = await s.json();
    if (!sd.items?.length) return [];
    const ids = sd.items.map(v=>v.id.videoId).filter(Boolean).join(",");
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${YT_API_KEY}`);
    const rd = await r.json();
    return (rd.items||[]).map(v => {
      const desc = v.snippet.description||"";
      const gm = desc.match(/(?:speaks? with|joined? by|with guest|ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i)
               || v.snippet.title.match(/(?:ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      return {
        ytId: v.id,
        title: v.snippet.title,
        date: (v.snippet.publishedAt||"").split("T")[0],
        views: parseInt(v.statistics.viewCount)||0,
        likes: parseInt(v.statistics.likeCount)||0,
        comments: parseInt(v.statistics.commentCount)||0,
        desc: desc.slice(0,400),
        guest: gm?.[1]||null,
      };
    }).sort((a,b) => new Date(b.date) - new Date(a.date));
  } catch(e) { console.error("YT error",e); return []; }
}

// ── Claude API ────────────────────────────────────────────────────────────────
async function ai(prompt, tokens=800) {
  try {
    const r = await fetch("/api/claude", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({prompt, maxTokens:tokens})
    });
    const d = await r.json();
    return d.text||"";
  } catch { return ""; }
}

async function genTakeaways(showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0
    ? ytVideos.slice(0,8).map(v=>`"${v.title}" — ${fmt(v.views)} YT views (${v.date})`)
    : fallback.slice(0,8).map(e=>`"${e.title}" — ${fmt(e.d7)} 7d downloads (${e.date})`);
  const metric = ytVideos.length > 0 ? "YouTube views" : "7-day downloads";
  const vals = ytVideos.length > 0 ? ytVideos.slice(0,8).map(v=>v.views) : fallback.slice(0,8).map(e=>e.d7);
  const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;

  const prompt = `You are a podcast strategy analyst for ${showName}.
Analysis: last 8 episodes by ${metric}.
Show avg: ${fmt(avg)} ${metric}

Episodes (most recent first):
${eps.join("\n")}

Give 3 specific actionable recommendations. Reference exact episode titles and numbers. Not generic advice.
Respond ONLY in JSON (no markdown):
{"takeaways":[{"title":"<action>","detail":"<2 sentences with specific evidence>"},{"title":"","detail":""},{"title":"","detail":""}],"period":"last 8 episodes","metric":"${metric}"}`;

  try {
    const raw = await ai(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function genSentiment(title, showName, views) {
  const prompt = `Podcast episode analysis for ${showName}: "${title}"
${views ? `YouTube views: ${fmt(views)}` : ""}
Generate realistic audience sentiment.
Respond ONLY in JSON (no markdown):
{"score":<1-10>,"summary":"<3-4 sentences>","consensus":["<point 1>","<point 2>","<point 3>"]}`;
  try {
    const raw = await ai(prompt, 500);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function genGuests(showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0
    ? ytVideos.slice(0,20).map(v=>`"${v.title}" — ${fmt(v.views)} views — DESC: ${v.desc.slice(0,150)}${v.guest?` — GUEST: ${v.guest}`:""}`)
    : fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const prompt = `Analyze guest performance for ${showName}.
Episodes:
${eps.join("\n")}

Identify all guest episodes, compare performance vs solo. 
Respond ONLY in JSON (no markdown):
{"guestEpisodes":[{"title":"<title>","guest":"<name>","views":<number>}],"guestAvg":<number>,"soloAvg":<number>,"delta":"<e.g. +23%>","insight":"<1-2 sentences>","metric":"${ytVideos.length>0?"YT views":"7d downloads"}"}`;
  try {
    const raw = await ai(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function genTopics(showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0
    ? ytVideos.slice(0,25).map(v=>`"${v.title}" — ${fmt(v.views)} views`)
    : fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const vals = ytVideos.length > 0 ? ytVideos.slice(0,25).map(v=>v.views) : fallback.map(e=>e.d7);
  const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  const metric = ytVideos.length > 0 ? "YT views" : "7d downloads";
  const prompt = `Analyze topic performance for ${showName}. Show avg: ${fmt(avg)} ${metric}.
Episodes: ${eps.join("\n")}
Tag 1-3 topics per episode, rank by avg ${metric} vs baseline.
Respond ONLY in JSON (no markdown):
{"topicPerformance":[{"topic":"<topic>","avgViews":<number>,"count":<number>,"vsBaseline":"<e.g. +18%>"}],"insight":"<1-2 sentences>","metric":"${metric}"}`;
  try {
    const raw = await ai(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

async function genTitles(showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0
    ? ytVideos.slice(0,25).map(v=>`"${v.title}" — ${fmt(v.views)} views`)
    : fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const vals = ytVideos.length > 0 ? ytVideos.slice(0,25).map(v=>v.views) : fallback.map(e=>e.d7);
  const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  const metric = ytVideos.length > 0 ? "YT views" : "7d downloads";
  const prompt = `Analyze title patterns for ${showName}. Show avg: ${fmt(avg)} ${metric}.
Episodes: ${eps.join("\n")}
Analyze: questions vs statements, numbers in title, guest names (ft./with), title length, "&" or "+".
Respond ONLY in JSON (no markdown):
{"patterns":[{"pattern":"<pattern>","avgViews":<number>,"count":<number>,"vsBaseline":"<e.g. +12%>","examples":["<title1>"]}],"bestPattern":"<winner>","insight":"<1-2 sentences>","metric":"${metric}"}`;
  try {
    const raw = await ai(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch { return null; }
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false); const [shake,setShake]=useState(false);
  const go=()=>{if(pw===PASSWORD)onLogin();else{setErr(true);setShake(true);setTimeout(()=>setShake(false),500);}};
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D0D0D",fontFamily:"'DM Mono',monospace"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        .lb{background:#141414;border:1px solid #2a2a2a;border-radius:2px;padding:48px;width:360px;text-align:center;}
        .li{width:100%;background:#0D0D0D;border:1px solid #2a2a2a;color:#fff;padding:12px 16px;font-family:'DM Mono',monospace;font-size:14px;border-radius:2px;outline:none;box-sizing:border-box;}
        .li:focus{border-color:#E8481C;}
        .lbt{width:100%;margin-top:12px;background:#E8481C;color:#fff;border:none;padding:13px;font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border-radius:2px;}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        .shake{animation:shake .3s;}`}</style>
      <div className={`lb${shake?" shake":""}`}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",fontWeight:"900",color:"#fff",marginBottom:"4px"}}>PROF G</div>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".15em",textTransform:"uppercase",marginBottom:"36px"}}>Intelligence Dashboard</div>
        <input className="li" type="password" placeholder="Enter password" value={pw}
          onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} autoFocus/>
        {err&&<div style={{fontSize:"12px",color:"#E8481C",marginTop:"10px"}}>Incorrect password</div>}
        <button className="lbt" onClick={go}>Enter</button>
      </div>
    </div>
  );
}

// ── Takeaway Block ────────────────────────────────────────────────────────────
function TakeawayBlock({showName, color, ytVideos, fallback}) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const run=async()=>{setLoading(true);const r=await genTakeaways(showName,ytVideos||[],fallback||[]);setData(r);setLoading(false);};
  const hasYT = ytVideos && ytVideos.length > 0;
  return (
    <div style={{background:"#141414",border:`1px solid ${color}33`,borderRadius:"2px",padding:"20px 24px",marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"3px",height:"20px",background:color,borderRadius:"1px"}}/>
          <span style={{fontSize:"12px",fontWeight:"500",color,letterSpacing:".1em",textTransform:"uppercase"}}>{showName} — Weekly Takeaways</span>
          {data&&<span style={{fontSize:"10px",color:"#444"}}>({data.period} · {data.metric})</span>}
        </div>
        <button onClick={run} disabled={loading} style={{background:"transparent",border:`1px solid ${color}55`,color,padding:"5px 14px",fontSize:"11px",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading?0.5:1}}>
          {loading?"Analyzing…":data?"Refresh":"Generate with AI"}
        </button>
      </div>
      {!hasYT&&!data&&<div style={{fontSize:"11px",color:"#555",marginBottom:"8px"}}>⚠ Using spreadsheet data — YouTube loading in background for fresher results</div>}
      {hasYT&&!data&&<div style={{fontSize:"11px",color:"#4CAF50",marginBottom:"8px"}}>✓ {ytVideos.length} live YouTube episodes ready</div>}
      {!data&&!loading&&<div style={{fontSize:"13px",color:"#444",fontStyle:"italic"}}>Click "Generate with AI" for this week's recommendations.</div>}
      {loading&&<div style={{fontSize:"13px",color:"#555"}}>Analyzing most recent episodes…</div>}
      {data?.takeaways?.map((t,i)=>(
        <div key={i} style={{marginBottom:"12px",paddingLeft:"12px",borderLeft:`2px solid ${color}44`}}>
          <div style={{fontSize:"13px",fontWeight:"500",color:"#e0e0e0",marginBottom:"3px"}}>→ {t.title}</div>
          <div style={{fontSize:"13px",color:"#888",lineHeight:"1.6"}}>{t.detail}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sentiment ─────────────────────────────────────────────────────────────────
function Sentiment({title, showName, views, color}) {
  const [s,setS]=useState(null); const [l,setL]=useState(false); const [open,setOpen]=useState(false);
  const run=async()=>{if(s){setOpen(!open);return;}setL(true);const r=await genSentiment(title,showName,views);setS(r);setL(false);setOpen(true);};
  return (
    <div>
      <button onClick={run} disabled={l} style={{background:"transparent",border:"1px solid #333",color:s?color:"#666",padding:"4px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>
        {l?"…":s?`${s.score}/10`:"Analyze"}
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
function Insights({show, ytVideos}) {
  const {name,color} = show;
  const fallback = FALLBACK[show.id]||[];
  const [guests,setGuests]=useState(null); const [topics,setTopics]=useState(null); const [titles,setTitles]=useState(null);
  const [loading,setLoading]=useState({guests:false,topics:false,titles:false});
  const hasYT = ytVideos && ytVideos.length > 0;

  const run=async(type)=>{
    setLoading(p=>({...p,[type]:true}));
    if(type==="guests"){const r=await genGuests(name,ytVideos||[],fallback);setGuests(r);}
    if(type==="topics"){const r=await genTopics(name,ytVideos||[],fallback);setTopics(r);}
    if(type==="titles"){const r=await genTitles(name,ytVideos||[],fallback);setTitles(r);}
    setLoading(p=>({...p,[type]:false}));
  };

  const Block=({title,type,result})=>(
    <div style={{background:"#0D0D0D",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px",marginBottom:"10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <span style={{fontSize:"11px",color,letterSpacing:".1em",textTransform:"uppercase",fontWeight:"500"}}>{title}</span>
        <button onClick={()=>run(type)} disabled={loading[type]} style={{background:"transparent",border:`1px solid ${color}44`,color,padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px",opacity:loading[type]?0.5:1}}>
          {loading[type]?"Analyzing…":result?"Refresh":"Run Analysis"}
        </button>
      </div>
      {!result&&!loading[type]&&<div style={{fontSize:"12px",color:"#444",fontStyle:"italic"}}>{hasYT?`Using ${ytVideos.length} live YouTube episodes.`:"Using spreadsheet data."}</div>}
      {loading[type]&&<div style={{fontSize:"12px",color:"#555"}}>Analyzing…</div>}

      {result&&type==="guests"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[
              {label:`Guest avg (${result.metric||"views"})`,val:result.guestAvg>0?fmt(result.guestAvg):"—"},
              {label:`Solo avg (${result.metric||"views"})`,val:result.soloAvg>0?fmt(result.soloAvg):"—"},
              {label:"Guest vs solo",val:result.delta||"N/A",accent:result.delta?.includes("+")?"#4CAF50":"#E8481C"},
            ].map((m,i)=>(
              <div key={i} style={{background:"#141414",borderRadius:"2px",padding:"10px 12px"}}>
                <div style={{fontSize:"10px",color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"4px"}}>{m.label}</div>
                <div style={{fontSize:"16px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
              </div>
            ))}
          </div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"4px 0",marginBottom:"4px"}}>
            <div style={{flex:1,fontSize:"10px",color:"#555",textTransform:"uppercase"}}>Guest</div>
            <div style={{width:"200px",fontSize:"10px",color:"#555",textTransform:"uppercase"}}>Episode</div>
            <div style={{width:"70px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"right"}}>{result.metric||"Views"}</div>
          </div>
          {result.guestEpisodes?.filter(e=>e.guest).slice(0,6).map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 0",borderBottom:"1px solid #1a1a1a"}}>
              <span style={{flex:1,fontSize:"12px",color:"#ccc",fontWeight:"500"}}>{e.guest}</span>
              <span style={{width:"200px",fontSize:"11px",color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title?.slice(0,35)}</span>
              <span style={{width:"70px",fontSize:"12px",color:"#e0e0e0",textAlign:"right"}}>{e.views>0?fmt(e.views):"—"}</span>
            </div>
          ))}
        </div>
      )}

      {result&&type==="topics"&&(
        <div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"4px 10px",marginBottom:"4px",background:"#141414",borderRadius:"2px"}}>
            <div style={{flex:1,fontSize:"10px",color:"#555",textTransform:"uppercase"}}>Topic</div>
            <div style={{width:"40px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"center"}}>Eps</div>
            <div style={{width:"65px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"right"}}>Avg {result.metric||"Views"}</div>
            <div style={{width:"55px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"right"}}>vs Avg</div>
          </div>
          {result.topicPerformance?.slice(0,6).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 10px",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{flex:1,fontSize:"12px",color:"#ccc"}}>{t.topic}</div>
              <div style={{width:"40px",fontSize:"12px",color:"#888",textAlign:"center"}}>{t.count}</div>
              <div style={{width:"65px",fontSize:"12px",color:"#e0e0e0",textAlign:"right"}}>{fmt(t.avgViews||t.avgD7)}</div>
              <div style={{width:"55px",fontSize:"11px",fontWeight:"500",color:t.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",textAlign:"right"}}>{t.vsBaseline}</div>
            </div>
          ))}
        </div>
      )}

      {result&&type==="titles"&&(
        <div>
          {result.insight&&<div style={{fontSize:"12px",color:"#888",lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}44`}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"4px 10px",marginBottom:"4px",background:"#141414",borderRadius:"2px"}}>
            <div style={{flex:1,fontSize:"10px",color:"#555",textTransform:"uppercase"}}>Pattern</div>
            <div style={{width:"80px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"right"}}>Avg {result.metric||"Views"}</div>
            <div style={{width:"55px",fontSize:"10px",color:"#555",textTransform:"uppercase",textAlign:"right"}}>vs Avg</div>
          </div>
          {result.patterns?.map((p,i)=>(
            <div key={i} style={{marginBottom:"8px",paddingBottom:"8px",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"0 10px"}}>
                <span style={{flex:1,fontSize:"12px",color:"#ccc",fontWeight:"500"}}>{p.pattern}</span>
                <span style={{width:"80px",fontSize:"12px",color:"#888",textAlign:"right"}}>{fmt(p.avgViews||p.avgD7)} · {p.count} eps</span>
                <span style={{width:"55px",fontSize:"12px",color:p.vsBaseline?.includes("+")?"#4CAF50":"#E8481C",fontWeight:"500",textAlign:"right"}}>{p.vsBaseline}</span>
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
      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"12px"}}>Deep Insights{hasYT?` · using ${ytVideos.length} live YouTube episodes`:" · loading YouTube data…"}</div>
      <Block title="Guest Performance" type="guests" result={guests}/>
      <Block title="Topic Performance Index" type="topics" result={topics}/>
      <Block title="Title Pattern Analysis" type="titles" result={titles}/>
    </div>
  );
}

// ── Show Page ─────────────────────────────────────────────────────────────────
function ShowPage({show}) {
  const {id,name,color,channelId} = show;
  const fallback = FALLBACK[id]||[];
  const [ytVideos,setYtVideos]=useState([]);
  const [ytLoading,setYtLoading]=useState(true);
  const [sort,setSort]=useState("views");

  useEffect(()=>{
    fetchYT(channelId).then(v=>{setYtVideos(v);setYtLoading(false);});
  },[channelId]);

  const displayEps = ytVideos.length > 0 ? ytVideos : fallback.map(e=>({title:e.title,date:e.date,views:e.d7,likes:0,comments:0}));
  const sorted = [...displayEps].sort((a,b)=>{
    if(sort==="views") return (b.views||0)-(a.views||0);
    if(sort==="date") return new Date(b.date||0)-new Date(a.date||0);
    return 0;
  });
  const avgViews = displayEps.length ? Math.round(displayEps.map(e=>e.views||0).reduce((a,b)=>a+b,0)/displayEps.length) : 0;
  const topEp = [...displayEps].sort((a,b)=>(b.views||0)-(a.views||0))[0];
  const recent4 = [...displayEps].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,4);
  const prior4 = [...displayEps].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(4,8);
  const r4avg = recent4.length?Math.round(recent4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/recent4.length):0;
  const p4avg = prior4.length?Math.round(prior4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/prior4.length):0;
  const trend = p4avg?Math.round(((r4avg-p4avg)/p4avg)*100):0;

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
          <div style={{width:"4px",height:"28px",background:color,borderRadius:"2px"}}/>
          <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",margin:0}}>{name}</h2>
        </div>
        <div style={{fontSize:"12px",color:ytLoading?"#555":"#4CAF50",marginLeft:"16px"}}>
          {ytLoading?"Loading live YouTube data…":`✓ ${ytVideos.length} live YouTube episodes loaded`}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Rolling 4-ep avg",val:fmt(r4avg),sub:p4avg?`${trend>=0?"+":""}${trend}% vs prior 4`:null,subColor:trend>=0?"#4CAF50":"#E8481C"},
          {label:"Overall avg views",val:fmt(avgViews),sub:`${displayEps.length} episodes`},
          {label:"Top episode",val:fmt(topEp?.views),sub:topEp?.title?.slice(0,28)+"…",accent:color},
          {label:"Data source",val:ytVideos.length>0?"YouTube":"Sheet",sub:ytVideos.length>0?"live":"fallback"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px"}}>
            <div style={{fontSize:"11px",color:"#555",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{m.label}</div>
            <div style={{fontSize:"22px",fontWeight:"500",color:m.accent||"#fff",fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
            {m.sub&&<div style={{fontSize:"11px",color:m.subColor||"#555",marginTop:"4px"}}>{m.sub}</div>}
          </div>
        ))}
      </div>

      <TakeawayBlock showName={name} color={color} ytVideos={ytVideos} fallback={fallback}/>

      <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px",marginBottom:"10px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          {[["views","By Views"],["date","By Date"]].map(([k,l])=>(
            <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?color:"transparent",border:`1px solid ${sort===k?color:"#333"}`,color:sort===k?"#fff":"#555",padding:"4px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>{l}</button>
          ))}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",fontFamily:"'DM Mono',monospace"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #222"}}>
                {["Date","Episode","Views","Likes","Comments","Guest","Sentiment"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",color:"#555",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep,i)=>(
                <tr key={i} style={{borderBottom:"1px solid #1a1a1a"}} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px",color:"#555",whiteSpace:"nowrap"}}>{ep.date?.slice(0,10)}</td>
                  <td style={{padding:"10px",color:"#ccc",maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title}</td>
                  <td style={{padding:"10px",color:"#e0e0e0",whiteSpace:"nowrap"}}>{fmt(ep.views)}</td>
                  <td style={{padding:"10px",color:"#888"}}>{fmt(ep.likes)}</td>
                  <td style={{padding:"10px",color:"#888"}}>{fmt(ep.comments)}</td>
                  <td style={{padding:"10px",color:ep.guest?color:"#333"}}>{ep.guest||"—"}</td>
                  <td style={{padding:"10px"}}><Sentiment title={ep.title} showName={name} views={ep.views} color={color}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Insights show={show} ytVideos={ytVideos}/>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function Home() {
  const shows = Object.values(CHANNELS);
  const [ytMap,setYtMap]=useState({});
  const [loaded,setLoaded]=useState(false);
  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  useEffect(()=>{
    Promise.all(shows.map(s=>fetchYT(s.channelId).then(v=>[s.id,v]))).then(results=>{
      const map={};
      results.forEach(([id,v])=>{if(v.length)map[id]=v;});
      setYtMap(map);
      setLoaded(true);
    });
  },[]);

  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"11px",color:"#555",letterSpacing:".15em",textTransform:"uppercase",marginBottom:"4px"}}>{today}</div>
        <h1 style={{fontSize:"28px",fontWeight:"900",color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 6px"}}>Weekly Snapshot</h1>
        <div style={{fontSize:"13px",color:loaded?"#4CAF50":"#666"}}>{loaded?"✓ Live YouTube data loaded for all shows":"Loading live YouTube data…"}</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"28px"}}>
        {shows.map(s=>{
          const vids = ytMap[s.id]||[];
          const fb = FALLBACK[s.id]||[];
          const eps = vids.length>0 ? vids : fb.map(e=>({...e,views:e.d7,date:e.date,title:e.title}));
          const avg = eps.length?Math.round(eps.map(e=>e.views||0).reduce((a,b)=>a+b,0)/eps.length):0;
          const recent4 = eps.slice(0,4);
          const prior4 = eps.slice(4,8);
          const r4 = recent4.length?Math.round(recent4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/recent4.length):0;
          const p4 = prior4.length?Math.round(prior4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/prior4.length):0;
          const trend = p4?Math.round(((r4-p4)/p4)*100):0;
          const top = [...eps].sort((a,b)=>(b.views||0)-(a.views||0))[0];
          return (
            <div key={s.id} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{width:"3px",height:"16px",background:s.color,borderRadius:"1px"}}/>
                <span style={{fontSize:"12px",fontWeight:"500",color:s.color}}>{s.name}</span>
                {vids.length>0&&<span style={{fontSize:"10px",color:"#4CAF50"}}>live</span>}
              </div>
              <div style={{fontSize:"24px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{fmt(r4)}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                <div style={{fontSize:"11px",color:"#555"}}>rolling 4-ep avg views</div>
                {p4>0&&<div style={{fontSize:"11px",fontWeight:"500",color:trend>=0?"#4CAF50":"#E8481C"}}>{trend>=0?"+":""}{trend}% vs prior</div>}
              </div>
              <div style={{fontSize:"12px",color:"#ccc",marginBottom:"4px"}}>{top?.title?.slice(0,55)}{(top?.title?.length||0)>55?"…":""}</div>
              <div style={{fontSize:"11px",color:"#555"}}>{fmt(top?.views)} views · top episode</div>
            </div>
          );
        })}
      </div>

      <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>AI Recommendations</div>
      {shows.map(s=>(
        <TakeawayBlock key={s.id} showName={s.name} color={s.color} ytVideos={ytMap[s.id]||[]} fallback={FALLBACK[s.id]||[]}/>
      ))}
    </div>
  );
}

// ── Trends Page ───────────────────────────────────────────────────────────────
function Trends() {
  const shows = Object.values(CHANNELS);
  const [active,setActive]=useState("pgm");
  const [ytMap,setYtMap]=useState({});

  useEffect(()=>{
    shows.forEach(s=>{
      fetchYT(s.channelId).then(v=>{
        if(v.length) setYtMap(prev=>({...prev,[s.id]:v}));
      });
    });
  },[]);

  const show = CHANNELS[active];
  const vids = ytMap[active]||[];
  const fb = FALLBACK[active]||[];
  const eps = vids.length>0 ? vids : fb.map(e=>({...e,views:e.d7}));
  const sorted = [...eps].sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
  const top10 = [...eps].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,10);
  const avgViews = eps.length?Math.round(eps.map(e=>e.views||0).reduce((a,b)=>a+b,0)/eps.length):0;

  // Monthly grouping
  const months={};
  sorted.forEach(e=>{
    const d=parseDate(e.date||"");
    if(d.getFullYear()>2000){
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if(!months[k])months[k]=[];
      months[k].push(e.views||0);
    }
  });
  const mkeys=Object.keys(months).sort();
  const mavgs=mkeys.map(k=>({key:k,avg:Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length),count:months[k].length}));
  const maxAvg=mavgs.length?Math.max(...mavgs.map(m=>m.avg)):1;

  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",fontFamily:"'Playfair Display',serif",marginBottom:"6px"}}>Trends</h2>
        <div style={{fontSize:"13px",color:"#555"}}>Historical performance by show</div>
      </div>
      <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
        {shows.map(s=>(
          <button key={s.id} onClick={()=>setActive(s.id)} style={{background:active===s.id?s.color:"transparent",border:`1px solid ${active===s.id?s.color:"#333"}`,color:active===s.id?"#fff":s.color,padding:"6px 16px",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Mono',monospace",borderRadius:"2px"}}>{s.name}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {label:"Avg views",val:fmt(avgViews),sub:`${eps.length} episodes`},
          {label:"Best month",val:mavgs.length?fmt(Math.max(...mavgs.map(m=>m.avg))):"—",sub:mavgs.find(m=>m.avg===maxAvg)?.key},
          {label:"Data source",val:vids.length>0?"Live YouTube":"Spreadsheet",sub:vids.length>0?`${vids.length} episodes`:"fallback"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"16px 18px"}}>
            <div style={{fontSize:"11px",color:"#555",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{m.label}</div>
            <div style={{fontSize:"22px",fontWeight:"500",color:show.color,fontFamily:"'Playfair Display',serif"}}>{m.val}</div>
            <div style={{fontSize:"11px",color:"#555",marginTop:"4px"}}>{m.sub}</div>
          </div>
        ))}
      </div>

      {mavgs.length>0&&(
        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 24px",marginBottom:"14px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"16px"}}>Monthly avg views</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:"4px",height:"120px",marginBottom:"8px"}}>
            {mavgs.map((m,i)=>{
              const h=Math.round((m.avg/maxAvg)*120);
              const isRecent=i>=mavgs.length-3;
              return (
                <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",minWidth:0}}>
                  <div style={{fontSize:"8px",color:isRecent?show.color:"#444",whiteSpace:"nowrap"}}>{fmt(m.avg)}</div>
                  <div style={{width:"100%",height:`${h}px`,background:show.color,opacity:isRecent?1:.4,borderRadius:"2px 2px 0 0"}}/>
                  <div style={{fontSize:"8px",color:"#333",transform:"rotate(-45deg)",transformOrigin:"center",marginTop:"4px",whiteSpace:"nowrap"}}>{m.key.split("-")[1]+"/"+m.key.split("-")[0].slice(-2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>Top 10 episodes</div>
          {top10.map((ep,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",borderBottom:"1px solid #1a1a1a"}}>
              <div style={{fontSize:"12px",color:show.color,minWidth:"20px",fontWeight:"500"}}>#{i+1}</div>
              <div style={{flex:1,fontSize:"12px",color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ep.title}</div>
              <div style={{fontSize:"12px",color:"#e0e0e0",whiteSpace:"nowrap",fontWeight:"500"}}>{fmt(ep.views)}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#141414",border:"1px solid #222",borderRadius:"2px",padding:"20px 22px"}}>
          <div style={{fontSize:"11px",color:"#555",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"14px"}}>Month by month</div>
          <div style={{maxHeight:"380px",overflowY:"auto"}}>
            {[...mavgs].reverse().map((m,i,arr)=>{
              const prev=arr[i+1];
              const delta=prev?Math.round(((m.avg-prev.avg)/prev.avg)*100):null;
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
  if (!authed) return <Login onLogin={()=>setAuthed(true)}/>;
  const nav=[{id:"home",label:"Home"},{id:"pgm",label:"Prof G Markets"},{id:"pgp",label:"Prof G Pod"},{id:"rm",label:"Raging Moderates"},{id:"trends",label:"Trends"}];
  const shows = CHANNELS;
  return (
    <div style={{minHeight:"100vh",background:"#0D0D0D",fontFamily:"'DM Mono',monospace",color:"#e0e0e0"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0D0D0D}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}`}</style>
      <div style={{position:"fixed",top:0,left:0,width:"200px",height:"100vh",background:"#0D0D0D",borderRight:"1px solid #1a1a1a",padding:"28px 0",display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"0 20px",marginBottom:"32px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:"900",color:"#fff"}}>PROF G</div>
          <div style={{fontSize:"9px",color:"#444",letterSpacing:".15em",textTransform:"uppercase",marginTop:"2px"}}>Intelligence</div>
        </div>
        {nav.map(n=>{
          const active=page===n.id; const show=shows[n.id];
          return <button key={n.id} onClick={()=>setPage(n.id)} style={{background:"transparent",border:"none",textAlign:"left",padding:"9px 20px",fontSize:"12px",color:active?(show?.color||"#fff"):"#555",cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:".04em",borderLeft:`2px solid ${active?(show?.color||"#E8481C"):"transparent"}`,width:"100%"}}>{n.label}</button>;
        })}
        <div style={{marginTop:"auto",padding:"20px 20px 0",borderTop:"1px solid #1a1a1a"}}>
          <div style={{fontSize:"10px",color:"#333",lineHeight:"1.6"}}>profg2025<br/>profg-dashboard.vercel.app</div>
        </div>
      </div>
      <div style={{marginLeft:"200px",padding:"32px 36px",minHeight:"100vh"}}>
        <div style={{maxWidth:"900px"}}>
          {page==="home"&&<Home/>}
          {page==="pgm"&&<ShowPage show={CHANNELS.pgm}/>}
          {page==="pgp"&&<ShowPage show={CHANNELS.pgp}/>}
          {page==="rm"&&<ShowPage show={CHANNELS.rm}/>}
          {page==="trends"&&<Trends/>}
        </div>
      </div>
    </div>
  );
}
