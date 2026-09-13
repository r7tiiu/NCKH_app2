import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // ---------- LƯU KẾT QUẢ ----------
if (req.method === 'POST') {
    try {
        const {
            submissionId,
            overallStress,
            highestDomain,
            domains
        } = req.body || {};

        if (!submissionId || overallStress === undefined || !domains) {
            return res.status(400).json({
                error: 'Thiếu dữ liệu'
            });
        }

        // Kiểm tra submission này đã được lưu chưa
        const existingResults = await redis.lrange(
            'survey_results',
            0,
            -1
        );

        for (const item of existingResults) {
            const record =
                typeof item === 'string'
                    ? JSON.parse(item)
                    : item;

            if (record.submissionId === submissionId) {
                // Đã lưu rồi → không tạo bản ghi mới
                return res.status(200).json({
                    ok: true,
                    id: record.id,
                    duplicate: true
                });
            }
        }

        const record = {
            id: crypto.randomUUID(),
            submissionId,
            timestamp: new Date().toISOString(),
            overallStress: Number(overallStress),
            highestDomain: highestDomain || null,
            domains
        };

        await redis.lpush(
            'survey_results',
            JSON.stringify(record)
        );

        return res.status(200).json({
            ok: true,
            id: record.id,
            duplicate: false
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
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

    // ---------- XÓA KẾT QUẢ ----------
  if (req.method === 'DELETE') {
    try {
      const { password, id } = req.query;
      if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Sai mật khẩu' });
      }
      if (!id) {
        return res.status(400).json({ error: 'Thiếu ID' });
      }

      const raw = await redis.lrange('survey_results', 0, -1);
      const updated = raw.filter(item => {
        const record = typeof item === 'string' ? JSON.parse(item) : item;
        return record.id !== id;
      });

      await redis.del('survey_results');
      if (updated.length > 0) {
        await redis.lpush('survey_results', ...updated);
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
