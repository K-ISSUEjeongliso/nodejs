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

app.post("/render/short", async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO content_items
        (content_id, source, article_link, title, snippet)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [
        "auto_" + Date.now(),     
        "api",
        "https://example.com",
        title || "no title",
        "auto insert"
      ]
    );

    res.json({ success: true, row: result.rows[0] });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
