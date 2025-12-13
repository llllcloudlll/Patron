// --- 1. AYARLAR & API ANAHTARI ---
// PATRON DİKKAT: API Anahtarını tırnak içine yapıştır.
const GEMINI_API_KEY = "BURAYA_YAPISTIR"; 

// --- 2. PROGRAM VERİTABANI (v3.0 OPTİMİZE) ---
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
    ]
};

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
let currentDay = "Pazartesi";
let isSickMode = false;
let myChart = null; // Grafik nesnesi

// --- 3. BAŞLANGIÇ & GÖREV EMRİ ---
window.onload = function() {
    initTracker();
    checkMissionBriefing();
};

function checkMissionBriefing() {
    const lastLogin = localStorage.getItem("lastLoginDate");
    const today = new Date().toLocaleDateString();
    
    // Günde 1 kez briefing ver
    if (lastLogin !== today && workouts[currentDay]) {
        const briefingModal = document.getElementById("mission-briefing");
        const textField = document.getElementById("briefing-text");
        briefingModal.style.display = "flex";
        
        // Basit AI Simülasyonu
        textField.innerHTML = `
            <b>GÜNAYDIN PATRON.</b><br><br>
            Bugün: <span style="color:gold">${currentDay}</span>.<br>
            Hedef: Zirveye bir adım daha yaklaşmak.<br><br>
            <i>Sistem hazır. Başlamaya hazır mısın?</i>
        `;
        localStorage.setItem("lastLoginDate", today);
    }
}
function closeBriefing() { document.getElementById("mission-briefing").style.display = "none"; }

// --- 4. GÖRÜNÜM YÖNETİMİ ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(`view-${viewName}`).style.display = 'block';
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[onclick="switchView('${viewName}')"]`).classList.add('active');

    if(viewName === 'program') renderProgram();
    if(viewName === 'analytics') initAnalytics();
}

// --- 5. TRACKER & HASTA MODU ---
function initTracker() {
    const selector = document.getElementById("day-selector");
    selector.innerHTML = "";
    Object.keys(workouts).forEach(day => {
        const btn = document.createElement("button");
        btn.className = `day-btn ${day === currentDay ? 'active' : ''}`;
        btn.innerText = day;
        btn.onclick = () => { currentDay = day; initTracker(); };
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

    // HASTA MODU İSE
    if (isSickMode) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--red);">
                <div style="font-size:3rem;">🤒</div>
                <h3>DİNLENME MODU AKTİF</h3>
                <p>Geçmiş olsun Patron. Sistem bugünlük kayıt almayacak ve analizlerde bu günü "Mazeretli" sayacak.</p>
                <button class="save-btn" style="background:#333; color:white;" onclick="logSickDay()">BUGÜNÜ 'HASTA' OLARAK KAYDET</button>
            </div>
        `;
        return;
    }

    // NORMAL ANTRENMAN
    if (!workouts[currentDay]) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Bugün planlı antrenman yok (OFF).<br>Dinlen ve büyü.</div>`;
        return;
    }

    workouts[currentDay].forEach(ex => {
        const history = JSON.parse(localStorage.getItem(ex.id)) || [];
        const last = history[history.length - 1];
        let info = last ? `Son: ${last.bestWeight}kg x ${last.bestReps}` : "İlk kayıt bekleniyor.";

        const card = document.createElement("div");
        card.className = "exercise-card";
        
        let setsHTML = "";
        for(let i=1; i<=ex.sets; i++) {
            setsHTML += `
            <div class="set-row">
                <span class="set-label">SET ${i}</span>
                <input type="number" id="${ex.id}_kg_${i}" placeholder="KG">
                <input type="number" id="${ex.id}_reps_${i}" placeholder="Tekrar">
                <button class="mic-btn" onclick="startVoice('${ex.id}_kg_${i}', '${ex.id}_reps_${i}')">🎤</button>
            </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="ex-name">${ex.name}</span>
                <span class="ex-meta">${ex.target[0]}-${ex.target[1]} | RIR ${ex.rir}</span>
            </div>
            <div style="font-size:0.8rem; color:#888; margin-bottom:10px;">${info}</div>
            ${setsHTML}
            <button class="save-btn" onclick="analyzeAndSave('${ex.id}', '${ex.name}', ${ex.target[1]})">KAYDET</button>
        `;
        container.appendChild(card);
    });
}

function logSickDay() {
    const today = new Date().toLocaleDateString();
    localStorage.setItem(`sick_day_${today}`, "true");
    alert("Kaydedildi Patron. Dinlenmene bak.");
}

// --- 6. SESLİ KOMUT (WEB SPEECH API) ---
function startVoice(kgId, repId) {
    if (!('webkitSpeechRecognition' in window)) { alert("Tarayıcın sesi desteklemiyor."); return; }
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.start();

    const btn = document.querySelector(`button[onclick*='${kgId}']`);
    btn.classList.add('listening');

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        // Basit ayrıştırma: "30 kilo 10 tekrar"
        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            document.getElementById(kgId).value = numbers[0];
            document.getElementById(repId).value = numbers[1];
        } else {
            alert("Anlayamadım. Örnek: '30 kilo 10 tekrar'");
        }
        btn.classList.remove('listening');
    };
    recognition.onerror = () => btn.classList.remove('listening');
}

// --- 7. KAYIT & AI ANALİZ (GEMINI) ---
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
    
    if (GEMINI_API_KEY === "BURAYA_YAPISTIR") {
        showModal("UYARI", "API Anahtarı girilmemiş. Yine de kaydedildi.");
        return;
    }

    try {
        const prompt = `Sen sert bir vücut geliştirme koçusun. Sporcun ${name} hareketinde ${bestWeight}kg ile ${bestReps} tekrar yaptı. Hedef üst sınır ${maxTarget}. Ona tek cümlelik, gaza getirici veya uyarıcı bir geri bildirim ver.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        showModal("JARVIS DİYOR Kİ:", data.candidates[0].content.parts[0].text);
    } catch (e) {
        showModal("KAYDEDİLDİ", "İnternet yok ama veriler güvende.");
    }
}

// --- 8. AI FULL RAPOR (HAFTALIK KONSEY) ---
async function askGeminiFullReport() {
    const area = document.getElementById("ai-report-area");
    area.innerHTML = "Veriler toplanıyor...";
    
    // Verileri Topla
    let log = "SPORCU VERİLERİ:\n";
    Object.keys(workouts).forEach(day => {
        workouts[day].forEach(ex => {
            const h = JSON.parse(localStorage.getItem(ex.id)) || [];
            if(h.length) {
                const last = h[h.length-1];
                log += `${ex.name}: ${last.bestWeight}kg x ${last.bestReps} (${last.date})\n`;
            }
        });
    });

    if(GEMINI_API_KEY === "AIzaSyCn_GaWtwR2Pym80nOCKfefoCv-yevdSso") return area.innerHTML = "API Anahtarı eksik.";

    try {
        const prompt = `Bu sporcunun son durumunu analiz et. Güçlü ve zayıf yönlerini söyle. Haftalık strateji ver. Veriler:\n${log}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        area.innerHTML = text.replace(/\n/g, "<br>"); // HTML formatı
    } catch(e) { area.innerHTML = "Hata oluştu."; }
}

// --- 9. ANALYTICS (GRAFİKLER) ---
function initAnalytics() {
    const select = document.getElementById("chart-exercise-select");
    select.innerHTML = "";
    
    // Tüm hareketleri listele
    let allEx = [];
    Object.values(workouts).forEach(dayArr => allEx.push(...dayArr));
    
    allEx.forEach(ex => {
        const opt = document.createElement("option");
        opt.value = ex.id;
        opt.text = ex.name;
        select.appendChild(opt);
    });
    
    updateChart();
}

function updateChart() {
    const exId = document.getElementById("chart-exercise-select").value;
    const history = JSON.parse(localStorage.getItem(exId)) || [];
    
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    if (myChart) myChart.destroy(); // Eski grafiği sil

    const labels = history.map(h => h.date.slice(0,5)); // Sadece gün/ay
    const dataPoints = history.map(h => h.bestWeight * (1 + h.bestReps/30)); // 1RM Tahmini

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tahmini 1RM Gücü (KG)',
                data: dataPoints,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false, grid: { color: '#333' } }, x: { grid: { color: '#333' } } },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// --- 10. YEDEKLEME & ARAÇLAR ---
function toggleSettings() {
    const p = document.getElementById("settings-panel");
    p.style.display = p.style.display === "block" ? "none" : "block";
}
function showModal(title, body) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = body;
    document.getElementById("modal").style.display = "flex";
}
function closeModal() { document.getElementById("modal").style.display = "none"; }

function exportData() {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `patron_backup_${new Date().toLocaleDateString()}.json`;
    a.click();
}

function importData(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
            alert("Yedek başarıyla yüklendi Patron!");
            location.reload();
        } catch(err) { alert("Dosya bozuk."); }
    };
    reader.readAsText(file);
}

// PROGRAM SEKMESİ (Basit Listeleme)
function renderProgram() {
    const c = document.getElementById("full-program-container");
    c.innerHTML = "";
    days.forEach(day => {
        if(workouts[day]) {
            let html = `<div style="background:#1a1a1a; margin:10px; padding:15px; border-radius:10px; border:1px solid #333;"><h3 style="color:gold; margin:0;">${day}</h3>`;
            workouts[day].forEach(ex => html += `<div style="font-size:0.9rem; margin-top:5px; border-bottom:1px solid #333; padding-bottom:3px;">${ex.name} (${ex.sets}x${ex.target[0]}-${ex.target[1]})</div>`);
            c.innerHTML += html + "</div>";
        } else {
            c.innerHTML += `<div style="margin:10px; padding:15px; background:#111; color:#666; border-radius:10px;"><b>${day}</b> - OFF</div>`;
        }
    });
         }
            
