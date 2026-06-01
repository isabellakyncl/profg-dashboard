const YT_CACHE = {};
const YT_CACHE = {};
import { useState, useEffect } from "react";

const PASSWORD = "profg2025";
const YT_KEY = process.env.REACT_APP_YT_API_KEY;

const BG = "#00222d";
const CARD = "#00303f";
const CARD2 = "#003a4a";
const BORDER = "#005066";
const BORDER2 = "#003d52";
const TEXT = "#ffffff";
const TEXT2 = "#b0d4db";
const TEXT3 = "#6a9aa3";
const TEAL = "#4fafb8";
const YELLOW = "#f4b547";
const ORANGE = "#de6f3f";
const PINK = "#d987b5";
const FONT = "'Barlow', sans-serif";

const CHANNELS = {
  pgm: { id:"pgm", name:"Prof G Markets",   color:ORANGE, channelId:"UCp4CBeq4nzeg9smAvdjPrig" },
  pgp: { id:"pgp", name:"Prof G Pod",       color:TEAL,   channelId:"UC1E1SVcVyU3ntWMSQEp38Yw" },
  rm:  { id:"rm",  name:"Raging Moderates", color:PINK,   channelId:"UCcvDWzvxz6Kn1iPQHMl2teA" },
};

const FALLBACK = {
  pgm: [
    {date:"2026-06-01",title:"Netflix Chief on the Future of Hollywood - ft. Ted Sarandos",views:0,likes:0,comments:0,guest:"Ted Sarandos",ytId:""},
    {date:"2026-05-29",title:"AI May Not Be Worth The Cost - Here's Why",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-27",title:"Bond Investors Are Panicking. They May Be Right",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-25",title:"How To Actually Tax The Rich",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-22",title:"SpaceX Just Filed to IPO - The Numbers Are Ugly",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-20",title:"Silicon Valley's Case Against the Wealth Tax",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-17",title:"Inside Trump's 3,700 Trades - ft. Anthony Scaramucci",views:96000,likes:3200,comments:421,guest:"Anthony Scaramucci",ytId:""},
    {date:"2026-05-15",title:"Inflation Is Soaring - Here's What Happens Next",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-13",title:"Aswath Damodaran: The AI Boom Is Headed For A Reckoning",views:236000,likes:8100,comments:1043,guest:"Aswath Damodaran",ytId:""},
    {date:"2026-05-10",title:"AI Skeptic: This Business Makes No Sense",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-08",title:"Hottest Inflation Report In 3 Years Has One Big Problem",views:0,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-05-06",title:"How AI Is Making Us All Dumber",views:0,likes:0,comments:0,guest:null,ytId:""},
  ],
  pgp: [
    {date:"2025-04-21",title:"Scott on AI, Loneliness, and What Matters at 60",views:152740,likes:0,comments:0,guest:null,ytId:""},
    {date:"2025-02-10",title:"DeepSeek Changes Everything + DOGE's Damage",views:141280,likes:0,comments:0,guest:null,ytId:""},
    {date:"2024-12-09",title:"The UnitedHealthcare CEO Shooting",views:136829,likes:0,comments:0,guest:null,ytId:""},
    {date:"2024-07-22",title:"Why is Silicon Valley Backing Trump?",views:139584,likes:0,comments:0,guest:null,ytId:""},
  ],
  rm: [
    {date:"2026-04-29",title:"Trump Blames Democrats, Demands His Ballroom",views:91757,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-04-22",title:"How Trump's Iran War Could Break the GOP - ft. Ben Shapiro",views:97051,likes:0,comments:0,guest:"Ben Shapiro",ytId:""},
    {date:"2026-04-15",title:"Trump Spirals as Iran Blockade Triggers Recession Fears",views:108830,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-04-08",title:"Trump Threatens to WIPE OUT Iran",views:99469,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-03-25",title:"Did Trump Already LOSE the War in Iran?",views:112455,likes:0,comments:0,guest:null,ytId:""},
    {date:"2026-03-11",title:"The Trump Administration on Iran",views:114783,likes:0,comments:0,guest:null,ytId:""},
  ],
};


function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if (n >= 1000) return Math.round(n/1000) + "K";
  return String(n);
}

function parseDate(s) {
  if (!s) return new Date(0);
  if (s.includes("-") && s.length >= 8) return new Date(s);
  const p = s.split("/");
  if (p.length === 3) return new Date(parseInt(p[2]), parseInt(p[0])-1, parseInt(p[1]));
  return new Date(0);
}

async function fetchYT(channelId) {
  if (!YT_KEY || !channelId) return [];
  if (YT_CACHE[channelId]) return YT_CACHE[channelId];
  try {
    const s = await fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + channelId + "&maxResults=50&order=date&publishedAfter=2026-01-01T00:00:00Z&type=video&key=" + YT_KEY);
    const sd = await s.json();
    if (!sd.items || !sd.items.length) return [];
    const ids = sd.items.map(function(v) { return v.id.videoId; }).filter(Boolean).join(",");
    const r = await fetch("https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + ids + "&key=" + YT_KEY);
    const rd = await r.json();
    const results = (rd.items || []).map(function(v) {
      const desc = v.snippet.description || "";
      const gm = desc.match(/(?:speaks? with|joined? by|with guest|ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i)
               || v.snippet.title.match(/(?:ft\.|feat\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      return {
        ytId: v.id,
        title: v.snippet.title,
        date: (v.snippet.publishedAt || "").split("T")[0],
        views: parseInt(v.statistics.viewCount) || 0,
        likes: parseInt(v.statistics.likeCount) || 0,
        comments: parseInt(v.statistics.commentCount) || 0,
        desc: desc.slice(0, 400),
        guest: gm ? gm[1] : null,
      };
    }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    return results;
  } catch(e) { return []; }
}

async function fetchComments(videoId) {
  if (!YT_KEY || !videoId) return [];
  try {
    const r = await fetch("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=" + videoId + "&maxResults=50&order=relevance&key=" + YT_KEY);
    const d = await r.json();
    if (!d.items) return [];
    return d.items.map(function(item) { return item.snippet.topLevelComment.snippet.textDisplay; }).filter(Boolean);
  } catch(e) { return []; }
}

async function callAI(prompt, tokens) {
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({prompt: prompt, maxTokens: tokens || 800})
    });
    const d = await r.json();
    return d.text || "";
  } catch(e) { return ""; }
}

async function genTakeaways(showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0
    ? ytVideos.slice(0, 8).map(function(v) { return '"' + v.title + '" - ' + fmt(v.views) + ' YT views (' + v.date + ')'; })
    : fallback.slice(0, 8).map(function(e) { return '"' + e.title + '" - ' + fmt(e.views) + ' views (' + e.date + ')'; });
  const metric = ytVideos.length > 0 ? "YouTube views" : "views";
  const vals = ytVideos.length > 0 ? ytVideos.slice(0,8).map(function(v){return v.views;}) : fallback.slice(0,8).map(function(e){return e.views;});
  const avg = vals.length ? Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length) : 0;
  const prompt = "You are a podcast strategy analyst for " + showName + ".\nData source: " + metric + ". Show avg: " + fmt(avg) + " " + metric + ".\nLast 8 episodes (most recent first):\n" + eps.join("\n") + "\n\nGive 3 specific actionable recommendations. Reference exact episode titles and numbers. Mention the timeframe (last 8 episodes).\nRespond ONLY in JSON (no markdown):\n{\"takeaways\":[{\"title\":\"<action>\",\"detail\":\"<2 sentences with specific evidence and timeframe>\"},{\"title\":\"\",\"detail\":\"\"},{\"title\":\"\",\"detail\":\"\"}],\"period\":\"last 8 episodes\",\"metric\":\"" + metric + "\"}";
  try {
    const raw = await callAI(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch(e) { return null; }
}

async function genSentiment(title, showName, views, ytId) {
  const comments = ytId ? await fetchComments(ytId) : [];
  const hasComments = comments.length > 0;
  const prompt = hasComments
    ? "Analyze real YouTube comments for " + showName + " episode: \"" + title + "\"\nViews: " + fmt(views) + "\n\nReal comments (" + comments.length + "):\n" + comments.slice(0,30).map(function(c,i){return (i+1)+". "+c.slice(0,200);}).join("\n") + "\n\nRespond ONLY in JSON (no markdown):\n{\"score\":<1-10>,\"summary\":\"<3-4 sentences based on real comments>\",\"consensus\":[\"<insight 1>\",\"<insight 2>\",\"<insight 3>\"],\"source\":\"real YouTube comments\"}"
    : "Podcast episode for " + showName + ": \"" + title + "\"\nViews: " + fmt(views) + "\nGenerate inferred audience sentiment.\nRespond ONLY in JSON (no markdown):\n{\"score\":<1-10>,\"summary\":\"<3-4 sentences>\",\"consensus\":[\"<point 1>\",\"<point 2>\",\"<point 3>\"],\"source\":\"AI inference (comments unavailable)\"}";
  try {
    const raw = await callAI(prompt, 600);
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch(e) { return null; }
}

async function genInsight(type, showName, ytVideos, fallback) {
  const eps = ytVideos.length > 0 ? ytVideos.slice(0,25) : fallback;
  const metric = ytVideos.length > 0 ? "YT views" : "views";
  const vals = eps.map(function(e){return e.views||0;});
  const avg = vals.length ? Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length) : 0;
  const epStr = eps.map(function(e){
    let s = '"' + e.title + '" - ' + fmt(e.views) + ' ' + metric;
    if (type === "guests" && e.desc) s += ' - DESC: ' + e.desc.slice(0,150);
    if (type === "guests" && e.guest) s += ' - GUEST: ' + e.guest;
    return s;
  }).join("\n");

  let prompt = "";
  if (type === "guests") {
    prompt = "Analyze guest performance for " + showName + ". Show avg: " + fmt(avg) + " " + metric + ".\nEpisodes:\n" + epStr + "\nIdentify all guest episodes, compare vs solo.\nRespond ONLY in JSON (no markdown):\n{\"guestEpisodes\":[{\"title\":\"<title>\",\"guest\":\"<name>\",\"views\":<number>}],\"guestAvg\":<number>,\"soloAvg\":<number>,\"delta\":\"<e.g. +23%>\",\"insight\":\"<1-2 sentences>\",\"metric\":\"" + metric + "\"}";
  } else if (type === "topics") {
    prompt = "Analyze topic performance for " + showName + ". Show avg: " + fmt(avg) + " " + metric + ".\nEpisodes:\n" + epStr + "\nTag 1-3 topics per episode, rank by avg " + metric + " vs baseline.\nRespond ONLY in JSON (no markdown):\n{\"topicPerformance\":[{\"topic\":\"<topic>\",\"avgViews\":<number>,\"count\":<number>,\"vsBaseline\":\"<e.g. +18%>\"}],\"insight\":\"<1-2 sentences>\",\"metric\":\"" + metric + "\"}";
  } else {
    prompt = "Analyze title patterns for " + showName + ". Show avg: " + fmt(avg) + " " + metric + ".\nEpisodes:\n" + epStr + "\nAnalyze: questions vs statements, numbers in title, guest names, title length, & or +.\nRespond ONLY in JSON (no markdown):\n{\"patterns\":[{\"pattern\":\"<pattern>\",\"avgViews\":<number>,\"count\":<number>,\"vsBaseline\":\"<e.g. +12%>\",\"examples\":[\"<title1>\"]}],\"bestPattern\":\"<winner>\",\"insight\":\"<1-2 sentences>\",\"metric\":\"" + metric + "\"}";
  }
  try {
    const raw = await callAI(prompt, 700);
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch(e) { return null; }
}

const cardStyle = {background:CARD, border:"1px solid " + BORDER, borderRadius:"4px", padding:"20px 22px"};
const card2Style = {background:CARD2, border:"1px solid " + BORDER, borderRadius:"4px", padding:"16px 18px"};
const labelStyle = {fontSize:"11px", color:TEXT3, letterSpacing:".12em", textTransform:"uppercase", fontFamily:FONT, marginBottom:"8px"};
const headStyle = {fontFamily:FONT, fontWeight:"900", fontStyle:"italic", textTransform:"uppercase"};

function Login({onLogin}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  function go() {
    if (pw === PASSWORD) { onLogin(); }
    else { setErr(true); setShake(true); setTimeout(function(){setShake(false);}, 500); }
  }
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:BG,fontFamily:FONT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,900;1,700;1,900&display=swap');*{box-sizing:border-box;}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}.shake{animation:shake .3s;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:" + BG + "}::-webkit-scrollbar-thumb{background:" + BORDER + ";border-radius:2px}"}</style>
      <div className={shake ? "shake" : ""} style={{background:CARD,border:"1px solid " + BORDER,borderRadius:"4px",padding:"48px",width:"380px",textAlign:"center"}}>
        <div style={{...headStyle,fontSize:"32px",color:YELLOW,marginBottom:"4px"}}>PROF G</div>
        <div style={{fontSize:"12px",color:TEXT3,letterSpacing:".15em",textTransform:"uppercase",marginBottom:"36px",fontFamily:FONT}}>Intelligence Dashboard</div>
        <input style={{width:"100%",background:BG,border:"1px solid " + BORDER,color:TEXT,padding:"13px 16px",fontFamily:FONT,fontSize:"15px",borderRadius:"4px",outline:"none",display:"block"}}
          type="password" placeholder="Enter password" value={pw}
          onChange={function(e){setPw(e.target.value);setErr(false);}}
          onKeyDown={function(e){if(e.key==="Enter")go();}} autoFocus/>
        {err && <div style={{fontSize:"13px",color:ORANGE,marginTop:"10px",fontFamily:FONT}}>Incorrect password</div>}
        <button style={{width:"100%",marginTop:"12px",background:YELLOW,color:BG,border:"none",padding:"14px",fontFamily:FONT,fontSize:"14px",fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",borderRadius:"4px"}} onClick={go}>Enter</button>
      </div>
    </div>
  );
}

function TakeawayBlock({showName, color, ytVideos, fallback}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    const r = await genTakeaways(showName, ytVideos || [], fallback || []);
    setData(r);
    setLoading(false);
  }
  const hasYT = ytVideos && ytVideos.length > 0;
  return (
    <div style={{...cardStyle, borderLeft:"3px solid " + color, marginBottom:"12px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
        <div>
          <span style={{...headStyle,fontSize:"13px",color:color,letterSpacing:".06em"}}>{showName} — Weekly Takeaways</span>
          {data && <span style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginLeft:"8px"}}>({data.period} · {data.metric})</span>}
          <div style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginTop:"3px"}}>
            {hasYT ? "Based on YouTube views from last 8 episodes" : "Based on most recent data · load YouTube for live analysis"}
          </div>
        </div>
        <button onClick={run} disabled={loading} style={{background:"transparent",border:"1px solid " + color,color:color,padding:"6px 16px",fontSize:"12px",fontWeight:"700",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:FONT,borderRadius:"3px",opacity:loading?0.5:1,flexShrink:0,marginLeft:"12px"}}>
          {loading ? "Analyzing..." : data ? "Refresh" : "Generate with AI"}
        </button>
      </div>
      {!data && !loading && <div style={{fontSize:"14px",color:TEXT3,fontStyle:"italic",fontFamily:FONT}}>Click Generate with AI for this week's recommendations.</div>}
      {loading && <div style={{fontSize:"14px",color:TEXT2,fontFamily:FONT}}>Analyzing most recent 8 episodes...</div>}
      {data && data.takeaways && data.takeaways.map(function(t, i) {
        return (
          <div key={i} style={{marginBottom:"14px",paddingLeft:"14px",borderLeft:"2px solid " + color + "55"}}>
            <div style={{...headStyle,fontSize:"14px",color:TEXT,marginBottom:"4px"}}>-> {t.title}</div>
            <div style={{fontSize:"14px",color:TEXT2,lineHeight:"1.65",fontFamily:FONT}}>{t.detail}</div>
          </div>
        );
      })}
    </div>
  );
}

function SentimentBtn({title, showName, views, color, ytId}) {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  async function run() {
    if (s) { setOpen(!open); return; }
    setLoading(true);
    const r = await genSentiment(title, showName, views, ytId);
    setS(r);
    setLoading(false);
    setOpen(true);
  }
  return (
    <div>
      <button onClick={run} disabled={loading} style={{background:"transparent",border:"1px solid " + BORDER,color:s?color:TEXT3,padding:"4px 12px",fontSize:"12px",cursor:"pointer",fontFamily:FONT,borderRadius:"3px",fontWeight:s?"700":"400"}}>
        {loading ? "..." : s ? s.score + "/10" : "Analyze"}
      </button>
      {open && s && (
        <div style={{marginTop:"8px",...card2Style}}>
          <div style={{...headStyle,fontSize:"20px",color:color,marginBottom:"4px"}}>{s.score}/10</div>
          <div style={{fontSize:"11px",color:s.source && s.source.includes("real") ? TEAL : TEXT3,marginBottom:"8px",fontFamily:FONT}}>{s.source || "AI inference"}</div>
          <div style={{fontSize:"13px",color:TEXT2,lineHeight:"1.65",marginBottom:"10px",fontFamily:FONT}}>{s.summary}</div>
          {s.consensus && s.consensus.map(function(c, i) {
            return <div key={i} style={{fontSize:"13px",color:TEXT2,marginBottom:"5px",paddingLeft:"10px",borderLeft:"2px solid " + color,fontFamily:FONT}}>"{c}"</div>;
          })}
          <button onClick={function(){setOpen(false);}} style={{marginTop:"8px",background:"transparent",border:"none",color:TEXT3,fontSize:"12px",cursor:"pointer",fontFamily:FONT}}>close</button>
        </div>
      )}
    </div>
  );
}

function InsightBlock({type, title, showName, color, ytVideos, fallback}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    const r = await genInsight(type, showName, ytVideos || [], fallback || []);
    setResult(r);
    setLoading(false);
  }
  const hasYT = ytVideos && ytVideos.length > 0;
  return (
    <div style={{...card2Style,marginBottom:"10px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <span style={{...headStyle,fontSize:"12px",color:color,letterSpacing:".08em"}}>{title}</span>
        <button onClick={run} disabled={loading} style={{background:"transparent",border:"1px solid " + color,color:color,padding:"4px 14px",fontSize:"11px",fontWeight:"700",cursor:"pointer",fontFamily:FONT,borderRadius:"3px",opacity:loading?0.5:1}}>
          {loading ? "Analyzing..." : result ? "Refresh" : "Run Analysis"}
        </button>
      </div>
      {!result && !loading && <div style={{fontSize:"13px",color:TEXT3,fontStyle:"italic",fontFamily:FONT}}>{hasYT ? "Using " + ytVideos.length + " live YouTube episodes." : "Using recent data."}</div>}
      {loading && <div style={{fontSize:"13px",color:TEXT2,fontFamily:FONT}}>Analyzing...</div>}
      {result && type === "guests" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            <div style={{background:BG,borderRadius:"4px",padding:"10px 12px"}}>
              <div style={{...labelStyle,marginBottom:"4px"}}>Guest avg ({result.metric || "views"})</div>
              <div style={{fontSize:"18px",fontWeight:"700",color:TEXT,fontFamily:FONT}}>{result.guestAvg > 0 ? fmt(result.guestAvg) : "-"}</div>
            </div>
            <div style={{background:BG,borderRadius:"4px",padding:"10px 12px"}}>
              <div style={{...labelStyle,marginBottom:"4px"}}>Solo avg ({result.metric || "views"})</div>
              <div style={{fontSize:"18px",fontWeight:"700",color:TEXT,fontFamily:FONT}}>{result.soloAvg > 0 ? fmt(result.soloAvg) : "-"}</div>
            </div>
            <div style={{background:BG,borderRadius:"4px",padding:"10px 12px"}}>
              <div style={{...labelStyle,marginBottom:"4px"}}>Guest vs solo</div>
              <div style={{fontSize:"18px",fontWeight:"700",color:result.delta && result.delta.includes("+") ? TEAL : ORANGE,fontFamily:FONT}}>{result.delta || "N/A"}</div>
            </div>
          </div>
          {result.insight && <div style={{fontSize:"13px",color:TEXT2,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:"2px solid " + color,fontFamily:FONT}}>{result.insight}</div>}
          {result.guestEpisodes && result.guestEpisodes.filter(function(e){return e.guest;}).slice(0,6).map(function(e,i) {
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 0",borderBottom:"1px solid " + BORDER2}}>
                <span style={{flex:1,fontSize:"14px",color:TEXT,fontWeight:"600",fontFamily:FONT}}>{e.guest}</span>
                <span style={{width:"200px",fontSize:"11px",color:TEXT3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:FONT}}>{e.title ? e.title.slice(0,35) : ""}</span>
                <span style={{width:"70px",fontSize:"13px",color:TEXT,textAlign:"right",fontFamily:FONT}}>{e.views > 0 ? fmt(e.views) : "-"}</span>
              </div>
            );
          })}
        </div>
      )}
      {result && type === "topics" && (
        <div>
          {result.insight && <div style={{fontSize:"13px",color:TEXT2,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:"2px solid " + color,fontFamily:FONT}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"6px 10px",marginBottom:"4px",background:BG,borderRadius:"3px"}}>
            <div style={{...labelStyle,flex:1,marginBottom:0}}>Topic</div>
            <div style={{...labelStyle,width:"40px",textAlign:"center",marginBottom:0}}>Eps</div>
            <div style={{...labelStyle,width:"80px",textAlign:"right",marginBottom:0}}>Avg {result.metric || "views"}</div>
            <div style={{...labelStyle,width:"55px",textAlign:"right",marginBottom:0}}>vs Avg</div>
          </div>
          {result.topicPerformance && result.topicPerformance.slice(0,6).map(function(t,i) {
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderBottom:"1px solid " + BORDER2}}>
                <div style={{flex:1,fontSize:"14px",color:TEXT,fontFamily:FONT}}>{t.topic}</div>
                <div style={{width:"40px",fontSize:"13px",color:TEXT3,textAlign:"center",fontFamily:FONT}}>{t.count}</div>
                <div style={{width:"80px",fontSize:"13px",color:TEXT,textAlign:"right",fontFamily:FONT}}>{fmt(t.avgViews || t.avgD7)}</div>
                <div style={{width:"55px",fontSize:"13px",fontWeight:"700",color:t.vsBaseline && t.vsBaseline.includes("+") ? TEAL : ORANGE,textAlign:"right",fontFamily:FONT}}>{t.vsBaseline}</div>
              </div>
            );
          })}
        </div>
      )}
      {result && type === "titles" && (
        <div>
          {result.insight && <div style={{fontSize:"13px",color:TEXT2,lineHeight:"1.65",marginBottom:"10px",paddingLeft:"10px",borderLeft:"2px solid " + color,fontFamily:FONT}}>{result.insight}</div>}
          <div style={{display:"flex",gap:"8px",padding:"6px 10px",marginBottom:"4px",background:BG,borderRadius:"3px"}}>
            <div style={{...labelStyle,flex:1,marginBottom:0}}>Pattern</div>
            <div style={{...labelStyle,width:"90px",textAlign:"right",marginBottom:0}}>Avg {result.metric || "views"}</div>
            <div style={{...labelStyle,width:"55px",textAlign:"right",marginBottom:0}}>vs Avg</div>
          </div>
          {result.patterns && result.patterns.map(function(p,i) {
            return (
              <div key={i} style={{marginBottom:"8px",paddingBottom:"8px",borderBottom:"1px solid " + BORDER2}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"0 10px"}}>
                  <span style={{flex:1,fontSize:"14px",color:TEXT,fontWeight:"600",fontFamily:FONT}}>{p.pattern}</span>
                  <span style={{width:"90px",fontSize:"13px",color:TEXT3,textAlign:"right",fontFamily:FONT}}>{fmt(p.avgViews || p.avgD7)} - {p.count} eps</span>
                  <span style={{width:"55px",fontSize:"13px",color:p.vsBaseline && p.vsBaseline.includes("+") ? TEAL : ORANGE,fontWeight:"700",textAlign:"right",fontFamily:FONT}}>{p.vsBaseline}</span>
                </div>
                {p.examples && p.examples[0] && <div style={{fontSize:"11px",color:TEXT3,marginTop:"3px",padding:"0 10px",fontFamily:FONT}}>e.g. "{p.examples[0].slice(0,55)}"</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EpisodeChart({eps, color}) {
  const [sel, setSel] = useState(null);
  const sorted = [...eps].sort(function(a,b){return new Date(a.date||0)-new Date(b.date||0);}).slice(-50);
  if (!sorted.length) return null;
  const maxV = Math.max.apply(null, sorted.map(function(e){return e.views||0;}));
  const minV = Math.min.apply(null, sorted.map(function(e){return e.views||0;}));
  const range = maxV - minV || 1;
  return (
    <div>
      <div style={{position:"relative",height:"140px",width:"100%",marginBottom:"8px",overflow:"hidden"}}>
        <svg width="100%" height="140" style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
          <polyline
            points={sorted.map(function(e,i){
              var x = (i/(sorted.length-1))*100;
              var y = 130 - Math.round(((e.views||0)-minV)/range*110);
              return x + "%," + y;
            }).join(" ")}
            fill="none" stroke={color} strokeWidth="2" opacity="0.6" strokeLinejoin="round"/>
        </svg>
        {sorted.map(function(e, i) {
          var x = (i/(sorted.length-1))*100;
          var y = 130 - Math.round(((e.views||0)-minV)/range*110);
          return (
            <div key={i}
              onClick={function(){setSel(sel===i?null:i);}}
              style={{
                position:"absolute",
                left:x+"%",
                top:y+"px",
                transform:"translate(-50%,-50%)",
                width:"10px",
                height:"10px",
                borderRadius:"50%",
                background:sel===i ? YELLOW : color,
                cursor:"pointer",
                border:"2px solid " + BG,
                zIndex:2,
              }}
              title={e.title + " - " + fmt(e.views) + " views"}
            />
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
        <span style={{fontSize:"11px",color:TEXT3,fontFamily:FONT}}>{sorted[0] ? sorted[0].date.slice(0,10) : ""}</span>
        <span style={{fontSize:"11px",color:TEXT3,fontFamily:FONT}}>click any dot for episode details</span>
        <span style={{fontSize:"11px",color:TEXT3,fontFamily:FONT}}>{sorted[sorted.length-1] ? sorted[sorted.length-1].date.slice(0,10) : ""}</span>
      </div>
      {sel !== null && sorted[sel] && (
        <div style={{background:CARD2,border:"2px solid " + color,borderRadius:"4px",padding:"16px 18px",marginTop:"4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"15px",fontWeight:"700",color:TEXT,fontFamily:FONT,marginBottom:"10px"}}>{sorted[sel].title}</div>
              <div style={{display:"flex",gap:"24px",flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginBottom:"2px"}}>YouTube views</div>
                  <div style={{fontSize:"20px",fontWeight:"900",color:color,fontFamily:FONT}}>{fmt(sorted[sel].views)}</div>
                </div>
                {sorted[sel].likes > 0 && <div>
                  <div style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginBottom:"2px"}}>Likes</div>
                  <div style={{fontSize:"20px",fontWeight:"900",color:TEXT,fontFamily:FONT}}>{fmt(sorted[sel].likes)}</div>
                </div>}
                <div>
                  <div style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginBottom:"2px"}}>Published</div>
                  <div style={{fontSize:"14px",fontWeight:"600",color:TEXT,fontFamily:FONT}}>{sorted[sel].date ? sorted[sel].date.slice(0,10) : ""}</div>
                </div>
                {sorted[sel].guest && <div>
                  <div style={{fontSize:"11px",color:TEXT3,fontFamily:FONT,marginBottom:"2px"}}>Guest</div>
                  <div style={{fontSize:"14px",fontWeight:"700",color:color,fontFamily:FONT}}>{sorted[sel].guest}</div>
                </div>}
              </div>
            </div>
            <button onClick={function(){setSel(null);}} style={{background:"transparent",border:"none",color:TEXT3,fontSize:"22px",cursor:"pointer",marginLeft:"12px",fontFamily:FONT}}>x</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShowPage({show}) {
  const fb = FALLBACK[show.id] || [];
  const [ytVideos, setYtVideos] = useState([]);
  const [ytLoading, setYtLoading] = useState(true);
  const [sort, setSort] = useState("views");
  useEffect(function() {
    fetchYT(show.channelId).then(function(v) { setYtVideos(v); setYtLoading(false); });
  }, [show.channelId]);
  const eps = ytVideos.length > 0 ? ytVideos : fb;
  const sorted = [...eps].sort(function(a,b) {
    if (sort === "views") return (b.views||0) - (a.views||0);
    return new Date(b.date||0) - new Date(a.date||0);
  });
  const avgV = eps.length ? Math.round(eps.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/eps.length) : 0;
  const top = [...eps].sort(function(a,b){return (b.views||0)-(a.views||0);})[0];
  const r4 = eps.slice(0,4); const p4 = eps.slice(4,8);
  const r4avg = r4.length ? Math.round(r4.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/r4.length) : 0;
  const p4avg = p4.length ? Math.round(p4.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/p4.length) : 0;
  const trend = p4avg ? Math.round(((r4avg-p4avg)/p4avg)*100) : 0;
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"6px"}}>
          <div style={{width:"5px",height:"32px",background:show.color,borderRadius:"2px"}}/>
          <h2 style={{...headStyle,fontSize:"26px",margin:0,color:TEXT}}>{show.name}</h2>
        </div>
        <div style={{fontSize:"13px",color:ytLoading?TEXT3:TEAL,marginLeft:"19px",fontFamily:FONT}}>
          {ytLoading ? "Loading live YouTube data..." : "Live YouTube data loaded - " + ytVideos.length + " episodes"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
        <div style={cardStyle}>
          <div style={labelStyle}>Rolling 4-ep avg (YouTube views)</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:TEXT,fontFamily:FONT}}>{fmt(r4avg)}</div>
          {p4avg > 0 && <div style={{fontSize:"13px",color:trend>=0?TEAL:ORANGE,marginTop:"4px",fontFamily:FONT}}>{trend>=0?"+":""}{trend}% vs prior 4 episodes</div>}
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Avg YouTube views</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:TEXT,fontFamily:FONT}}>{fmt(avgV)}</div>
          <div style={{fontSize:"13px",color:TEXT3,marginTop:"4px",fontFamily:FONT}}>across {eps.length} episodes</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Top episode (YouTube views)</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:show.color,fontFamily:FONT}}>{fmt(top ? top.views : 0)}</div>
          <div style={{fontSize:"13px",color:TEXT3,marginTop:"4px",fontFamily:FONT}}>{top ? top.title.slice(0,30) + "..." : ""}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Data source</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:TEXT,fontFamily:FONT}}>{ytVideos.length > 0 ? "YouTube" : "Cached"}</div>
          <div style={{fontSize:"13px",color:ytVideos.length>0?TEAL:TEXT3,marginTop:"4px",fontFamily:FONT}}>{ytVideos.length > 0 ? ytVideos.length + " live episodes" : "using fallback data"}</div>
        </div>
      </div>
      <TakeawayBlock showName={show.name} color={show.color} ytVideos={ytVideos} fallback={fb}/>
      <div style={{...cardStyle,marginBottom:"10px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
          {[["views","By Views"],["date","By Date"]].map(function(item) {
            return (
              <button key={item[0]} onClick={function(){setSort(item[0]);}} style={{background:sort===item[0]?show.color:"transparent",border:"1px solid " + (sort===item[0]?show.color:BORDER),color:sort===item[0]?BG:TEXT3,padding:"5px 14px",fontSize:"12px",fontWeight:"700",cursor:"pointer",fontFamily:FONT,borderRadius:"3px"}}>{item[1]}</button>
            );
          })}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",fontFamily:FONT}}>
            <thead>
              <tr style={{borderBottom:"1px solid " + BORDER}}>
                {["Date","Episode","YouTube Views","Likes","Comments","Guest","Sentiment"].map(function(h) {
                  return <th key={h} style={{...labelStyle,padding:"8px 10px",textAlign:"left",whiteSpace:"nowrap",marginBottom:0}}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map(function(ep, i) {
                return (
                  <tr key={i} style={{borderBottom:"1px solid " + BORDER2}}
                    onMouseEnter={function(e){e.currentTarget.style.background=CARD2;}}
                    onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}>
                    <td style={{padding:"10px",color:TEXT3,whiteSpace:"nowrap"}}>{ep.date ? ep.date.slice(0,10) : ""}</td>
                    <td style={{padding:"10px",color:TEXT,maxWidth:"260px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:"600"}}>{ep.title}</td>
                    <td style={{padding:"10px",color:TEXT,whiteSpace:"nowrap",fontWeight:"700"}}>{fmt(ep.views)}</td>
                    <td style={{padding:"10px",color:TEXT2}}>{fmt(ep.likes)}</td>
                    <td style={{padding:"10px",color:TEXT2}}>{fmt(ep.comments)}</td>
                    <td style={{padding:"10px",color:ep.guest?show.color:BORDER,fontWeight:ep.guest?"600":"400"}}>{ep.guest || "-"}</td>
                    <td style={{padding:"10px"}}><SentimentBtn title={ep.title} showName={show.name} views={ep.views} color={show.color} ytId={ep.ytId}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{marginTop:"20px"}}>
        <div style={{...labelStyle,marginBottom:"12px"}}>Deep Insights - {ytVideos.length > 0 ? ytVideos.length + " live YouTube episodes" : "using cached data"}</div>
        <InsightBlock type="guests" title="Guest Performance" showName={show.name} color={show.color} ytVideos={ytVideos} fallback={fb}/>
        <InsightBlock type="topics" title="Topic Performance Index" showName={show.name} color={show.color} ytVideos={ytVideos} fallback={fb}/>
        <InsightBlock type="titles" title="Title Pattern Analysis" showName={show.name} color={show.color} ytVideos={ytVideos} fallback={fb}/>
      </div>
    </div>
  );
}

function Home() {
  const shows = Object.values(CHANNELS);
  const [ytMap, setYtMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {weekday:"long",month:"long",day:"numeric"});
  useEffect(function() {
    Promise.all(shows.map(function(s) {
      return fetchYT(s.channelId).then(function(v) { return [s.id, v]; });
    })).then(function(results) {
      var map = {};
      results.forEach(function(r) { if (r[1].length) map[r[0]] = r[1]; });
      setYtMap(map);
      setLoaded(true);
    });
  }, []);
  return (
    <div>
      <div style={{marginBottom:"28px"}}>
        <div style={{fontSize:"12px",color:TEXT3,letterSpacing:".15em",textTransform:"uppercase",marginBottom:"6px",fontFamily:FONT}}>{today}</div>
        <h1 style={{...headStyle,fontSize:"32px",margin:"0 0 6px",color:YELLOW}}>Weekly Snapshot</h1>
        <div style={{fontSize:"14px",color:loaded?TEAL:TEXT3,fontFamily:FONT}}>{loaded ? "Live YouTube data loaded for all shows" : "Loading live YouTube data..."}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"28px"}}>
        {shows.map(function(s) {
          const vids = ytMap[s.id] || [];
          const fb = FALLBACK[s.id] || [];
          const eps = vids.length > 0 ? vids : fb;
          const r4 = eps.slice(0,4); const p4 = eps.slice(4,8);
          const r4avg = r4.length ? Math.round(r4.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/r4.length) : 0;
          const p4avg = p4.length ? Math.round(p4.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/p4.length) : 0;
          const trend = p4avg ? Math.round(((r4avg-p4avg)/p4avg)*100) : 0;
          const top = [...eps].sort(function(a,b){return (b.views||0)-(a.views||0);})[0];
          return (
            <div key={s.id} style={{...cardStyle,borderTop:"3px solid " + s.color}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
                <span style={{...headStyle,fontSize:"13px",color:s.color,letterSpacing:".06em"}}>{s.name}</span>
                {vids.length > 0 && <span style={{fontSize:"11px",color:TEAL,fontFamily:FONT}}>live</span>}
              </div>
              <div style={{fontSize:"32px",fontWeight:"900",color:TEXT,fontFamily:FONT,marginBottom:"2px"}}>{fmt(r4avg)}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                <div style={{fontSize:"12px",color:TEXT3,fontFamily:FONT}}>rolling 4-ep avg - YouTube views</div>
              </div>
              {p4avg > 0 && <div style={{fontSize:"12px",fontWeight:"700",color:trend>=0?TEAL:ORANGE,fontFamily:FONT,marginBottom:"12px"}}>{trend>=0?"+":""}{trend}% vs prior 4 episodes</div>}
              <div style={{fontSize:"13px",color:TEXT2,lineHeight:"1.5",marginBottom:"4px",fontFamily:FONT,fontWeight:"600"}}>{top ? top.title.slice(0,55) + (top.title.length>55?"...":"") : ""}</div>
              <div style={{fontSize:"12px",color:TEXT3,fontFamily:FONT}}>{fmt(top ? top.views : 0)} YouTube views - top episode</div>
            </div>
          );
        })}
      </div>
      <div style={{...labelStyle,marginBottom:"14px"}}>AI Recommendations - based on YouTube views from last 8 episodes</div>
      {shows.map(function(s) {
        return <TakeawayBlock key={s.id} showName={s.name} color={s.color} ytVideos={ytMap[s.id]||[]} fallback={FALLBACK[s.id]||[]}/>;
      })}
    </div>
  );
}

function Trends() {
  const shows = Object.values(CHANNELS);
  const [active, setActive] = useState("pgm");
  const [ytMap, setYtMap] = useState({});
  useEffect(function() {
    shows.forEach(function(s) {
      fetchYT(s.channelId).then(function(v) {
        if (v.length) setYtMap(function(prev) { var m = Object.assign({}, prev); m[s.id] = v; return m; });
      });
    });
  }, []);
  const show = CHANNELS[active];
  const vids = ytMap[active] || [];
  const fb = FALLBACK[active] || [];
  const eps = vids.length > 0 ? vids : fb;
  const top10 = [...eps].sort(function(a,b){return (b.views||0)-(a.views||0);}).slice(0,10);
  const avgV = eps.length ? Math.round(eps.map(function(e){return e.views||0;}).reduce(function(a,b){return a+b;},0)/eps.length) : 0;
  const months = {};
  eps.forEach(function(e) {
    const d = parseDate(e.date || "");
    if (d.getFullYear() > 2000) {
      const k = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
      if (!months[k]) months[k] = [];
      months[k].push(e.views || 0);
    }
  });
  const mkeys = Object.keys(months).sort();
  const mavgs = mkeys.map(function(k) {
    return {key:k, avg:Math.round(months[k].reduce(function(a,b){return a+b;},0)/months[k].length), count:months[k].length};
  });
  const maxAvg = mavgs.length ? Math.max.apply(null, mavgs.map(function(m){return m.avg;})) : 1;
  return (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{...headStyle,fontSize:"26px",margin:"0 0 6px",color:YELLOW}}>Trends</h2>
        <div style={{fontSize:"13px",color:TEXT3,fontFamily:FONT}}>Historical performance by show - YouTube views</div>
      </div>
      <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
        {shows.map(function(s) {
          return (
            <button key={s.id} onClick={function(){setActive(s.id);}} style={{background:active===s.id?s.color:"transparent",border:"1px solid " + (active===s.id?s.color:BORDER),color:active===s.id?BG:s.color,padding:"7px 18px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:FONT,borderRadius:"3px"}}>{s.name}</button>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"20px"}}>
        <div style={cardStyle}>
          <div style={labelStyle}>Avg YouTube views</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:show.color,fontFamily:FONT}}>{fmt(avgV)}</div>
          <div style={{fontSize:"13px",color:TEXT3,marginTop:"4px",fontFamily:FONT}}>across {eps.length} episodes</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Best month</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:show.color,fontFamily:FONT}}>{mavgs.length ? fmt(Math.max.apply(null, mavgs.map(function(m){return m.avg;}))) : "-"}</div>
          <div style={{fontSize:"13px",color:TEXT3,marginTop:"4px",fontFamily:FONT}}>{mavgs.find(function(m){return m.avg===maxAvg;}) ? mavgs.find(function(m){return m.avg===maxAvg;}).key : ""}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Data source</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:show.color,fontFamily:FONT}}>{vids.length > 0 ? "Live YouTube" : "Cached"}</div>
          <div style={{fontSize:"13px",color:vids.length>0?TEAL:TEXT3,marginTop:"4px",fontFamily:FONT}}>{vids.length > 0 ? vids.length + " episodes" : "fallback data"}</div>
        </div>
      </div>
      <div style={{...cardStyle,marginBottom:"14px"}}>
        <div style={{...labelStyle,marginBottom:"16px"}}>YouTube views per episode - last {Math.min(eps.length,50)} episodes, oldest to newest - click any dot for details</div>
        <EpisodeChart eps={eps} color={show.color}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <div style={cardStyle}>
          <div style={labelStyle}>Top 10 episodes by YouTube views</div>
          {top10.map(function(ep, i) {
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid " + BORDER2}}>
                <div style={{fontSize:"13px",color:show.color,minWidth:"24px",fontWeight:"900",fontFamily:FONT}}>#{i+1}</div>
                <div style={{flex:1,fontSize:"13px",color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:FONT,fontWeight:"600"}}>{ep.title}</div>
                <div style={{fontSize:"13px",color:TEXT,whiteSpace:"nowrap",fontWeight:"700",fontFamily:FONT}}>{fmt(ep.views)}</div>
              </div>
            );
          })}
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Month by month - avg YouTube views</div>
          <div style={{maxHeight:"380px",overflowY:"auto"}}>
            {[...mavgs].reverse().map(function(m, i, arr) {
              const prev = arr[i+1];
              const delta = prev ? Math.round(((m.avg-prev.avg)/prev.avg)*100) : null;
              return (
                <div key={m.key} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 0",borderBottom:"1px solid " + BORDER2}}>
                  <div style={{fontSize:"13px",color:TEXT3,minWidth:"50px",fontFamily:FONT}}>{m.key.split("-")[1] + "/" + m.key.split("-")[0].slice(-2)}</div>
                  <div style={{flex:1,fontSize:"14px",color:TEXT,fontWeight:"700",fontFamily:FONT}}>{fmt(m.avg)}</div>
                  <div style={{fontSize:"12px",color:TEXT3,fontFamily:FONT}}>{m.count} eps</div>
                  {delta !== null && <div style={{fontSize:"12px",fontWeight:"700",color:delta>=0?TEAL:ORANGE,minWidth:"45px",textAlign:"right",fontFamily:FONT}}>{delta>=0?"+":""}{delta}%</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("home");
  if (!authed) return <Login onLogin={function(){setAuthed(true);}} />;
  const nav = [
    {id:"home", label:"Home"},
    {id:"pgm", label:"Prof G Markets"},
    {id:"pgp", label:"Prof G Pod"},
    {id:"rm", label:"Raging Moderates"},
    {id:"trends", label:"Trends"},
  ];
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,color:TEXT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,900;1,700;1,900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:" + BG + "}::-webkit-scrollbar-thumb{background:" + BORDER + ";border-radius:2px}"}</style>
      <div style={{position:"fixed",top:0,left:0,width:"210px",height:"100vh",background:CARD,borderRight:"1px solid " + BORDER,padding:"28px 0",display:"flex",flexDirection:"column",zIndex:10}}>
        <div style={{padding:"0 20px",marginBottom:"32px"}}>
          <div style={{...headStyle,fontSize:"20px",color:YELLOW}}>PROF G</div>
          <div style={{fontSize:"10px",color:TEXT3,letterSpacing:".15em",textTransform:"uppercase",marginTop:"2px",fontFamily:FONT}}>Intelligence</div>
        </div>
        {nav.map(function(n) {
          const active = page === n.id;
          const show = CHANNELS[n.id];
          const col = show ? show.color : YELLOW;
          return (
            <button key={n.id} onClick={function(){setPage(n.id);}} style={{background:active ? col + "15" : "transparent",border:"none",textAlign:"left",padding:"10px 20px",fontSize:"13px",color:active ? col : TEXT3,cursor:"pointer",fontFamily:FONT,fontWeight:active?"700":"400",borderLeft:"3px solid " + (active ? col : "transparent"),width:"100%"}}>
              {n.label}
            </button>
          );
        })}
        <div style={{marginTop:"auto",padding:"20px",borderTop:"1px solid " + BORDER}}>
          <div style={{fontSize:"11px",color:BORDER,lineHeight:"1.6",fontFamily:FONT}}>profg2025{"\n"}profg-dashboard.vercel.app</div>
        </div>
      </div>
      <div style={{marginLeft:"210px",padding:"36px 40px",minHeight:"100vh"}}>
        <div style={{maxWidth:"920px"}}>
          {page === "home" && <Home/>}
          {page === "pgm" && <ShowPage show={CHANNELS.pgm}/>}
          {page === "pgp" && <ShowPage show={CHANNELS.pgp}/>}
          {page === "rm" && <ShowPage show={CHANNELS.rm}/>}
          {page === "trends" && <Trends/>}
        </div>
      </div>
    </div>
  );
}
