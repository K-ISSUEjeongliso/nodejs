const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * ✅ 안정적인 렌더 엔드포인트
 * - content_id가 있으면 UPDATE
 * - 없으면 INSERT
 * - n8n 재시도 / 중복 호출 안전
 */
app.post("/render/short", async (req, res) => {
  const {
    content_id,
    title = null,
    snippet = null,
    article_link = null,
  } = req.body;

  if (!content_id) {
    return res.status(400).json({ error: "content_id is required" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO content_items (
        content_id,
        title,
        snippet,
        article_link,
        status,
        updated_at
      )
      VALUES ($1, $2, $3, $4, 'PROCESSING', NOW())
      ON CONFLICT (content_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        snippet = EXCLUDED.snippet,
        article_link = EXCLUDED.article_link,
        status = 'PROCESSING',
        updated_at = NOW()
      RETURNING *;
      `,
      [content_id, title, snippet, article_link]
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
  console.log("Server ru
