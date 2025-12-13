// --- PATRON v3.0 NİHAİ PROGRAM VERİTABANI ---
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

// Günlerin Odak Konuları
const dayThemes = {
    "Pazartesi": "İTİŞ (GÜÇ & HACİM)",
    "Salı": "ÇEKİŞ (SIRT KALINLIĞI)",
    "Çarşamba": "BACAK (TEMEL İNŞAAT)",
    "Perşembe": "OFF (DİNLENME)",
    "Cuma": "OMUZ GÜCÜ & GÖĞÜS",
    "Cumartesi": "SIRT DETAY & KOL",
    "Pazar": "OFF (DİNLENME)"
};

// --- SİSTEM MOTORU ---
let currentDay = "Pazartesi";
const container = document.getElementById("workout-container");
const daySelector = document.getElementById("day-selector");
const programContainer = document.getElementById("full-program-container");

// Haftanın Günleri (Sıralı)
const allDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const trainingDays = ["Pazartesi", "Salı", "Çarşamba", "Cuma", "Cumartesi"];

// --- 1. GÖRÜNÜM DEĞİŞTİRME ---
function switchView(viewName) {
    // Nav butonlarını güncelle
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-btn[onclick="switchView('${viewName}')"]`).classList.add('active');

    // Sayfaları gizle/göster
    document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
    document.getElementById(`view-${viewName}`).style.display = 'block';

    if(viewName === 'program') {
        renderFullProgram();
    }
}

// --- 2. ANTRENMAN TAKİP SAYFASI ---
function initTracker() {
    daySelector.innerHTML = "";
    trainingDays.forEach(day => {
        const btn = document.createElement("button");
        btn.className = `day-btn ${day === currentDay ? 'active' : ''}`;
        btn.innerText = day;
        btn.onclick = () => {
            document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentDay = day;
            renderTracker();
        }
        daySelector.appendChild(btn);
    });
    renderTracker();
}

function renderTracker() {
    container.innerHTML = "";
    const exercises = workouts[currentDay];

    exercises.forEach(ex => {
        const history = JSON.parse(localStorage.getItem(ex.id)) || [];
        const lastSession = history[history.length - 1];
        
        let infoText = "Henüz kayıt yok.";
        if (lastSession) {
            infoText = `Son: <b>${lastSession.bestWeight}kg</b> x <b>${lastSession.bestReps}</b>`;
        }

        const card = document.createElement("div");
        card.className = "exercise-card";
        
        let setsHTML = "";
        for(let i=1; i<=ex.sets; i++) {
            setsHTML += `
            <div class="set-row">
                <span class="set-label">SET ${i}</span>
                <input type="number" id="${ex.id}_kg_${i}" placeholder="KG">
                <input type="number" id="${ex.id}_reps_${i}" placeholder="Tekrar">
            </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="ex-name">${ex.name}</span>
                <span class="ex-meta">${ex.target[0]}-${ex.target[1]} T | RIR ${ex.rir}</span>
            </div>
            <div style="font-size:0.8rem; color:#888; margin-bottom:10px; font-style:italic;">${infoText}</div>
            ${setsHTML}
            <button class="save-btn" onclick="analyze('${ex.id}', '${ex.name}', ${ex.target[1]}, ${ex.target[0]})">KAYDET</button>
        `;
        container.appendChild(card);
    });
}

// --- 3. PROGRAMIM SAYFASI ---
function renderFullProgram() {
    programContainer.innerHTML = "";
    
    allDays.forEach(day => {
        // OFF GÜNÜ MÜ?
        if (!workouts[day]) {
            const offCard = document.createElement("div");
            offCard.className = "off-card";
            offCard.innerHTML = `
                <div class="off-title">${day}</div>
                <div class="off-desc">OFF - Tam Dinlenme 🛌</div>
            `;
            programContainer.appendChild(offCard);
        } else {
            // ANTRENMAN GÜNÜ
            const dayCard = document.createElement("div");
            dayCard.className = "program-day-card";
            
            let exListHTML = "";
            workouts[day].forEach(ex => {
                exListHTML += `
                <div class="prog-ex-item">
                    <span>${ex.name}</span>
                    <span class="prog-details">${ex.sets}x${ex.target[0]}-${ex.target[1]}</span>
                </div>`;
            });

            dayCard.innerHTML = `
                <div class="day-header">
                    <span class="day-title">${day}</span>
                    <span class="day-focus">${dayThemes[day]}</span>
                </div>
                <div class="exercise-list">
                    ${exListHTML}
                </div>
            `;
            programContainer.appendChild(dayCard);
        }
    });
}

// --- 4. ANALİZ VE KAYIT (DEĞİŞMEDİ) ---
function analyze(id, name, maxTarget, minTarget) {
    const kgInputs = document.querySelectorAll(`[id^='${id}_kg_']`);
    const repInputs = document.querySelectorAll(`[id^='${id}_reps_']`);
    
    let bestWeight = 0;
    let bestReps = 0;
    let validSets = 0;

    for(let i=0; i<kgInputs.length; i++) {
        let k = parseFloat(kgInputs[i].value);
        let r = parseFloat(repInputs[i].value);
        if(k && r) {
            validSets++;
            let oneRM = k * (1 + r/30);
            let currentBestOneRM = bestWeight * (1 + bestReps/30);
            if(oneRM > currentBestOneRM) { bestWeight = k; bestReps = r; }
        }
    }

    if(validSets === 0) { alert("Boş veri girme Patron."); return; }

    const history = JSON.parse(localStorage.getItem(id)) || [];
    const sessionData = { date: new Date().toLocaleDateString(), bestWeight, bestReps, estimatedOneRM: bestWeight * (1 + bestReps/30) };
    history.push(sessionData);
    localStorage.setItem(id, JSON.stringify(history));

    let report = "";
    if (bestReps >= maxTarget) {
        report += `<div class="analysis-box" style="border-left: 4px solid #00e676"><b class="trend-up">🚀 HEDEF PARÇALANDI!</b><br>Haftaya ağırlığı %5 artır.</div>`;
    } else if (bestReps < minTarget) {
        report += `<div class="analysis-box" style="border-left: 4px solid #ff3d00"><b class="trend-down">⚠️ HEDEF ALTINDA</b><br>Formuna odaklan.</div>`;
    } else {
        report += `<div class="analysis-box" style="border-left: 4px solid #FFD700"><b class="trend-flat">✅ HEDEFTEYİZ</b><br>İstikrara devam.</div>`;
    }

    showModal(name, report);
}

function showModal(title, content) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = content;
    document.getElementById("modal").style.display = "flex";
}
function closeModal() {
    document.getElementById("modal").style.display = "none";
    renderTracker();
}

// BAŞLAT
initTracker();
