/* Cấu hình chung cho hệ thống StressCheck */
const CONFIG = {
    VERSION: "3.2",
    APP_VERSION: "1.0.0",
    STORAGE_KEY: "stresscheck_results",
    CRITICAL_THRESHOLD: 70,
    MAX_SCORE_PER_QUESTION: 4,
    screeningThreshold: 40,   // Ngưỡng % để đào sâu
    loadingDelay: 1500
};

const LIKERT_LABELS = [
    "Hoàn toàn không đúng",
    "Không đúng",
    "Đúng một phần",
    "Đúng",
    "Hoàn toàn đúng"
];
