/*
==================================================
StressCheck AI – survey.js (3 cặp, gộp C/I)
==================================================
*/

const LikertText = [
    "Hoàn toàn không",
    "Rất ít",
    "Thỉnh thoảng",
    "Khá nhiều",
    "Gần như luôn"
];

const SurveyEngine = {
    step: 'ranking',
    answers: {},
    ranking: [],
    currentPair: null,
    currentDomain: null,
    currentQuestionType: null,
    currentQuestionIndex: 0,
    pairStatus: {},
    totalQuestions: 0
};

// =============================================
// KẾT THÚC KHẢO SÁT (định nghĩa sớm)
// =============================================

function finishSurvey() {
    console.log('Kết thúc khảo sát. Số câu trả lời:', Object.keys(SurveyEngine.answers).length);
    
    const loadingPage = document.getElementById('loadingPage');
    if (loadingPage) loadingPage.classList.add('active');
    
    const surveyPage = document.getElementById('surveyPage');
    if (surveyPage) surveyPage.classList.remove('active');
    
    setTimeout(() => {
        calculateAllScores();
        if (typeof buildReport === 'function') {
            buildReport();
        } else {
            showResultsPage();
        }
    }, 500);
}

function showResultsPage() {
    const surveyPage = document.getElementById('surveyPage');
    const loadingPage = document.getElementById('loadingPage');
    const resultPage = document.getElementById('resultPage');
    
    if (surveyPage) surveyPage.classList.remove('active');
    if (loadingPage) loadingPage.classList.remove('active');
    if (resultPage) resultPage.classList.add('active');
    
    console.log('✅ Đã chuyển sang trang kết quả');
}

// =============================================
// HÀM LẤY CÂU HỎI
// =============================================

function getDomainsInPair(pairId) {
    return SURVEY.pairs[pairId].domains;
}

function getSQuestion(domainId) {
    // Luôn lấy câu S đầu tiên (index 0)
    return SURVEY.screening[domainId] ? SURVEY.screening[domainId][0] : null;
}

function getCQuestion(domainId) {
    return SURVEY.cause[domainId];
}

function getIQuestion(domainId) {
    return SURVEY.impact[domainId];
}

// =============================================
// KHỞI TẠO
// =============================================

function startSurvey() {
    SurveyEngine.step = 'ranking';
    SurveyEngine.answers = {};
    SurveyEngine.ranking = [];
    SurveyEngine.pairStatus = {};
    SurveyEngine.totalQuestions = 0;
    renderRanking();
}

// =============================================
// RENDER XẾP HẠNG KÉO THẢ
// =============================================

function renderRanking() {
    const box = document.getElementById('questionContainer');
    if (!box) {
        console.error('❌ questionContainer not found!');
        return;
    }

    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';

    const pairNames = {
        A: '📚 Học tập – Tương lai',
        B: '💪 Sức khỏe – Cảm xúc',
        C: '🏠 Gia đình – Quan hệ'
    };

    const defaultOrder = ['A', 'B', 'C'];

    let html = `
        <div class="question-card">
            <div class="question-title">🎯 Hãy sắp xếp các cặp lĩnh vực theo mức độ stress bạn cảm thấy</div>
            <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 20px;">
                👆 Kéo thả để sắp xếp từ <strong>cao nhất</strong> (trên cùng) xuống <strong>thấp nhất</strong> (dưới cùng)
            </p>
            <div class="ranking-drop-zone" id="rankingDropZone">
                ${defaultOrder.map((pairId, index) => `
                    <div class="ranking-item" draggable="true" data-pair="${pairId}">
                        <span class="rank-number">${index + 1}</span>
                        <span class="rank-label">${pairNames[pairId]}</span>
                        <span class="drag-handle">⠿</span>
                    </div>
                `).join('')}
            </div>
            <button id="confirmRankingBtn" class="primary" style="margin-top: 20px;">✅ Xác nhận</button>
        </div>
    `;

    box.innerHTML = html;

    const confirmBtn = document.getElementById('confirmRankingBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', submitRankingDrag);
    }

    setTimeout(initDragAndDrop, 50);
    updateProgress();
}

// =============================================
// DRAG & DROP
// =============================================

function initDragAndDrop() {
    const dropZone = document.getElementById('rankingDropZone');
    if (!dropZone) return;
    let draggedItem = null;

    dropZone.addEventListener('dragstart', function(e) {
        const item = e.target.closest('.ranking-item');
        if (!item) return;
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    });

    dropZone.addEventListener('dragend', function(e) {
        const item = e.target.closest('.ranking-item');
        if (item) item.classList.remove('dragging');
        document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
    });

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const target = e.target.closest('.ranking-item');
        if (target && target !== draggedItem) {
            document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
            target.classList.add('drag-over');
        }
    });

    dropZone.addEventListener('dragleave', function(e) {
        const target = e.target.closest('.ranking-item');
        if (target) target.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        const target = e.target.closest('.ranking-item');
        if (!target || !draggedItem || target === draggedItem) {
            document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
            return;
        }

        const items = Array.from(dropZone.querySelectorAll('.ranking-item'));
        const dragIndex = items.indexOf(draggedItem);
        const dropIndex = items.indexOf(target);
        if (dragIndex < dropIndex) {
            target.parentNode.insertBefore(draggedItem, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedItem, target);
        }
        updateRankNumbers();
        document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
        draggedItem = null;
    });

    // TOUCH SUPPORT
    let touchDraggedItem = null;
    let touchClone = null;
    let touchOffsetY = 0;
    dropZone.addEventListener('touchstart', function(e) {
        const item = e.target.closest('.ranking-item');
        if (!item) return;

        const touch = e.touches[0];
        touchDraggedItem = item;
        touchOffsetY = touch.clientY - item.getBoundingClientRect().top;
        touchClone = item.cloneNode(true);
        touchClone.id = 'touch-clone';
        touchClone.style.position = 'fixed';
        touchClone.style.width = item.offsetWidth + 'px';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.zIndex = '9999';
        touchClone.style.opacity = '0.85';
        touchClone.style.transform = 'scale(1.05)';
        touchClone.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
        touchClone.style.border = '2px solid #2563eb';
        touchClone.style.borderRadius = '14px';
        touchClone.style.background = window.getComputedStyle(item).background || 'white';
        document.body.appendChild(touchClone);
        item.classList.add('dragging');
    }, { passive: true });

    dropZone.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!touchDraggedItem || !touchClone) return;

        const touch = e.touches[0];
        touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
        touchClone.style.left = (touch.clientX - touchClone.offsetWidth / 2) + 'px';
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const target = elements.find(el => el.classList && el.classList.contains('ranking-item') && el !== touchDraggedItem);
        document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
        if (target) {
            target.classList.add('drag-over');
        }
    }, { passive: false });

    dropZone.addEventListener('touchend', function(e) {
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }

        if (!touchDraggedItem) {
            document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
            return;
        }

        const touch = e.changedTouches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const target = elements.find(el => el.classList && el.classList.contains('ranking-item') && el !== touchDraggedItem);

        if (target) {
            const items = Array.from(dropZone.querySelectorAll('.ranking-item'));
            const dragIndex = items.indexOf(touchDraggedItem);
            const dropIndex = items.indexOf(target);

            if (dragIndex < dropIndex) {
                target.parentNode.insertBefore(touchDraggedItem, target.nextSibling);
            } else {
                target.parentNode.insertBefore(touchDraggedItem, target);
            }
            updateRankNumbers();
        }
        touchDraggedItem.classList.remove('dragging');
        document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('drag-over'));
        touchDraggedItem = null;
    }, { passive: true });
}

function updateRankNumbers() {
    const items = document.querySelectorAll('.ranking-item');
    items.forEach((item, index) => {
        const numberSpan = item.querySelector('.rank-number');
        if (numberSpan) {
            numberSpan.textContent = index + 1;
        }
    });
}

// =============================================
// XÁC NHẬN XẾP HẠNG
// =============================================

window.submitRankingDrag = function() {
    console.log('✅ submitRankingDrag called!');
    
    const items = document.querySelectorAll('.ranking-item');
    if (!items || items.length === 0) {
        showInlineMessage('⚠️ Vui lòng sắp xếp các cặp trước khi xác nhận.');
        return;
    }

    const ranking = [];
    items.forEach(item => {
        ranking.push(item.dataset.pair);
    });

    if (ranking.length !== 3) {
        showInlineMessage('⚠️ Vui lòng sắp xếp đủ 3 cặp.');
        return;
    }

    const unique = new Set(ranking);
    if (unique.size !== 3) {
        showInlineMessage('⚠️ Có cặp bị trùng lặp, vui lòng sắp xếp lại.');
        return;
    }

    SurveyEngine.ranking = ranking;
    SurveyEngine.step = 'pair1_S';
    SurveyEngine.currentPair = ranking[0];
    SurveyEngine.currentDomainIndex = 0;
    SurveyEngine.totalQuestions += 1;

    renderPair1S();
    updateProgress();
};

// =============================================
// BƯỚC 2: S CỦA CẶP 1 (gộp 2 câu vào 1 trang)
// =============================================

function renderPair1S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const box = document.getElementById('questionContainer');
    
    let html = `
        <div class="question-card">
            <div class="question-title">Câu hỏi sàng lọc cho cặp ${SURVEY.pairs[SurveyEngine.currentPair].name}</div>
            ${domains.map(dom => {
                const q = getSQuestion(dom);
                return `
                    <div class="question-block" style="margin-top: 16px;">
                        <div class="question-title" style="font-size: 1rem;">${q.question}</div>
                        <div class="likert-options">
                            ${LikertText.map((text, idx) => `
                                <div class="option">
                                    <input type="radio" name="s_${dom}" id="s_${dom}_${idx}" value="${idx}">
                                    <label for="s_${dom}_${idx}">${text}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            <button onclick="savePair1S()" class="primary" style="margin-top: 16px;">Tiếp theo</button>
        </div>
    `;
    box.innerHTML = html;
    updateProgress();
}

function savePair1S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    let allSelected = true;
    
    domains.forEach(dom => {
        const selected = document.querySelector(`input[name="s_${dom}"]:checked`);
        if (!selected) {
            allSelected = false;
            return;
        }
        const val = parseInt(selected.value);
        SurveyEngine.answers[`${dom}_s1`] = val;
        const sScore = (val / 4) * 100;
        SurveyEngine.pairStatus[dom] = { S_score: sScore, triggered: false, CI_done: false };
    });

    if (!allSelected) {
        showInlineMessage('⚠️ Vui lòng chọn đáp án cho tất cả câu hỏi.');
        return;
    }

    checkPair1Threshold();
}

function checkPair1Threshold() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    let anyTriggered = false;
    domains.forEach(dom => {
        const status = SurveyEngine.pairStatus[dom];
        if (status && status.S_score >= SURVEY.threshold.S_trigger) {
            status.triggered = true;
            anyTriggered = true;
        }
    });
    if (anyTriggered) {
        SurveyEngine.step = 'pair1_CI';
        renderPair1CI();
    } else {
        SurveyEngine.currentPair = SurveyEngine.ranking[1];
        SurveyEngine.step = 'pair2_S';
        renderPair2S();
    }
}

// =============================================
// BƯỚC 3: C/I CỦA CẶP 1 (gộp C và I của 2 domain)
// =============================================

// =============================================
// BƯỚC 3: C/I CỦA CẶP 1 (gộp C và I của 2 domain)
// =============================================

function renderPair1CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    if (pendingDomains.length === 0) {
        SurveyEngine.currentPair = SurveyEngine.ranking[1];
        SurveyEngine.step = 'pair2_S';
        renderPair2S();
        return;
    }

    const box = document.getElementById('questionContainer');
    let html = `<div class="question-card">`;
    
    // === PHẦN C (Cause) cho tất cả domain pending ===
    pendingDomains.forEach(domain => {
        const cQ = getCQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${cQ.question}</div>
                <div class="checkbox-options">
                    ${cQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="c-checkbox" data-domain="${domain}" id="c_${domain}_${idx}" value="${opt}">
                            <label for="c_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // === PHẦN I (Impact) cho tất cả domain pending ===
    html += `<hr style="margin: 18px 0;">`;
    pendingDomains.forEach(domain => {
        const iQ = getIQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${iQ.question}</div>
                <div class="checkbox-options">
                    ${iQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="i-checkbox" data-domain="${domain}" id="i_${domain}_${idx}" value="${opt}">
                            <label for="i_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += `
        <button onclick="savePair1CI()" class="primary" style="margin-top: 18px;">Tiếp theo</button>
    </div>`;
    
    box.innerHTML = html;
    updateProgress();
}

function savePair1CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    pendingDomains.forEach(domain => {
        const cSelected = [];
        document.querySelectorAll(`.c-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) cSelected.push(cb.value);
        });
        
        const iSelected = [];
        document.querySelectorAll(`.i-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) iSelected.push(cb.value);
        });
        
        SurveyEngine.answers[`${domain}_c1`] = cSelected;
        SurveyEngine.answers[`${domain}_i1`] = iSelected;
        SurveyEngine.pairStatus[domain].CI_done = true;
    });
    
    renderPair1CI();
}

function savePair1CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    pendingDomains.forEach(domain => {
        // Lấy checkbox C của domain này
        const cSelected = [];
        document.querySelectorAll(`.c-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) cSelected.push(cb.value);
        });
        
        // Lấy checkbox I của domain này
        const iSelected = [];
        document.querySelectorAll(`.i-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) iSelected.push(cb.value);
        });
        
        SurveyEngine.answers[`${domain}_c1`] = cSelected;
        SurveyEngine.answers[`${domain}_i1`] = iSelected;
        SurveyEngine.pairStatus[domain].CI_done = true;
    });
    
    renderPair1CI();
}

// =============================================
// BƯỚC 4: S CỦA CẶP 2
// =============================================

function renderPair2S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const box = document.getElementById('questionContainer');
    
    let html = `
        <div class="question-card">
            <div class="question-title">Câu hỏi sàng lọc cho cặp ${SURVEY.pairs[SurveyEngine.currentPair].name}</div>
            ${domains.map(dom => {
                const q = getSQuestion(dom);
                return `
                    <div class="question-block" style="margin-top: 16px;">
                        <div class="question-title" style="font-size: 1rem;">${q.question}</div>
                        <div class="likert-options">
                            ${LikertText.map((text, idx) => `
                                <div class="option">
                                    <input type="radio" name="s_${dom}" id="s_${dom}_${idx}" value="${idx}">
                                    <label for="s_${dom}_${idx}">${text}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            <button onclick="savePair2S()" class="primary" style="margin-top: 16px;">Tiếp theo</button>
        </div>
    `;
    box.innerHTML = html;
    updateProgress();
}

function savePair2S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    let allSelected = true;
    
    domains.forEach(dom => {
        const selected = document.querySelector(`input[name="s_${dom}"]:checked`);
        if (!selected) {
            allSelected = false;
            return;
        }
        const val = parseInt(selected.value);
        SurveyEngine.answers[`${dom}_s2`] = val;
        const sScore = (val / 4) * 100;
        SurveyEngine.pairStatus[dom] = { S_score: sScore, triggered: false, CI_done: false };
    });

    if (!allSelected) {
        showInlineMessage('⚠️ Vui lòng chọn đáp án cho tất cả câu hỏi.');
        return;
    }

    let anyTriggered = false;
    domains.forEach(dom => {
        if (SurveyEngine.pairStatus[dom].S_score >= SURVEY.threshold.S_trigger_other) {
            SurveyEngine.pairStatus[dom].triggered = true;
            anyTriggered = true;
        }
    });

    if (anyTriggered) {
        SurveyEngine.step = 'pair2_CI';
        renderPair2CI();
    } else {
        SurveyEngine.currentPair = SurveyEngine.ranking[2];
        SurveyEngine.step = 'pair3_S';
        renderPair3S();
    }
}

// =============================================
// BƯỚC 4b: C/I CỦA CẶP 2 (gộp C và I của 2 domain)
// =============================================

function renderPair2CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    if (pendingDomains.length === 0) {
        SurveyEngine.currentPair = SurveyEngine.ranking[2];
        SurveyEngine.step = 'pair3_S';
        renderPair3S();
        return;
    }

    const box = document.getElementById('questionContainer');
    let html = `<div class="question-card">`;
    
    // === PHẦN C (Cause) cho tất cả domain pending ===
    pendingDomains.forEach(domain => {
        const cQ = getCQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${cQ.question}</div>
                <div class="checkbox-options">
                    ${cQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="c-checkbox" data-domain="${domain}" id="c_${domain}_${idx}" value="${opt}">
                            <label for="c_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // === PHẦN I (Impact) cho tất cả domain pending ===
    html += `<hr style="margin: 18px 0;">`;
    pendingDomains.forEach(domain => {
        const iQ = getIQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${iQ.question}</div>
                <div class="checkbox-options">
                    ${iQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="i-checkbox" data-domain="${domain}" id="i_${domain}_${idx}" value="${opt}">
                            <label for="i_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += `
        <button onclick="savePair2CI()" class="primary" style="margin-top: 18px;">Tiếp theo</button>
    </div>`;
    
    box.innerHTML = html;
    updateProgress();
}

function savePair2CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    pendingDomains.forEach(domain => {
        const cSelected = [];
        document.querySelectorAll(`.c-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) cSelected.push(cb.value);
        });
        
        const iSelected = [];
        document.querySelectorAll(`.i-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) iSelected.push(cb.value);
        });
        
        SurveyEngine.answers[`${domain}_c2`] = cSelected;
        SurveyEngine.answers[`${domain}_i2`] = iSelected;
        SurveyEngine.pairStatus[domain].CI_done = true;
    });
    
    renderPair2CI();
}

// =============================================
// BƯỚC 5: S CỦA CẶP 3
// =============================================

function renderPair3S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const box = document.getElementById('questionContainer');
    
    let html = `
        <div class="question-card">
            <div class="question-title">Câu hỏi sàng lọc cho cặp ${SURVEY.pairs[SurveyEngine.currentPair].name}</div>
            ${domains.map(dom => {
                const q = getSQuestion(dom);
                return `
                    <div class="question-block" style="margin-top: 16px;">
                        <div class="question-title" style="font-size: 1rem;">${q.question}</div>
                        <div class="likert-options">
                            ${LikertText.map((text, idx) => `
                                <div class="option">
                                    <input type="radio" name="s_${dom}" id="s_${dom}_${idx}" value="${idx}">
                                    <label for="s_${dom}_${idx}">${text}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            <button onclick="savePair3S()" class="primary" style="margin-top: 16px;">Tiếp theo</button>
        </div>
    `;
    box.innerHTML = html;
    updateProgress();
}

function savePair3S() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    let allSelected = true;
    
    domains.forEach(dom => {
        const selected = document.querySelector(`input[name="s_${dom}"]:checked`);
        if (!selected) {
            allSelected = false;
            return;
        }
        const val = parseInt(selected.value);
        SurveyEngine.answers[`${dom}_s3`] = val;
        const sScore = (val / 4) * 100;
        SurveyEngine.pairStatus[dom] = { S_score: sScore, triggered: false, CI_done: false };
    });

    if (!allSelected) {
        showInlineMessage('⚠️ Vui lòng chọn đáp án cho tất cả câu hỏi.');
        return;
    }

    let anyTriggered = false;
    domains.forEach(dom => {
        if (SurveyEngine.pairStatus[dom].S_score >= SURVEY.threshold.S_trigger_other) {
            SurveyEngine.pairStatus[dom].triggered = true;
            anyTriggered = true;
        }
    });

    if (anyTriggered) {
        SurveyEngine.step = 'pair3_CI';
        renderPair3CI();
    } else {
        finishSurvey();
    }
}

// =============================================
// BƯỚC 5b: C/I CỦA CẶP 3 (gộp C và I của 2 domain)
// =============================================

function renderPair3CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    if (pendingDomains.length === 0) {
        finishSurvey();
        return;
    }

    const box = document.getElementById('questionContainer');
    let html = `<div class="question-card">`;
    
    // === PHẦN C (Cause) cho tất cả domain pending ===
    pendingDomains.forEach(domain => {
        const cQ = getCQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${cQ.question}</div>
                <div class="checkbox-options">
                    ${cQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="c-checkbox" data-domain="${domain}" id="c_${domain}_${idx}" value="${opt}">
                            <label for="c_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // === PHẦN I (Impact) cho tất cả domain pending ===
    html += `<hr style="margin: 18px 0;">`;
    pendingDomains.forEach(domain => {
        const iQ = getIQuestion(domain);
        html += `
            <div class="question-block" style="margin-top: 16px;">
                <div class="question-title" style="font-size: 1rem; font-weight: 600;">${iQ.question}</div>
                <div class="checkbox-options">
                    ${iQ.options.map((opt, idx) => `
                        <div class="option">
                            <input type="checkbox" class="i-checkbox" data-domain="${domain}" id="i_${domain}_${idx}" value="${opt}">
                            <label for="i_${domain}_${idx}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += `
        <button onclick="savePair3CI()" class="primary" style="margin-top: 18px;">Tiếp theo</button>
    </div>`;
    
    box.innerHTML = html;
    updateProgress();
}

function savePair3CI() {
    const domains = getDomainsInPair(SurveyEngine.currentPair);
    const pendingDomains = domains.filter(d => 
        SurveyEngine.pairStatus[d].triggered && !SurveyEngine.pairStatus[d].CI_done
    );
    
    pendingDomains.forEach(domain => {
        const cSelected = [];
        document.querySelectorAll(`.c-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) cSelected.push(cb.value);
        });
        
        const iSelected = [];
        document.querySelectorAll(`.i-checkbox[data-domain="${domain}"]`).forEach(cb => {
            if (cb.checked) iSelected.push(cb.value);
        });
        
        SurveyEngine.answers[`${domain}_c3`] = cSelected;
        SurveyEngine.answers[`${domain}_i3`] = iSelected;
        SurveyEngine.pairStatus[domain].CI_done = true;
    });
    
    renderPair3CI();
}
//update progress bar
function updateProgress() {
    const answered = Object.keys(SurveyEngine.answers).length;
    
    // Đếm tổng số câu hỏi sẽ được hỏi dựa trên trạng thái
    let total = 0;
    
    // 1 câu xếp hạng
    total += 1;
    
    // Cặp 1: 2 câu S
    total += 2;
    
    // Cặp 1 C/I (nếu trigger)
    const pair1Domains = getDomainsInPair(SurveyEngine.ranking[0] || 'A');
    let pair1Triggered = false;
    pair1Domains.forEach(dom => {
        if (SurveyEngine.pairStatus[dom] && SurveyEngine.pairStatus[dom].triggered) {
            pair1Triggered = true;
        }
    });
    if (pair1Triggered) total += 2;
    
    // Cặp 2: 2 câu S
    total += 2;
    
    // Cặp 2 C/I (nếu trigger)
    const pair2Domains = getDomainsInPair(SurveyEngine.ranking[1] || 'B');
    let pair2Triggered = false;
    pair2Domains.forEach(dom => {
        if (SurveyEngine.pairStatus[dom] && SurveyEngine.pairStatus[dom].triggered) {
            pair2Triggered = true;
        }
    });
    if (pair2Triggered) total += 2;
    
    // Cặp 3: 2 câu S
    total += 2;
    
    // Cặp 3 C/I (nếu trigger)
    const pair3Domains = getDomainsInPair(SurveyEngine.ranking[2] || 'C');
    let pair3Triggered = false;
    pair3Domains.forEach(dom => {
        if (SurveyEngine.pairStatus[dom] && SurveyEngine.pairStatus[dom].triggered) {
            pair3Triggered = true;
        }
    });
    if (pair3Triggered) total += 2;
    
    const percent = Math.min(100, Math.round((answered / total) * 100));
    
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    if (bar) bar.style.width = percent + '%';
    if (text) text.innerText = 'Tiến độ: ' + percent + '%';
    
    // Lưu để tham chiếu
    SurveyEngine.totalQuestions = total;
}

// =============================================
// THÔNG BÁO LỖI
// =============================================

function showInlineMessage(msg) {
    const old = document.querySelector('.inline-error-message');
    if (old) old.remove();
    const card = document.querySelector('.question-card');
    if (!card) return;
    const div = document.createElement('div');
    div.className = 'inline-error-message';
    div.innerText = msg;
    card.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// =============================================
// SỰ KIỆN DOM
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            const welcomePage = document.getElementById('welcomePage');
            const surveyPage = document.getElementById('surveyPage');
            if (welcomePage) welcomePage.classList.remove('active');
            if (surveyPage) surveyPage.classList.add('active');
            startSurvey();
        });
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            console.log('Back button clicked');
        });
    }
});

console.log('✅ survey.js loaded (gộp C/I, S1 cố định)');