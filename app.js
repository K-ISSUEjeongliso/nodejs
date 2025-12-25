const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// PostgreSQL 연결
// ============================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ============================
// 미들웨어
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('➡️ INCOMING REQUEST');
  console.log('METHOD:', req.method);
  console.log('PATH:', req.path);
  next();
});

// ============================
// 1️⃣ 헬스 체크
// ============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// ============================
// 2️⃣ 렌더 요청 수신 (n8n → 서버)
// ============================
app.post('/render/short', async (req, res) => {
  try {
    console.log('🔥 RENDER REQUEST RECEIVED');
    console.log(req.body);

    const result = await pool.query(
      `
      INSERT INTO render_jobs (
        content_id,
        status,
        provider
      )
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [
        `job_${Date.now()}`,
        'PENDING',
        'n8n'
      ]
    );

    res.json({
      success: true,
      job: result.rows[0],
    });

  } catch (err) {
    console.error('❌ INSERT ERROR:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// ============================
// 3️⃣ 작업 하나 가져오기 (워커용)
// ============================
app.get('/jobs/next', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM render_jobs
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.json({ message: 'No pending jobs' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ FETCH ERROR:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ============================
// 서버 시작
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
