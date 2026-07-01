const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool
  .query("SELECT 1")
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

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

app.post("/shorten", limiter, async (req, res) => {
  const longUrl = req.body.longUrl;
  try {
    const url = new URL(longUrl);
    if (!isValidUrl(longUrl)) {
      return res.status(400).json({ error: "Invalid URL" });
    }
  } catch {
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
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to shorten URL" });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const shortCode = req.params.code;
    if (!/^[A-Za-z0-9]{6}$/.test(shortCode)) {
      return res.status(404).json({ error: "URL not found" });
    }
    const result = await pool.query(
      "SELECT long_url FROM url_mapping WHERE short_code = $1",
      [shortCode],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    const longUrl = result.rows[0].longUrl;
    if (!isValidUrl(longUrl)) {
      return res.status(500).json({ error: "Stored URL is not valid " });
    }
    res.redirect(longUrl);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
