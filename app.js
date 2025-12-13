// --- 1. AYARLAR & API ---
// PATRON DİKKAT: API Anahtarını tırnakların içine yapıştır!
const GEMINI_API_KEY = "AIzaSyCn_GaWtwR2Pym80nOCKfefoCv-yevdSso"; 

// --- 2. PROGRAM VERİTABANI (7 GÜN EKSİKSİZ) ---
const workouts = {
    "Pazartesi": [
        { id: "pzt_1", name: "Incline Dumbbell Press", sets: 3, target: [6, 10], rir: "1-2" },
        { id: "pzt_2", name: "Flat Dumbbell Press", sets: 3, target: [8, 12], rir: "1-2" },
        { id: "pzt_3", name: "Cable Crossover", sets: 3, target: [10, 15], rir: "0-1" },
        { id: "pzt_4", name: "Lateral Raise", sets: 4, target: [12, 15], rir: "0" },
        { id: "pzt_5", name: "Triceps Pushdown", sets: 3, target: [10, 15], rir: "0-1" },
        { id: "pzt_6", name: "Z-Bar Skullcrusher", sets: 2, target: [8, 12], rir: "1" }
    ],
    "Salı": [
        { id: "sal_1", name: "Lat Pulldown", sets: 3, target: [8, 12], rir: "1-2" },
        { id: "sal_2", name: "Barbell Row", sets: 4, target: [8, 12], rir: "1-2" },
        { id: "sal_3", name: "Cable Row", sets: 2, target: [8, 12], rir: "1" },
        { id: "sal_4", name: "Rear Delt Fly", sets: 4, target: [12, 15], rir: "0" },
        { id: "sal_5", name: "Barbell Curl", sets: 3, target: [8, 12], rir: "1" },
        { id: "sal_6", name: "Hammer Curl", sets: 2, target: [8, 12], rir: "0-1" },
        { id: "sal_7", name: "Reverse/Wrist Curl", sets: 2, target: [10, 15], rir: "0" }
    ],
    "Çarşamba": [
        { id: "car_1", name: "Hack Squat", sets: 4, target: [6, 10], rir: "1-2" },
        { id: "car_2", name: "Leg Press", sets: 3, target: [10, 15], rir: "1" },
        { id: "car_3", name: "Romanian Deadlift", sets: 3, target: [8, 12], rir: "1-2" },
        { id: "car_4", name: "Leg Curl", sets: 3, target: [10, 15], rir: "0-1" },
        { id: "car_5", name: "Leg Extension", sets: 2, target: [12, 15], rir: "0" },
        { id: "car_6", name: "Standing Calf Raise", sets: 4, target: [10, 15], rir: "0" }
    ],
    "Perşembe": [], // OFF DAY
    "Cuma": [
        { id: "cum_1", name: "Seated Dumbbell Press", sets: 2, target: [6, 10], rir: "1-2" },
        { id: "cum_2", name: "Chest Press (Makine)", sets: 3, target: [8, 12], rir: "1" },
        { id: "cum_3", name: "Incline Chest Press", sets: 3, target: [8, 12], rir: "1" },
        { id: "cum_4", name: "Cable Crossover", sets: 3, target: [10, 15], rir: "0-1" },
        { id: "cum_5", name: "Lateral Raise", sets: 4, target: [12, 15], rir: "0" },
        { id: "cum_6", name: "Triceps Pushdown", sets: 3, target: [10, 15], rir: "0" },
        { id: "cum_7", name: "Z-Bar Skullcrusher", sets: 2, target: [10, 12], rir: "0-1" }
    ],
    "Cumartesi": [
        { id: "cmt_1", name: "Lat Pulldown (Ters)", sets: 3, target: [8, 12], rir: "1" },
        { id: "cmt_2", name: "Machine Row", sets: 3, target: [8, 12], rir: "1" },
        { id: "cmt_3", name: "Cable Row (Geniş)", sets: 2, target: [10, 15], rir: "0" },
        { id: "cmt_4", name: "Rear Delt Fly", sets: 4, target: [12, 15], rir: "0" },
        { id: "cmt_5", name: "Barbell Curl", sets: 2, target: [8, 12], rir: "0" },
        { id: "cmt_6", name: "Hammer Curl", sets: 2, target: [10, 12], rir: "0" }
    ],
    "Pazar": [] // OFF DAY
};

// VÜCUT ÖLÇÜLERİ ETİKETLERİ
const bodyParts = {
    m_shoulder: "Omuz", m_chest: "Göğüs", m_l_arm: "Sol Kol", m_r_arm: "Sağ Kol",
    m_waist: "Bel", m_thigh: "Üst Bacak", m_calf: "Kalf", m_weight: "Kilo"
};

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
let currentDay = "Pazartesi";
let isSickMode = false;
let myChart = null;
let chartMode = 'workout'; // 'workout' veya 'body'

// --- 3. BAŞLATICI ---
window.onload = function() {
    initTracker();
    checkMissionBriefing();
};

function checkMissionBriefing() {
    const lastLogin = localStorage.getItem("lastLoginDate");
    const today = new Date().toLocaleDateString();
    if (lastLogin !== today && workouts[currentDay] && workouts[currentDay].length > 0) {
        document.getElementById("mission-briefing").style.display = "flex";
        document.getElementById("briefing-text").innerHTML = `<b>GÜNAYDIN PATRON.</b><br>Bugün: <span style="color:gold">${currentDay}</span>.<br>Hedef: Zirve. Hazır mısın?`;
        localStorage.setItem("lastLoginDate", today);
    }
}
function closeBriefing() { document.getElementById("mission-briefing").style.display = "none"; }

// --- 4. GÖRÜNÜM GEÇİŞLERİ ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewName}`).style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[onclick="switchView('${viewName}')"]`).classList.add('active');

    if(viewName === 'program') renderProgram();
    if(viewName === 'analytics') initAnalytics();
    if(viewName === 'body') renderBodyHistory();
}

// --- 5. TRACKER (ANTRENMAN) ---
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
        container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--red); border:1px dashed var(--red); border-radius:15px; margin:20px;"><i class="fa-solid fa-bed" style="font-size:3rem; margin-bottom:10px;"></i><h3>MAZERET MODU</h3><p>Dinlen Patron.</p><button class="save-btn" style="background:#333;" onclick="alert('Kaydedildi')">KAYDET</button></div>`;
        return;
    }

    if (!workouts[currentDay] || workouts[currentDay].length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px 20px; color:#888;"><i class="fa-solid fa-mug-hot" style="font-size:4rem; margin-bottom:20px;"></i><h2 style="color:var(--gold);">OFF DAY</h2><p>Büyüme uykuda olur.</p></div>`;
        return;
    }

    workouts[currentDay].forEach(ex => {
        const history = JSON.parse(localStorage.getItem(ex.id)) || [];
        const last = history[history.length - 1];
        let info = last ? `Son: ${last.bestWeight}kg x ${last.bestReps}` : "İlk Kayıt";

        const card = document.createElement("div");
        card.className = "exercise-card";
        let setsHTML = "";
        for(let i=1; i<=ex.sets; i++) {
            setsHTML += `<div class="set-row"><span class="set-label">SET ${i}</span><input type="number" id="${ex.id}_kg_${i}" placeholder="KG"><input type="number" id="${ex.id}_reps_${i}" placeholder="Tekrar"><button class="mic-btn" onclick="startVoice('${ex.id}_kg_${i}', '${ex.id}_reps_${i}')"><i class="fa-solid fa-microphone"></i></button></div>`;
        }
        card.innerHTML = `<div class="card-header"><span class="ex-name">${ex.name}</span><span class="ex-meta">${ex.target[0]}-${ex.target[1]} | RIR ${ex.rir}</span></div><div style="font-size:0.8rem; color:#888; margin-bottom:10px;">${info}</div>${setsHTML}<button class="save-btn" onclick="analyzeAndSave('${ex.id}', '${ex.name}', ${ex.target[1]})">KAYDET</button>`;
        container.appendChild(card);
    });
}

// --- 6. VÜCUT ÖLÇÜLERİ ---
function saveMeasurements() {
    const stats = {};
    let filled = false;
    Object.keys(bodyParts).forEach(key => {
        const val = document.getElementById(key).value;
        if(val) { stats[key] = parseFloat(val); filled = true; }
        document.getElementById(key).value = ""; 
    });

    if(!filled) return alert("En az bir ölçü gir Patron.");

    stats.date = new Date().toLocaleDateString();
    const history = JSON.parse(localStorage.getItem("body_stats")) || [];
    history.push(stats);
    localStorage.setItem("body_stats", JSON.stringify(history));
    
    showModal("KAYDEDİLDİ", "Vücut verilerin sisteme işlendi. Gelişimini grafikten takip edebilirsin.");
    renderBodyHistory();
}

function renderBodyHistory() {
    const container = document.getElementById("measurement-history");
    const history = JSON.parse(localStorage.getItem("body_stats")) || [];
    container.innerHTML = history.length ? "" : "<div style='text-align:center; color:#666;'>Henüz ölçü girmedin.</div>";
    
    history.slice().reverse().forEach(stat => {
        let details = "";
        Object.keys(bodyParts).forEach(key => {
            if(stat[key]) details += `${bodyParts[key]}: <b>${stat[key]}</b> | `;
        });
        container.innerHTML += `<div class="history-item"><div><div class="h-date">${stat.date}</div><div class="h-summary">${details}</div></div></div>`;
    });
}

// --- 7. KAYIT VE AI ANALİZ (ANLIK) ---
async function analyzeAndSave(id, name, maxTarget) {
    const kgInputs = document.querySelectorAll(`[id^='${id}_kg_']`);
    const repInputs = document.querySelectorAll(`[id^='${id}_reps_']`);
    let bestWeight = 0, bestReps = 0;
    
    for(let i=0; i<kgInputs.length; i++) {
        let k = parseFloat(kgInputs[i].value), r = parseFloat(repInputs[i].value);
        if(k && r) {
            let oneRM = k * (1 + r/30);
            if(oneRM > (bestWeight * (1 + bestReps/30))) { bestWeight = k; bestReps = r; }
        }
    }
    if(bestWeight === 0) return alert("Boş veri girme Patron.");

    const history = JSON.parse(localStorage.getItem(id)) || [];
    history.push({ date: new Date().toLocaleDateString(), bestWeight, bestReps });
    localStorage.setItem(id, JSON.stringify(history));

    // GEMINI ÇAĞRISI
    showModal("AI ANALİZİ", "🧠 Veriler inceleniyor...");
    if(GEMINI_API_KEY === "AIzaSyCn_GaWtwR2Pym80nOCKfefoCv-yevdSso") return showModal("KAYDEDİLDİ", "Veriler kaydedildi (API Anahtarı yok).");

    try {
        const prompt = `Koç, sporcu ${name} hareketinde ${bestWeight}kg x ${bestReps} yaptı. Hedef ${maxTarget} tekrardı. Tek cümlelik sert bir yorum yap.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const aiText = data.candidates && data.candidates[0] ? data.candidates[0].content.parts[0].text : "Cevap alınamadı.";
        showModal("JARVIS DİYOR Kİ:", aiText);
    } catch(e) { showModal("KAYDEDİLDİ", "İnternet sorunu, ama veri güvende."); }
}

// --- 8. GRAFİK & ANALİZ ---
function setChartMode(mode) {
    chartMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.mode-btn[onclick="setChartMode('${mode}')"]`).classList.add('active');
    initAnalytics();
}

function initAnalytics() {
    const select = document.getElementById("chart-select");
    select.innerHTML = "";
    
    if (chartMode === 'workout') {
        let allEx = [];
        Object.values(workouts).forEach(dayArr => allEx.push(...dayArr));
        allEx.forEach(ex => {
            const opt = document.createElement("option");
            opt.value = ex.id; opt.text = ex.name; select.appendChild(opt);
        });
    } else {
        Object.keys(bodyParts).forEach(key => {
            const opt = document.createElement("option");
            opt.value = key; opt.text = bodyParts[key]; select.appendChild(opt);
        });
    }
    updateChart();
}

function updateChart() {
    const key = document.getElementById("chart-select").value;
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    let labels = [], dataPoints = [], labelStr = "";

    if (chartMode === 'workout') {
        const history = JSON.parse(localStorage.getItem(key)) || [];
        labels = history.map(h => h.date.slice(0,5));
        dataPoints = history.map(h => h.bestWeight * (1 + h.bestReps/30));
        labelStr = "Tahmini 1RM Gücü (KG)";
    } else {
        const history = JSON.parse(localStorage.getItem("body_stats")) || [];
        const filtered = history.filter(h => h[key]);
        labels = filtered.map(h => h.date.slice(0,5));
        dataPoints = filtered.map(h => h[key]);
        labelStr = `${bodyParts[key]} Ölçüsü (cm/kg)`;
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelStr,
                data: dataPoints,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { grid: { color: '#333' } }, x: { grid: { color: '#333' } } },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// --- 9. ARAÇLAR ---
function startVoice(kgId, repId) {
    if (!('webkitSpeechRecognition' in window)) return alert("Ses desteklenmiyor.");
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'tr-TR'; recognition.start();
    const btn = document.querySelector(`button[onclick*='${kgId}']`);
    btn.classList.add('listening');
    recognition.onresult = (e) => {
        const nums = e.results[0][0].transcript.match(/\d+/g);
        if(nums && nums.length>=2) { document.getElementById(kgId).value = nums[0]; document.getElementById(repId).value = nums[1]; }
        btn.classList.remove('listening');
    };
}
function toggleSettings() { const p=document.getElementById("settings-panel"); p.style.display=p.style.display==="block"?"none":"block"; }
function showModal(title, body) { document.getElementById("modal-title").innerText=title; document.getElementById("modal-body").innerHTML=body; document.getElementById("modal").style.display="flex"; }
function closeModal() { document.getElementById("modal").style.display="none"; }
function exportData() { const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(localStorage)],{type:"application/json"})); a.download=`patron_backup.json`; a.click(); }
function importData(inp) { const r=new FileReader(); r.onload=e=>{try{const d=JSON.parse(e.target.result);Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));location.reload();}catch(x){alert("Hata");}}; if(inp.files[0])r.readAsText(inp.files[0]); }
function renderProgram() {
    const c = document.getElementById("full-program-container"); c.innerHTML = "";
    days.forEach(day => {
        let content = workouts[day].length ? workouts[day].map(e=>`<div style="font-size:0.9rem;border-bottom:1px solid #333;padding:5px;">${e.name}</div>`).join('') : "<i style='color:#666'>OFF DAY</i>";
        c.innerHTML += `<div style="background:#1a1a1a;margin:10px;padding:15px;border-radius:10px;border:1px solid #333;"><h3 style="color:gold;margin:0;">${day}</h3>${content}</div>`;
    });
}

// --- 10. AI DETAYLI RAPOR (FIXED v6.1) ---
async function askGeminiFullReport() {
    const area = document.getElementById("ai-report-area");
    area.innerHTML = `<div style="color:var(--gold); margin-top:10px;">Veriler analiz ediliyor Patron...<br><span style="font-size:0.8rem; color:#666;">(5-10 saniye bekle)</span></div>`;
    
    // API KONTROLÜ
    if(GEMINI_API_KEY === "AIzaSyCn_GaWtwR2Pym80nOCKfefoCv-yevdSso" || GEMINI_API_KEY.length < 10) {
        area.innerHTML = `<div style="color:var(--red);">⚠️ HATA: API Anahtarı eksik! Kodun başına yapıştır.</div>`;
        return;
    }

    let workoutLog = "ANTRENMANLAR:\n";
    Object.keys(workouts).forEach(day => {
        workouts[day].forEach(ex => {
            const h = JSON.parse(localStorage.getItem(ex.id)) || [];
            if(h.length) {
                const r = h[h.length-1];
                workoutLog += `- ${ex.name}: ${r.bestWeight}kg x ${r.bestReps}\n`;
            }
        });
    });

    let bodyLog = "VÜCUT ÖLÇÜLERİ:\n";
    const bs = JSON.parse(localStorage.getItem("body_stats")) || [];
    if(bs.length) {
        const l = bs[bs.length-1];
        bodyLog += `Son Kayıt (${l.date}): Kilo:${l.m_weight||'-'}, Kol:${l.m_r_arm||'-'}\n`;
    }

    const promptText = `
        Sen sert bir vücut geliştirme koçusun. Patron'un verileri:
        ${workoutLog}
        ${bodyLog}
        
        Görevin:
        1. Güç durumu nasıl?
        2. Hangi bölge eksik?
        3. Beslenme tavsiyesi ver.
        4. Haftalık strateji belirle.
        
        HTML formatında (<b>, <br>) şık ve kısa yaz.
    `;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text.replace(/\n/g, "<br>");
        area.innerHTML = `<div style="background:#1a1a1a; padding:15px; border-radius:10px; border:1px solid #333; text-align:left;">${text}</div>`;
    } catch (e) {
        area.innerHTML = `<div style="color:var(--red);">Bağlantı hatası: ${e.message}</div>`;
    }
        }
         
