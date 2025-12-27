const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.post("/render/short", async (req, res) => {
  const { content_id, title, snippet, article_link } = req.body;

  if (!content_id) {
    return res.status(400).json({
      error: "content_id is required",
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE content_items
      SET
        title = $1,
        snippet = $2,
        article_link = $3,
        status = 'PROCESSING',
        updated_at = NOW()
      WHERE content_id = $4
      RETURNING *;
      `,
      [
        title ?? null,
        snippet ?? null,
        article_link ?? null,
        content_id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "content_id not found",
        content_id,
      });
    }

    res.json({
      success: true,
      row: result.rows[0],
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
