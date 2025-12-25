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
// 렌더 요청 저장 (POST)
// ============================
app.post('/render/short', async (req, res) => {
  try {
    const payload = req.body;

    const result = await pool.query(
      `INSERT INTO render_jobs (payload, status)
       VALUES ($1, 'pending')
       RETURNING *`,
      [payload]
    );

    res.json({
      success: true,
      message: 'Short render job received',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('❌ INSERT ERROR:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// ============================
// 작업 목록 조회
// ============================
app.get('/jobs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM render_jobs ORDER BY created_at DESC'
    );
