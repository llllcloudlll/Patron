// =================================================================
// 1. AYARLAR & API (PATRON, ANAHTARINI BURAYA KOY)
// =================================================================
const GEMINI_API_KEY = "AIzaSyCn_GaWtwR2Pym80nOCKfefoCv-yevdSso"; 

// =================================================================
// 2. PROGRAM VERİTABANI & AYARLAR
// =================================================================
// Hareketlerin "type" özelliğini ekledik: 'compound' (3dk dinlenme) veya 'isolation' (1.5dk)
const workouts = {
    "Pazartesi": [
        { id: "pzt_1", name: "Incline Dumbbell Press", sets: 3, target: [6, 10], type: "compound" },
        { id: "pzt_2", name: "Flat Dumbbell Press", sets: 3, target: [8, 12], type: "compound" },
        { id: "pzt_3", name: "Cable Crossover", sets: 3, target: [10, 15], type: "isolation" },
        { id: "pzt_4", name: "Lateral Raise", sets: 4, target: [12, 15], type: "isolation" },
        { id: "pzt_5", name: "Triceps Pushdown", sets: 3, target: [10, 15], type: "isolation" },
        { id: "pzt_6", name: "Z-Bar Skullcrusher", sets: 2, target: [8, 12], type: "isolation" }
    ],
    "Salı": [
        { id: "sal_1", name: "Lat Pulldown", sets: 3, target: [8, 12], type: "compound" },
        { id: "sal_2", name: "Barbell Row", sets: 4, target: [8, 12], type: "compound" },
        { id: "sal_3", name: "Cable Row", sets: 2, target: [8, 12], type: "isolation" },
        { id: "sal_4", name: "Rear Delt Fly", sets: 4, target: [12, 15], type: "isolation" },
        { id: "sal_5", name: "Barbell Curl", sets: 3, target: [8, 12], type: "isolation" },
        { id: "sal_6", name: "Hammer Curl", sets: 2, target: [8, 12], type: "isolation" },
        { id: "sal_7", name: "Reverse/Wrist Curl", sets: 2, target: [10, 15], type: "isolation" }
    ],
    "Çarşamba": [
        { id: "car_1", name: "Hack Squat", sets: 4, target: [6, 10], type: "compound" },
        { id: "car_2", name: "Leg Press", sets: 3, target: [10, 15], type: "compound" },
        { id: "car_3", name: "Romanian Deadlift", sets: 3, target: [8, 12], type: "compound" },
        { id: "car_4", name: "Leg Curl", sets: 3, target: [10, 15], type: "isolation" },
        { id: "car_5", name: "Leg Extension", sets: 2, target: [12, 15], type: "isolation" },
        { id: "car_6", name: "Standing Calf Raise", sets: 4, target: [10, 15], type: "isolation" }
    ],
    "Perşembe": [], // OFF
    "Cuma": [
        { id: "cum_1", name: "Seated Dumbbell Press", sets: 2, target: [6, 10], type: "compound" },
        { id: "cum_2", name: "Chest Press (Makine)", sets: 3, target: [8, 12], type: "compound" },
        { id: "cum_3", name: "Incline Chest Press", sets: 3, target: [8, 12], type: "compound" },
        { id: "cum_4", name: "Cable Crossover", sets: 3, target: [10, 15], type: "isolation" },
        { id: "cum_5", name: "Lateral Raise", sets: 4, target: [12, 15], type: "isolation" },
        { id: "cum_6", name: "Triceps Pushdown", sets: 3, target: [10, 15], type: "isolation" },
        { id: "cum_7", name: "Z-Bar Skullcrusher", sets: 2, target: [10, 12], type: "isolation" }
    ],
    "Cumartesi": [
        { id: "cmt_1", name: "Lat Pulldown (Ters)", sets: 3, target: [8, 12], type: "compound" },
        { id: "cmt_2", name: "Machine Row", sets: 3, target: [8, 12], type: "compound" },
        { id: "cmt_3", name: "Cable Row (Geniş)", sets: 2, target: [10, 15], type: "isolation" },
        { id: "cmt_4", name: "Rear Delt Fly", sets: 4, target: [12, 15], type: "isolation" },
        { id: "cmt_5", name: "Barbell Curl", sets: 2, target: [8, 12], type: "isolation" },
        { id: "cmt_6", name: "Hammer Curl", sets: 2, target: [10, 12], type: "isolation" }
    ],
    "Pazar": [] // OFF
};

const bodyParts = { m_shoulder:"Omuz", m_chest:"Göğüs", m_l_arm:"Sol Kol", m_r_arm:"Sağ Kol", m_waist:"Bel", m_thigh:"Bacak", m_calf:"Kalf", m_weight:"Kilo" };
const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
let currentDay = "Pazartesi";
let isSickMode = false;
let myChart = null;
let chartMode = 'workout';
let timerInterval = null;

// =================================================================
// 3. BAŞLATICI
// =================================================================
window.onload = function() {
    initTracker();
    checkMissionBriefing();
};

function checkMissionBriefing() {
    const lastLogin = localStorage.getItem("lastLoginDate");
    const today = new Date().toLocaleDateString();
    if (lastLogin !== today && workouts[currentDay] && workouts[currentDay].length > 0) {
        document.getElementById("mission-briefing").style.display = "flex";
        document.getElementById("briefing-text").innerHTML = `<b>GÜNAYDIN PATRON.</b><br>Bugün: <span style="color:gold">${currentDay}</span>.<br>Hedef: Limitleri Zorlamak.`;
        localStorage.setItem("lastLoginDate", today);
    }
}
function closeBriefing() { document.getElementById("mission-briefing").style.display = "none"; }

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewName}`).style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[onclick="switchView('${viewName}')"]`).classList.add('active');
    if(viewName === 'program') renderProgram();
    if(viewName === 'analytics') initAnalytics();
    if(viewName === 'body') renderBodyHistory();
}

// =================================================================
// 4. ANTRENMAN TAKİP (YENİ ÖZELLİKLERLE)
// =================================================================
function initTracker() {
    const selector = document.getElementById("day-selector");
    selector.innerHTML = "";
    days.forEach(day => {
        const btn = document.createElement("button");
        btn.className = `day-btn ${day === currentDay ? 'active' : ''}`;
        if (workouts[day].length === 0) { btn.style.opacity = "0.6"; btn.innerText = day.substr(0,3) + " (OFF)"; } 
        else { btn.innerText = day; }
        btn.onclick = () => { 
            document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentDay = day; isSickMode = false; renderWorkout(); 
        };
        selector.appendChild(btn);
    });
    renderWorkout();
}

function markDayStatus(status) {
    isSickMode = (status === 'sick');
    renderWorkout();
}

function renderWorkout() {
    const container = document.getElementById("workout-container");
    container.innerHTML = "";

    if (isSickMode) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--red); border:1px dashed var(--red); border-radius:15px; margin:20px;"><h3>MAZERET MODU</h3><p>Dinlen.</p></div>`;
        return;
    }

    if (!workouts[currentDay] || workouts[currentDay].length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px 20px; color:#888;"><h2 style="color:var(--gold);">OFF DAY</h2><p>Büyüme uykuda olur.</p></div>`;
        return;
    }

    // GÜNLÜK NOT ALANI (EN ÜSTE)
    const noteHTML = `<div style="margin:10px 15px;"><input type="text" id="daily-note" placeholder="Bugünkü antrenman notun..." onchange="saveDailyNote(this.value)" style="width:100%; border:1px solid #333; background:#111; padding:10px; border-radius:5px; color:white;"></div>`;
    container.innerHTML += noteHTML;
    
    // NOTU YÜKLE
    const todayKey = `note_${new Date().toLocaleDateString()}`;
    const savedNote = localStorage.getItem(todayKey);
    if(savedNote) setTimeout(() => document.getElementById("daily-note").value = savedNote, 100);


    workouts[currentDay].forEach(ex => {
        const history = JSON.parse(localStorage.getItem(ex.id)) || [];
        const last = history[history.length - 1];
        let info = last ? `Son: ${last.bestWeight}kg x ${last.bestReps}` : "İlk Kayıt";
        
        // REKOR KONTROLÜ İÇİN EN İYİ KİLOYU BUL
        let maxWeight = 0;
        history.forEach(h => { if(h.bestWeight > maxWeight) maxWeight = h.bestWeight; });

        const card = document.createElement("div");
        card.className = "exercise-card";
        
        let setsHTML = "";
        for(let i=1; i<=ex.sets; i++) {
            setsHTML += `
            <div class="set-row" id="row_${ex.id}_${i}">
                <span class="set-label">SET ${i}</span>
                <input type="number" id="${ex.id}_kg_${i}" placeholder="KG" oninput="checkPR(this, ${maxWeight})">
                <input type="number" id="${ex.id}_reps_${i}" placeholder="Tekrar">
                
                <div class="rpe-selector">
                    <div class="rpe-dot easy" onclick="selectRPE('${ex.id}_${i}', 'easy')" title="Kolay"></div>
                    <div class="rpe-dot medium" onclick="selectRPE('${ex.id}_${i}', 'medium')" title="Orta"></div>
                    <div class="rpe-dot hard" onclick="selectRPE('${ex.id}_${i}', 'hard')" title="Tükendim"></div>
                    <input type="hidden" id="${ex.id}_rpe_${i}" value="">
                </div>

                <button class="timer-btn" onclick="startSmartTimer('${ex.type}', '${ex.id}_${i}')"><i class="fa-solid fa-hourglass-start"></i></button>
            </div>`;
        }

        // ISINMA BUTONU
        const warmUpBtn = `<button style="background:none; border:none; color:#666; font-size:0.8rem; cursor:pointer; float:right;" onclick="showWarmup(${maxWeight || 20})"><i class="fa-solid fa-fire"></i> Isınma Göster</button>`;

        card.innerHTML = `
            <div class="card-header">
                <span class="ex-name">${ex.name}</span>
                <span class="ex-meta">${ex.target[0]}-${ex.target[1]}</span>
            </div>
            <div style="font-size:0.8rem; color:#888; margin-bottom:10px;">${info} ${warmUpBtn}</div>
            ${setsHTML}
            <button class="save-btn" onclick="analyzeAndSave('${ex.id}', '${ex.name}', ${ex.target[1]})">KAYDET</button>
        `;
        container.appendChild(card);
    });
}

// =================================================================
// 5. YENİ ÖZELLİKLER (PR, RPE, TIMER, ISINMA)
// =================================================================

// A) CANLI REKOR UYARISI
function checkPR(input, maxWeight) {
    if(parseFloat(input.value) > maxWeight && maxWeight > 0) {
        input.style.borderColor = "#FFD700";
        input.style.boxShadow = "0 0 10px #FFD700";
        input.style.color = "#FFD700";
    } else {
        input.style.borderColor = "#333";
        input.style.boxShadow = "none";
        input.style.color = "white";
    }
}

// B) RPE (HİSSİYAT) SEÇİMİ
function selectRPE(rowId, level) {
    // Önce hepsini temizle
    document.querySelector(`#row_${rowId} .easy`).classList.remove('selected');
    document.querySelector(`#row_${rowId} .medium`).classList.remove('selected');
    document.querySelector(`#row_${rowId} .hard`).classList.remove('selected');
    
    // Seçileni işaretle
    document.querySelector(`#row_${rowId} .${level}`).classList.add('selected');
    document.getElementById(`${rowId.replace('row_', '')}`).value = level; // Hidden input'a yaz (Düzeltme: ID yapısı farklı olabilir, aşağıda düzeltildi)
    // Hidden input ID: {ex.id}_rpe_{i} -> rowId zaten {ex.id}_{i} formatında gelmiyor.
    // Fonksiyon çağrısı: selectRPE('pzt_1_1', 'easy') -> ID: pzt_1_rpe_1
    // Düzeltme:
    const parts = rowId.split('_'); 
    const rpeId = `${parts[0]}_${parts[1]}_rpe_${parts[2]}`;
    const hiddenInput = document.getElementById(rpeId);
    if(hiddenInput) hiddenInput.value = level;
}

// C) AKILLI DİNLENME SAYACI
function startSmartTimer(type, rowId) {
    // Süre Belirle: Compound = 180sn, Isolation = 90sn
    const duration = (type === 'compound') ? 180 : 90;
    
    // Modal Aç
    showModal("DİNLENME", `<div id="timer-display" style="font-size:4rem; color:var(--gold); font-weight:bold;">${duration}</div><div style="color:#888;">saniye</div><button onclick="addTime(30)" style="margin-top:20px; background:#333; color:white; border:none; padding:10px; border-radius:5px;">+30 Sn Ekle</button>`);
    
    let timeLeft = duration;
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const display = document.getElementById("timer-display");
        if(display) display.innerText = timeLeft;
        
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            if(display) {
                display.innerText = "HAZIR OL!";
                display.style.color = "#00ff00";
                // Titreşim (Mobil destekliyorsa)
                if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
        }
    }, 1000);
}

function addTime(sec) {
    // Bu basit versiyonda süreyi değişkene ekleyemiyoruz çünkü interval içinde.
    // O yüzden sayacı durdurup yeniden başlatıyoruz.
    const display = document.getElementById("timer-display");
    let current = parseInt(display.innerText);
    if(timerInterval) clearInterval(timerInterval);
    
    let timeLeft = current + sec;
    display.innerText = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        if(display) display.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            display.innerText = "HAZIR OL!";
            display.style.color = "#00ff00";
            if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, 1000);
}

// D) ISINMA HESAPLAYICI
function showWarmup(maxKg) {
    if(!maxKg || maxKg < 20) return alert("Önce bir ana ağırlık kaydetmen lazım Patron.");
    const w1 = (maxKg * 0.5).toFixed(1);
    const w2 = (maxKg * 0.75).toFixed(1);
    showModal("ISINMA SETLERİ", `
        <ul style="text-align:left; list-style:none; padding:0;">
            <li style="margin-bottom:10px;">1. Boş Bar x 15-20 Tekrar</li>
            <li style="margin-bottom:10px;">2. <b>${w1} kg</b> x 8-10 Tekrar</li>
            <li style="margin-bottom:10px;">3. <b>${w2} kg</b> x 3-5 Tekrar</li>
            <li style="color:var(--gold);">🔥 ANA SET: <b>${maxKg} kg</b></li>
        </ul>
    `);
}

// E) GÜNLÜK NOT
function saveDailyNote(text) {
    const key = `note_${new Date().toLocaleDateString()}`;
    localStorage.setItem(key, text);
}

// =================================================================
// 6. VERİ KAYDI VE AI ANLIK ANALİZ (RPE DAHİL)
// =================================================================
async function analyzeAndSave(id, name, maxTarget) {
    const kgInputs = document.querySelectorAll(`[id^='${id}_kg_']`);
    const repInputs = document.querySelectorAll(`[id^='${id}_reps_']`);
    let bestWeight = 0, bestReps = 0;
    
    // RPE bilgisini de toplayalım
    let rpeFeedback = "";
    
    for(let i=0; i<kgInputs.length; i++) {
        let k = parseFloat(kgInputs[i].value), r = parseFloat(repInputs[i].value);
        // RPE değerini bul
        const rpeVal = document.getElementById(`${id}_rpe_${i+1}`)?.value || "seçilmedi";
        
        if(k && r) {
            let oneRM = k * (1 + r/30);
            if(oneRM > (bestWeight * (1 + bestReps/30))) { bestWeight = k; bestReps = r; }
            if(rpeVal === "easy") rpeFeedback = " (Not: Ağırlık hafif geldi)";
            if(rpeVal === "hard") rpeFeedback = " (Not: Tükendi)";
        }
    }

    if(bestWeight === 0) return alert("Boş veri girme Patron.");

    const history = JSON.parse(localStorage.getItem(id)) || [];
    history.push({ date: new Date().toLocaleDateString(), bestWeight, bestReps });
    localStorage.setItem(id, JSON.stringify(history));

    showModal("AI ANALİZİ", "🧠 Veriler inceleniyor...");

    try {
        const prompt = `Koç, sporcu ${name} hareketinde ${bestWeight}kg x ${bestReps} yaptı. Hedef ${maxTarget} tekrardı.${rpeFeedback}. Tek cümlelik, net bir geri bildirim ver.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const aiText = data.candidates && data.candidates[0] ? data.candidates[0].content.parts[0].text : "AI Cevap veremedi.";
        showModal("JARVIS DİYOR Kİ:", aiText);
    } catch(e) { showModal("KAYDEDİLDİ", "Veriler kaydedildi."); }
}

// =================================================================
// 7. VÜCUT ÖLÇÜLERİ (STANDART)
// =================================================================
function saveMeasurements() {
    const stats = {}; let filled = false;
    Object.keys(bodyParts).forEach(key => { const val=document.getElementById(key).value; if(val){stats[key]=parseFloat(val); filled=true;} document.getElementById(key).value=""; });
    if(!filled) return alert("Veri gir.");
    stats.date = new Date().toLocaleDateString();
    const h = JSON.parse(localStorage.getItem("body_stats")) || []; h.push(stats); localStorage.setItem("body_stats", JSON.stringify(h));
    showModal("KAYDEDİLDİ", "Ölçüler alındı."); renderBodyHistory();
}
function renderBodyHistory() {
    const c=document.getElementById("measurement-history"); const h=JSON.parse(localStorage.getItem("body_stats"))||[];
    c.innerHTML=h.length?"":"<div style='text-align:center;color:#666;'>Kayıt yok.</div>";
    h.slice().reverse().forEach(s=>{ let d=""; Object.keys(bodyParts).forEach(k=>{if(s[k])d+=`${bodyParts[k]}:<b>${s[k]}</b>|`;}); c.innerHTML+=`<div class="history-item"><div><div class="h-date">${s.date}</div><div class="h-summary">${d}</div></div></div>`; });
}

// =================================================================
// 8. GRAFİKLER & RAPOR (STANDART)
// =================================================================
function setChartMode(m){chartMode=m; document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active')); document.querySelector(`.mode-btn[onclick="setChartMode('${m}')"]`).classList.add('active'); initAnalytics();}
function initAnalytics(){
    const s=document.getElementById("chart-select"); s.innerHTML="";
    if(chartMode==='workout'){ Object.values(workouts).forEach(d=>d.forEach(e=>{const o=document.createElement("option"); o.value=e.id; o.text=e.name; s.appendChild(o);})); }
    else{ Object.keys(bodyParts).forEach(k=>{const o=document.createElement("option"); o.value=k; o.text=bodyParts[k]; s.appendChild(o);}); }
    updateChart();
}
function updateChart(){
    const k=document.getElementById("chart-select").value; const ctx=document.getElementById('mainChart').getContext('2d');
    if(myChart)myChart.destroy();
    let l=[], d=[], lbl="";
    if(chartMode==='workout'){ const h=JSON.parse(localStorage.getItem(k))||[]; l=h.map(x=>x.date.slice(0,5)); d=h.map(x=>x.bestWeight*(1+x.bestReps/30)); lbl="Tahmini 1RM"; }
    else{ const h=JSON.parse(localStorage.getItem("body_stats"))||[]; const f=h.filter(x=>x[k]); l=f.map(x=>x.date.slice(0,5)); d=f.map(x=>x[k]); lbl=bodyParts[k]; }
    myChart=new Chart(ctx,{type:'line',data:{labels:l,datasets:[{label:lbl,data:d,borderColor:'#FFD700',backgroundColor:'rgba(255,215,0,0.1)',borderWidth:3,tension:0.4,fill:true}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{grid:{color:'#333'}},x:{grid:{color:'#333'}}},plugins:{legend:{labels:{color:'white'}}}}});
}

// AI RAPOR
async function askGeminiFullReport() {
    const area = document.getElementById("ai-report-area");
    area.innerHTML = `<div style="color:var(--gold);">Analiz yapılıyor...</div>`;
    
     // GÜNLÜK NOTLARI DA ALALIM
    const todayNote = localStorage.getItem(`note_${new Date().toLocaleDateString()}`) || "Not yok.";

    let log = `GÜNLÜK NOT: ${todayNote}\n\nANTRENMANLAR:\n`;
    Object.keys(workouts).forEach(day => { workouts[day].forEach(ex => { const h=JSON.parse(localStorage.getItem(ex.id))||[]; if(h.length){const r=h[h.length-1]; log+=`- ${ex.name}: ${r.bestWeight}kg x ${r.bestReps}\n`;} }); });
    let body = "VÜCUT:\n"; const bs=JSON.parse(localStorage.getItem("body_stats"))||[]; if(bs.length){const l=bs[bs.length-1]; body+=`Kilo:${l.m_weight||'-'}\n`;}

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: `Sen Patron'un koçusun. Veriler:\n${log}\n${body}\n Durum analizi yap.` }] }] })
        });
        const d = await res.json();
        area.innerHTML = `<div style="background:#1a1a1a; padding:15px; border-radius:10px;">${d.candidates[0].content.parts[0].text.replace(/\n/g, "<br>")}</div>`;
    } catch(e) { area.innerHTML = "Hata oluştu."; }
}

// YARDIMCILAR
function startVoice(k,r){if(!('webkitSpeechRecognition'in window))return alert("Ses yok.");const x=new webkitSpeechRecognition();x.lang='tr-TR';x.start();document.querySelector(`button[onclick*='${k}']`).classList.add('listening');x.onresult=e=>{const n=e.results[0][0].transcript.match(/\d+/g);if(n&&n.length>=2){document.getElementById(k).value=n[0];document.getElementById(r).value=n[1];}document.querySelector(`button[onclick*='${k}']`).classList.remove('listening');};}
function toggleSettings(){const p=document.getElementById("settings-panel");p.style.display=p.style.display==="block"?"none":"block";}
function showModal(t,b){document.getElementById("modal-title").innerText=t;document.getElementById("modal-body").innerHTML=b;document.getElementById("modal").style.display="flex";}
function closeModal(){document.getElementById("modal").style.display="none";if(timerInterval)clearInterval(timerInterval);}
function exportData(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(localStorage)],{type:"application/json"}));a.download="backup.json";a.click();}
function importData(i){const r=new FileReader();r.onload=e=>{try{const d=JSON.parse(e.target.result);Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));location.reload();}catch(x){alert("Hata");}};if(i.files[0])r.readAsText(i.files[0]);}
function renderProgram(){const c=document.getElementById("full-program-container");c.innerHTML="";days.forEach(d=>{let h=workouts[d].length?workouts[d].map(e=>`<div style="font-size:0.9rem;border-bottom:1px solid #333;padding:5px;">${e.name}</div>`).join(''):"<i style='color:#666'>OFF</i>";c.innerHTML+=`<div style="background:#1a1a1a;margin:10px;padding:15px;border-radius:10px;border:1px solid #333;"><h3 style="color:gold;margin:0;">${d}</h3>${h}</div>`;});}
