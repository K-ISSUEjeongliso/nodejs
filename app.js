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

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 콘텐츠 생성 API (ID는 서버에서 자동 생성)
app.post("/render/short", async (req, res) => {
  const { title, snippet } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO content_items
        (content_id, source, article_link, title, snippet)
      VALUES
        (
          'auto_' || extract(epoch from now())::bigint,
          'api',
          'https://example.com',
          $1,
          $2
        )
      RETURNING *;
      `,
      [
        title || 'no title',
        snippet || 'auto insert'
      ]
    );

    res.json({
      success: true,
      row: result.rows[0],
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
