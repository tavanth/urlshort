const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool
  .connect()
  .then(() => console.log("connected to database"))
  .catch((err) => console.error("Connection Error", err.stack));
// Everything above is setting up the Postgres database connection^^

function generateShortUrl() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortUrl = "";
  for (let i = 0; i < 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return shortUrl;
}

app.post("/shorten", async (req, res) => {
  const longUrl = req.body.longUrl;
  if (!longUrl || !longUrl.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  try {
    let shortCode;
    let inserted = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      shortCode = generateShortUrl();
      try {
        await pool.query(
          "INSERT INTO url_mapping (long_url, short_code) VALUES ($1, $2) RETURNING *",
          [longUrl, shortCode],
        );
        inserted = true;
        break;
      } catch (err) {
        if (err.code !== "23505") throw err;
      }
    }
    if (!inserted) {
      return res.status(500).json({ error: "Failed to shorten URL" });
    }
    res.json({
      message: "URL shortened successfully",
      shortUrl: `${process.env.BASE_URL}${process.env.PORT}/${shortCode}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to shorten URL" });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const shortCode = req.params.code;
    const result = await pool.query(
      "SELECT long_url FROM url_mapping WHERE short_code = $1",
      [shortCode],
    );
    if (result.rows.length > 0) {
      res.redirect(result.rows[0].long_url);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
