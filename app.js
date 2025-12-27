app.post("/render/short", async (req, res) => {
  const {
    title,
    snippet,
    article_link,
    source = "api"
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO content_items
      (source, article_link, title, snippet, status)
      VALUES ($1, $2, $3, $4, 'PROCESSING')
      RETURNING *;
      `,
      [source, article_link, title, snippet]
    );

    res.json({
      success: true,
      row: result.rows[0]
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
