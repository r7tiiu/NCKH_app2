/*==================================================
StressCheck - dashboard.js
==================================================*/

function riskBadge(score) {
    if (score < 20) return '<div class="risk-badge safe">🟢 Bình thường</div>';
    if (score < 40) return '<div class="risk-badge light">🟡 Áp lực nhẹ</div>';
    if (score < 60) return '<div class="risk-badge medium">🟠 Trung bình</div>';
    if (score < 80) return '<div class="risk-badge high">🔴 Cao</div>';
    return '<div class="risk-badge extreme">🚨 Rất cao</div>';
}

// Badge riêng cho Resilience (tích cực: cao là tốt)
function resilienceBadge(score) {
    if (score >= 80) return '<div class="risk-badge safe">🟢 Rất tốt</div>';
    if (score >= 60) return '<div class="risk-badge light">🟡 Khá tốt</div>';
    if (score >= 40) return '<div class="risk-badge medium">🟠 Trung bình</div>';
    if (score >= 20) return '<div class="risk-badge high">🔴 Thấp</div>';
    return '<div class="risk-badge extreme">🚨 Rất thấp</div>';
}

function buildProgressBar(score) {
    let color = "#27ae60";
    if (score >= 40 && score < 60) color = "#f39c12";
    if (score >= 60 && score < 80) color = "#e67e22";
    if (score >= 80) color = "#e74c3c";
    
    return `
        <div class="progress-container" style="background: #eef4fb; width: 100%; height: 8px; border-radius: 4px; overflow: hidden;">
            <div class="progress-bar" style="width: ${score}%; height: 100%; background: ${color}; transition: width 0.5s ease;"></div>
        </div>
    `;
}

// Progress bar cho Resilience (cao là tốt → màu xanh)
function buildResilienceProgressBar(score) {
    let color = "#e74c3c";
    if (score >= 40 && score < 60) color = "#e67e22";
    if (score >= 60 && score < 80) color = "#f39c12";
    if (score >= 80) color = "#27ae60";
    
    return `
        <div class="progress-container" style="background: #eef4fb; width: 100%; height: 8px; border-radius: 4px; overflow: hidden;">
            <div class="progress-bar" style="width: ${score}%; height: 100%; background: ${color}; transition: width 0.5s ease;"></div>
        </div>
    `;
}

function paintScore(id, score) {
    const el = document.getElementById(id);
    if (!el) return;
    if (score < 40) el.style.color = "#27ae60";
    else if (score < 70) el.style.color = "#f39c12";
    else el.style.color = "#e74c3c";
}

function paintResilienceScore(id, score) {
    const el = document.getElementById(id);
    if (!el) return;
    if (score >= 80) el.style.color = "#27ae60";
    else if (score >= 60) el.style.color = "#f39c12";
    else el.style.color = "#e74c3c";
}

function renderDashboard() {
    const overall = SCORE_ENGINE.overallStress || 0;
    const burnout = SCORE_ENGINE.burnoutIndex || 0;
    const resilience = SCORE_ENGINE.resilienceIndex || 0;
    const peak = (SCORE_ENGINE.rank && SCORE_ENGINE.rank[0]) ? SCORE_ENGINE.rank[0] : { title: "Không rõ", risk: 0 };

    // Chạy hiệu ứng số tăng dần
    if (typeof animateNumber === "function") {
        const oEl = document.getElementById("overallStressValue");
        const bEl = document.getElementById("burnoutValue");
        const pEl = document.getElementById("peakValue");
        const rEl = document.getElementById("resilienceValue");
        
        if (oEl) animateNumber(oEl, overall);
        if (bEl) animateNumber(bEl, burnout);
        if (pEl) animateNumber(pEl, peak.risk);
        if (rEl) animateNumber(rEl, resilience);
    }

    // Đổi màu chữ theo mức độ stress
    paintScore("overallStressValue", overall);
    paintScore("burnoutValue", burnout);
    paintScore("peakValue", peak.risk);
    paintResilienceScore("resilienceValue", resilience);

    // Render Progress Bars
    const op = document.getElementById("overallProgress");
    const bp = document.getElementById("burnoutProgress");
    const pp = document.getElementById("peakProgress");
    const rp = document.getElementById("resilienceProgress");
    
    if (op) op.innerHTML = buildProgressBar(overall);
    if (bp) bp.innerHTML = buildProgressBar(burnout);
    if (pp) pp.innerHTML = buildProgressBar(peak.risk);
    if (rp) rp.innerHTML = buildResilienceProgressBar(resilience);

    // Render Badges
    const ol = document.getElementById("overallLevel");
    const bl = document.getElementById("burnoutLevel");
    const pl = document.getElementById("peakLevel");
    const pt = document.getElementById("peakTitle");
    const rl = document.getElementById("resilienceLevel");
    
    if (ol) ol.innerHTML = riskBadge(overall);
    if (bl) bl.innerHTML = riskBadge(burnout);
    if (pl) pl.innerHTML = riskBadge(peak.risk);
    if (pt) pt.innerHTML = peak.title;
    if (rl) rl.innerHTML = resilienceBadge(resilience);
}

// Hàm levelText dùng trong báo cáo
function levelText(score) {
    if (score < 20) return "Bình thường 😌";
    if (score < 40) return "Áp lực nhẹ 🙂";
    if (score < 60) return "Stress trung bình 😐";
    if (score < 80) return "Stress cao 😟";
    return "Stress rất cao 😣";
}

// Level text cho Resilience
function resilienceLevelText(score) {
    if (score >= 80) return "Rất tốt 💪";
    if (score >= 60) return "Khá tốt 👍";
    if (score >= 40) return "Trung bình 🤔";
    if (score >= 20) return "Cần cải thiện 😕";
    return "Đáng lo ngại 😟";
}

// Hàm render summary cards (dùng trong report.js)
function renderSummaryCards() {
    const overall = SCORE_ENGINE.overallStress || 0;
    const burnout = SCORE_ENGINE.burnoutIndex || 0;
    const resilience = SCORE_ENGINE.resilienceIndex || 0;
    const peak = SCORE_ENGINE.rank && SCORE_ENGINE.rank.length > 0 ? SCORE_ENGINE.rank[0] : null;

    const overallValue = document.getElementById("overallStressValue");
    const burnoutValue = document.getElementById("burnoutValue");
    const peakValue = document.getElementById("peakValue");
    const resilienceValue = document.getElementById("resilienceValue");
    
    const overallProgress = document.getElementById("overallProgress");
    const burnoutProgress = document.getElementById("burnoutProgress");
    const peakProgress = document.getElementById("peakProgress");
    const resilienceProgress = document.getElementById("resilienceProgress");
    
    const overallLevel = document.getElementById("overallLevel");
    const burnoutLevel = document.getElementById("burnoutLevel");
    const peakLevel = document.getElementById("peakLevel");
    const resilienceLevel = document.getElementById("resilienceLevel");
    
    const peakTitle = document.getElementById("peakTitle");

    if (overallValue) overallValue.textContent = `${overall.toFixed(1)}%`;
    if (burnoutValue) burnoutValue.textContent = `${burnout.toFixed(1)}%`;
    if (peakValue) peakValue.textContent = `${peak ? peak.risk.toFixed(1) : 0}%`;
    if (resilienceValue) resilienceValue.textContent = `${resilience.toFixed(1)}%`;
    
    if (overallProgress) overallProgress.innerHTML = buildProgressBar(overall);
    if (burnoutProgress) burnoutProgress.innerHTML = buildProgressBar(burnout);
    if (peakProgress) peakProgress.innerHTML = peak ? buildProgressBar(peak.risk) : buildProgressBar(0);
    if (resilienceProgress) resilienceProgress.innerHTML = buildResilienceProgressBar(resilience);
    
    if (overallLevel) overallLevel.innerHTML = riskBadge(overall);
    if (burnoutLevel) burnoutLevel.innerHTML = riskBadge(burnout);
    if (peakLevel) peakLevel.innerHTML = peak ? riskBadge(peak.risk) : riskBadge(0);
    if (resilienceLevel) resilienceLevel.innerHTML = resilienceBadge(resilience);
    
    if (peakTitle) peakTitle.textContent = peak ? peak.title : "-";
    
    // Đổi màu
    paintScore("overallStressValue", overall);
    paintScore("burnoutValue", burnout);
    paintScore("peakValue", peak ? peak.risk : 0);
    paintResilienceScore("resilienceValue", resilience);
}