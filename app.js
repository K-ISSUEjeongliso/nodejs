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
// 헬스 체크
// ============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'short-render-engine' });
});

// ============================
// 렌더 요청 저장
// ============================
app.post('/render/short', async (req, res) => {
  try {
    const { title = 'untitled' } = req.body;

    const result = await pool.query(
      `INSERT INTO render_jobs (title, status)
       VALUES ($1, 'pending')
       RETURNING *`,
      [title]
    );

    res.json({
      success: true,
      job: result.rows[0],
    });
  } catch (err) {
    console.error('DB ERROR:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// ============================
// 서버 시작
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
