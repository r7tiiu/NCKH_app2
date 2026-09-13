/*
==================================================
StressCheck – charts.js
Radar Chart – hiển thị % kế bên tên
==================================================
*/

let radarChart = null;

function createRadarData() {
    SCORE_ENGINE.radarLabels = [];
    SCORE_ENGINE.radarValues = [];
    (SCORE_ENGINE.rank || []).forEach(item => {
        // Tạo label: Tên lĩnh vực (Giá trị%)
        SCORE_ENGINE.radarLabels.push(`${item.title} (${item.risk.toFixed(0)}%)`);
        SCORE_ENGINE.radarValues.push(Number(item.risk.toFixed(1)));
    });
}

function renderRadarChart() {
    const ctx = document.getElementById("radarChart");
    if (!ctx) return;

    if (radarChart) radarChart.destroy();

    const isDark = document.body.classList.contains("dark");
    const isMobile = window.innerWidth <= 576;

    // Màu sắc theo theme
    const radarBorderColor = isDark ? "#7fb7ff" : "#2563eb";
    const radarBackgroundColor = isDark ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.15)";
    const radarPointBackground = isDark ? "#dbeafe" : "#2563eb";
    const radarGridColor = isDark ? "rgba(147,197,253,0.15)" : "rgba(37,99,235,0.1)";
    const radarLabelColor = isDark ? "#e6eef8" : "#1f2937";
    const radarTickColor = isDark ? "#94a3b8" : "#64748b";

    const pointRadius = isMobile ? 4 : 6;
    const pointHoverRadius = isMobile ? 6 : 8;
    const labelFontSize = isMobile ? 10 : 13;
    const tickFontSize = isMobile ? 8 : 11;

    radarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: SCORE_ENGINE.radarLabels, // đã có sẵn %
            datasets: [{
                label: "Mức stress",
                data: SCORE_ENGINE.radarValues,
                fill: true,
                borderWidth: 2.5,
                backgroundColor: radarBackgroundColor,
                borderColor: radarBorderColor,
                pointBackgroundColor: radarPointBackground,
                pointBorderColor: radarBorderColor,
                pointRadius: pointRadius,
                pointHoverRadius: pointHoverRadius,
                pointStyle: 'circle',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !isMobile,
                    labels: {
                        color: radarLabelColor,
                        font: { size: isMobile ? 10 : 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Stress: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        color: radarTickColor,
                        font: { size: tickFontSize },
                        backdropColor: 'transparent',
                    },
                    grid: {
                        color: radarGridColor,
                        circular: true,
                    },
                    angleLines: {
                        color: radarGridColor,
                    },
                    pointLabels: {
                        color: radarLabelColor,
                        font: { 
                            size: labelFontSize,
                            weight: 'bold',
                        },
                        padding: isMobile ? 6 : 10,
                        // Nếu muốn thêm hiệu ứng, không cần callback vì label đã có sẵn
                    }
                }
            },
            animation: {
                duration: 700,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function renderCharts() {
    renderRadarChart();
}