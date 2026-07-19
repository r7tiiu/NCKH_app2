/*
==================================================
StressCheck – report.js
Gộp Top 3 stress + Gợi ý thành 1 phần
==================================================
*/

// ===== Hàm emoji =====
function getStressEmoji(score) {
    if (score < 20) return "😌";
    if (score < 40) return "🙂";
    if (score < 60) return "😐";
    if (score < 80) return "😟";
    return "😣";
}

// ===== BÁO CÁO CHÍNH =====
const REPORT_ENGINE = {
    generate() {
        const top = SCORE_ENGINE.rank || [];
        let html = "";
        // Chỉ gọi 1 hàm duy nhất: gộp top 3 + gợi ý
        html += this.buildTopThreeWithAdvice(top);
        document.getElementById("aiReport").innerHTML = html;
    },

    // 👇 Hàm gộp: hiển thị cả mức stress và lời khuyên cho từng mục
    buildTopThreeWithAdvice(rank) {
        if (!rank || rank.length === 0) {
            return `<div class="report-section"><p>Không có dữ liệu để hiển thị.</p></div>`;
        }

        let html = `<div class="report-section"><h2>🔥 3 nguồn stress lớn nhất & gợi ý</h2>`;
        rank.slice(0, 3).forEach((item, index) => {
            html += `
            <div class="top-card combined-card">
                <div class="top-card-header">
                    <span class="top-number">${index + 1}</span>
                    <h3>${item.title}</h3>
                    <span class="stress-badge" style="background:${getColor(item.risk)}; color:white; padding:4px 14px; border-radius:20px; font-size:0.9rem;">
                        ${item.risk.toFixed(0)}%
                    </span>
                </div>
                <div class="top-card-body">
                    <p><strong>📊 Mức stress:</strong> ${item.risk.toFixed(1)}%</p>
                    <p><strong>💡 Gợi ý:</strong> ${getAdvice(item.id, item.risk)}</p>
                </div>
            </div>`;
        });
        html += `</div>`;
        return html;
    }
};

// ===== Lời khuyên cho từng lĩnh vực =====
function getAdvice(id, risk) {
    const advice = {
        study: "Hãy chia nhỏ mục tiêu học tập, áp dụng Pomodoro (25 phút học, 5 phút nghỉ), tránh học liên tục nhiều giờ.",
        exam: "Lập kế hoạch ôn tập theo tuần thay vì chỉ tập trung vào điểm số. Xác định mục tiêu phù hợp với năng lực của bản thân.",
        sleep: "Cố gắng ngủ đủ 7–8 giờ mỗi ngày, hạn chế sử dụng điện thoại trước khi ngủ khoảng 30–60 phút.",
        family: "Hãy thử chia sẻ cảm xúc của mình với bố mẹ hoặc người thân mà bạn tin tưởng. Không nên giữ mọi áp lực một mình.",
        peer: "Hãy nhớ rằng mỗi người có một thế mạnh riêng. Tập trung vào mục tiêu của bản thân thay vì so sánh với người khác. Dành thời gian cho những người bạn thực sự tôn trọng và ủng hộ bạn.",
        emotion: "Thực hành viết nhật ký cảm xúc, hít thở sâu hoặc tham gia hoạt động giúp thư giãn như thể thao, âm nhạc."
    };
    let txt = advice[id] || "Hãy dành thời gian chăm sóc bản thân nhiều hơn. Bạn xứng đáng được nghỉ ngơi.";
    if (risk >= 75) txt += "<br><br><b>⚠ Đây hiện là nguồn stress nghiêm trọng nhất của bạn.</b>";
    return txt;
}

// ===== Hàm lấy màu cho badge =====
function getColor(score) {
    if (score < 20) return "#22c55e";
    if (score < 40) return "#84cc16";
    if (score < 60) return "#f59e0b";
    if (score < 80) return "#ef4444";
    return "#991b1b";
}

// ==================================================
// XÂY DỰNG BÁO CÁO (async) – tích hợp AI
// ==================================================
async function buildReport() {
    try {
        REPORT_ENGINE.generate();
        renderSummaryCards();
        createRadarData();
        renderCharts();
        await generateAIAdvice();
        showResultsPage();
        if (typeof animateCards === "function") animateCards();
    } catch (error) {
        console.error("Build report failed", error);
        showResultsPage();
    } finally {
        const loadingPage = document.getElementById("loadingPage");
        if (loadingPage) loadingPage.classList.remove("active");
    }
}

function showResultsPage() {
    const loadingPage = document.getElementById("loadingPage");
    const resultPage = document.getElementById("resultPage");
    if (loadingPage) loadingPage.classList.remove("active");
    if (resultPage) resultPage.classList.add("active");
}

// ==================================================
// AI ADVICE
// ==================================================
async function generateAIAdvice() {
    const data = {
        overallStress: SCORE_ENGINE.overallStress || 0,
        burnout: SCORE_ENGINE.burnoutIndex || 0,
        resilience: SCORE_ENGINE.resilienceIndex || 0,
        topStressors: (SCORE_ENGINE.rank || []).slice(0, 3).map(item => item.title)
    };

    const fallbackHTML = `
        <div class="report-section">
            <h2>🧠 Phân tích tâm lý</h2>
            <ul>
                <li><strong>Mức độ stress tổng thể:</strong> ${data.overallStress.toFixed(1)}%</li>
                <li><strong>Chỉ số kiệt sức (Burnout):</strong> ${data.burnout.toFixed(1)}%</li>
                <li><strong>Khả năng phục hồi (Resilience):</strong> ${data.resilience.toFixed(1)}%</li>
                <li><strong>Ba nguồn stress lớn nhất:</strong> ${data.topStressors.join(', ') || 'Chưa có dữ liệu'}</li>
            </ul>
            <p>💡 <em>Hãy dành thời gian nghỉ ngơi, chia sẻ với người thân và cân bằng cuộc sống.</em></p>
            <p style="font-size:0.9rem;color:#999;">⚠️ Lời khuyên này là tạm thời (chưa kết nối được AI).</p>
        </div>
    `;

    const isLocal = window.location.protocol === 'file:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

    if (isLocal) {
        console.log('🔧 Đang chạy local, dùng fallback thay vì gọi API.');
        showAdvice(fallbackHTML);
        return;
    }

    const prompt = `Bạn là chuyên gia tâm lý. Dựa trên kết quả stress của học sinh:
- Stress tổng: ${data.overallStress}%
- Burnout: ${data.burnout}%
- Resilience: ${data.resilience}%
- Top 3 stress: ${data.topStressors.join(', ')}.

Hãy đưa ra 3 lời khuyên ngắn gọn, thực tế, mỗi lời khuyên 1-2 câu. Không phân tích dài dòng, không mở đầu.`;

    try {
        const response = await fetch('/api/advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        const aiAdvice = result.choices?.[0]?.message?.content;

        if (aiAdvice) {
            showAdvice(aiAdvice);
        } else {
            showAdvice(fallbackHTML);
        }
    } catch (error) {
        console.warn('⚠️ AI không khả dụng, dùng fallback:', error);
        showAdvice(fallbackHTML);
    }
}

function showAdvice(content) {
    const isFallback = content.includes('tạm thời') || content.includes('chưa kết nối');

    let formatted = content;
    if (!content.includes('<')) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.some(line => line.match(/^[-*•\d+.]/))) {
            formatted = '<ul>' + lines.map(line => {
                const clean = line.replace(/^[-*•\d+.]\s*/, '');
                return `<li>${clean}</li>`;
            }).join('') + '</ul>';
        } else {
            formatted = `<p>${content}</p>`;
        }
    }

    const wrapper = `
        <div class="groq-advice ${isFallback ? 'fallback' : ''}">
            <h2>🧠 Phân tích từ AI (Groq)</h2>
            ${formatted}
            <p style="font-size:0.85rem;color:#6b7280;margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px;">
                ⚡ Dựa trên mô hình Llama 3.3 70B · Groq
            </p>
        </div>
    `;

    const container = document.getElementById('aiAdviceContainer');
    if (container) {
        container.innerHTML = wrapper;
    } else {
        const reportDiv = document.getElementById('aiReport');
        if (reportDiv) {
            const newDiv = document.createElement('div');
            newDiv.id = 'aiAdviceContainer';
            newDiv.className = 'report-section';
            newDiv.innerHTML = wrapper;
            reportDiv.appendChild(newDiv);
        }
    }
}

// ==================================================
// SUMMARY CARDS
// ==================================================
function renderSummaryCards() {
    const overall = SCORE_ENGINE.overallStress || 0;
    const burnout = SCORE_ENGINE.burnoutIndex || 0;
    const peak = SCORE_ENGINE.rank && SCORE_ENGINE.rank.length > 0 ? SCORE_ENGINE.rank[0] : null;

    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    const setHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    setText('overallStressValue', overall.toFixed(1) + '%');
    setText('burnoutValue', burnout.toFixed(1) + '%');
    setText('peakValue', peak ? peak.risk.toFixed(1) + '%' : '0%');
    setText('resilienceValue', (SCORE_ENGINE.resilienceIndex || 0) + '%');

    setHTML('overallProgress', buildProgressBar(overall));
    setHTML('burnoutProgress', buildProgressBar(burnout));
    setHTML('peakProgress', peak ? buildProgressBar(peak.risk) : buildProgressBar(0));
    setHTML('resilienceProgress', buildResilienceProgressBar(SCORE_ENGINE.resilienceIndex || 0));

    setHTML('overallLevel', levelText(overall));
    setHTML('burnoutLevel', levelText(burnout));
    setHTML('peakLevel', peak ? levelText(peak.risk) : levelText(0));
    setHTML('resilienceLevel', resilienceLevelText(SCORE_ENGINE.resilienceIndex || 0));

    const peakTitle = document.getElementById('peakTitle');
    if (peakTitle) peakTitle.textContent = peak ? peak.title : '-';
}

function levelText(score) {
    if (score < 20) return "Bình thường 😌";
    if (score < 40) return "Áp lực nhẹ 🙂";
    if (score < 60) return "Stress trung bình 😐";
    if (score < 80) return "Stress cao 😟";
    return "Stress rất cao 😣";
}

function resilienceLevelText(score) {
    if (score >= 80) return "Rất tốt 💪";
    if (score >= 60) return "Khá tốt 👍";
    if (score >= 40) return "Trung bình 🤔";
    if (score >= 20) return "Cần cải thiện 😕";
    return "Đáng lo ngại 😟";
}

function buildProgressBar(score) {
    let color = "#27ae60";
    if (score >= 40 && score < 60) color = "#f39c12";
    if (score >= 60 && score < 80) color = "#e67e22";
    if (score >= 80) color = "#e74c3c";
    return `<div class="progress-container" style="background:#eef4fb;width:100%;height:8px;border-radius:4px;overflow:hidden;">
                <div class="progress-bar" style="width:${score}%;height:100%;background:${color};transition:width 0.5s ease;"></div>
            </div>`;
}

function buildResilienceProgressBar(score) {
    let color = "#e74c3c";
    if (score >= 40 && score < 60) color = "#e67e22";
    if (score >= 60 && score < 80) color = "#f39c12";
    if (score >= 80) color = "#27ae60";
    return `<div class="progress-container" style="background:#eef4fb;width:100%;height:8px;border-radius:4px;overflow:hidden;">
                <div class="progress-bar" style="width:${score}%;height:100%;background:${color};transition:width 0.5s ease;"></div>
            </div>`;
}

console.log('✅', 'report.js loaded');