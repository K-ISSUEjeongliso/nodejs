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
  console.log('🔥 RENDER REQUEST RECEIVED');
  console.log(req.body);

  res.json({
    success: true,
    message: 'Short render job received',
    receivedAt: new Date().toISOString(),
  });
});

// ============================
// 3️⃣ 대기중인 작업 1건 조회 (worker용)
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
    console.error('❌ JOB FETCH ERROR:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// ============================
// 4️⃣ 상태 업데이트 (작업 완료/실패)
// ============================
app.post('/jobs/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await pool.query(
      `UPDATE render_jobs SET status = $1 WHERE id = $2`,
      [status, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ UPDATE ERROR:', err);
    res.status(500).json({ error: 'update failed' });
  }
});

// ============================
// 서버 시작
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
