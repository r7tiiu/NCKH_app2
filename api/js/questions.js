/*
==================================================
StressCheck AI – QUESTIONS (3 cặp, tối đa 13 câu)
==================================================
*/

const SURVEY = {
    domains: {
        study: { id: 'study', title: 'Học tập', pair: 'A' },
        exam: { id: 'exam', title: 'Tương lai', pair: 'A' },
        sleep: { id: 'sleep', title: 'Sức khỏe', pair: 'B' },
        emotion: { id: 'emotion', title: 'Cảm xúc', pair: 'B' },
        family: { id: 'family', title: 'Gia đình', pair: 'C' },
        social: { id: 'social', title: 'Quan hệ', pair: 'C' }
    },

    screening: {
        study: [
            { id: 'study_s1', question: 'Bạn có thường cảm thấy việc học quá tải không?' },
            { id: 'study_s2', question: 'Bạn có cảm thấy việc học khiến mình luôn mệt mỏi không?' }
        ],
        exam: [
            { id: 'exam_s1', question: 'Bạn có lo lắng tột độ trước mỗi kỳ thi không?' },
            { id: 'exam_s2', question: 'Kết quả thi cử có là nỗi ám ảnh lớn với bạn không?' }
        ],
        sleep: [
            { id: 'sleep_s1', question: 'Bạn có thường gặp khó khăn trong việc đi vào giấc ngủ không?' },
            { id: 'sleep_s2', question: 'Bạn có hay bị giật mình tỉnh giấc giữa đêm không?' }
        ],
        emotion: [
            { id: 'emotion_s1', question: 'Tâm trạng của bạn có hay thay đổi thất thường không?' },
            { id: 'emotion_s2', question: 'Bạn có hay cảm thấy trống rỗng hoặc buồn bã không?' }
        ],
        family: [
            { id: 'family_s1', question: 'Bạn có cảm thấy không khí gia đình ngột ngạt không?' },
            { id: 'family_s2', question: 'Bạn có cảm thấy gia đình không hiểu mình không?' }
        ],
        social: [
            { id: 'social_s1', question: 'Bạn có thường cảm thấy mình thua kém bạn bè không?' },
            { id: 'social_s2', question: 'Bạn có thường cảm thấy bị cô lập trong các mối quan hệ không?' }
        ]
    },

    // === CAUSE - rút gọn (3-4 lựa chọn) ===
    cause: {
        study: { 
            id: 'study_c1', 
            question: 'Điều gì khiến bạn áp lực nhất khi học?', 
            options: ['Quá nhiều bài tập', 'Không hiểu bài', 'Điểm số', 'So sánh với bạn bè'] 
        },
        exam: { 
            id: 'exam_c1', 
            question: 'Nguyên nhân chính dẫn đến áp lực thi cử của bạn?', 
            options: ['Sợ điểm kém', 'Sợ trượt', 'Kỳ vọng gia đình', 'Chưa chuẩn bị đủ'] 
        },
        sleep: { 
            id: 'sleep_c1', 
            question: 'Lý do chính khiến bạn mất ngủ?', 
            options: ['Suy nghĩ nhiều', 'Dùng điện thoại trước ngủ', 'Lịch học dày', 'Tiếng ồn'] 
        },
        emotion: { 
            id: 'emotion_c1', 
            question: 'Yếu tố nào tác động mạnh nhất đến cảm xúc tiêu cực của bạn?', 
            options: ['Áp lực tích tụ', 'Bị chỉ trích', 'Tình cảm/bạn bè', 'Tự nhiên buồn'] 
        },
        family: { 
            id: 'family_c1', 
            question: 'Vấn đề nào trong gia đình khiến bạn mệt mỏi nhất?', 
            options: ['Bố mẹ cãi vã', 'Bố mẹ nghiêm khắc', 'Bị so sánh', 'Kỳ vọng quá lớn'] 
        },
        social: { 
            id: 'social_c1', 
            question: 'Khía cạnh nào từ bạn bè làm bạn áp lực nhất?', 
            options: ['Bạn giỏi giang', 'Bị cô lập', 'Peer pressure'] 
        }
    },

    // === IMPACT - rút gọn (3-4 lựa chọn) ===
    impact: {
        study: { 
            id: 'study_i1', 
            question: 'Áp lực học tập ảnh hưởng thế nào đến bạn?', 
            options: ['Chán nản, muốn bỏ học', 'Mất ngủ', 'Đau đầu, đau dạ dày', 'Hay cáu gắt'] 
        },
        exam: { 
            id: 'exam_i1', 
            question: 'Trước hoặc trong kỳ thi, bạn thường gặp tình trạng nào?', 
            options: ['Học dồn quên ăn', 'Đau đầu, buồn nôn', 'Hoảng loạn', 'Khóc lóc'] 
        },
        sleep: { 
            id: 'sleep_i1', 
            question: 'Việc thiếu ngủ gây hậu quả gì cho bạn?', 
            options: ['Buồn ngủ trên lớp', 'Mất tập trung', 'Uể oải', 'Dễ cáu gắt'] 
        },
        emotion: { 
            id: 'emotion_i1', 
            question: 'Khi cảm xúc bất ổn, bạn thường có biểu hiện gì?', 
            options: ['Khóc', 'Dễ cáu', 'Mất động lực', 'Overthinking'] 
        },
        family: { 
            id: 'family_i1', 
            question: 'Áp lực từ gia đình khiến bạn có xu hướng làm gì?', 
            options: ['Không muốn về nhà', 'Cô lập bản thân', 'Cãi lại bố mẹ', 'Tổn thương tâm lý'] 
        },
        social: { 
            id: 'social_i1', 
            question: 'Áp lực đồng lứa ảnh hưởng thế nào đến bạn?', 
            options: ['Cố gắng quá sức', 'Tự ti', 'Ghen tị'] 
        }
    },

    // Cặp
    pairs: {
        A: { name: 'Học tập – Tương lai', domains: ['study', 'exam'] },
        B: { name: 'Sức khỏe – Cảm xúc', domains: ['sleep', 'emotion'] },
        C: { name: 'Gia đình – Quan hệ', domains: ['family', 'social'] }
    },

    threshold: {
        S_trigger: 40,
        S_trigger_other: 50
    }
};