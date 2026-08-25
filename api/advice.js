// api/advice.js
export default async function handler(req, res) {
    // Chỉ cho phép POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('❌ GROQ_API_KEY not configured');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                // ✅ SỬA MODEL Ở ĐÂY
                model: 'llama-3.1-70b-versatile', // hoặc 'mixtral-8x7b-32768'
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Groq API error:', data);
            return res.status(response.status).json({
                error: data.error?.message || 'Groq API request failed'
            });
        }

        console.log('✅ Groq API success');
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Handler error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
