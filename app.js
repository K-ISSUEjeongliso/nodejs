const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 모든 요청 로그
app.use((req, res, next) => {
  console.log('➡️ INCOMING REQUEST');
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  next();
});

// ✅ Postgres Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

// 1️⃣ 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// 2️⃣ n8n → 숏폼 렌더 트리거 (받자마자 DB에 저장)
app.post('/render/short', async (req, res) => {
  try {
    const body = req.body || {};
    const content_id = body.content_id || body.contentId || body.id || null;

    // meta에 원본 payload 통째로 저장
    const insertSql = `
      INSERT INTO render_jobs (content_id, status, provider, meta)
      VALUES ($1, 'PENDING', 'n8n', $2::jsonb)
      RETURNING *
    `;
    const { rows } = await pool.query(insertSql, [content_id, JSON.stringify(body)]);

    return res.json({
      success: true,
      message: 'Queued',
      job: rows[0],
    });
  } catch (err) {
    console.error('❌ INSERT ERROR:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3️⃣ 대기중인 작업 1건 조회 (worker용)
app.get('/jobs/next', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM render_jobs
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (rows.length === 0) return res.json({ message: 'No pending jobs' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('❌ JOB FETCH ERROR:', err);
    return res.status(500).json({ error: 'DB error' });
  }
});

// 4️⃣ 상태 업데이트
app.post('/jobs/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  try {
    await pool.query(`UPDATE render_jobs SET status = $1, updated_at = NOW() WHERE id = $2`, [
      status,
      id,
    ]);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ UPDATE ERROR:', err);
    return res.status(500).json({ error: 'update failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
