/*
==================================================
StressCheck – survey.js (Không frequency)
==================================================
*/

const SurveyEngine = {
    currentCategory: 0,
    currentStage: 0,
    currentQuestion: 0,
    answers: {},
    profile: {},
    currentQuestions: [],
    needDeep: false,
    history: [],
    groupResult: {},
    totalQuestions: 0
};

const STAGE = {
    SCREENING: 0,
    CAUSE: 1,
    IMPACT: 2
};

const LikertText = [
    "Hoàn toàn không",
    "Hiếm khi",
    "Đôi khi",
    "Thường xuyên",
    "Gần như luôn"
];

// ===== KHỞI TẠO =====
function initTotalQuestions() {
    let total = 0;
    SURVEY.forEach(group => {
        total += group.screening.length;
        if (group.causes) total += group.causes.length;
        if (group.impact) total += group.impact.length;
    });
    SurveyEngine.totalQuestions = total;
}

function startSurvey() {
    SurveyEngine.currentCategory = 0;
    SurveyEngine.currentStage = STAGE.SCREENING;
    SurveyEngine.currentQuestion = 0;
    SurveyEngine.answers = {};
    SurveyEngine.history = [];
    SurveyEngine.groupResult = {};
    initTotalQuestions();
    loadCurrentStage();
}

// ===== LOAD STAGE =====
function loadCurrentStage() {
    const group = SURVEY[SurveyEngine.currentCategory];
    if (!group) {
        console.log("Không còn nhóm nào, kết thúc survey.");
        finishSurvey();
        return;
    }

    console.log(`Load category: ${group.title}, stage: ${SurveyEngine.currentStage}`);

    switch (SurveyEngine.currentStage) {
        case STAGE.SCREENING:
            SurveyEngine.currentQuestions = group.screening || [];
            break;
        case STAGE.CAUSE:
            SurveyEngine.currentQuestions = group.causes || [];
            break;
        case STAGE.IMPACT:
            SurveyEngine.currentQuestions = group.impact || [];
            break;
    }

    if (!SurveyEngine.currentQuestions.length) {
        console.log("Không có câu hỏi, chuyển stage.");
        finishStage();
        return;
    }

    SurveyEngine.currentQuestion = 0;
    renderQuestion();
    updateProgress();

    if (SurveyEngine.currentStage === STAGE.SCREENING) {
        showTransitionNotice(`📌 ${group.title}`);
    }
}

// ===== RENDER QUESTION =====
function renderQuestion() {
    const box = document.getElementById("questionContainer");
    const questions = SurveyEngine.currentQuestions || [];

    if (!questions.length) {
        finishStage();
        return;
    }

    if (SurveyEngine.currentStage === STAGE.SCREENING) {
        let html = `<div class="question-card"><div class="question-title">Câu hỏi sàng lọc</div>`;
        questions.forEach((q) => {
            html += `<div class="question-block" style="margin-top:18px;">
                <div class="question-title" style="font-size:1rem;margin-bottom:10px;">${q.question}</div>`;
            if (q.type === "likert") {
                LikertText.forEach((text, index) => {
                    const checked = SurveyEngine.answers[q.id] === index ? "checked" : "";
                    html += `<div class="option">
                        <input type="radio" name="answer-${q.id}" id="${q.id}-${index}" value="${index}" ${checked}>
                        <label for="${q.id}-${index}">${text}</label>
                    </div>`;
                });
            }
            html += `</div>`;
        });
        html += `</div>`;
        box.innerHTML = html;
        return;
    }

    const q = questions[SurveyEngine.currentQuestion];
    if (!q) {
        finishStage();
        return;
    }

    let html = `<div class="question-card"><div class="question-title">${q.question}</div>`;

    if (q.type === "likert") {
        LikertText.forEach((text, index) => {
            const checked = SurveyEngine.answers[q.id] === index ? "checked" : "";
            html += `<div class="option">
                <input type="radio" name="answer" id="a${index}" value="${index}" ${checked}>
                <label for="a${index}">${text}</label>
            </div>`;
        });
    } else if (q.type === "checkbox") {
        // Xác định reverse (câu "Không ảnh hưởng")
        let reverseOption = null;
        q.options.forEach((text, idx) => {
            if (text.includes("Không ảnh hưởng") || text === "Không" || text.includes("không ảnh hưởng")) {
                reverseOption = { text, idx };
            }
        });

        const selectedValues = Array.isArray(SurveyEngine.answers[q.id]) ? SurveyEngine.answers[q.id] : [];
        html += `<div class="checkbox-group" data-reverse-index="${reverseOption ? reverseOption.idx : -1}">`;
        q.options.forEach((text, index) => {
            const checked = selectedValues.includes(text) ? "checked" : "";
            const isReverse = (reverseOption && index === reverseOption.idx);
            html += `<div class="option">
                <input type="checkbox" id="c${index}" value="${text}" ${checked} 
                       ${isReverse ? 'data-reverse="true"' : ''}
                       onchange="handleCheckboxChange(this, '${q.id}', ${isReverse})">
                <label for="c${index}">${text}</label>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    box.innerHTML = html;
}

// ===== SAVE ANSWER =====
function saveCurrentAnswer() {
    const questions = SurveyEngine.currentQuestions || [];
    if (!questions.length) return false;

    if (SurveyEngine.currentStage === STAGE.SCREENING) {
        let allAnswered = true;
        questions.forEach((q) => {
            if (q.type === "likert") {
                const value = document.querySelector(`input[name="answer-${q.id}"]:checked`);
                if (!value) {
                    allAnswered = false;
                    return;
                }
                SurveyEngine.answers[q.id] = Number(value.value);
            }
        });
        return allAnswered;
    }

    const q = questions[SurveyEngine.currentQuestion];
    if (!q) return false;

    if (q.type === "likert") {
        const value = document.querySelector('input[name="answer"]:checked');
        if (!value) return false;
        SurveyEngine.answers[q.id] = Number(value.value);
    } else if (q.type === "checkbox") {
        let arr = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(e => arr.push(e.value));
        SurveyEngine.answers[q.id] = arr;
        return arr.length > 0;
    }
    return true;
}

// ===== NEXT / BACK =====
function nextQuestion() {
    if (!saveCurrentAnswer()) {
        const card = document.querySelector('.question-card');
        if (card) {
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 400);
        }
        showInlineMessage("⚠️ Vui lòng chọn câu trả lời trước khi tiếp tục.");
        return;
    }

    if (SurveyEngine.currentStage === STAGE.SCREENING) {
        finishStage();
        return;
    }

    SurveyEngine.history.push({
        category: SurveyEngine.currentCategory,
        stage: SurveyEngine.currentStage,
        question: SurveyEngine.currentQuestion
    });

    SurveyEngine.currentQuestion++;
    if (SurveyEngine.currentQuestion >= SurveyEngine.currentQuestions.length) {
        finishStage();
        return;
    }

    renderQuestion();
    updateProgress();
    scrollToTop();
}

function previousQuestion() {
    if (SurveyEngine.history.length === 0) return;
    const last = SurveyEngine.history.pop();
    SurveyEngine.currentCategory = last.category;
    SurveyEngine.currentStage = last.stage;
    SurveyEngine.currentQuestion = last.question;
    const group = SURVEY[SurveyEngine.currentCategory];
    switch (SurveyEngine.currentStage) {
        case STAGE.SCREENING: SurveyEngine.currentQuestions = group.screening; break;
        case STAGE.CAUSE: SurveyEngine.currentQuestions = group.causes; break;
        case STAGE.IMPACT: SurveyEngine.currentQuestions = group.impact; break;
    }
    renderQuestion();
    updateProgress();
    scrollToTop();
}

// ===== FINISH STAGE =====
function calculateScreeningScore(group) {
    let total = 0, max = 0;
    group.screening.forEach(q => {
        const value = SurveyEngine.answers[q.id] ?? 0;
        total += value;
        max += 4;
    });
    return normalize(total, max);
}

function calculateDecisionScore(group) {
    const screening = calculateScreeningScore(group);
    const severityBoost = screening >= 75 ? 100 : screening >= 60 ? 80 : screening >= 45 ? 60 : screening >= 35 ? 40 : 0;
    return (screening * 0.7 + severityBoost * 0.3);
}

function shouldExpandGroup(group) {
    const hasHighSymptom = group.screening.some(q => {
        const val = SurveyEngine.answers[q.id];
        return val !== undefined && val >= 3;
    });
    
    if (hasHighSymptom) {
        console.log(`Mở rộng ${group.title} vì có câu trả lời >= 3`);
        return true;
    }
    
    const decision = calculateDecisionScore(group);
    const result = decision >= CONFIG.screeningThreshold;
    if (result) {
        console.log(`Mở rộng ${group.title} vì đạt ngưỡng ${CONFIG.screeningThreshold}%`);
    }
    return result;
}

function finishStage() {
    const group = SURVEY[SurveyEngine.currentCategory];
    if (!group) {
        finishSurvey();
        return;
    }

    const screeningScore = calculateScreeningScore(group);
    SurveyEngine.groupResult[group.id] = { screeningScore, expanded: shouldExpandGroup(group) };

    console.log(`Finish stage ${SurveyEngine.currentStage} of ${group.title}, needDeep: ${shouldExpandGroup(group)}`);

    if (group.id === "resilience" && SurveyEngine.currentStage === STAGE.SCREENING) {
        console.log("Resilience done, finishing survey.");
        finishSurvey();
        return;
    }

    if (SurveyEngine.currentStage === STAGE.SCREENING) {
        if (shouldExpandGroup(group) && group.causes && group.causes.length > 0) {
            SurveyEngine.currentStage = STAGE.CAUSE;
            SurveyEngine.currentQuestion = 0;
            loadCurrentStage();
            return;
        } else {
            SurveyEngine.currentCategory++;
            SurveyEngine.currentStage = STAGE.SCREENING;
            SurveyEngine.currentQuestion = 0;
            if (SurveyEngine.currentCategory >= SURVEY.length) {
                finishSurvey();
                return;
            }
            loadCurrentStage();
            return;
        }
    }

    if (SurveyEngine.currentStage === STAGE.CAUSE) {
        if (group.impact && group.impact.length > 0) {
            SurveyEngine.currentStage = STAGE.IMPACT;
            SurveyEngine.currentQuestion = 0;
            loadCurrentStage();
            return;
        } else {
            SurveyEngine.currentCategory++;
            SurveyEngine.currentStage = STAGE.SCREENING;
            SurveyEngine.currentQuestion = 0;
            if (SurveyEngine.currentCategory >= SURVEY.length) {
                finishSurvey();
                return;
            }
            loadCurrentStage();
            return;
        }
    }

    if (SurveyEngine.currentStage === STAGE.IMPACT) {
        SurveyEngine.currentCategory++;
        SurveyEngine.currentStage = STAGE.SCREENING;
        SurveyEngine.currentQuestion = 0;
        if (SurveyEngine.currentCategory >= SURVEY.length) {
            finishSurvey();
            return;
        }
        loadCurrentStage();
        return;
    }
}

// ===== TIẾN ĐỘ =====
function calculateProgress() {
    const answered = Object.keys(SurveyEngine.answers).length;
    let total = 0;

    SURVEY.forEach(group => {
        total += group.screening.length;
        if (SurveyEngine.groupResult[group.id]?.expanded) {
            total += (group.causes || []).length;
            total += (group.impact || []).length;
        }
    });

    return total > 0 ? Math.round((answered / total) * 100) : 0;
}

function updateProgress() {
    const percent = calculateProgress();
    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressText");
    if (bar) bar.style.width = percent + "%";
    if (text) text.innerText = "Tiến độ: " + percent + "%";
}

// ===== KẾT THÚC =====
function finishSurvey() {
    console.log("Finishing survey...");
    const surveyPage = document.getElementById("surveyPage");
    const loadingPage = document.getElementById("loadingPage");
    if (surveyPage) surveyPage.classList.remove("active");
    if (loadingPage) loadingPage.classList.add("active");

    setTimeout(async () => {
        try {
            await calculateAllScores();
            if (typeof renderSummaryCards === "function") renderSummaryCards();
            if (typeof renderDashboard === "function") renderDashboard();
        } catch (error) {
            console.error("Survey scoring failed", error);
        } finally {
            const loadingPage = document.getElementById("loadingPage");
            const resultPage = document.getElementById("resultPage");
            if (loadingPage) loadingPage.classList.remove("active");
            if (resultPage) resultPage.classList.add("active");
        }
    }, CONFIG.loadingDelay);
}

// ===== HELPER =====
function showTransitionNotice(text) {
    const oldNotice = document.querySelector('.transition-notice');
    if (oldNotice) oldNotice.remove();
    const notice = document.createElement('div');
    notice.className = 'transition-notice';
    notice.innerText = text;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2000);
}

function showInlineMessage(msg) {
    const oldMsg = document.querySelector('.inline-error-message');
    if (oldMsg) oldMsg.remove();
    const card = document.querySelector('.question-card');
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'inline-error-message';
    div.innerText = msg;
    card.appendChild(div);
    setTimeout(() => { if (div.parentNode) div.remove(); }, 3000);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== XỬ LÝ CHECKBOX VỚI REVERSE =====
window.handleCheckboxChange = function(checkbox, questionId, isReverse) {
    const group = checkbox.closest('.checkbox-group');
    const reverseIndex = parseInt(group.dataset.reverseIndex, 10);
    const allCheckboxes = group.querySelectorAll('input[type="checkbox"]');

    if (isReverse) {
        if (checkbox.checked) {
            allCheckboxes.forEach(cb => {
                if (cb !== checkbox) cb.checked = false;
            });
        }
    } else {
        if (checkbox.checked && reverseIndex !== -1) {
            const reverseCb = group.querySelector(`input[type="checkbox"][data-reverse="true"]`);
            if (reverseCb) reverseCb.checked = false;
        }
    }

    const checkedValues = [];
    allCheckboxes.forEach(cb => {
        if (cb.checked) checkedValues.push(cb.value);
    });
    SurveyEngine.answers[questionId] = checkedValues;
};

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");
    const startBtn = document.getElementById("startBtn");
    const themeBtn = document.getElementById("themeBtn");

    // Sự kiện click toàn trang welcome (đã xóa nút start)
    const welcomePage = document.getElementById("welcomePage");
    if (welcomePage) {
        welcomePage.addEventListener("click", function(event) {
            if (!welcomePage.classList.contains("active")) return;
            const surveyPage = document.getElementById("surveyPage");
            if (surveyPage) {
                welcomePage.classList.remove("active");
                surveyPage.classList.add("active");
                startSurvey();
            }
        });
        welcomePage.style.cursor = "pointer";
    }

    if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
    if (backBtn) backBtn.addEventListener("click", previousQuestion);

    if (themeBtn) {
        themeBtn.addEventListener("click", function() {
            document.body.classList.toggle('dark');
        });
    }
});

console.log("Survey Engine loaded successfully (Không frequency)");
