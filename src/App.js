import { useState, useEffect } from "react";

const PASSWORD = "profg2025";
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;

// ── Brand ─────────────────────────────────────────────────────────────────────
const B = {
  bg:       "#00222d",   // main background
  card:     "#00303f",   // card background
  cardAlt:  "#003a4a",   // slightly lighter card
  border:   "#005066",   // borders
  borderSub:"#003d52",   // subtle borders
  text:     "#ffffff",   // primary text
  textSub:  "#b0d4db",   // secondary text
  textMute: "#6a9aa3",   // muted text
  teal:     "#4fafb8",   // teal accent
  yellow:   "#f4b547",   // yellow accent
  orange:   "#de6f3f",   // orange (Markets)
  pink:     "#d987b5",   // pink (Raging Moderates)
  green:    "#4fafb8",   // success = teal
  red:      "#de6f3f",   // warning = orange
  font:     "'Barlow', sans-serif",
};

// ── Global YouTube cache — fetches once per session, not on every page load ──
const YT_CACHE = {};
async function fetchYTCached(channelId) {
  if (YT_CACHE[channelId]) return YT_CACHE[channelId];
  const data = await fetchYT(channelId);
  if (data.length > 0) YT_CACHE[channelId] = data;
  return data;
}

const CHANNELS = {
  pgm: { id:"pgm", name:"Prof G Markets",   color:B.orange, channelId:"UCp4CBeq4nzeg9smAvdjPrig" },
  pgp: { id:"pgp", name:"Prof G Pod",       color:B.teal,   channelId:"UC1E1SVcVyU3ntWMSQEp38Yw" },
  rm:  { id:"rm",  name:"Raging Moderates", color:B.pink,   channelId:"UCcvDWzvxz6Kn1iPQHMl2teA" },
};

const FALLBACK = {
  pgm: [
    {date:"2026-05-26",title:"SpaceX Just Filed to IPO — ft. Patrick Boyle",views:383000,likes:12400,comments:892,ytId:""},
    {date:"2026-05-19",title:"Inside Trump's 3,700 Trades — ft. Anthony Scaramucci",views:96000,likes:3200,comments:421,ytId:""},
    {date:"2026-05-12",title:"The AI Boom Is Headed For a Crash — ft. Aswath Damodaran",views:236000,likes:8100,comments:1043,ytId:""},
    {date:"2026-05-05",title:"Silicon Valley's Case Against Trump — ft. Jason Calacanis & Bradley Tusk",views:34000,likes:1200,comments:287,ytId:""},
    {date:"2026-04-28",title:"How To Actually Tax The Rich — ft. Ray Madoff",views:73000,likes:2400,comments:312,ytId:""},
    {date:"6/9/2025",  title:"Trump & Elon Break Up Over the Tax Bill",views:158325,likes:0,comments:0,ytId:""},
    {date:"6/2/2025",  title:"Tariffs Blocked by Court, U.S. Steel's Golden Shares",views:118781,likes:0,comments:0,ytId:""},
    {date:"5/26/2025", title:"The Story of Scott's Career",views:107827,likes:0,comments:0,ytId:""},
  ],
  pgp: [
    {date:"4/21/2025", title:"Scott on AI, Loneliness, and What Matters at 60",views:152740,likes:0,comments:0,ytId:""},
    {date:"2/10/2025", title:"DeepSeek Changes Everything + DOGE's Damage",views:141280,likes:0,comments:0,ytId:""},
    {date:"12/09/2024",title:"The UnitedHealthcare CEO Shooting",views:136829,likes:0,comments:0,ytId:""},
    {date:"7/22/2024", title:"Why is Silicon Valley Backing Trump?",views:139584,likes:0,comments:0,ytId:""},
  ],
  rm: [
    {date:"4/29/2026", title:"Trump Blames Democrats, Demands His Ballroom",views:91757,likes:0,comments:0,ytId:""},
    {date:"4/22/2026", title:"How Trump's Iran War Could Break the GOP (ft. Ben Shapiro)",views:97051,likes:0,comments:0,ytId:""},
    {date:"4/15/2026", title:"Trump Spirals as Iran Blockade Triggers Recession Fears",views:108830,likes:0,comments:0,ytId:""},
    {date:"4/8/2026",  title:"Trump Threatens to WIPE OUT Iran",views:99469,likes:0,comments:0,ytId:""},
    {date:"4/1/2026",  title:"Trump & Pentagon Now Completely Delusional",views:99511,likes:0,comments:0,ytId:""},
    {date:"3/25/2026", title:"Did Trump Already LOSE the War in Iran?",views:112455,likes:0,comments:0,ytId:""},
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
  if (s.includes("-") && s.length>=8) return new Date(s);
  const p=s.split("/");
  if (p.length===3) return new Date(parseInt(p[2]),parseInt(p[0])-1,parseInt(p[1]));
  return new Date(0);
}

// ── YouTube API ───────────────────────────────────────────────────────────────
async function fetchYT(channelId) {
  if (!YT_API_KEY||!channelId) return [];
  try {
    const s=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${YT_API_KEY}`);
    const sd=await s.json();
    if (!sd.items?.length) return [];
    const ids=sd.items.map(v=>v.id.videoId).filter(Boolean).join(",");
    const r=await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${YT_API_KEY}`);
    const rd=await r.json();
    return (rd.items||[]).map(v=>{
      const desc=v.snippet.description||"";
      const gm=desc.match(/(?:speaks? with|joined? by|with guest|ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i)
              ||v.snippet.title.match(/(?:ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      return {
        ytId:v.id, title:v.snippet.title,
        date:(v.snippet.publishedAt||"").split("T")[0],
        views:parseInt(v.statistics.viewCount)||0,
        likes:parseInt(v.statistics.likeCount)||0,
        comments:parseInt(v.statistics.commentCount)||0,
        desc:desc.slice(0,400), guest:gm?.[1]||null,
      };
    }).sort((a,b)=>new Date(b.date)-new Date(a.date));
  } catch(e){console.error("YT",e);return [];}
}

// ── YouTube Comments ─────────────────────────────────────────────────────────
async function fetchYTComments(videoId) {
  if (!YT_API_KEY || !videoId) return [];
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=relevance&key=${YT_API_KEY}`);
    const d = await r.json();
    if (!d.items) return [];
    return d.items.map(item => item.snippet.topLevelComment.snippet.textDisplay).filter(Boolean);
  } catch(e) { console.error("Comments error", e); return []; }
}

// ── Claude API ────────────────────────────────────────────────────────────────
async function ai(prompt,tokens=800) {
  try {
    const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,maxTokens:tokens})});
    const d=await r.json();
    return d.text||"";
  } catch {return "";}
}

async function genTakeaways(showName,ytVideos,fallback) {
  const eps=ytVideos.length>0
    ?ytVideos.slice(0,8).map(v=>`"${v.title}" — ${fmt(v.views)} YT views (${v.date})`)
    :fallback.slice(0,8).map(e=>`"${e.title}" — ${fmt(e.d7)} downloads (${e.date})`);
  const metric=ytVideos.length>0?"YouTube views":"7-day downloads";
  const vals=ytVideos.length>0?ytVideos.slice(0,8).map(v=>v.views):fallback.slice(0,8).map(e=>e.d7);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  const prompt=`You are a podcast strategy analyst for ${showName}.
Analysis: last 8 episodes by ${metric}. Show avg: ${fmt(avg)} ${metric}.
Episodes (most recent first):
${eps.join("\n")}
Give 3 specific actionable recommendations. Reference exact episode titles and numbers.
Respond ONLY in JSON (no markdown):
{"takeaways":[{"title":"<action>","detail":"<2 sentences with specific evidence>"},{"title":"","detail":""},{"title":"","detail":""}],"period":"last 8 episodes","metric":"${metric}"}`;
  try {const raw=await ai(prompt,700);return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch {return null;}
}

async function genSentiment(title,showName,views,ytId,comments) {
  const hasComments = comments && comments.length > 0;
  const prompt = hasComments
    ? `You are analyzing real YouTube audience comments for a podcast episode.
Show: ${showName}
Episode: "${title}"
YouTube views: ${fmt(views)}

Real audience comments (${comments.length} comments):
${comments.slice(0,30).map((c,i)=>`${i+1}. ${c.slice(0,200)}`).join("\n")}

Based on these REAL comments, provide:
1. A sentiment score 1-10
2. A 3-4 sentence summary of what the audience actually said — what they praised, criticized, asked for more of
3. 2-3 specific consensus points pulled directly from the comments

Respond ONLY in JSON (no markdown):
{"score":<1-10>,"summary":"<3-4 sentences based on real comments>","consensus":["<direct insight from comments 1>","<direct insight from comments 2>","<direct insight from comments 3>"],"source":"real YouTube comments"}`
    : `Podcast episode for ${showName}: "${title}"${views?`\nYouTube views: ${fmt(views)}`:""}
Generate inferred audience sentiment based on topic and performance.
Respond ONLY in JSON (no markdown):
{"score":<1-10>,"summary":"<3-4 sentences>","consensus":["<point 1>","<point 2>","<point 3>"],"source":"AI inference (no comments available)"}`;
  try {const raw=await ai(prompt,600);return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch {return null;}
}

async function genGuests(showName,ytVideos,fallback) {
  const eps=ytVideos.length>0
    ?ytVideos.slice(0,20).map(v=>`"${v.title}" — ${fmt(v.views)} views — DESC: ${v.desc.slice(0,150)}${v.guest?` — GUEST: ${v.guest}`:""}`)
    :fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const metric=ytVideos.length>0?"YT views":"7d downloads";
  const prompt=`Analyze guest performance for ${showName}.
Episodes: ${eps.join("\n")}
Identify all guest episodes, compare performance vs solo.
Respond ONLY in JSON (no markdown):
{"guestEpisodes":[{"title":"<title>","guest":"<name>","views":<number>}],"guestAvg":<number>,"soloAvg":<number>,"delta":"<e.g. +23%>","insight":"<1-2 sentences>","metric":"${metric}"}`;
  try {const raw=await ai(prompt,700);return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch {return null;}
}

async function genTopics(showName,ytVideos,fallback) {
  const eps=ytVideos.length>0
    ?ytVideos.slice(0,25).map(v=>`"${v.title}" — ${fmt(v.views)} views`)
    :fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const vals=ytVideos.length>0?ytVideos.slice(0,25).map(v=>v.views):fallback.map(e=>e.d7);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  const metric=ytVideos.length>0?"YT views":"7d downloads";
  const prompt=`Analyze topic performance for ${showName}. Show avg: ${fmt(avg)} ${metric}.
Episodes: ${eps.join("\n")}
Tag 1-3 topics per episode, rank by avg ${metric} vs baseline.
Respond ONLY in JSON (no markdown):
{"topicPerformance":[{"topic":"<topic>","avgViews":<number>,"count":<number>,"vsBaseline":"<e.g. +18%>"}],"insight":"<1-2 sentences>","metric":"${metric}"}`;
  try {const raw=await ai(prompt,700);return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch {return null;}
}

async function genTitles(showName,ytVideos,fallback) {
  const eps=ytVideos.length>0
    ?ytVideos.slice(0,25).map(v=>`"${v.title}" — ${fmt(v.views)} views`)
    :fallback.map(e=>`"${e.title}" — ${fmt(e.d7)} downloads`);
  const vals=ytVideos.length>0?ytVideos.slice(0,25).map(v=>v.views):fallback.map(e=>e.d7);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  const metric=ytVideos.length>0?"YT views":"7d downloads";
  const prompt=`Analyze title patterns for ${showName}. Show avg: ${fmt(avg)} ${metric}.
Episodes: ${eps.join("\n")}
Analyze: questions vs statements, numbers in title, guest names (ft./with), title length, & or +.
Respond ONLY in JSON (no markdown):
{"patterns":[{"pattern":"<pattern>","avgViews":<number>,"count":<number>,"vsBaseline":"<e.g. +12%>","examples":["<title1>"]}],"bestPattern":"<winner>","insight":"<1-2 sentences>","metric":"${metric}"}`;
  try {const raw=await ai(prompt,700);return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch {return null;}
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const card = {background:B.card, border:`1px solid ${B.border}`, borderRadius:"4px", padding:"20px 22px"};
const cardAlt = {background:B.cardAlt, border:`1px solid ${B.border}`, borderRadius:"4px", padding:"16px 18px"};
const label = {fontSize:"11px", color:B.textMute, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"8px", fontFamily:B.font};
const heading = {fontFamily:B.font, fontWeight:"900", fontStyle:"italic", textTransform:"uppercase", color:B.text};

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false); const [shake,setShake]=useState(false);
  const go=()=>{if(pw===PASSWORD)onLogin();else{setErr(true);setShake(true);setTimeout(()=>setShake(false),500);}};
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:B.bg,fontFamily:B.font}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,900;1,700;1,900&family=Barlow+Condensed:ital,wght@0,400;0,700;0,900&display=swap');
        *{box-sizing:border-box;}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        .shake{animation:shake .3s;}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${B.bg}} ::-webkit-scrollbar-thumb{background:${B.border};border-radius:2px}`}</style>
      <div className={shake?"shake":""} style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:"4px",padding:"48px",width:"380px",textAlign:"center"}}>
        <div style={{...heading,fontSize:"32px",marginBottom:"4px",color:B.yellow}}>PROF G</div>
        <div style={{fontSize:"12px",color:B.textMute,letterSpacing:".15em",textTransform:"uppercase",marginBottom:"36px",fontFamily:B.font}}>Intelligence Dashboard</div>
        <input style={{width:"100%",background:B.bg,border:`1px solid ${B.border}`,color:B.text,padding:"13px 16px",fontFamily:B.font,fontSize:"15px",borderRadius:"4px",outline:"none",boxSizing:"border-box"}}
          type="password" placeholder="Enter password" value={pw}
          onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} autoFocus/>
        {err&&<div style={{fontSize:"13px",color:B.red,marginTop:"10px",fontFamily:B.font}}>Incorrect password</div>}
        <button style={{width:"100%",marginTop:"12px",background:B.yellow,color:B.bg,border:"none",padding:"14px",fontFamily:B.font,fontSize:"14px",fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",borderRadius:"4px"}} onClick={go}>Enter</button>
      </div>
    </div>
  );
}

// ── Takeaway Block ────────────────────────────────────────────────────────────
function TakeawayBlock({showName,color,ytVideos,fallback}) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(false);
  const run=async()=>{setLoading(true);const r=await genTakeaways(showName,ytVideos||[],fallback||[]);setData(r);setLoading(false);};
  const hasYT=ytVideos&&ytVideos.length>0;
  return (
    <div style={{...card,borderLeft:`3px solid ${color}`,marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{...heading,fontSize:"13px",color,letterSpacing:".08em"}}>{showName} — Weekly Takeaways</span>
          {data&&<span style={{fontSize:"11px",color:B.textMute,fontFamily:B.font}}>({data.period} · {data.metric})</span>}
        </div>
        <button onClick={run} disabled={loading} style={{background:"transparent",border:`1px solid ${color}`,color,padding:"6px 16px",fontSize:"12px",fontWeight:"700",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:B.font,borderRadius:"3px",opacity:loading?0.5:1}}>
          {loading?"Analyzing…":data?"Refresh":"Generate with AI"}
        </button>
      </div>
      {!data&&!loading&&<div style={{fontSize:"14px",color:B.textMute,fontStyle:"italic",fontFamily:B.font}}>{hasYT?`✓ ${ytVideos.length} live YouTube episodes ready.`:"Click Generate with AI for this week's recommendations."}</div>}
      <div style={{fontSize:"11px",color:B.textMute,fontFamily:B.font,marginBottom:"8px"}}>AI analysis based on episode titles and YouTube view counts. Sentiment analysis uses real YouTube comments.</div>
      {loading&&<div style={{fontSize:"14px",color:B.textSub,fontFamily:B.font}}>Analyzing most recent episodes…</div>}
      {data?.takeaways?.map((t,i)=>(
        <div key={i} style={{marginBottom:"14px",paddingLeft:"14px",borderLeft:`2px solid ${color}55`}}>
          <div style={{...heading,fontSize:"14px",color:B.text,marginBottom:"4px"}}>→ {t.title}</div>
          <div style={{fontSize:"14px",color:B.textSub,lineHeight:"1.65",fontFamily:B.font}}>{t.detail}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sentiment ─────────────────────────────────────────────────────────────────
function Sentiment({title,showName,views,color,ytId}) {
  const [s,setS]=useState(null); const [l,setL]=useState(false); const [open,setOpen]=useState(false);
  const run=async()=>{
    if(s){setOpen(!open);return;}
    setL(true);
    const comments = ytId ? await fetchYTComments(ytId) : [];
    const r=await genSentiment(title,showName,views,ytId,comments);
    setS(r);setL(false);setOpen(true);
  };
  return (
    <div>
      <button onClick={run} disabled={l} style={{background:"transparent",border:`1px solid ${B.border}`,color:s?color:B.textMute,padding:"4px 12px",fontSize:"12px",cursor:"pointer",fontFamily:B.font,borderRadius:"3px",fontWeight:s?"700":"400"}}>
        {l?"…":s?`${s.score}/10`:"Analyze"}
      </button>
      {open&&s&&(
        <div style={{marginTop:"8px",...cardAlt}}>
          <div style={{...heading,fontSize:"20px",color,marginBottom:"4px"}}>{s.score}/10</div>
          <div style={{fontSize:"11px",color:s.source?.includes("real")?"#4fafb8":B.textMute,marginBottom:"8px",fontFamily:B.font}}>{s.source||"AI inference"}</div>
          <div style={{fontSize:"13px",color:B.textSub,lineHeight:"1.65",marginBottom:"10px",fontFamily:B.font}}>{s.summary}</div>
          {s.consensus?.map((c,i)=><div key={i} style={{fontSize:"13px",color:B.textSub,marginBottom:"5px",paddingLeft:"10px",borderLeft:`2px solid ${color}`,fontFamily:B.font}}>"{c}"</div>)}
          <button onClick={()=>setOpen(false)} style={{marginTop:"8px",background:"transparent",border:"none",color:B.textMute,fontSize:"12px",cursor:"pointer",fontFamily:B.font}}>close ↑</button>
        </div>
      )}
    </div>
  );
}

// ── Insights Panel ────────────────────────────────────────────────────────────
function Insights({show,ytVideos}) {
  const {name,color}=show;
  const fallback=FALLBACK[show.id]||[];
  const [guests,setGuests]=useState(null); const [topics,setTopics]=useState(null); const [titles,setTitles]=useState(null);
  const [loading,setLoading]=useState({guests:false,topics:false,titles:false});
  const hasYT=ytVideos&&ytVideos.length>0;
  const run=async(type)=>{
    setLoading(p=>({...p,[type]:true}));
    if(type==="guests"){const r=await genGuests(name,ytVideos||[],fallback);setGuests(r);}
    if(type==="topics"){const r=await genTopics(name,ytVideos||[],fallback);setTopics(r);}
    if(type==="titles"){const r=await genTitles(name,ytVideos||[],fallback);setTitles(r);}
    setLoading(p=>({...p,[type]:false}));
  };
  const Block=({title,type,result})=>(
    <div style={{...cardAlt,marginBottom:"10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <span style={{...heading,fontSize:"12px",color,letterSpacing:".08em"}}>{title}</span>
        <button onClick={()=>run(type)} disabled={loading[type]} style={{background:"transparent",border:`1px solid ${color}`,color,padding:"4px 14px",fontSize:"11px",fontWeight:"700",cursor:"pointer",fontFamily:B.font,borderRadius:"3px",opacity:loading[type]?0.5:1}}>
          {loading[type]?"Analyzing…":result?"Refresh":"Run Analysis"}
        </button>
      </div>
      {!result&&!loading[type]&&<div style={{fontSize:"13px",color:B.textMute,fontStyle:"italic",fontFamily:B.font}}>{hasYT?`Using ${ytVideos.length} live YouTube episodes.`:"Using spreadsheet data."}</div>}
      {loading[type]&&<div style={{fontSize:"13px",color:B.textSub,fontFamily:B.font}}>Analyzing…</div>}
      {result&&type==="guests"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[
              {l:`Guest avg (${result.metric||"views"})`,v:result.guestAvg>0?fmt(result.guestAvg):"—"},
              {l:`Solo avg (${result.metric||"views"})`,v:result.soloAvg>0?fmt(result.soloAvg):"—"},
              {l:"Guest vs solo",v:result.delta||"N/A",c:result.delta?.includes("+")?"#4fafb8":"#de6f3f"},
            ].map((m,i)=>(
              <div key={i} style={{background:B.bg,borderRadius:"4px",padding:"10px 12px"}}>
                <div style={{...label,marginBottom:"4px"}}>{m.l}</div>
                <div style={{fontSize:"18px",fontWeight:"700",color:m.c||B.text,fontFamily:B.font}}>{m.v}</div>
              </div>
            ))}
          </div>
          {result.insight&&<div style={{fontSize:"13px",color:B.textSub,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}`,fontFamily:B.font}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"4px 0",marginBottom:"4px"}}>
            {["Guest","Episode",result.metric||"Views"].map((h,i)=><div key={i} style={{...label,flex:i===0?1:i===1?"0 0 200px":"0 0 70px",textAlign:i===2?"right":"left",marginBottom:0}}>{h}</div>)}
          </div>
          {result.guestEpisodes?.filter(e=>e.guest).slice(0,6).map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 0",borderBottom:`1px solid ${B.borderSub}`}}>
              <span style={{flex:1,fontSize:"14px",color:B.text,fontWeight:"600",fontFamily:B.font}}>{e.guest}</span>
              <span style={{width:"200px",fontSize:"12px",color:B.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:B.font}}>{e.title?.slice(0,35)}</span>
              <span style={{width:"70px",fontSize:"13px",color:B.text,textAlign:"right",fontFamily:B.font}}>{e.views>0?fmt(e.views):"—"}</span>
            </div>
          ))}
        </div>
      )}
      {result&&type==="topics"&&(
        <div>
          {result.insight&&<div style={{fontSize:"13px",color:B.textSub,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}`,fontFamily:B.font}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"6px 10px",marginBottom:"4px",background:B.bg,borderRadius:"3px"}}>
            {["Topic","Eps",`Avg ${result.metric||"Views"}`,"vs Avg"].map((h,i)=><div key={i} style={{...label,flex:i===0?1:"none",width:i===1?"40px":i===2?"80px":"60px",textAlign:i>1?"right":"left",marginBottom:0}}>{h}</div>)}
          </div>
          {result.topicPerformance?.slice(0,6).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderBottom:`1px solid ${B.borderSub}`}}>
              <div style={{flex:1,fontSize:"14px",color:B.text,fontFamily:B.font}}>{t.topic}</div>
              <div style={{width:"40px",fontSize:"13px",color:B.textMute,textAlign:"center",fontFamily:B.font}}>{t.count}</div>
              <div style={{width:"80px",fontSize:"13px",color:B.text,textAlign:"right",fontFamily:B.font}}>{fmt(t.avgViews||t.avgD7)}</div>
              <div style={{width:"60px",fontSize:"13px",fontWeight:"700",color:t.vsBaseline?.includes("+")?"#4fafb8":"#de6f3f",textAlign:"right",fontFamily:B.font}}>{t.vsBaseline}</div>
            </div>
          ))}
        </div>
      )}
      {result&&type==="titles"&&(
        <div>
          {result.insight&&<div style={{fontSize:"13px",color:B.textSub,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:`2px solid ${color}`,fontFamily:B.font}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"6px 10px",marginBottom:"4px",background:B.bg,borderRadius:"3px"}}>
            {["Pattern",`Avg ${result.metric||"Views"}`,"vs Avg"].map((h,i)=><div key={i} style={{...label,flex:i===0?1:"none",width:i===1?"90px":"60px",textAlign:i>0?"right":"left",marginBottom:0}}>{h}</div>)}
          </div>
          {result.patterns?.map((p,i)=>(
            <div key={i} style={{marginBottom:"8px",paddingBottom:"8px",borderBottom:`1px solid ${B.borderSub}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"0 10px"}}>
                <span style={{flex:1,fontSize:"14px",color:B.text,fontWeight:"600",fontFamily:B.font}}>{p.pattern}</span>
                <span style={{width:"90px",fontSize:"13px",color:B.textMute,textAlign:"right",fontFamily:B.font}}>{fmt(p.avgViews||p.avgD7)} · {p.count} eps</span>
                <span style={{width:"60px",fontSize:"13px",color:p.vsBaseline?.includes("+")?"#4fafb8":"#de6f3f",fontWeight:"700",textAlign:"right",fontFamily:B.font}}>{p.vsBaseline}</span>
              </div>
              {p.examples?.[0]&&<div style={{fontSize:"12px",color:B.textMute,marginTop:"3px",padding:"0 10px",fontFamily:B.font}}>e.g. "{p.examples[0].slice(0,55)}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div style={{marginTop:"20px"}}>
      <div style={{...label,marginBottom:"12px"}}>Deep Insights{hasYT?` · ${ytVideos.length} live YouTube episodes`:" · loading YouTube…"}</div>
      <Block title="Guest Performance" type="guests" result={guests}/>
      <Block title="Topic Performance Index" type="topics" result={topics}/>
      <Block title="Title Pattern Analysis" type="titles" result={titles}/>
    </div>
  );
}

// ── Show Page ─────────────────────────────────────────────────────────────────
function ShowPage({show}) {
  const {id,name,color,channelId}=show;
  const fallback=FALLBACK[id]||[];
  const [ytVideos,setYtVideos]=useState([]); const [ytLoading,setYtLoading]=useState(true); const [sort,setSort]=useState("views");
  useEffect(()=>{fetchYTCached(channelId).then(v=>{setYtVideos(v);setYtLoading(false);});},[channelId]);
  const displayEps=ytVideos.length>0?ytVideos:fallback.map(e=>({...e,views:e.d7,likes:0,comments:0}));
  const sorted=[...displayEps].sort((a,b)=>sort==="views"?(b.views||0)-(a.views||0):new Date(b.date||0)-new Date(a.date||0));
  const avgViews=displayEps.length?Math.round(displayEps.map(e=>e.views||0).reduce((a,b)=>a+b,0)/displayEps.length):0;
  const top=[...displayEps].sort((a,b)=>(b.views||0)-(a.views||0))[0];
  const recent4=displayEps.slice(0,4); const prior4=displayEps.slice(4,8);
  const r4=recent4.length?Math.round(recent4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/recent4.length):0;
  const p4=prior4.length?Math.round(prior4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/prior4.length):0;
  const trend=p4?Math.round(((r4-p4)/p4)*100):0;
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"6px"}}>
          <div style={{width:"5px",height:"32px",background:color,borderRadius:"2px"}}/>
          <h2 style={{...heading,fontSize:"26px",margin:0,color:B.text}}>{name}</h2>
        </div>
        <div style={{fontSize:"13px",color:ytLoading?B.textMute:B.green,marginLeft:"19px",fontFamily:B.font}}>
          {ytLoading?"Loading live YouTube data…":`✓ ${ytVideos.length} live YouTube episodes loaded`}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {l:"Rolling 4-ep avg (YT views)",v:fmt(r4),s:p4?`${trend>=0?"+":""}${trend}% vs prior 4`:null,sc:trend>=0?"#4fafb8":"#de6f3f"},
          {l:"Avg YouTube views",v:fmt(avgViews),s:`across ${displayEps.length} episodes`},
          {l:"Top episode",v:fmt(top?.views),s:top?.title?.slice(0,28)+"…",ac:color},
          {l:"Data source",v:ytVideos.length>0?"YouTube":"Sheet",s:ytVideos.length>0?`${ytVideos.length} eps`:"fallback"},
        ].map((m,i)=>(
          <div key={i} style={card}>
            <div style={label}>{m.l}</div>
            <div style={{fontSize:"24px",fontWeight:"900",color:m.ac||B.text,fontFamily:B.font}}>{m.v}</div>
            {m.s&&<div style={{fontSize:"13px",color:m.sc||B.textMute,marginTop:"4px",fontFamily:B.font}}>{m.s}</div>}
          </div>
        ))}
      </div>
      <TakeawayBlock showName={name} color={color} ytVideos={ytVideos} fallback={fallback}/>
      <div style={{...card,marginBottom:"10px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          {[["views","By Views"],["date","By Date"]].map(([k,l])=>(
            <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?color:"transparent",border:`1px solid ${sort===k?color:B.border}`,color:sort===k?B.bg:B.textMute,padding:"5px 14px",fontSize:"12px",fontWeight:"700",cursor:"pointer",fontFamily:B.font,borderRadius:"3px"}}>{l}</button>
          ))}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",fontFamily:B.font}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${B.border}`}}>
                {["Date","Episode","Views","Likes","Comments","Guest","Sentiment"].map(h=>(
                  <th key={h} style={{...label,padding:"8px 10px",textAlign:"left",whiteSpace:"nowrap",marginBottom:0}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${B.borderSub}`}} onMouseEnter={e=>e.currentTarget.style.background=B.cardAlt} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px",color:B.textMute,whiteSpace:"nowrap"}}>{ep.date?.slice(0,10)}</td>
                  <td style={{padding:"10px",color:B.text,maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:"600"}}>{ep.title}</td>
                  <td style={{padding:"10px",color:B.text,whiteSpace:"nowrap",fontWeight:"700"}}>{fmt(ep.views)}</td>
                  <td style={{padding:"10px",color:B.textSub}}>{fmt(ep.likes)}</td>
                  <td style={{padding:"10px",color:B.textSub}}>{fmt(ep.comments)}</td>
                  <td style={{padding:"10px",color:ep.guest?color:B.borderSub,fontWeight:ep.guest?"600":"400"}}>{ep.guest||"—"}</td>
                  <td style={{padding:"10px"}}><Sentiment title={ep.title} showName={name} views={ep.views} color={color} ytId={ep.ytId}/></td>
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

// ── Home ──────────────────────────────────────────────────────────────────────
function Home() {
  const shows=Object.values(CHANNELS);
  const [ytMap,setYtMap]=useState({}); const [loaded,setLoaded]=useState(false);
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  useEffect(()=>{
    Promise.all(shows.map(s=>fetchYTCached(s.channelId).then(v=>[s.id,v]))).then(results=>{
      const map={};results.forEach(([id,v])=>{if(v.length)map[id]=v;});
      setYtMap(map);setLoaded(true);
    });
  },[]);
  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"12px",color:B.textMute,letterSpacing:".15em",textTransform:"uppercase",marginBottom:"6px",fontFamily:B.font}}>{today}</div>
        <h1 style={{...heading,fontSize:"32px",margin:"0 0 6px",color:B.yellow}}>Weekly Snapshot</h1>
        <div style={{fontSize:"14px",color:loaded?B.green:B.textMute,fontFamily:B.font}}>{loaded?"✓ Live YouTube data loaded for all shows":"Loading live YouTube data…"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"28px"}}>
        {shows.map(s=>{
          const vids=ytMap[s.id]||[]; const fb=FALLBACK[s.id]||[];
          const eps=vids.length>0?vids:fb;
          const r4=eps.slice(0,4); const p4=eps.slice(4,8);
          const r4avg=r4.length?Math.round(r4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/r4.length):0;
          const p4avg=p4.length?Math.round(p4.map(e=>e.views||0).reduce((a,b)=>a+b,0)/p4.length):0;
          const trend=p4avg?Math.round(((r4avg-p4avg)/p4avg)*100):0;
          const top=[...eps].sort((a,b)=>(b.views||0)-(a.views||0))[0];
          return (
            <div key={s.id} style={{...card,borderTop:`3px solid ${s.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
                <span style={{...heading,fontSize:"13px",color:s.color,letterSpacing:".06em"}}>{s.name}</span>
                {vids.length>0&&<span style={{fontSize:"11px",color:B.green,fontFamily:B.font}}>live</span>}
              </div>
              <div style={{fontSize:"32px",fontWeight:"900",color:B.text,fontFamily:B.font,marginBottom:"2px"}}>{fmt(r4avg)}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <div style={{fontSize:"12px",color:B.textMute,fontFamily:B.font}}>rolling 4-ep avg · YouTube views</div>
                {p4avg>0&&<div style={{fontSize:"12px",fontWeight:"700",color:trend>=0?"#4fafb8":"#de6f3f",fontFamily:B.font}}>{trend>=0?"+":""}{trend}% vs prior</div>}
              </div>
              <div style={{fontSize:"13px",color:B.textSub,lineHeight:"1.5",marginBottom:"4px",fontFamily:B.font,fontWeight:"600"}}>{top?.title?.slice(0,55)}{(top?.title?.length||0)>55?"…":""}</div>
              <div style={{fontSize:"12px",color:B.textMute,fontFamily:B.font}}>{fmt(top?.views)} views · top episode</div>
            </div>
          );
        })}
      </div>
      <div style={{...label,marginBottom:"14px"}}>AI Recommendations</div>
      {shows.map(s=><TakeawayBlock key={s.id} showName={s.name} color={s.color} ytVideos={ytMap[s.id]||[]} fallback={FALLBACK[s.id]||[]}/>)}
    </div>
  );
}

// ── Trends ────────────────────────────────────────────────────────────────────
function Trends() {
  const shows=Object.values(CHANNELS);
  const [active,setActive]=useState("pgm"); const [ytMap,setYtMap]=useState({});
  useEffect(()=>{shows.forEach(s=>{fetchYTCached(s.channelId).then(v=>{if(v.length)setYtMap(prev=>({...prev,[s.id]:v}));});});},[]);
  const show=CHANNELS[active]; const vids=ytMap[active]||[]; const fb=FALLBACK[active]||[];
  const eps=vids.length>0?vids:fb;
  const top10=[...eps].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,10);
  const avgViews=eps.length?Math.round(eps.map(e=>e.views||0).reduce((a,b)=>a+b,0)/eps.length):0;
  const months={};
  eps.forEach(e=>{const d=parseDate(e.date||"");if(d.getFullYear()>2000){const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;if(!months[k])months[k]=[];months[k].push(e.views||0);}});
  const mkeys=Object.keys(months).sort();
  const mavgs=mkeys.map(k=>({key:k,avg:Math.round(months[k].reduce((a,b)=>a+b,0)/months[k].length),count:months[k].length}));
  const maxAvg=mavgs.length?Math.max(...mavgs.map(m=>m.avg)):1;
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{...heading,fontSize:"26px",margin:"0 0 6px",color:B.yellow}}>Trends</h2>
        <div style={{fontSize:"13px",color:B.textMute,fontFamily:B.font}}>Historical performance by show</div>
      </div>
      <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
        {shows.map(s=>(
          <button key={s.id} onClick={()=>setActive(s.id)} style={{background:active===s.id?s.color:"transparent",border:`1px solid ${active===s.id?s.color:B.border}`,color:active===s.id?B.bg:s.color,padding:"7px 18px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:B.font,borderRadius:"3px"}}>{s.name}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"20px"}}>
        {[
          {l:"Avg YouTube views",v:fmt(avgViews),s:`across ${eps.length} episodes`},
          {l:"Best month",v:mavgs.length?fmt(Math.max(...mavgs.map(m=>m.avg))):"—",s:mavgs.find(m=>m.avg===maxAvg)?.key},
          {l:"Data source",v:vids.length>0?"Live YouTube":"Sheet",s:vids.length>0?`${vids.length} eps`:"fallback"},
        ].map((m,i)=>(
          <div key={i} style={card}>
            <div style={label}>{m.l}</div>
            <div style={{fontSize:"24px",fontWeight:"900",color:show.color,fontFamily:B.font}}>{m.v}</div>
            <div style={{fontSize:"13px",color:B.textMute,marginTop:"4px",fontFamily:B.font}}>{m.s}</div>
          </div>
        ))}
      </div>
      {eps.length>1&&(
        <div style={{...card,marginBottom:"14px"}}>
          <div style={{...label,marginBottom:"16px"}}>YouTube views per episode — last {Math.min(eps.length,50)} episodes, oldest to newest</div>
          {(()=>{
            const chartEps=[...eps].sort((a,b)=>new Date(a.date||0)-new Date(b.date||0)).slice(-50);
            const maxV=Math.max(...chartEps.map(e=>e.views||0));
            const minV=Math.min(...chartEps.map(e=>e.views||0));
            const range=maxV-minV||1;
            const H=120;
            const points=chartEps.map((e,i)=>{
              const x=(i/(chartEps.length-1))*100;
              const y=H-Math.round(((e.views||0)-minV)/range*(H-10))-5;
              return {x,y,e};
            });
            return (
              <div style={{position:"relative",height:`${H+30}px`,width:"100%"}}>
                <svg width="100%" height={H} style={{overflow:"visible"}}>
                  <polyline
                    points={points.map(p=>`${p.x}%,${p.y}`).join(" ")}
                    fill="none" stroke={show.color} strokeWidth="2" strokeLinejoin="round"/>
                  {points.map((p,i)=>(
                    <circle key={i} cx={`${p.x}%`} cy={p.y} r="3" fill={show.color} opacity="0.7">
                      <title>{p.e.title} — {fmt(p.e.views)} views ({p.e.date?.slice(0,10)})</title>
                    </circle>
                  ))}
                </svg>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:"6px"}}>
                  <div style={{fontSize:"11px",color:B.textMute,fontFamily:B.font}}>{chartEps[0]?.date?.slice(0,10)}</div>
                  <div style={{fontSize:"11px",color:B.textMute,fontFamily:B.font,textAlign:"center"}}>{fmt(minV)} — {fmt(maxV)} views range</div>
                  <div style={{fontSize:"11px",color:B.textMute,fontFamily:B.font}}>{chartEps[chartEps.length-1]?.date?.slice(0,10)}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={card}>
          <div style={label}>Top 10 episodes by YouTube views</div>
          {top10.map((ep,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:`1px solid ${B.borderSub}`}}>
              <div style={{fontSize:"13px",color:show.color,minWidth:"24px",fontWeight:"900",fontFamily:B.font}}>#{i+1}</div>
              <div style={{flex:1,fontSize:"13px",color:B.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:B.font,fontWeight:"600"}}>{ep.title}</div>
              <div style={{fontSize:"13px",color:B.text,whiteSpace:"nowrap",fontWeight:"700",fontFamily:B.font}}>{fmt(ep.views)}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={label}>Month by month</div>
          <div style={{maxHeight:"380px",overflowY:"auto"}}>
            {[...mavgs].reverse().map((m,i,arr)=>{
              const prev=arr[i+1]; const delta=prev?Math.round(((m.avg-prev.avg)/prev.avg)*100):null;
              return (
                <div key={m.key} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 0",borderBottom:`1px solid ${B.borderSub}`}}>
                  <div style={{fontSize:"13px",color:B.textMute,minWidth:"50px",fontFamily:B.font}}>{m.key.split("-")[1]+"/"+m.key.split("-")[0].slice(-2)}</div>
                  <div style={{flex:1,fontSize:"14px",color:B.text,fontWeight:"700",fontFamily:B.font}}>{fmt(m.avg)}</div>
                  <div style={{fontSize:"12px",color:B.textMute,fontFamily:B.font}}>{m.count} eps</div>
                  {delta!==null&&<div style={{fontSize:"12px",fontWeight:"700",color:delta>=0?"#4fafb8":"#de6f3f",minWidth:"45px",textAlign:"right",fontFamily:B.font}}>{delta>=0?"+":""}{delta}%</div>}
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
  const [authed,setAuthed]=useState(false); const [page,setPage]=useState("home");
  if (!authed) return <Login onLogin={()=>setAuthed(true)}/>;
  const nav=[{id:"home",label:"Home"},{id:"pgm",label:"Prof G Markets"},{id:"pgp",label:"Prof G Pod"},{id:"rm",label:"Raging Moderates"},{id:"trends",label:"Trends"}];
  return (
    <div style={{minHeight:"100vh",background:B.bg,fontFamily:B.font,color:B.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,900;1,700;1,900&family=Barlow+Condensed:ital,wght@0,400;0,700;0,900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${B.bg}}::-webkit-scrollbar-thumb{background:${B.border};border-radius:2px}`}</style>
      <div style={{position:"fixed",top:0,left:0,width:"210px",height:"100vh",background:B.card,borderRight:`1px solid ${B.border}`,padding:"28px 0",display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"0 20px",marginBottom:"32px"}}>
          <div style={{...heading,fontSize:"20px",color:B.yellow}}>PROF G</div>
          <div style={{fontSize:"10px",color:B.textMute,letterSpacing:".15em",textTransform:"uppercase",marginTop:"2px",fontFamily:B.font}}>Intelligence</div>
        </div>
        {nav.map(n=>{
          const active=page===n.id; const show=CHANNELS[n.id];
          return <button key={n.id} onClick={()=>setPage(n.id)} style={{background:active?`${show?.color||B.yellow}15`:"transparent",border:"none",textAlign:"left",padding:"10px 20px",fontSize:"13px",color:active?(show?.color||B.yellow):B.textMute,cursor:"pointer",fontFamily:B.font,fontWeight:active?"700":"400",borderLeft:`3px solid ${active?(show?.color||B.yellow):"transparent"}`,width:"100%"}}>{n.label}</button>;
        })}
        <div style={{marginTop:"auto",padding:"20px",borderTop:`1px solid ${B.border}`}}>
          <div style={{fontSize:"11px",color:B.borderSub,lineHeight:"1.6",fontFamily:B.font}}>profg2025<br/>profg-dashboard.vercel.app</div>
        </div>
      </div>
      <div style={{marginLeft:"210px",padding:"36px 40px",minHeight:"100vh"}}>
        <div style={{maxWidth:"920px"}}>
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
