/*
==================================================
StressCheck - QUESTIONS DATA (Optimized v3.1)
==================================================
*/

const SURVEY = [
    {
        id: "study",
        title: "Áp lực học tập",
        weight: 0.1624,
        screening: [
            {
                id: "study_s1",
                type: "likert",
                question: "Trong 2 tuần gần đây, bạn có thường cảm thấy việc học quá tải không?"
            },
            {
                id: "study_s2",
                type: "likert",
                question: "Bạn có cảm thấy việc học khiến mình luôn mệt mỏi hoặc căng thẳng không?"
            }
        ],
        causes: [
            {
                id: "study_c1",
                type: "checkbox",
                question: "Điều gì khiến bạn áp lực nhất khi học?",
                options: [
                    "Quá nhiều bài tập", "Không hiểu bài", "Thiếu thời gian", "Học thêm nhiều",
                    "Điểm số", "So sánh với bạn bè", "Kỳ vọng của bản thân", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "study_i1",
                type: "checkbox",
                question: "Áp lực học tập ảnh hưởng như thế nào đến bạn?",
                options: [
                    "Chán nản, muốn bỏ học", "Mất ngủ", "Đau đầu, đau dạ dày",
                    "Xa lánh mọi người", "Hay cáu gắt", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "study_f1",
                type: "range",
                question: "Tần suất bạn cảm thấy mất động lực học tập là bao nhiêu?"
            }
        ]
    },
    {
        id: "exam",
        title: "Áp lực thi cử",
        weight: 0.1558,
        screening: [
            {
                id: "exam_s1",
                type: "likert",
                question: "Bạn có cảm thấy lo lắng tột độ trước mỗi kỳ thi không?"
            },
            {
                id: "exam_s2",
                type: "likert",
                question: "Kết quả thi cử có phải là nỗi ám ảnh lớn đối với bạn không?"
            }
        ],
        causes: [
            {
                id: "exam_c1",
                type: "checkbox",
                question: "Nguyên nhân chính dẫn đến áp lực thi cử của bạn là gì?",
                options: [
                    "Sợ điểm kém", "Sợ trượt tốt nghiệp/đại học", "Kỳ vọng từ gia đình",
                    "Áp lực thành tích trường lớp", "Chưa chuẩn bị đủ kiến thức", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "exam_i1",
                type: "checkbox",
                question: "Trước hoặc trong kỳ thi, bạn thường gặp phải tình trạng nào?",
                options: [
                    "Học dồn quên ăn quên ngủ", "Đau đầu, buồn nôn khi vào phòng thi",
                    "Bị rối loạn tiêu hóa", "Hoảng loạn, mất bình tĩnh", "Khóc lóc, stress nặng", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "exam_f1",
                type: "range",
                question: "Tần suất bạn gặp ác mộng hoặc mất ngủ liên quan đến thi cử?"
            }
        ]
    },
    {
        id: "family",
        title: "Áp lực gia đình",
        weight: 0.1429,
        screening: [
            {
                id: "family_s1",
                type: "likert",
                question: "Bạn có cảm thấy không khí gia đình ngột ngạt hoặc căng thẳng không?"
            },
            {
                id: "family_s2",
                type: "likert",
                question: "Bạn có cảm thấy gia đình không hiểu và không ủng hộ mình không?"
            }
        ],
        causes: [
            {
                id: "family_c1",
                type: "checkbox",
                question: "Vấn đề nào trong gia đình khiến bạn mệt mỏi nhất?",
                options: [
                    "Bố mẹ hay cãi vã", "Bố mẹ quá nghiêm khắc, kiểm soát", "Bị so sánh với 'con nhà người ta'",
                    "Kỳ vọng quá lớn về tương lai", "Thiếu thốn tình cảm, ít được quan tâm", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "family_i1",
                type: "checkbox",
                question: "Áp lực từ gia đình khiến bạn có xu hướng làm gì?",
                options: [
                    "Không muốn về nhà", "Cô lập bản thân trong phòng", "Cãi lại bố mẹ",
                    "Tổn thương tâm lý sâu sắc", "Tìm người lạ để tâm sự", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "family_f1",
                type: "range",
                question: "Tần suất xảy ra xung đột hoặc bất đồng ý kiến giữa bạn và bố mẹ?"
            }
        ]
    },
    {
        id: "peer",
        title: "Áp lực đồng lứa",
        weight: 0.1104,
        screening: [
            {
                id: "peer_s1",
                type: "likert",
                question: "Bạn có thường cảm thấy mình thua kém, tụt hậu so với bạn bè xung quanh không?"
            },
            {
                id: "peer_s2",
                type: "likert",
                question: "Bạn có thường cảm thấy mình nổ lực trong vô ích không?"
            }
        ],
        causes: [
            {
                id: "peer_c1",
                type: "checkbox",
                question: "Khía cạnh nào từ bạn bè làm bạn áp lực nhất?",
                options: [
                    "Bạn bè giỏi giang, đạt nhiều giải thưởng", "Bạn bè có điều kiện kinh tế tốt hơn",
                    "Bị bạn bè cô lập, tẩy chay", "Áp lực phải bắt chước theo nhóm (Peer pressure)", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "peer_i1",
                type: "checkbox",
                question: "Áp lực đồng lứa ảnh hưởng thế nào đến lối sống của bạn?",
                options: [
                    "Cố gắng quá sức dẫn đến kiệt sức", "Tự ti, ngại giao tiếp xã hội",
                    "Ghen tị, oán trách bản thân", "Chi tiêu lãng phí để bằng bạn bằng bè", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "peer_f1",
                type: "range",
                question: "Tần suất bạn so sánh bản thân với người khác khi lướt mạng xã hội?"
            }
        ]
    },
    {
        id: "sleep",
        title: "Rối loạn giấc ngủ",
        weight: 0.1364,
        screening: [
            {
                id: "sleep_s1",
                type: "likert",
                question: "Bạn có thường gặp khó khăn trong việc đi vào giấc ngủ không?"
            },
            {
                id: "sleep_s2",
                type: "likert",
                question: "Bạn có hay bị giật mình tỉnh giấc giữa đêm và khó ngủ lại không?"
            }
        ],
        causes: [
            {
                id: "sleep_c1",
                type: "checkbox",
                question: "Lý do chính khiến bạn mất ngủ hoặc ngủ không ngon giấc?",
                options: [
                    "Suy nghĩ, lo lắng vẩn vơ (Overthinking)", "Sử dụng điện thoại/máy tính sát giờ ngủ",
                    "Uống trà, cà phê muộn", "Tiếng ồn hoặc không gian phòng ngủ không thoải mái", "Lịch học dày đặc phải thức khuya", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "sleep_i1",
                type: "checkbox",
                question: "Việc thiếu ngủ gây ra những hậu quả gì cho bạn vào ngày hôm sau?",
                options: [
                    "Buồn ngủ gật, ngủ gà ngủ gật trên lớp", "Mất tập trung, suy giảm trí nhớ",
                    "Cơ thể uể oải, không có năng lượng", "Dễ nổi cáu, tâm trạng thất thường", "Đau phờ phạc đầu tóc", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "sleep_f1",
                type: "range",
                question: "Tần suất bạn ngủ ít hơn 5 tiếng một ngày trong tuần vừa qua?"
            }
        ]
    },
    {
        id: "emotion",
        title: "Bất ổn cảm xúc",
        weight: 0.1429,
        screening: [
            {
                id: "emotion_s1",
                type: "likert",
                question: "Tâm trạng của bạn có hay bị thay đổi thất thường không lý do không?"
            },
            {
                id: "emotion_s2",
                type: "likert",
                question: "Bạn có hay cảm thấy trống rỗng, vô vọng hoặc buồn bã không?"
            }
        ],
        causes: [
            {
                id: "emotion_c1",
                type: "checkbox",
                question: "Yếu tố nào tác động mạnh nhất đến cảm xúc tiêu cực của bạn?",
                options: [
                    "Gặp chuyện không vui trong tình cảm, bạn bè", "Bị chỉ trích, phê bình",
                    "Do áp lực tích tụ từ nhiều phía", "Thay đổi nội tiết tố", "Không có lý do cụ thể, tự nhiên buồn", "Khác"
                ]
            }
        ],
        impact: [
            {
                id: "emotion_i1",
                type: "checkbox",
                question: "Khi cảm xúc bất ổn, bạn thường có biểu hiện gì?",
                options: [
                    "Khóc", "Dễ cáu", "Overthinking", "Mất động lực", "Không muốn giao tiếp", "Mệt mỏi", "Không ảnh hưởng nhiều"
                ]
            }
        ],
        frequency: [
            {
                id: "emotion_f1",
                type: "range",
                question: "Tần suất bạn cảm thấy không kiểm soát được cơn giận hoặc nỗi buồn?"
            }
        ]
    },

    {
        id: "resilience",
        title: "Khả năng phục hồi",
        weight: 0, // Không dùng weight vì không ảnh hưởng stress tổng
        screening: [
            {
                id: "res_s1",
                type: "likert",
                question: "Tôi có ít nhất một người (bạn bè, gia đình) sẵn sàng lắng nghe và hỗ trợ tôi khi tôi gặp khó khăn."
            },
            {
                id: "res_s2",
                type: "likert",
                question: "Tôi thường xuyên tham gia các hoạt động giải trí, thể thao hoặc sở thích cá nhân để thư giãn."
            },
            {
                id: "res_s3",
                type: "likert",
                question: "Khi đối mặt với vấn đề, tôi thường giữ bình tĩnh và tìm cách giải quyết thay vì bỏ cuộc."
            },
            {
                id: "res_s4",
                type: "likert",
                question: "Tôi cảm thấy lạc quan và tin tưởng vào tương lai của mình."
            }
        ],
        causes: [],
        impact: []
    }
];

/*=========================================================
UTILITY FUNCTIONS
=========================================================*/

function getGroup(id) {
    return SURVEY.find(g => g.id === id) || null;
}

function getQuestion(questionId) {
    for (const group of SURVEY) {
        const sections = [group.screening, group.causes, group.impact, group.frequency].filter(Boolean);
        for (const list of sections) {
            const q = list.find(item => item.id === questionId);
            if (q) return q;
        }
    }
    return null;
}

function getWeight(groupId) {
    const group = getGroup(groupId);
    return group ? group.weight : 0;
}

function normalize(value, max) {
    if (max === 0) return 0;
    return Number(((value / max) * 100).toFixed(2));
}