/*
==================================================
scoring.js
StressCheck – SCORING ENGINE (sửa logic)
==================================================
*/

const SCORE_ENGINE = {
    groupScores: {},
    overallStress: 0,
    peakStress: 0,
    spreadStress: 0,
    burnout: 0,
    burnoutIndex: 0,
    spreadIndex: 0,
    dominantGroup: null,
    recommendation: [],
    rank: [],
    criticalAreas: 0,
    confidence: 100,
    level: {},
    radarLabels: [],
    radarValues: [],
    barLabels: [],
    barValues: [],
    resilienceIndex: 0
};

// Chỉ lấy các nhóm stress, bỏ qua resilience
const STRESS_GROUPS = SURVEY.filter(g => g.id !== "resilience");

// ===== HÀM TÍNH ĐIỂM SÀNG LỌC (2 câu likert 0-4 → %) =====
function symptomScore(group) {
    let total = 0;
    group.screening.forEach(q => {
        total += SurveyEngine.answers[q.id] ?? 0;
    });
    const max = group.screening.length * 4; // 8
    return max === 0 ? 0 : (total / max) * 100;
}

// ===== HÀM TÍNH ĐIỂM CAUSE (checkbox) =====
function causeScore(group) {
    const causeQ = group.causes?.[0];
    if (!causeQ) return 0;
    const selected = SurveyEngine.answers[causeQ.id] || [];
    const total = causeQ.options.length;
    return total === 0 ? 0 : (selected.length / total) * 100;
}

// ===== HÀM TÍNH ĐIỂM IMPACT (checkbox + reverse) =====
function impactScore(group) {
    const impactQ = group.impact?.[0];
    if (!impactQ) return 0;
    const selected = SurveyEngine.answers[impactQ.id] || [];
    const options = impactQ.options;

    // Tìm câu reverse (chứa "Không ảnh hưởng" hoặc "Không")
    const reverseIdx = options.findIndex(opt => 
        opt.includes("Không ảnh hưởng") || opt === "Không" || opt.includes("không ảnh hưởng")
    );

    // Nếu chọn reverse → chỉ 10%
    if (reverseIdx !== -1 && selected.includes(options[reverseIdx])) {
        return 10;
    }

    // Bỏ qua reverse khi tính
    const filtered = options.filter((_, idx) => idx !== reverseIdx);
    if (filtered.length === 0) return 0;
    const chosen = selected.filter(val => filtered.includes(val));
    return (chosen.length / filtered.length) * 100;
}

// ===== HÀM TÍNH ĐIỂM FREQUENCY (1 câu range 0 - 100%) =====
function frequencyScore(group) {
    const freqQ = group.frequency?.[0];
    if (!freqQ) return 0;
    const val = SurveyEngine.answers[freqQ.id] ?? 0;
    if (freqQ.type === "range") {
        return val;
    }
    return val * 25;
}

// ===== TÍNH RISK CHO MỖI DOMAIN (theo logic mới) =====
function calculateRisk(group) {
    const symptom = symptomScore(group);

    // Nếu screening < 40% → chỉ lấy 35% của symptom
    if (symptom < 40) {
        return {
            symptom,
            cause: 0,
            impact: 0,
            frequency: 0,
            risk: symptom * 0.35
        };
    }

    // Ngược lại: tính đầy đủ
    const cause = causeScore(group);
    const impact = impactScore(group);
    const frequency = frequencyScore(group);
    const risk = symptom * 0.35 + cause * 0.25 + impact * 0.25 + frequency * 0.15;

    return {
        symptom,
        cause,
        impact,
        frequency,
        risk
    };
}

// ===== CÁC HÀM TỔNG HỢP (giữ nguyên) =====
function calculateGroupScores() {
    SCORE_ENGINE.groupScores = {};
    STRESS_GROUPS.forEach(group => {
        const result = calculateRisk(group);
        SCORE_ENGINE.groupScores[group.id] = {
            ...result,
            weight: group.weight,
            weighted: result.risk * group.weight
        };
    });
}

function calculatePeakStress() {
    let max = -1;
    let name = "";
    Object.entries(SCORE_ENGINE.groupScores).forEach(([id, data]) => {
        if (data.risk > max) {
            max = data.risk;
            name = id;
        }
    });
    SCORE_ENGINE.peakStress = max;
    SCORE_ENGINE.dominantGroup = name;
}

function calculateOverallStress() {
    let total = 0;
    let weight = 0;
    STRESS_GROUPS.forEach(group => {
        const grpScore = SCORE_ENGINE.groupScores[group.id]?.risk || 0;
        total += grpScore * group.weight;
        weight += group.weight;
    });
    SCORE_ENGINE.overallStress = weight === 0 ? 0 : total / weight;
}

function calculateSpreadStress() {
    const risks = STRESS_GROUPS.map(g => SCORE_ENGINE.groupScores[g.id]?.risk || 0);
    const mean = risks.reduce((a, b) => a + b, 0) / risks.length;
    let variance = 0;
    risks.forEach(v => variance += Math.pow(v - mean, 2));
    variance /= risks.length;
    const std = Math.sqrt(variance);
    SCORE_ENGINE.spreadStress = Math.max(0, 100 - std * 2);
}

function calculateBurnout() {
    const sleep = SCORE_ENGINE.groupScores.sleep?.risk || 0;
    const emotion = SCORE_ENGINE.groupScores.emotion?.risk || 0;
    const study = SCORE_ENGINE.groupScores.study?.risk || 0;
    const exam = SCORE_ENGINE.groupScores.exam?.risk || 0;
    SCORE_ENGINE.burnout = study * 0.35 + exam * 0.30 + sleep * 0.25 + emotion * 0.10;
}

function calculateCriticalIndex() {
    let count = 0;
    STRESS_GROUPS.forEach(group => {
        if ((SCORE_ENGINE.groupScores[group.id]?.risk || 0) >= 70) count++;
    });
    SCORE_ENGINE.criticalAreas = count;
}

function rankStressAreas() {
    SCORE_ENGINE.rank = STRESS_GROUPS.map(g => ({
        id: g.id,
        title: g.title,
        risk: SCORE_ENGINE.groupScores[g.id]?.risk || 0
    }));
    SCORE_ENGINE.rank.sort((a, b) => b.risk - a.risk);
}

// ===== RESILIENCE =====
function calculateResilience() {
    const resGroup = SURVEY.find(g => g.id === "resilience");
    if (!resGroup) {
        SCORE_ENGINE.resilienceIndex = 0;
        return;
    }

    const valueMap = {
        0: 5,
        1: 25,
        2: 60,
        3: 80,
        4: 100
    };

    let total = 0;
    let count = 0;
    resGroup.screening.forEach(q => {
        const val = SurveyEngine.answers[q.id];
        if (val !== undefined && val !== null && val >= 0 && val <= 4) {
            total += valueMap[val] || 0;
            count++;
        }
    });

    SCORE_ENGINE.resilienceIndex = count > 0 ? Math.round(total / count) : 0;
}

function classifyRisk(score) {
    if (score < 20) return { level: "Rất thấp", color: "#2ecc71" };
    if (score < 40) return { level: "Thấp", color: "#27ae60" };
    if (score < 60) return { level: "Trung bình", color: "#f39c12" };
    if (score < 75) return { level: "Cao", color: "#e67e22" };
    if (score < 90) return { level: "Rất cao", color: "#e74c3c" };
    return { level: "Khẩn cấp", color: "#c0392b" };
}

function classifyOverall() {
    SCORE_ENGINE.level = classifyRisk(SCORE_ENGINE.overallStress);
}

function calculateConfidence() {
    const values = Object.values(SurveyEngine.answers).filter(v => typeof v === "number");
    if (values.length === 0) return;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    let diff = 0;
    values.forEach(v => diff += Math.abs(avg - v));
    diff /= values.length;
    SCORE_ENGINE.confidence = Math.max(40, 100 - diff * 18);
}

// ===== TÍNH TOÁN TẤT CẢ =====
async function calculateAllScores() {
    calculateGroupScores();
    calculatePeakStress();
    calculateOverallStress();
    calculateSpreadStress();
    calculateBurnout();
    calculateCriticalIndex();
    calculateConfidence();
    classifyOverall();
    rankStressAreas();
    calculateResilience();

    SCORE_ENGINE.burnoutIndex = SCORE_ENGINE.burnout;
    SCORE_ENGINE.spreadIndex = SCORE_ENGINE.spreadStress;

    if (typeof buildReport === "function") await buildReport();
    if (typeof saveLocal === "function") saveLocal();
}