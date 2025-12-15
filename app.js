// ===============================
// PATRON GYM OS v11.2 INFINITE (Gemini 2.5 Flash uyumlu)
// ===============================

// ====== GEMINI AYARLARI (GÜVENLİ MOD) ======

// 1. Senin şifreli anahtarın (Base64)
const SIFRELI_ANAHTAR = "QUl6YVN5QTlrcjFSck1MdmtHR3lnakJGaGF3cWFYSHVCa1BndWI0";

// 2. Şifreyi çözüyoruz (Hata buradaydı, şimdi değişkene atıyoruz)
const COZULMUS_API_KEY = atob(SIFRELI_ANAHTAR);

// KONTROL (İsteğe bağlı): F12 konsolunda anahtar görünüyor mu diye bakabilirsin
// console.log("Anahtar Durumu:", COZULMUS_API_KEY ? "Dolu" : "Boş");

// 3. Gemini Motorunu Başlatıyoruz (En kritik yer burası!)
// Eğer bu satırı yazmazsan "API Key not found" hatası alırsın.
const genAI = new GoogleGenerativeAI(COZULMUS_API_KEY);

// 4. Modeller (Patron, 2.5 diye bir model yok, 1.5 en iyisidir)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ============================================



let COACH_TONE = localStorage.getItem("coach_tone") || "short"; // short | normal
let PRIVACY_MODE = (localStorage.getItem("privacy") ?? "1") === "1"; // AI’ye full değil özet

// ====== PROGRAM DATA ======
const dayOrder = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const bodyParts = { m_shoulder:"Omuz", m_chest:"Göğüs", m_l_arm:"Sol Kol", m_r_arm:"Sağ Kol", m_waist:"Bel", m_thigh:"Bacak", m_calf:"Kalf", m_weight:"Kilo" };

const workouts = {
  "Pazartesi": [
    { id:"pzt_1", name:"Incline Dumbbell Press", sets:3, target:[6,10], type:"compound", group:"Göğüs" },
    { id:"pzt_2", name:"Flat Dumbbell Press", sets:3, target:[8,12], type:"compound", group:"Göğüs" },
    { id:"pzt_3", name:"Cable Crossover", sets:3, target:[10,15], type:"isolation", group:"Göğüs" },
    { id:"pzt_4", name:"Lateral Raise", sets:4, target:[12,15], type:"isolation", group:"Omuz" },
    { id:"pzt_5", name:"Triceps Pushdown", sets:3, target:[10,15], type:"isolation", group:"Kol" },
    { id:"pzt_6", name:"Z-Bar Skullcrusher", sets:2, target:[8,12], type:"isolation", group:"Kol" }
  ],
  "Salı": [
    { id:"sal_1", name:"Lat Pulldown", sets:3, target:[8,12], type:"compound", group:"Sırt" },
    { id:"sal_2", name:"Barbell Row", sets:4, target:[8,12], type:"compound", group:"Sırt" },
    { id:"sal_3", name:"Cable Row", sets:2, target:[8,12], type:"isolation", group:"Sırt" },
    { id:"sal_4", name:"Rear Delt Fly", sets:4, target:[12,15], type:"isolation", group:"Omuz" },
    { id:"sal_5", name:"Barbell Curl", sets:3, target:[8,12], type:"isolation", group:"Kol" },
    { id:"sal_6", name:"Hammer Curl", sets:2, target:[8,12], type:"isolation", group:"Kol" },
    { id:"sal_7", name:"Reverse/Wrist Curl", sets:2, target:[10,15], type:"isolation", group:"Kol" }
  ],
  "Çarşamba": [
    { id:"car_1", name:"Hack Squat", sets:4, target:[6,10], type:"compound", group:"Bacak" },
    { id:"car_2", name:"Leg Press", sets:3, target:[10,15], type:"compound", group:"Bacak" },
    { id:"car_3", name:"Romanian Deadlift", sets:3, target:[8,12], type:"compound", group:"Bacak" },
    { id:"car_4", name:"Leg Curl", sets:3, target:[10,15], type:"isolation", group:"Bacak" },
    { id:"car_5", name:"Leg Extension", sets:2, target:[12,15], type:"isolation", group:"Bacak" },
    { id:"car_6", name:"Standing Calf Raise", sets:4, target:[10,15], type:"isolation", group:"Bacak" }
  ],
  "Perşembe": [],
  "Cuma": [
    { id:"cum_1", name:"Seated Dumbbell Press", sets:2, target:[6,10], type:"compound", group:"Omuz" },
    { id:"cum_2", name:"Chest Press (Makine)", sets:3, target:[8,12], type:"compound", group:"Göğüs" },
    { id:"cum_3", name:"Incline Chest Press", sets:3, target:[8,12], type:"compound", group:"Göğüs" },
    { id:"cum_4", name:"Cable Crossover", sets:3, target:[10,15], type:"isolation", group:"Göğüs" },
    { id:"cum_5", name:"Lateral Raise", sets:4, target:[12,15], type:"isolation", group:"Omuz" },
    { id:"cum_6", name:"Triceps Pushdown", sets:3, target:[10,15], type:"isolation", group:"Kol" },
    { id:"cum_7", name:"Z-Bar Skullcrusher", sets:2, target:[10,12], type:"isolation", group:"Kol" }
  ],
  "Cumartesi": [
    { id:"cmt_1", name:"Lat Pulldown (Ters)", sets:3, target:[8,12], type:"compound", group:"Sırt" },
    { id:"cmt_2", name:"Machine Row", sets:3, target:[8,12], type:"compound", group:"Sırt" },
    { id:"cmt_3", name:"Cable Row (Geniş)", sets:2, target:[10,15], type:"isolation", group:"Sırt" },
    { id:"cmt_4", name:"Rear Delt Fly", sets:4, target:[12,15], type:"isolation", group:"Omuz" },
    { id:"cmt_5", name:"Barbell Curl", sets:2, target:[8,12], type:"isolation", group:"Kol" },
    { id:"cmt_6", name:"Hammer Curl", sets:2, target:[10,12], type:"isolation", group:"Kol" }
  ],
  "Pazar": []
};

// ====== STATE ======
let currentDay = "Pazartesi";
let isSickMode = false;
let charts = {};
let aiWindow = "weekly";
let bodyHeatWindow = 7;

// ====== Helpers ======
function todayStr(){ return new Date().toLocaleDateString(); }
function safeNum(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
function est1RM(w,r){ return w * (1 + (r/30)); } // Epley
function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>t.classList.remove("show"), 1500);
}
function animOn(){ return (localStorage.getItem("anim") ?? "1") === "1"; }
function aiCacheOn(){ return (localStorage.getItem("ai_cache_on") ?? "1") === "1"; }
function dateToNum(tr){
  const d = new Date(tr);
  if(!Number.isNaN(d.getTime())) return d.getTime();
  const m = String(tr).match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);
  if(m){
    const dd = Number(m[1]), mm = Number(m[2])-1, yy = Number(m[3]);
    return new Date(yy,mm,dd).getTime();
  }
  return 0;
}
function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}
function weekKey(d=new Date()){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
}
function monthKey(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

// ====== Theme / Settings ======
function applyTheme(){
  const theme = localStorage.getItem("theme") || "neo";
  document.body.setAttribute("data-theme", theme);

  const panel = document.getElementById("settings-panel");
  if(panel){
    panel.querySelectorAll(".seg-btn")?.forEach?.(b=>b.classList.remove("active"));
    const map = { neo:"NEO", gold:"GOLD", crimson:"CRIMSON" };
    const btn = Array.from(panel.querySelectorAll(".seg-btn"))
      .find(b=>b.textContent.trim()===map[theme]);
    btn?.classList.add("active");
  }
}
function setTheme(theme){
  localStorage.setItem("theme", theme);
  applyTheme();
  redrawAllCharts();
  toast(`Tema: ${theme.toUpperCase()}`);
}
function setAnimations(on){
  localStorage.setItem("anim", on ? "1" : "0");
  toast(on ? "Animasyon açık" : "Animasyon kapalı");
}
function setAICache(on){
  localStorage.setItem("ai_cache_on", on ? "1" : "0");
  toast(on ? "AI Cache açık" : "AI Cache kapalı");
}
function setPrivacyMode(on){
  localStorage.setItem("privacy", on ? "1" : "0");
  PRIVACY_MODE = on;
  toast(on ? "Gizlilik: Özet" : "Gizlilik: Normal");
}
function setCoachTone(tone){
  COACH_TONE = tone;
  localStorage.setItem("coach_tone", tone);

  // Güvenli: panel yoksa patlama
  const panel = document.getElementById("settings-panel");
  if(panel){
    // eski seçiciyi bozmayalım: varsa uygula
    const cards = panel.querySelectorAll(".setting-card");
    if(cards && cards.length){
      panel.querySelectorAll(".seg-btn")?.forEach?.(b=>b.classList.remove("active"));
    }
  }
  toast(`Koç modu: ${tone==="short"?"KISA":"NORMAL"}`);
}
function toggleSettings(){
  const p = document.getElementById("settings-panel");
  if(!p) return;
  p.style.display = (p.style.display==="block") ? "none" : "block";
}

// ====== Navigation ======
function switchView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(`view-${view}`)?.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  const btn = Array.from(document.querySelectorAll(".nav-btn"))
    .find(b=>b.getAttribute("onclick")===`switchView('${view}')`);
  btn?.classList.add("active");

  if(view==="home") renderHome();
  if(view==="tracker"){ initTracker(); renderWorkout(); }
  if(view==="program") renderProgram();
  if(view==="analytics") renderAdvancedAnalytics();
  if(view==="body") renderBodyHistory();
  if(view==="ai"){ renderAIStatsAndTrend(); renderAIReportCached(); renderAIChat(); }
}

// ====== Storage for Sessions ======
function getSessionKey(dateStr=todayStr()){ return `session_${dateStr}`; }
function readSession(dateStr=todayStr()){
  return JSON.parse(localStorage.getItem(getSessionKey(dateStr)) || "[]");
}
function writeSession(arr, dateStr=todayStr()){
  localStorage.setItem(getSessionKey(dateStr), JSON.stringify(arr));
}
function collectAllSessions(){
  const all = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith("session_")){
      try{
        const arr = JSON.parse(localStorage.getItem(k) || "[]");
        arr.forEach(x=>all.push(x));
      }catch{}
    }
  }
  all.sort((a,b)=>dateToNum(a.date)-dateToNum(b.date));
  return all;
}

// ====== PR ======
function prKey(exId){ return `pr_${exId}`; }
function updatePR(exId, oneRM, reps, weight){
  const key = prKey(exId);
  const pr = JSON.parse(localStorage.getItem(key) || "{}");
  const hits = [];
  if(!pr.oneRM || oneRM > pr.oneRM + 0.01){
    pr.oneRM = oneRM; pr.oneRMDate = todayStr(); hits.push("1RM");
  }
  if(!pr.reps || reps > pr.reps){
    pr.reps = reps; pr.repsWeight = weight; pr.repsDate = todayStr(); hits.push("REPS");
  }
  localStorage.setItem(key, JSON.stringify(pr));
  return hits;
}
function listTopPRs(limit=6){
  const exAll = [];
  Object.values(workouts).flat().forEach(e=>{
    const pr = JSON.parse(localStorage.getItem(prKey(e.id)) || "{}");
    if(pr.oneRM || pr.reps){
      exAll.push({ name:e.name, id:e.id, oneRM:pr.oneRM||0, reps:pr.reps||0, date:pr.oneRMDate||pr.repsDate||"" });
    }
  });
  exAll.sort((a,b)=> (b.oneRM-a.oneRM) || (b.reps-a.reps));
  return exAll.slice(0,limit);
}
function showAllPRs(){
  const prs = listTopPRs(999);
  if(!prs.length) return showModal("PR", "Henüz PR yok Patron.");
  const html = prs.map(p=>`
    <div class="hit">
      <div class="t">${escapeHtml(p.name)}</div>
      <div class="s">1RM≈ <b>${p.oneRM.toFixed(1)}</b> • Reps PR: <b>${p.reps}</b> • ${p.date||""}</div>
    </div>
  `).join("");
  showModal("Tüm PR", html);
}

// ====== Progress Engine ======
function windowStartMs(days){
  if(days==="all") return 0;
  const d = new Date();
  d.setDate(d.getDate()-(Number(days)-1));
  return d.getTime();
}
function aggregateWindow(days){
  const start = windowStartMs(days);
  const all = collectAllSessions().filter(x=> start===0 ? true : dateToNum(x.date)>=start);

  const vol = all.reduce((a,x)=>a+safeNum(x.volume),0);
  const sets = all.reduce((a,x)=>a+safeNum(x.sets),0);

  const map = new Map();
  all.forEach(x=>{
    const key = x.exId || x.name;
    const cur = map.get(key) || { best1:0, type:x.type||"isolation" };
    cur.best1 = Math.max(cur.best1, safeNum(x.oneRM));
    cur.type = x.type || cur.type;
    map.set(key, cur);
  });

  let strengthSum=0, strengthW=0;
  map.forEach(v=>{
    const w = (v.type==="compound") ? 1.25 : 0.65;
    strengthSum += v.best1 * w;
    strengthW += w;
  });
  const strength = strengthW>0 ? (strengthSum/strengthW) : 0;

  const groups = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  all.forEach(x=>{
    const g = x.group || "Core";
    groups[g] = (groups[g]||0) + safeNum(x.volume);
  });

  const rpes = all.map(x=>safeNum(x.avgRPE)).filter(n=>n>0);
  const avgRPE = rpes.length ? (rpes.reduce((a,b)=>a+b,0)/rpes.length) : 0;

  return { vol, sets, strength, groups, avgRPE, all };
}
function pctChange(cur, prev){
  if(prev<=0 && cur<=0) return 0;
  if(prev<=0) return 100;
  return ((cur - prev) / prev) * 100;
}
function classifyTrend(pct){
  if(pct >= 3) return { label:"Pozitif", cls:"good" };
  if(pct <= -3) return { label:"Negatif", cls:"bad" };
  return { label:"Nötr", cls:"neutral" };
}
function computeRecoveryStatus(cur7, prev7){
  const volPct = pctChange(cur7.vol, prev7.vol);
  const rpe = cur7.avgRPE || 0;

  let risk = 0;
  if(volPct > 12) risk += 1;
  if(rpe >= 9) risk += 2;
  else if(rpe >= 8.2) risk += 1;

  if(risk >= 2) return { label:"Risk", cls:"bad", sub:`Yük/RPE yüksek (ΔHacim ${volPct.toFixed(1)}%)` };
  if(risk === 1) return { label:"Dikkat", cls:"neutral", sub:`Kontrollü git (ΔHacim ${volPct.toFixed(1)}%)` };
  return { label:"İyi", cls:"good", sub:`Stabil (ΔHacim ${volPct.toFixed(1)}%)` };
}

// ====== Heatmap ======
function buildHeatmap(elId, days=30){
  const el = document.getElementById(elId);
  if(!el) return;

  const map = new Map();
  collectAllSessions().forEach(x=>{
    map.set(x.date, (map.get(x.date)||0) + safeNum(x.volume));
  });

  const vols = [];
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate()-(days-1));
  for(let i=0;i<days;i++){
    const ds = d.toLocaleDateString();
    dates.push(ds);
    vols.push(map.get(ds)||0);
    d.setDate(d.getDate()+1);
  }
  const max = Math.max(...vols, 1);

  el.innerHTML="";
  dates.forEach((ds, idx)=>{
    const v = vols[idx];
    const ratio = v/max;
    const level =
      ratio<=0.02 ? 0 :
      ratio<=0.18 ? 1 :
      ratio<=0.32 ? 2 :
      ratio<=0.48 ? 3 :
      ratio<=0.66 ? 4 : 5;

    const div = document.createElement("div");
    div.className = `heat ${level?("l"+level):""}`;
    div.title = `${ds} • Tonaj: ${Math.round(v)}`;
    el.appendChild(div);
  });
}

// ====== Body Heat SVG ======
function heatColor(level){
  if(level<=0) return "rgba(255,255,255,0.08)";
  if(level===1) return "rgba(0,217,255,0.18)";
  if(level===2) return "rgba(0,217,255,0.26)";
  if(level===3) return "rgba(0,255,157,0.28)";
  if(level===4) return "rgba(0,255,157,0.40)";
  return "rgba(255,215,0,0.34)";
}
function setBodyHeatWindow(days){
  bodyHeatWindow = days;
  document.querySelectorAll("#view-home .seg-btn.small")?.forEach?.(b=>b.classList.remove("active"));
  const btn = Array.from(document.querySelectorAll("#view-home .seg-btn.small"))
    .find(b=>b.textContent.trim()===(days===7?"7G":"30G"));
  btn?.classList.add("active");
  renderBodyHeatmap();
}
function renderBodyHeatmap(){
  const host = document.getElementById("body-heatmap");
  if(!host) return;

  const w = aggregateWindow(bodyHeatWindow);
  const g = w.groups;
  const vals = Object.values(g);
  const max = Math.max(...vals, 1);

  const lvl = (v)=> clamp(Math.ceil((v/max)*5), 0, 5);

  const chest = lvl(g["Göğüs"]);
  const back  = lvl(g["Sırt"]);
  const legs  = lvl(g["Bacak"]);
  const shoul = lvl(g["Omuz"]);
  const arms  = lvl(g["Kol"]);
  const core  = lvl(g["Core"]);

  const svg = `
  <svg viewBox="0 0 260 420" width="100%" height="100%" style="max-height:360px">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <g opacity="0.95">
      <path d="M130 20c30 0 45 18 45 40 0 10-4 18-10 26l-7 10v20c0 10 8 18 18 22l10 4c10 4 16 14 16 24v24c0 16-6 30-16 42l-10 12v76c0 18-10 34-26 42l-8 4v44H108v-44l-8-4c-16-8-26-24-26-42v-76l-10-12c-10-12-16-26-16-42v-24c0-10 6-20 16-24l10-4c10-4 18-12 18-22v-20l-7-10c-6-8-10-16-10-26 0-22 15-40 45-40z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" stroke-width="1.2"/>

      <path d="M92 148c10-10 22-16 38-16s28 6 38 16c-2 20-14 34-38 34s-36-14-38-34z"
        fill="${heatColor(chest)}" filter="url(#glow)"/>
      <path d="M92 190c10-14 22-22 38-22s28 8 38 22c-4 30-18 52-38 52s-34-22-38-52z"
        fill="${heatColor(back)}" filter="url(#glow)"/>

      <path d="M68 150c8-16 18-24 28-22 6 1 10 4 14 8-10 8-18 20-18 34-10 0-18-8-24-20z"
        fill="${heatColor(shoul)}" filter="url(#glow)"/>
      <path d="M192 150c-8-16-18-24-28-22-6 1-10 4-14 8 10 8 18 20 18 34 10 0 18-8 24-20z"
        fill="${heatColor(shoul)}" filter="url(#glow)"/>

      <path d="M52 178c-6 14-8 30-4 48l8 38c2 10 10 18 20 20-6-20-4-40 2-58l6-18c2-10-6-24-32-30z"
        fill="${heatColor(arms)}" filter="url(#glow)"/>
      <path d="M208 178c6 14 8 30 4 48l-8 38c-2 10-10 18-20 20 6-20 4-40-2-58l-6-18c-2-10 6-24 32-30z"
        fill="${heatColor(arms)}" filter="url(#glow)"/>

      <path d="M104 206c8 8 16 12 26 12s18-4 26-12v56c0 18-12 32-26 32s-26-14-26-32v-56z"
        fill="${heatColor(core)}" filter="url(#glow)"/>

      <path d="M96 292h34v108H96c-14 0-26-12-26-26V318c0-14 12-26 26-26z"
        fill="${heatColor(legs)}" filter="url(#glow)"/>
      <path d="M130 292h34c14 0 26 12 26 26v56c0 14-12 26-26 26h-34V292z"
        fill="${heatColor(legs)}" filter="url(#glow)"/>
    </g>

    <text x="12" y="408" fill="rgba(255,255,255,0.65)" font-size="12" font-family="Inter">
      Son ${bodyHeatWindow} gün yük dağılımı
    </text>
  </svg>
  `;
  host.innerHTML = svg;
}

// ====== Charts ======
function cssVar(name){
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}
function renderChart(canvasId, type, labels, datasets, opts={}){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const ctx = canvas.getContext("2d");

  if(charts[canvasId]) charts[canvasId].destroy();

  const c1 = cssVar("--a1") || "#00D9FF";
  const c2 = cssVar("--a2") || "#00FF9D";
  const c3 = cssVar("--a3") || "#FFD700";

  const ds = datasets.map((d, idx)=> {
    const color = d.borderColor || (idx===0?c1:idx===1?c2:c3);
    const bg = d.backgroundColor || (type==="line" ? `${color}22` : `${color}18`);
    return {
      ...d,
      borderColor: color,
      backgroundColor: bg,
      borderWidth: 3,
      pointRadius: type==="line" ? 2 : 0,
      tension: d.tension ?? 0.35,
      fill: d.fill ?? (type==="line")
    };
  });

  const isRadar = type==="radar" || opts.radar;
  const cfg = {
    type,
    data: { labels, datasets: ds },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ display: !opts.hideLegend, labels:{ color:"#fff", font:{ weight:"700" } } },
        tooltip:{ enabled:true }
      },
      scales: isRadar ? {} : {
        x:{ grid:{ color:"rgba(255,255,255,0.10)" }, ticks:{ color:"rgba(255,255,255,0.75)", font:{ weight:"700" } } },
        y:{ grid:{ color:"rgba(255,255,255,0.10)" }, ticks:{ color:"rgba(255,255,255,0.75)", font:{ weight:"700" } } }
      }
    }
  };

  charts[canvasId] = new Chart(ctx, cfg);
}
function redrawAllCharts(){
  renderHome();
  renderProgram();
  renderAdvancedAnalytics();
  renderAIStatsAndTrend();
}

// ====== Home ======
function computeStreak(){
  const all = collectAllSessions();
  if(!all.length) return 0;
  const map = new Map();
  all.forEach(x=> map.set(x.date, (map.get(x.date)||0) + safeNum(x.volume)));
  let streak = 0;
  let d = new Date();
  for(;;){
    const ds = d.toLocaleDateString();
    const vol = map.get(ds) || 0;
    if(vol > 0) streak++;
    else break;
    d.setDate(d.getDate()-1);
  }
  return streak;
}
function lastNDaysSeries(days=14){
  const map = new Map();
  collectAllSessions().forEach(x=> map.set(x.date, (map.get(x.date)||0) + safeNum(x.volume)));
  const labels=[], data=[];
  const d = new Date();
  d.setDate(d.getDate()-(days-1));
  for(let i=0;i<days;i++){
    const ds = d.toLocaleDateString();
    labels.push(ds.slice(0,5));
    data.push(Math.round(map.get(ds)||0));
    d.setDate(d.getDate()+1);
  }
  return { labels, data };
}
function aggregateWindowPrev(days){
  const d = new Date();
  const end = new Date();
  end.setDate(d.getDate()-days);
  const start = new Date();
  start.setDate(d.getDate()-(2*days-1));

  const startMs = start.getTime();
  const endMs = end.getTime();

  const all = collectAllSessions().filter(x=>{
    const t = dateToNum(x.date);
    return t>=startMs && t<endMs;
  });

  const vol = all.reduce((a,x)=>a+safeNum(x.volume),0);
  const sets = all.reduce((a,x)=>a+safeNum(x.sets),0);

  const map = new Map();
  all.forEach(x=>{
    const key = x.exId || x.name;
    const cur = map.get(key) || { best1:0, type:x.type||"isolation" };
    cur.best1 = Math.max(cur.best1, safeNum(x.oneRM));
    cur.type = x.type || cur.type;
    map.set(key, cur);
  });

  let strengthSum=0, strengthW=0;
  map.forEach(v=>{
    const w = (v.type==="compound") ? 1.25 : 0.65;
    strengthSum += v.best1 * w;
    strengthW += w;
  });
  const strength = strengthW>0 ? (strengthSum/strengthW) : 0;

  const groups = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  all.forEach(x=>{
    const g = x.group || "Core";
    groups[g] = (groups[g]||0) + safeNum(x.volume);
  });

  const rpes = all.map(x=>safeNum(x.avgRPE)).filter(n=>n>0);
  const avgRPE = rpes.length ? (rpes.reduce((a,b)=>a+b,0)/rpes.length) : 0;

  return { vol, sets, strength, groups, avgRPE, all };
}
function renderEngine(){
  const cur7 = aggregateWindow(7);
  const prev7 = aggregateWindowPrev(7);

  const strengthPct = pctChange(cur7.strength, prev7.strength);
  const musclePct = pctChange(cur7.vol, prev7.vol);

  const sClass = classifyTrend(strengthPct);
  const mClass = classifyTrend(musclePct);
  const rec = computeRecoveryStatus(cur7, prev7);

  const elS = document.getElementById("eng-strength");
  const elM = document.getElementById("eng-muscle");
  const elR = document.getElementById("eng-recovery");
  const subS = document.getElementById("eng-strength-sub");
  const subM = document.getElementById("eng-muscle-sub");
  const subR = document.getElementById("eng-recovery-sub");

  if(elS){
    elS.className = `engine-v ${sClass.cls}`;
    elS.textContent = `${sClass.label} (${strengthPct>=0?"+":""}${strengthPct.toFixed(1)}%)`;
  }
  if(subS) subS.textContent = `1RM trend (7g vs önceki 7g)`;

  if(elM){
    elM.className = `engine-v ${mClass.cls}`;
    elM.textContent = `${mClass.label} (${musclePct>=0?"+":""}${musclePct.toFixed(1)}%)`;
  }
  if(subM) subM.textContent = `Hacim trend (tonaj)`;

  if(elR){
    elR.className = `engine-v ${rec.cls}`;
    elR.textContent = rec.label;
  }
  if(subR) subR.textContent = rec.sub;
}
function renderHome(){
  const jsDayNames = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  currentDay = jsDayNames[new Date().getDay()];

  const hd = document.getElementById("home-date");
  const hday = document.getElementById("home-day");
  const hplan = document.getElementById("home-plan");
  if(hd) hd.textContent = todayStr();
  if(hday) hday.textContent = currentDay;

  const plan = workouts[currentDay] || [];
  if(hplan){
    hplan.textContent = plan.length ? `${plan.length} hareket • hedef: net progresyon` : `OFF • mobilite / yürüyüş`;
  }

  const sess = readSession();
  const sets = sess.reduce((a,x)=>a + safeNum(x.sets),0);
  const ton = sess.reduce((a,x)=>a + safeNum(x.volume),0);

  const hs = document.getElementById("home-sets");
  const ht = document.getElementById("home-tonnage");
  const hst = document.getElementById("home-streak");
  if(hs) hs.textContent = String(sets);
  if(ht) ht.textContent = String(Math.round(ton));
  if(hst) hst.textContent = String(computeStreak());

  const prs = listTopPRs(6);
  const prList = document.getElementById("home-pr-list");
  if(prList){
    prList.innerHTML = prs.length ? prs.map(p=>`
      <div class="pr">
        <div class="t">${escapeHtml(p.name)}</div>
        <div class="s">${p.date||""}</div>
        <div class="v">1RM≈ ${p.oneRM.toFixed(1)} • Reps ${p.reps}</div>
      </div>
    `).join("") : `<div class="muted">Henüz PR yok Patron. Kayıt gir, sistem parlar.</div>`;
  }

  buildHeatmap("heatmap", 30);
  renderBodyHeatmap();

  const series = lastNDaysSeries(14);
  renderChart("spark-tonnage", "line", series.labels, [{ label:"Tonaj", data: series.data }], { hideLegend:true });

  renderEngine();
}

// ====== Tracker ======
function initTracker(){
  const selector = document.getElementById("day-selector");
  if(!selector) return;
  selector.innerHTML = "";
  dayOrder.forEach(day=>{
    const btn = document.createElement("button");
    btn.className = `day-btn ${day===currentDay ? "active" : ""}`;
    const off = (workouts[day]?.length||0)===0;
    btn.textContent = off ? `${day.slice(0,3)} (OFF)` : day;
    btn.style.opacity = off ? "0.75" : "1";
    btn.onclick = ()=>{
      document.querySelectorAll(".day-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      currentDay = day;
      renderWorkout();
    };
    selector.appendChild(btn);
  });
}
function updateDailySummary(){
  const sess = readSession();
  const sets = sess.reduce((a,x)=>a + safeNum(x.sets),0);
  const ton = sess.reduce((a,x)=>a + safeNum(x.volume),0);
  const estMin = Math.round(sets * 2.5);

  const a = document.getElementById("sum-sets");
  const b = document.getElementById("sum-tonnage");
  const c = document.getElementById("sum-time");
  if(a) a.textContent = String(sets);
  if(b) b.textContent = String(Math.round(ton));
  if(c) c.textContent = `${estMin} dk`;

  const trendEl = document.getElementById("sum-trend");
  if(trendEl){
    const t = computeTodayTrend();
    trendEl.textContent = t.text;
    trendEl.className = `v ${t.cls}`;
  }
}
function computeTodayTrend(){
  const sess = readSession();
  if(!sess.length) return { text:"—", cls:"neutral" };

  let gain=0, cnt=0;
  sess.forEach(x=>{
    const hist = JSON.parse(localStorage.getItem(x.exId) || "[]");
    if(hist.length>=2){
      const prev = hist[hist.length-2];
      const prev1 = est1RM(prev.bestWeight, prev.bestReps);
      const cur1 = safeNum(x.oneRM);
      if(prev1>0){
        gain += ((cur1-prev1)/prev1)*100;
        cnt++;
      }
    }
  });
  if(!cnt) return { text:"Stabil", cls:"neutral" };
  const pct = gain/cnt;
  const c = classifyTrend(pct);
  return { text:`${c.label} ${pct>=0?"+":""}${pct.toFixed(1)}%`, cls:c.cls };
}
function setDayStatus(status){
  const key = `status_${todayStr()}`;
  if(status==="sick") localStorage.setItem(key, "sick");
  else localStorage.removeItem(key);
  isSickMode = status==="sick";
  renderWorkout();
}
function updateStatusUI(){
  const sick = localStorage.getItem(`status_${todayStr()}`)==="sick";
  isSickMode = sick;
  const btnS = document.getElementById("btn-sick");
  if(btnS){
    if(sick) btnS.classList.add("danger");
    else btnS.classList.remove("danger");
  }
}
function renderWorkout(){
  updateStatusUI();
  updateDailySummary();

  const container = document.getElementById("workout-container");
  if(!container) return;
  container.innerHTML = "";

  if(isSickMode){
    container.innerHTML = `<div class="wrap"><div class="card"><b>Patron, bugün OFF.</b><div class="muted" style="margin-top:6px">Toparlan, uyku, su, yürüyüş. Yarın devam.</div></div></div>`;
    return;
  }

  const list = workouts[currentDay] || [];
  if(!list.length){
    container.innerHTML = `<div class="wrap"><div class="card"><b>OFF DAY</b><div class="muted" style="margin-top:6px">Mobilite + kısa yürüyüş öneririm Patron.</div></div></div>`;
    return;
  }

  container.innerHTML += `<div class="wrap">
    <div class="card">
      <div class="card-head"><div class="card-title"><i class="fa-solid fa-pen"></i> Günlük Not</div></div>
      <input id="daily-note" class="input" placeholder="Patron, bugün notun ne? (uyku, enerji, ağrı...)" />
    </div>
  </div>`;
  const noteKey = `note_${todayStr()}`;
  setTimeout(()=>{
    const el = document.getElementById("daily-note");
    if(!el) return;
    el.value = localStorage.getItem(noteKey) || "";
    el.addEventListener("input", ()=> localStorage.setItem(noteKey, el.value));
  },0);

  list.forEach(ex=>{
    const history = JSON.parse(localStorage.getItem(ex.id) || "[]");
    const last = history[history.length-1] || null;
    const info = last ? `Son: ${last.bestWeight}kg x ${last.bestReps}` : "İlk kayıt";
    const pr = JSON.parse(localStorage.getItem(prKey(ex.id)) || "{}");
    const prBadge = pr.oneRM ? `<span class="badge pr"><i class="fa-solid fa-crown"></i> PR 1RM≈${pr.oneRM.toFixed(1)}</span>` : "";

    const trend = computeExerciseTrend(ex.id);
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <div class="ex-head">
        <div class="ex-name">${ex.name}</div>
        <div class="ex-meta">${ex.target[0]}-${ex.target[1]}</div>
      </div>
      <div class="ex-sub">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <span class="badge g-${ex.group}">${ex.group}</span>
          ${prBadge}
          <span class="badge ${trend.cls}">Trend: ${trend.text}</span>
        </div>
        <div>${info}</div>
      </div>

      <div id="sets_${ex.id}"></div>

      <div class="row gap" style="margin-top:10px; flex-wrap:wrap;">
        <button class="tool-btn" onclick="showWarmupFor('${ex.id}')"><i class="fa-solid fa-fire"></i> Isınma</button>
        <button class="tool-btn" onclick="startSmartTimer('${ex.type}')"><i class="fa-solid fa-hourglass-start"></i> Dinlenme</button>
        <button class="btn" onclick="analyzeAndSave('${ex.id}', '${escapeQuotes(ex.name)}', '${ex.group}', '${ex.type}')"><i class="fa-solid fa-check"></i> Kaydet</button>
        <button class="chip" onclick="jarvisExercise('${ex.id}')">AI İpucu</button>
      </div>
    `;
    container.appendChild(card);

    const wrap = card.querySelector(`#sets_${ex.id}`);
    for(let i=1;i<=ex.sets;i++){
      const set = document.createElement("div");
      set.className = "set";
      set.id = `row_${ex.id}_${i}`;
      set.innerHTML = `
        <div class="set-top">
          <span>SET ${i}</span>
          <button class="mic" onclick="startVoice('${ex.id}_kg_${i}', '${ex.id}_reps_${i}')"><i class="fa-solid fa-microphone"></i></button>
        </div>
        <div class="set-inputs">
          <input class="input" type="number" id="${ex.id}_kg_${i}" placeholder="KG">
          <input class="input" type="number" id="${ex.id}_reps_${i}" placeholder="Tekrar">
        </div>
        <div class="tools">
          <div class="rpe">
            <div class="rpe-dot easy" onclick="selectRPE('${ex.id}_${i}','easy')" title="Kolay"></div>
            <div class="rpe-dot medium" onclick="selectRPE('${ex.id}_${i}','medium')" title="Orta"></div>
            <div class="rpe-dot hard" onclick="selectRPE('${ex.id}_${i}','hard')" title="Tükendim"></div>
            <input type="hidden" id="${ex.id}_rpe_${i}" value="">
          </div>
          <button class="tool-btn" onclick="toggleDrop('${ex.id}_${i}')">📉 Drop</button>
        </div>
        <div id="drop_${ex.id}_${i}" class="drop">
          <input class="input" type="number" id="${ex.id}_d1kg_${i}" placeholder="Drop1 KG">
          <input class="input" type="number" id="${ex.id}_d1reps_${i}" placeholder="Drop1 Rep">
          <input class="input" type="number" id="${ex.id}_d2kg_${i}" placeholder="Drop2 KG">
          <input class="input" type="number" id="${ex.id}_d2reps_${i}" placeholder="Drop2 Rep">
        </div>
      `;
      wrap.appendChild(set);
    }

    attachDraftHandlers(ex.id, ex.sets);
  });

  updateDailySummary();
}
function escapeQuotes(s){ return String(s).replace(/'/g, "\\'"); }
function computeExerciseTrend(exId){
  const h = JSON.parse(localStorage.getItem(exId) || "[]");
  if(h.length < 3) return { text:"—", cls:"neutral" };

  const last3 = h.slice(-3).map(x=>est1RM(x.bestWeight, x.bestReps));
  const a = (last3[0]+last3[1])/2;
  const b = last3[2];
  const pct = a>0 ? ((b-a)/a)*100 : 0;
  const c = classifyTrend(pct);
  return { text:`${pct>=0?"+":""}${pct.toFixed(1)}%`, cls:c.cls };
}
function attachDraftHandlers(exId, sets){
  const dKey = `draft_${todayStr()}_${exId}_`;
  for(let i=1;i<=sets;i++){
    const kg = document.getElementById(`${exId}_kg_${i}`);
    const rp = document.getElementById(`${exId}_reps_${i}`);
    if(!kg || !rp) continue;

    kg.value = localStorage.getItem(dKey+`kg_${i}`) || "";
    rp.value = localStorage.getItem(dKey+`reps_${i}`) || "";

    const refresh = ()=>{
      localStorage.setItem(dKey+`kg_${i}`, kg.value);
      localStorage.setItem(dKey+`reps_${i}`, rp.value);
    };
    kg.addEventListener("input", refresh);
    rp.addEventListener("input", refresh);
  }
}
function selectRPE(baseId, level){
  document.querySelectorAll(`#row_${baseId} .rpe-dot`)?.forEach?.(d=>d.classList.remove("selected"));
  document.querySelector(`#row_${baseId} .${level}`)?.classList.add("selected");
  const parts = baseId.split("_");
  const exId = `${parts[0]}_${parts[1]}`;
  const setNo = parts[2];
  const hid = document.getElementById(`${exId}_rpe_${setNo}`);
  if(hid) hid.value = level;
}
function toggleDrop(rowId){
  const el = document.getElementById(`drop_${rowId}`);
  if(!el) return;
  el.style.display = (el.style.display==="grid") ? "none" : "grid";
}
function startSmartTimer(type){
  const duration = (type==="compound") ? 180 : 90;
  showModal("Dinlenme", `
    <div style="text-align:center">
      <div style="font-size:3rem; font-weight:900; background:linear-gradient(90deg,var(--a1),var(--a2),var(--a3)); -webkit-background-clip:text; color:transparent">
        <span id="timer-display">${duration}</span>
      </div>
      <div class="muted">Compound 3dk • Isolation 90sn</div>
      <div style="margin-top:10px">
        <button class="btn ghost" onclick="closeModal()">Kapat</button>
      </div>
    </div>
  `);

  let t = duration;
  clearInterval(startSmartTimer._int);
  startSmartTimer._int = setInterval(()=>{
    t--;
    const el = document.getElementById("timer-display");
    if(el) el.textContent = t;
    if(t<=0){
      clearInterval(startSmartTimer._int);
      if(el) el.textContent = "HAZIR!";
      if(navigator.vibrate) navigator.vibrate([200,100,200]);
    }
  },1000);
}
function showWarmupFor(exId){
  const pr = JSON.parse(localStorage.getItem(prKey(exId)) || "{}");
  const est = pr.oneRM ? Math.max(20, Math.round(pr.oneRM*0.75)) : 40;

  showModal("Isınma", `
    <div><b>Patron, ısınma planı:</b></div>
    <ul style="line-height:1.7">
      <li>Çok hafif x 12-15</li>
      <li>${(est*0.50).toFixed(1)} kg x 8</li>
      <li>${(est*0.70).toFixed(1)} kg x 4-5</li>
      <li><b>Çalışma:</b> ~${est} kg</li>
    </ul>
    <div class="muted tiny">Amaç: eklem + form + sinir sistemi.</div>
  `);
}

// ====== Voice ======
function startVoice(kgId, repId){
  if(!("webkitSpeechRecognition" in window)) return alert("Patron, tarayıcı ses desteklemiyor.");
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "tr-TR";
  recognition.start();

  const btn = document.querySelector(`button[onclick*='${kgId}']`);
  btn?.classList.add("listening");

  recognition.onresult = (e)=>{
    const text = e.results[0][0].transcript;
    const nums = text.match(/\d+/g);
    if(nums){
      if(nums.length>=2){
        document.getElementById(kgId).value = nums[0];
        document.getElementById(repId).value = nums[1];
      } else {
        document.getElementById(kgId).value = nums[0];
      }
    }
    btn?.classList.remove("listening");
  };
  recognition.onend = ()=> btn?.classList.remove("listening");
}

// ====== Save + AI ======
function rpeToScore(level){
  if(level==="easy") return 7.0;
  if(level==="medium") return 8.5;
  if(level==="hard") return 9.8;
  return 0;
}
async function analyzeAndSave(exId, name, group, type){
  const ex = Object.values(workouts).flat().find(x=>x.id===exId);
  const setsN = ex?.sets || 3;

  let bestWeight=0, bestReps=0, volume=0, completed=0;
  let rpeSum=0, rpeCnt=0;

  for(let i=1;i<=setsN;i++){
    const k = safeNum(document.getElementById(`${exId}_kg_${i}`)?.value);
    const r = safeNum(document.getElementById(`${exId}_reps_${i}`)?.value);

    const rpe = document.getElementById(`${exId}_rpe_${i}`)?.value || "";
    const rpeScore = rpeToScore(rpe);
    if(rpeScore>0){ rpeSum += rpeScore; rpeCnt++; }

    if(k>0 && r>0){
      completed++;
      volume += k*r;

      const one = est1RM(k,r);
      if(one > est1RM(bestWeight,bestReps)){
        bestWeight=k; bestReps=r;
      }
    }
  }

  if(bestWeight===0) return alert("Patron, boş veri girme.");

  const history = JSON.parse(localStorage.getItem(exId) || "[]");
  history.push({ date: todayStr(), bestWeight, bestReps });
  localStorage.setItem(exId, JSON.stringify(history));

  const sess = readSession();
  const record = {
    date: todayStr(),
    day: currentDay,
    exId,
    name,
    group,
    type,
    bestWeight,
    bestReps,
    oneRM: est1RM(bestWeight,bestReps),
    sets: completed,
    volume,
    avgRPE: rpeCnt ? Number((rpeSum/rpeCnt).toFixed(2)) : 0
  };
  const idx = sess.findIndex(x=>x.exId===exId);
  if(idx>=0) sess[idx]=record; else sess.push(record);
  writeSession(sess);

  const hits = updatePR(exId, record.oneRM, bestReps, bestWeight);
  if(hits.length) toast(`🔥 PR: ${hits.join(" + ")}`);
  else toast("Kaydedildi");

  updateDailySummary();
  renderHome();

  showModal("JARVIS", `<div class="muted">Patron, koç yorumu hazırlanıyor...</div>`);
  try{
    const prompt = buildCoachPrompt({
      mode: "micro_comment",
      title: name,
      payload: {
        best: `${bestWeight}kg x ${bestReps} (1RM≈${record.oneRM.toFixed(1)})`,
        volume: Math.round(volume),
        avgRPE: record.avgRPE,
        target: ex ? `${ex.target[0]}-${ex.target[1]}` : ""
      }
    });
    const txt = await geminiText(prompt);
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}

// ====== Program View ======
function renderProgram(){
  const cal = document.getElementById("program-calendar");
  const listEl = document.getElementById("program-list");
  if(!cal || !listEl) return;

  cal.innerHTML = "";
  dayOrder.forEach(day=>{
    const dayList = workouts[day] || [];
    const totalSets = dayList.reduce((a,x)=>a + safeNum(x.sets),0);
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <div class="day-title">
        <span>${day}</span>
        <span class="day-chip">${dayList.length ? `${dayList.length} hareket • ${totalSets} set` : "OFF"}</span>
      </div>
      <div id="day_${day}"></div>
    `;
    cal.appendChild(card);

    const area = card.querySelector(`#day_${day}`);
    if(!dayList.length){
      area.innerHTML = `<div class="muted tiny" style="margin-top:10px;">Dinlenme / mobilite</div>`;
    } else {
      dayList.forEach(ex=>{
        const chip = document.createElement("div");
        chip.className = "ex-chip";
        chip.innerHTML = `
          <div class="n">${ex.name}</div>
          <div class="g g-${ex.group}">${ex.group}</div>
        `;
        area.appendChild(chip);
      });
    }
  });

  const byGroup = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  dayOrder.forEach(day=>{
    (workouts[day]||[]).forEach(ex=>{
      byGroup[ex.group] = (byGroup[ex.group]||0) + safeNum(ex.sets);
    });
  });

  listEl.innerHTML = Object.keys(byGroup).map(g=>`
    <div class="pl">
      <div class="t">${g}</div>
      <div class="s">Haftalık set: <b>${byGroup[g]}</b></div>
    </div>
  `).join("");

  renderChart("program-radar","radar", Object.keys(byGroup), [{
    label:"Haftalık Set Dağılımı",
    data: Object.keys(byGroup).map(k=>byGroup[k])
  }], { radar:true });
}
function showProgramStats(){
  const byDay = {};
  dayOrder.forEach(d=>{
    const list = workouts[d] || [];
    byDay[d] = { ex:list.length, sets:list.reduce((a,x)=>a+safeNum(x.sets),0), groups:[...new Set(list.map(x=>x.group))] };
  });
  const html = dayOrder.map(d=>`
    <div class="hit">
      <div class="t">${d}</div>
      <div class="s">${byDay[d].ex} hareket • ${byDay[d].sets} set • ${byDay[d].groups.join(", ") || "OFF"}</div>
    </div>
  `).join("");
  showModal("Plan İstatistik", html);
}

// ====== Advanced Analytics ======
function computeWindowStats(windowValue){
  const start = windowValue==="all" ? 0 : windowStartMs(windowValue);
  const all = collectAllSessions().filter(x=> start===0 ? true : dateToNum(x.date)>=start);

  const dayMap = new Map();
  all.forEach(x=>{
    const key = x.date;
    const cur = dayMap.get(key) || { tonnage:0, sets:0, sessions:0, avg1rm:0, cnt:0 };
    cur.tonnage += safeNum(x.volume);
    cur.sets += safeNum(x.sets);
    cur.sessions = 1;
    cur.avg1rm += safeNum(x.oneRM);
    cur.cnt += 1;
    dayMap.set(key, cur);
  });

  const dates = Array.from(dayMap.keys()).sort((a,b)=>dateToNum(a)-dateToNum(b));
  const labels = dates.map(d=>d.slice(0,5));
  const metricSeries = (metric)=>{
    return dates.map(d=>{
      const o = dayMap.get(d);
      if(metric==="tonnage") return Math.round(o.tonnage);
      if(metric==="sets") return Math.round(o.sets);
      if(metric==="sessions") return o.sessions ? 1 : 0;
      if(metric==="avg1rm") return o.cnt ? Number((o.avg1rm/o.cnt).toFixed(1)) : 0;
      return 0;
    });
  };

  const groups = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  all.forEach(x=>{
    const g = x.group || "Core";
    groups[g] = (groups[g]||0) + safeNum(x.volume);
  });

  return { labels, metricSeries, groups, all };
}
function renderAdvancedAnalytics(){
  const win = document.getElementById("ana-window")?.value || "30";
  const metric = document.getElementById("ana-metric")?.value || "tonnage";
  const s = computeWindowStats(win);

  const title = metric==="tonnage" ? "Tonaj" : metric==="sets" ? "Set" : metric==="sessions" ? "Seans" : "Ortalama 1RM";
  const data = s.metricSeries(metric);

  renderChart("ana-main","line", s.labels, [{ label:title, data }], {});

  const glabels = Object.keys(s.groups);
  const gdata = glabels.map(k=>Math.round(s.groups[k]));
  renderChart("ana-radar","radar", glabels, [{ label:"Kas grubu hacim", data:gdata }], { radar:true });

  const hmDays = win==="all" ? 60 : Math.min(Number(win), 60);
  buildHeatmap("ana-heatmap", hmDays);
}
function showAnalyticsHelp(){
  showModal("Analiz", `
    <div>
      <b>Tonaj:</b> kg×tekrar toplamı.<br>
      <b>Ortalama 1RM:</b> trend görmek için tahmin.<br>
      <b>Kas dengesi:</b> hacim dağılımı.<br><br>
      <span class="muted tiny">Patron, amaç: “yükseliyor muyum / düşüyor muyum?” net görmek.</span>
    </div>
  `);
}

// ====== Body ======
function saveMeasurements(){
  const s = {}; let filled=false;
  Object.keys(bodyParts).forEach(k=>{
    const el = document.getElementById(k);
    const v = el?.value;
    if(v){ s[k]=parseFloat(v); filled=true; }
    if(el) el.value="";
  });
  if(!filled) return alert("Patron, veri gir.");
  s.date = todayStr();
  const h = JSON.parse(localStorage.getItem("body_stats") || "[]");
  h.push(s);
  localStorage.setItem("body_stats", JSON.stringify(h));
  toast("Ölçü kaydedildi");
  renderBodyHistory();
}
function renderBodyHistory(){
  const c = document.getElementById("measurement-history");
  if(!c) return;
  const h = JSON.parse(localStorage.getItem("body_stats") || "[]");
  if(!h.length){
    c.innerHTML = `<div class="muted">Kayıt yok Patron.</div>`;
    return;
  }

  const last = h[h.length-1] || null;
  const prev = h[h.length-2] || null;

  c.innerHTML = h.slice().reverse().map(s=>{
    let d="";
    Object.keys(bodyParts).forEach(k=>{
      if(s[k]){
        let delta="";
        if(prev && last && s===last && prev[k] && last[k]){
          const diff = (last[k]-prev[k]);
          if(Math.abs(diff)>0.01){
            delta = ` <b style="color:${diff>0?'var(--ok)':'var(--bad)'}">(${diff>0?'+':''}${diff.toFixed(1)})</b>`;
          }
        }
        d += `${bodyParts[k]}: <b>${s[k]}</b>${delta} • `;
      }
    });
    return `<div class="hi"><div class="hd">${s.date}</div><div class="hs">${d}</div></div>`;
  }).join("");
}

// ====== Modals ======
function showModal(title, bodyHtml){
  const t = document.getElementById("modal-title");
  const b = document.getElementById("modal-body");
  const m = document.getElementById("modal");
  if(t) t.innerHTML = title;
  if(b) b.innerHTML = bodyHtml;
  if(m) m.style.display="flex";
}
function closeModal(){
  const m = document.getElementById("modal");
  if(m) m.style.display="none";
  clearInterval(startSmartTimer._int);
}

// ====== Search ======
function openSearch(){
  const sm = document.getElementById("search-modal");
  const input = document.getElementById("search-input");
  const res = document.getElementById("search-results");
  if(!sm || !input || !res) return;

  sm.style.display="flex";
  input.value="";
  res.innerHTML = `<div class="muted">Patron, yaz…</div>`;
  setTimeout(()=>input.focus(), 40);
}
function closeSearch(){
  const sm = document.getElementById("search-modal");
  if(sm) sm.style.display="none";
}
function runSearch(q){
  const results = document.getElementById("search-results");
  if(!results) return;

  q = (q||"").trim().toLowerCase();
  if(!q){ results.innerHTML = `<div class="muted">Patron, yaz…</div>`; return; }

  const hits = [];

  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith("note_")){
      const v = (localStorage.getItem(k)||"");
      if(v.toLowerCase().includes(q)){
        hits.push({ title:`Not (${k.replace("note_","")})`, sub:v.slice(0,120) });
      }
    }
  }
  collectAllSessions().forEach(x=>{
    if(String(x.name).toLowerCase().includes(q)){
      hits.push({ title:`${x.name} • ${x.date}`, sub:`${x.bestWeight}kg x ${x.bestReps} • 1RM≈${Number(x.oneRM||0).toFixed(1)} • ${x.group}` });
    }
  });

  if(!hits.length){ results.innerHTML = `<div class="muted">Sonuç yok.</div>`; return; }

  results.innerHTML = hits.slice(0,30).map(h=>`
    <div class="hit"><div class="t">${escapeHtml(h.title)}</div><div class="s">${escapeHtml(h.sub)}</div></div>
  `).join("");
}

// ====== Export / Import ======
function exportData(){
  const obj = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    obj[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Yedek indirildi");
}
function importData(input){
  const file = input.files?.[0];
  if(!file) return;
  const r = new FileReader();
  r.onload = e=>{
    try{
      const d = JSON.parse(e.target.result);
      Object.keys(d).forEach(k=>localStorage.setItem(k, d[k]));
      location.reload();
    }catch{ alert("Patron, yedek dosyası bozuk."); }
  };
  r.readAsText(file);
}
function exportCSV(){
  const rows = [];
  rows.push(["date","day","exercise","group","type","bestWeight","bestReps","oneRM","sets","volume","avgRPE"].join(","));
  collectAllSessions().forEach(x=>{
    rows.push([
      x.date,
      x.day,
      `"${String(x.name).replace(/"/g,'""')}"`,
      x.group || "",
      x.type || "",
      x.bestWeight,
      x.bestReps,
      Number(safeNum(x.oneRM)).toFixed(2),
      x.sets,
      Math.round(safeNum(x.volume)),
      Number(safeNum(x.avgRPE)).toFixed(2)
    ].join(","));
  });
  const blob = new Blob([rows.join("\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download="patron_export.csv";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("CSV indirildi");
}
function hardResetConfirm(){
  showModal("Sıfırla", `
    <div><b>Patron, dikkat:</b> tüm veriler silinir.</div>
    <div class="row gap" style="margin-top:12px; flex-wrap:wrap;">
      <button class="btn danger" onclick="hardReset()">Evet sil</button>
      <button class="btn ghost" onclick="closeModal()">Vazgeç</button>
    </div>
  `);
}
function hardReset(){ localStorage.clear(); location.reload(); }

// ====== Quick Log ======
function openQuickLog(){ const q = document.getElementById("quicklog"); if(q) q.style.display="flex"; }
function closeQuickLog(){ const q = document.getElementById("quicklog"); if(q) q.style.display="none"; }
function saveQuickLog(){
  const name = document.getElementById("q-name")?.value?.trim?.() || "";
  const group = document.getElementById("q-group")?.value || "Core";
  const kg = safeNum(document.getElementById("q-kg")?.value);
  const reps = safeNum(document.getElementById("q-reps")?.value);
  const sets = Math.max(1, safeNum(document.getElementById("q-sets")?.value || 3));
  const type = document.getElementById("q-type")?.value || "compound";

  if(!name || kg<=0 || reps<=0) return alert("Patron, isim + kg + tekrar şart.");

  const oneRM = est1RM(kg, reps);
  const volume = kg*reps*sets;

  const sess = readSession();
  sess.push({
    date: todayStr(),
    day: currentDay,
    exId: `quick_${Date.now()}`,
    name,
    group,
    type,
    bestWeight: kg,
    bestReps: reps,
    oneRM,
    sets,
    volume,
    avgRPE: 0
  });
  writeSession(sess);
  toast("Hızlı kayıt eklendi");
  closeQuickLog();

  const qn = document.getElementById("q-name"); if(qn) qn.value="";
  const qk = document.getElementById("q-kg"); if(qk) qk.value="";
  const qr = document.getElementById("q-reps"); if(qr) qr.value="";
  const qs = document.getElementById("q-sets"); if(qs) qs.value="3";

  updateDailySummary();
  renderHome();
}

// ====== AI (Gemini 2.5 Flash) ======
function coachStyleHeader(){
  const max = (COACH_TONE==="short") ? "6 maddeyi geçme. 120 kelimeyi geçme." : "Kısa tut.";
  return `Sen "JARVIS" adlı koçsun. Kullanıcıya her zaman "Patron" diye hitap et.
Üslup: samimi, net, gerçekçi. Boş motivasyon yok.
Çıktı: kısa, uygulanabilir, madde madde.
Kural: ${max}`;
}

// Gemini REST: v1beta generateContent
async function geminiText(prompt, timeoutMs=22000){
  if(!GEMINI_API_KEY || GEMINI_API_KEY==="BURAYA_KEY"){
    throw new Error("Patron, GEMINI_API_KEY boş. app.js içine key yaz.");
  }

  let lastErr = null;

  for(const model of GEMINI_MODELS){
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const controller = new AbortController();
    const t = setTimeout(()=>controller.abort(), timeoutMs);

    try{
      const body = {
        contents:[{ role:"user", parts:[{ text: prompt }]}],
        // çıktı kontrolü (JARVIS kısa kalsın)
        generationConfig:{
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: COACH_TONE==="short" ? 320 : 520
        }
      };

      const res = await fetch(url, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const json = await res.json().catch(()=> ({}));
      if(!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);

      const text = (json?.candidates?.[0]?.content?.parts || [])
        .map(p=>p.text)
        .filter(Boolean)
        .join("")
        .trim();

      if(!text) throw new Error("Boş cevap döndü.");
      return text;

    } catch(e){
      lastErr = e;
    } finally{
      clearTimeout(t);
    }
  }

  throw lastErr || new Error("AI hata verdi.");
}

function buildCoachPrompt({mode, title, payload}){
  const header = coachStyleHeader();

  if(mode==="micro_comment"){
    return `${header}
Görev: 1-2 cümle KOÇ yorumu.
Hareket: ${title}
Veri: ${JSON.stringify(payload)}
İstek: Tek somut öneri + tek uyarı (maks 2 cümle).`;
  }

  if(mode==="today_plan"){
    return `${header}
Görev: Bugün antrenman planı.
Format:
1) Isınma (3 madde)
2) Ana plan (her hareket için 1 satır: set/tekrar + RIR/RPE + dinlenme)
3) Kapanış (2 madde)
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="ex_tip"){
    return `${header}
Görev: Bu hareket için 5 satır KOÇ ipucu.
Hareket: ${title}
Son kayıt: ${JSON.stringify(payload)}`;
  }

  if(mode==="progress_explain"){
    return `${header}
Görev: Gelişim Motorunu açıkla.
Format: 4 madde + 1 mini hedef.
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="heatmap_advice"){
    return `${header}
Görev: Vücut ısı haritasına göre denge öner.
Format: 5 madde (denge, eksik, fazla, toparlanma, öneri).
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="consistency"){
    return `${header}
Görev: Devamlılık taktiği.
Format: 5 kısa madde.
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="analytics_summary"){
    return `${header}
Görev: Analiz özetle.
Format: 6 madde (durum, trend, risk, denge, öneri, hedef).
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="tracker_feedback"){
    return `${header}
Görev: Bugünkü antrenmanı değerlendir.
Format: 5 madde (gidişat, güç, hacim, risk, yarın).
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="program_balance"){
    return `${header}
Görev: Program dengesi kontrolü.
Format: 6 madde (dengeli mi? eksik kas? fazla yük? öneri).
Veri: ${JSON.stringify(payload)}`;
  }

  if(mode==="full_report"){
    return `${header}
Görev: Haftalık/Aylık rapor.
Format:
1) Durum (3 madde)
2) Risk (2 madde)
3) Öneri (5 madde)
4) Hedef (3 madde)
Veri: ${JSON.stringify(payload)}`;
  }

  return `${header}\nSoru: ${title}\nVeri: ${JSON.stringify(payload)}`;
}

// ====== AI Buttons everywhere ======
async function jarvisHome(kind){
  const box = document.getElementById("home-jarvis-mini");
  if(!box) return;

  box.innerHTML = `<div class="muted">Patron, AI çalışıyor...</div>`;

  try{
    if(kind==="today_plan"){
      await aiMakeTodayPlan(true);
      box.innerHTML = `<div>Patron, planı “Koç” sekmesine yazdım.</div>`;
      return;
    }

    if(kind==="explain_progress"){
      const cur7 = aggregateWindow(7);
      const prev7 = aggregateWindowPrev(7);
      const payload = {
        strengthPct: pctChange(cur7.strength, prev7.strength).toFixed(1),
        musclePct: pctChange(cur7.vol, prev7.vol).toFixed(1),
        avgRPE: Number(cur7.avgRPE||0).toFixed(2),
        groups7: cur7.groups
      };
      const txt = await geminiText(buildCoachPrompt({mode:"progress_explain", title:"Gelişim Motoru", payload}));
      box.innerHTML = `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`;
      return;
    }

    if(kind==="heatmap_advice"){
      const w = aggregateWindow(bodyHeatWindow);
      const payload = { windowDays: bodyHeatWindow, groups: w.groups, totalVol: Math.round(w.vol) };
      const txt = await geminiText(buildCoachPrompt({mode:"heatmap_advice", title:"Isı Haritası", payload}));
      box.innerHTML = `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`;
      return;
    }

    if(kind==="consistency_tips"){
      const payload = { streak: computeStreak(), last14: lastNDaysSeries(14).data };
      const txt = await geminiText(buildCoachPrompt({mode:"consistency", title:"Devamlılık", payload}));
      box.innerHTML = `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`;
      return;
    }
  } catch(e){
    box.innerHTML = `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`;
  }
}
async function jarvisTracker(kind){
  const sess = readSession();
  const payload = {
    day: currentDay,
    todaySets: sess.reduce((a,x)=>a+safeNum(x.sets),0),
    todayVol: Math.round(sess.reduce((a,x)=>a+safeNum(x.volume),0)),
    todayAvgRPE: (()=>{ const r=sess.map(x=>safeNum(x.avgRPE)).filter(n=>n>0); return r.length?(r.reduce((a,b)=>a+b,0)/r.length).toFixed(2):"0"; })(),
    todayTrend: computeTodayTrend().text,
    note: (localStorage.getItem(`note_${todayStr()}`)||"")
  };
  try{
    const txt = await geminiText(buildCoachPrompt({
      mode: "tracker_feedback",
      title:"Bugün",
      payload
    }));
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}
async function jarvisExercise(exId){
  const h = JSON.parse(localStorage.getItem(exId) || "[]");
  const last = h[h.length-1] || null;
  const payload = {
    last: last ? `${last.bestWeight}kg x ${last.bestReps}` : "Yok",
    trend: computeExerciseTrend(exId).text
  };
  const ex = Object.values(workouts).flat().find(x=>x.id===exId);
  try{
    const txt = await geminiText(buildCoachPrompt({mode:"ex_tip", title: ex?.name || "Hareket", payload}));
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}
async function jarvisProgram(kind){
  const byGroup = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  dayOrder.forEach(day=>{
    (workouts[day]||[]).forEach(ex=> byGroup[ex.group]=(byGroup[ex.group]||0)+safeNum(ex.sets));
  });
  try{
    const txt = await geminiText(buildCoachPrompt({mode:"program_balance", title:"Program", payload:{weeklySets:byGroup}}));
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}
async function jarvisAnalytics(kind){
  const win = document.getElementById("ana-window")?.value || "30";
  const metric = document.getElementById("ana-metric")?.value || "tonnage";
  const s = computeWindowStats(win);
  const payload = {
    window: win,
    metric,
    lastValues: s.metricSeries(metric).slice(-10),
    groups: s.groups
  };
  try{
    const txt = await geminiText(buildCoachPrompt({mode:"analytics_summary", title:"Analiz", payload}));
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}
async function jarvisBody(kind){
  const h = JSON.parse(localStorage.getItem("body_stats") || "[]");
  const last = h[h.length-1] || {};
  const prev = h[h.length-2] || {};
  const payload = { last, prev };
  try{
    const txt = await geminiText(buildCoachPrompt({mode:"analytics_summary", title:"Vücut Ölçü", payload}));
    showModal("JARVIS", `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`);
  } catch(e){
    showModal("Hata", `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`);
  }
}

// ====== AI View (Report + Chat) ======
function buildAIWindowStats(kind){
  const winDays = (kind==="weekly") ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate()-(winDays-1));
  const start = d.getTime();

  const all = collectAllSessions().filter(x=>dateToNum(x.date) >= start);
  const totalVol = all.reduce((a,x)=>a+safeNum(x.volume),0);
  const totalSets = all.reduce((a,x)=>a+safeNum(x.sets),0);
  const rpes = all.map(x=>safeNum(x.avgRPE)).filter(n=>n>0);
  const avgRPE = rpes.length ? (rpes.reduce((a,b)=>a+b,0)/rpes.length) : 0;

  const dayMap = new Map();
  all.forEach(x=> dayMap.set(x.date, (dayMap.get(x.date)||0) + safeNum(x.volume)));
  const dates = Array.from(dayMap.keys()).sort((a,b)=>dateToNum(a)-dateToNum(b));
  const labels = dates.map(d=>d.slice(0,5));
  const series = dates.map(d=>Math.round(dayMap.get(d)||0));

  const groups = { "Göğüs":0, "Sırt":0, "Bacak":0, "Omuz":0, "Kol":0, "Core":0 };
  all.forEach(x=> groups[x.group||"Core"] = (groups[x.group||"Core"]||0) + safeNum(x.volume));

  const top = (()=> {
    const byEx = new Map();
    all.forEach(x=>{
      const cur = byEx.get(x.name) || { vol:0, best1:0, count:0 };
      cur.vol += safeNum(x.volume);
      cur.best1 = Math.max(cur.best1, safeNum(x.oneRM));
      cur.count += 1;
      byEx.set(x.name, cur);
    });
    return Array.from(byEx.entries())
      .sort((a,b)=>b[1].vol-a[1].vol)
      .slice(0,5)
      .map(([name,v])=>({ name, vol:Math.round(v.vol), best1:Number(v.best1.toFixed(1)), count:v.count }));
  })();

  const note = localStorage.getItem(`note_${todayStr()}`) || "";

  return { kind, winDays, totalVol:Math.round(totalVol), totalSets:Math.round(totalSets), avgRPE:Number(avgRPE.toFixed(2)), labels, series, groups, top, note };
}
function setAIWindow(kind){
  aiWindow = kind;
  document.querySelectorAll("#view-ai .seg-btn.small")?.forEach?.(b=>b.classList.remove("active"));
  const btn = Array.from(document.querySelectorAll("#view-ai .seg-btn.small")).find(b=>b.textContent.trim()===(kind==="weekly"?"HAFTA":"AY"));
  btn?.classList.add("active");
  renderAIStatsAndTrend();
  renderAIReportCached();
}
function renderAIStatsAndTrend(){
  const stats = buildAIWindowStats(aiWindow);
  renderChart("ai-trend","line", stats.labels, [{ label:"Günlük Tonaj", data: stats.series }], {});

  const box = document.getElementById("ai-stats");
  if(!box) return;

  const topHtml = stats.top.length ? `
    <ol style="margin:10px 0 0; padding-left:18px;">
      ${stats.top.map(x=>`<li><b>${escapeHtml(x.name)}</b> — hacim <b>${x.vol}</b> • 1RM≈${x.best1}</li>`).join("")}
    </ol>` : `<div class="muted">Patron, veri az.</div>`;

  box.innerHTML = `
    <div><b>${aiWindow==="weekly" ? "Son 7 Gün" : "Son 30 Gün"}</b></div>
    <div style="margin-top:8px;">Tonaj: <b>${stats.totalVol}</b></div>
    <div>Set: <b>${stats.totalSets}</b></div>
    <div>Ortalama RPE: <b>${stats.avgRPE || 0}</b></div>
    <div style="margin-top:10px;"><b>En çok yüklenen</b></div>
    ${topHtml}
  `;
}
function renderAIReportCached(){
  const area = document.getElementById("ai-report-area");
  if(!area) return;
  const cacheId = aiWindow==="weekly" ? `ai_cache_${weekKey()}` : `ai_cache_${monthKey()}`;
  const cached = localStorage.getItem(cacheId);
  area.innerHTML = cached ? cached : `<div class="muted">Patron, “Rapor Üret” bas.</div>`;
}
async function generateAIReport(forceRefresh){
  const area = document.getElementById("ai-report-area");
  if(!area) return;

  const cacheId = aiWindow==="weekly" ? `ai_cache_${weekKey()}` : `ai_cache_${monthKey()}`;

  if(aiCacheOn() && !forceRefresh){
    const cached = localStorage.getItem(cacheId);
    if(cached){ area.innerHTML = cached; toast("Cache rapor"); return; }
  }

  const stats = buildAIWindowStats(aiWindow);
  if(stats.totalSets < 3){
    area.innerHTML = `<div class="muted">Patron, rapor için veri az. Birkaç kayıt daha.</div>`;
    return;
  }

  area.innerHTML = `<div class="muted">Patron, rapor hazırlanıyor...</div>`;

  const payload = PRIVACY_MODE
    ? { kind:aiWindow, totalVol:stats.totalVol, totalSets:stats.totalSets, avgRPE:stats.avgRPE, groups:stats.groups, top:stats.top, note:stats.note }
    : stats;

  try{
    const txt = await geminiText(buildCoachPrompt({mode:"full_report", title:"Rapor", payload}));
    const html = `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`;
    area.innerHTML = html;
    if(aiCacheOn()) localStorage.setItem(cacheId, html);
    toast("Rapor hazır");
  } catch(e){
    area.innerHTML = `<div style="color:var(--bad)">${escapeHtml(String(e.message||e))}</div>`;
  }
}
async function aiMakeTodayPlan(fromHome=false){
  const area = document.getElementById("ai-report-area");
  if(!area && !fromHome) return;

  const plan = workouts[currentDay] || [];
  if(!plan.length){
    if(!fromHome && area) area.innerHTML = `<div class="muted">Patron, bugün OFF. Mobilite + yürüyüş öneririm.</div>`;
    return;
  }

  const sess = readSession();
  const payload = {
    day: currentDay,
    todayVol: Math.round(sess.reduce((a,x)=>a+safeNum(x.volume),0)),
    note: localStorage.getItem(`note_${todayStr()}`)||"",
    program: plan.map(x=>({name:x.name, sets:x.sets, target:`${x.target[0]}-${x.target[1]}`, type:x.type, group:x.group}))
  };

  if(!fromHome && area) area.innerHTML = `<div class="muted">Patron, plan hazırlanıyor...</div>`;
  const txt = await geminiText(buildCoachPrompt({mode:"today_plan", title:"Bugün Plan", payload}));
  const html = `<div>${escapeHtml(txt).replace(/\n/g,"<br>")}</div>`;
  if(!fromHome && area) area.innerHTML = html;

  const homeBox = document.getElementById("home-jarvis-mini");
  if(homeBox) homeBox.innerHTML = html;
}

// ====== AI Chat ======
function aiChatKey(){ return "ai_chat_history"; }
function readAIChat(){ return JSON.parse(localStorage.getItem(aiChatKey()) || "[]"); }
function writeAIChat(arr){ localStorage.setItem(aiChatKey(), JSON.stringify(arr)); }

function renderAIChat(){
  const box = document.getElementById("ai-chat");
  if(!box) return;
  const hist = readAIChat();
  box.innerHTML = hist.length ? hist.map(m=>`
    <div class="msg ${m.role}">
      <div class="who">${m.role==="user" ? "SEN" : "JARVIS"}</div>
      <div class="txt">${escapeHtml(m.text).replace(/\n/g,"<br>")}</div>
    </div>
  `).join("") : `<div class="muted">Patron, yaz. (Her konuda sorabilirsin)</div>`;
  box.scrollTop = box.scrollHeight;
}
function aiQuick(text){
  const inp = document.getElementById("ai-input");
  if(inp){ inp.value = text; inp.focus(); }
}
function aiClearChat(){ writeAIChat([]); renderAIChat(); toast("Chat temizlendi"); }
function aiExportChat(){
  const hist = readAIChat();
  const blob = new Blob([JSON.stringify(hist, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jarvis_chat.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Chat indirildi");
}
async function sendAIChat(){
  const inp = document.getElementById("ai-input");
  if(!inp) return;
  const text = (inp.value||"").trim();
  if(!text) return;
  inp.value = "";

  const hist = readAIChat();
  hist.push({ role:"user", text, ts: Date.now() });
  writeAIChat(hist);
  renderAIChat();

  const stats7 = aggregateWindow(7);
  const prev7 = aggregateWindowPrev(7);
  const prog = {
    strengthPct: pctChange(stats7.strength, prev7.strength).toFixed(1),
    musclePct: pctChange(stats7.vol, prev7.vol).toFixed(1),
    avgRPE: Number(stats7.avgRPE||0).toFixed(2),
    groups: stats7.groups
  };

  const context = PRIVACY_MODE
    ? { day: currentDay, progress: prog }
    : { day: currentDay, progress: prog, lastSessions: collectAllSessions().slice(-20) };

  const last10 = hist.slice(-10).map(m=>`${m.role==="user"?"Kullanıcı":"JARVIS"}: ${m.text}`).join("\n");

  const prompt =
`${coachStyleHeader()}
Ek görev: Kullanıcı sohbet edebilir (her konuda). Yine de kısa kal.
Kullanıcı "fitness" sorarsa: veriye dayalı konuş.
Bağlam: ${JSON.stringify(context)}
Sohbet:
${last10}
Cevap ver.`;

  const box = document.getElementById("ai-chat");
  if(box){
    const thinking = document.createElement("div");
    thinking.className = "msg ai";
    thinking.innerHTML = `<div class="who">JARVIS</div><div class="txt" style="opacity:0.8">Patron…</div>`;
    box.appendChild(thinking);
    box.scrollTop = box.scrollHeight;
  }

  try{
    const reply = await geminiText(prompt);
    const h2 = readAIChat();
    h2.push({ role:"ai", text: reply, ts: Date.now() });
    writeAIChat(h2);
    renderAIChat();
  } catch(e){
    const h2 = readAIChat();
    h2.push({ role:"ai", text: `Hata: ${String(e.message||e)}`, ts: Date.now() });
    writeAIChat(h2);
    renderAIChat();
  }
}

// ====== Today Details ======
function showTodayDetails(){
  const sess = readSession();
  if(!sess.length) return showModal("Bugün", "Patron, bugün kayıt yok.");
  const ton = sess.reduce((a,x)=>a+safeNum(x.volume),0);

  const html = sess.map(x=>`
    <div class="hit">
      <div class="t">${escapeHtml(x.name)}</div>
      <div class="s">${x.bestWeight}kg x ${x.bestReps} • 1RM≈${Number(x.oneRM||0).toFixed(1)} • hacim ${Math.round(x.volume)} • RPE ${x.avgRPE||0}</div>
    </div>
  `).join("");

  showModal("Bugün Özeti", `<div><b>Toplam tonaj:</b> ${Math.round(ton)}</div><div style="margin-top:10px">${html}</div>`);
}

// ====== Boot ======
window.onload = function(){
  const jsDayNames = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
  currentDay = jsDayNames[new Date().getDay()];

  applyTheme();

  const animT = document.getElementById("toggle-anim");
  const cacheT = document.getElementById("toggle-cache");
  const privT = document.getElementById("toggle-privacy");
  if(animT) animT.checked = animOn();
  if(cacheT) cacheT.checked = aiCacheOn();
  if(privT) privT.checked = PRIVACY_MODE;

  setCoachTone(COACH_TONE);
  setBodyHeatWindow(7);

  renderHome();
  initTracker();
  renderProgram();
  renderAdvancedAnalytics();
  renderBodyHistory();
  renderAIStatsAndTrend();
  renderAIReportCached();
  renderAIChat();
};



