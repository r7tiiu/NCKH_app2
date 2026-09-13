/* Các hàm tiện ích dùng chung */
const utils = {
    normalize: (total, max) => max === 0 ? 0 : (total / max) * 100,
    round: (val, decimals = 0) => Number(Math.round(val + 'e' + decimals) + 'e-' + decimals),
    
    // Tạo màu sắc dựa trên mức độ stress (phục vụ biểu đồ)
    getColorByScore: (score) => {
        if (score < 40) return "#27ae60"; // Thấp - Xanh lá
        if (score < 70) return "#f39c12"; // Trung bình - Vàng/Cam
        return "#e74c3c"; // Cao - Đỏ
    }
};