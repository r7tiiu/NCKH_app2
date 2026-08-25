/*
==================================================
scoring.js – Tính điểm cho mô hình 3 cặp
==================================================
*/

const SCORE_ENGINE = {
    overallStress: 0,
    domainScores: {},
    burnout: 0,
    burnoutIndex: 0,
    resilience: 0,
    resilienceIndex: 0,
    rank: [],
    radarLabels: [],
    radarValues: [],
    level: {}
};

// Trọng số S, C, I
const WEIGHT_S = 0.55;
const WEIGHT_C = 0.28;
const WEIGHT_I = 0.17;

// Trọng số các domain
const DOMAIN_WEIGHTS = {
    study: 0.1624,
    exam: 0.1893,
    sleep: 0.1586,
    emotion: 0.1680,
    family: 0.1741,
    social: 0.1475
};

// Hàm tính điểm S từ câu trả lời (0-4)
function getSScore(domainId, answerKey) {
    const val = SurveyEngine.answers[answerKey];
    if (val === undefined || val === null) return 0;
    return (val / 4) * 100;
}

// Hàm tính điểm C từ checkbox
function getCScore(domainId, answerKey) {
    const selected = SurveyEngine.answers[answerKey] || [];
    const total = SURVEY.cause[domainId] ? SURVEY.cause[domainId].options.length : 0;
    if (total === 0) return 0;
    return (selected.length / total) * 100;
}

// Hàm tính điểm I từ checkbox
function getIScore(domainId, answerKey) {
    const selected = SurveyEngine.answers[answerKey] || [];
    const total = SURVEY.impact[domainId] ? SURVEY.impact[domainId].options.length : 0;
    if (total === 0) return 0;
    return (selected.length / total) * 100;
}

// Tính điểm cho từng domain
function calculateDomainScores() {
    const domainIds = Object.keys(SURVEY.domains);
    domainIds.forEach(dom => {
        let S = 0, C = 0, I = 0;
        let hasS = false, hasC = false, hasI = false;

        // Lấy điểm S (kiểm tra tất cả các key có thể)
        const sKeys = [`${dom}_s1`, `${dom}_s2`, `${dom}_s3`];
        for (let key of sKeys) {
            if (SurveyEngine.answers[key] !== undefined) {
                S = getSScore(dom, key);
                hasS = true;
                break;
            }
        }

        // Lấy điểm C
        const cKeys = [`${dom}_c1`, `${dom}_c2`, `${dom}_c3`];
        for (let key of cKeys) {
            if (SurveyEngine.answers[key] !== undefined) {
                C = getCScore(dom, key);
                hasC = true;
                break;
            }
        }

        // Lấy điểm I
        const iKeys = [`${dom}_i1`, `${dom}_i2`, `${dom}_i3`];
        for (let key of iKeys) {
            if (SurveyEngine.answers[key] !== undefined) {
                I = getIScore(dom, key);
                hasI = true;
                break;
            }
        }

        // Nếu chỉ có S, dùng S*0.55
        if (hasS && !hasC && !hasI) {
            SCORE_ENGINE.domainScores[dom] = S * 0.55;
        } else if (hasS && hasC && hasI) {
            SCORE_ENGINE.domainScores[dom] = WEIGHT_S * S + WEIGHT_C * C + WEIGHT_I * I;
        } else if (hasS && hasC) {
            // Nếu chỉ có S và C (không có I) → dùng S*0.55 + C*0.28
            SCORE_ENGINE.domainScores[dom] = WEIGHT_S * S + WEIGHT_C * C;
        } else {
            SCORE_ENGINE.domainScores[dom] = 0;
        }
    });
}

// Tính Overall Stress
function calculateOverallStress() {
    let total = 0;
    let weightSum = 0;
    Object.keys(DOMAIN_WEIGHTS).forEach(dom => {
        const score = SCORE_ENGINE.domainScores[dom] || 0;
        const w = DOMAIN_WEIGHTS[dom];
        total += score * w;
        weightSum += w;
    });
    SCORE_ENGINE.overallStress = weightSum > 0 ? total / weightSum : 0;
}

// Tính Burnout
function calculateBurnout() {
    const study = SCORE_ENGINE.domainScores.study || 0;
    const exam = SCORE_ENGINE.domainScores.exam || 0;
    const sleep = SCORE_ENGINE.domainScores.sleep || 0;
    const emotion = SCORE_ENGINE.domainScores.emotion || 0;
    SCORE_ENGINE.burnout = study * 0.30 + exam * 0.25 + sleep * 0.25 + emotion * 0.20;
    SCORE_ENGINE.burnoutIndex = SCORE_ENGINE.burnout;
}

// Tính Resilience
function calculateResilience() {
    // Lấy 4 câu resilience (giả định từ câu res_s1, res_s2, res_s3, res_s4)
    const resKeys = ['res_s1', 'res_s2', 'res_s3', 'res_s4'];
    let total = 0;
    let count = 0;
    resKeys.forEach(key => {
        const val = SurveyEngine.answers[key];
        if (val !== undefined && val !== null) {
            total += val;
            count++;
        }
    });
    // Quy đổi 0-4 thành 0-100% (ánh xạ: 0→5%, 1→25%, 2→60%, 3→80%, 4→100%)
    const valueMap = { 0: 5, 1: 25, 2: 60, 3: 80, 4: 100 };
    let resTotal = 0;
    let resCount = 0;
    resKeys.forEach(key => {
        const val = SurveyEngine.answers[key];
        if (val !== undefined && val !== null && val >= 0 && val <= 4) {
            resTotal += valueMap[val] || 0;
            resCount++;
        }
    });
    SCORE_ENGINE.resilience = resCount > 0 ? Math.round(resTotal / resCount) : 0;
    SCORE_ENGINE.resilienceIndex = SCORE_ENGINE.resilience;
}

// Xếp hạng domain theo điểm stress
function rankDomains() {
    const sorted = Object.keys(SCORE_ENGINE.domainScores)
        .map(id => ({
            id: id,
            title: SURVEY.domains[id].title,
            risk: SCORE_ENGINE.domainScores[id] || 0
        }))
        .sort((a, b) => b.risk - a.risk);
    SCORE_ENGINE.rank = sorted;
}

// Hàm tính tất cả
function calculateAllScores() {
    calculateDomainScores();
    calculateOverallStress();
    calculateBurnout();
    calculateResilience();
    rankDomains();
    
    // Log để debug
    console.log('✅ Domain Scores:', SCORE_ENGINE.domainScores);
    console.log('✅ Overall Stress:', SCORE_ENGINE.overallStress);
    console.log('✅ Rank:', SCORE_ENGINE.rank);
    
    // Gọi build report nếu có
    if (typeof buildReport === 'function') {
        buildReport();
    }
}