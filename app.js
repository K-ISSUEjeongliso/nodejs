const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL 연결
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());

// 🔹 서버 시작 시 테이블 자동 생성
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS render_jobs (
        id SERIAL PRIMARY KEY,
        content_id TEXT,
        title TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table ready");
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
})();

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 데이터 저장 API
app.post("/render/short", async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO render_jobs (title) VALUES ($1) RETURNING *",
      [title]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("DB INSERT ERROR:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
