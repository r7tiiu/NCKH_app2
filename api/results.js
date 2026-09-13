import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // ---------- LƯU KẾT QUẢ ----------
  if (req.method === 'POST') {
    try {
      const { overallStress, highestDomain, domains } = req.body || {};

      if (overallStress === undefined || !domains) {
        return res.status(400).json({ error: 'Thiếu dữ liệu' });
      }

      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        overallStress: Number(overallStress),
        highestDomain: highestDomain || null,
        domains: domains // ví dụ: { "Công việc": 55, "Tài chính": 30, ... }
      };

      await redis.lpush('survey_results', JSON.stringify(record));
      return res.status(200).json({ ok: true, id: record.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------- ĐỌC KẾT QUẢ (cần mật khẩu) ----------
  if (req.method === 'GET') {
    const { password } = req.query;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Sai mật khẩu' });
    }

    const raw = await redis.lrange('survey_results', 0, -1);
    const results = raw.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
    return res.status(200).json({ results });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
