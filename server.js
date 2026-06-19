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
  const shortCode = generateShortUrl();
  await pool.query(
    "INSERT INTO url_mapping (long_url, short_code) VALUES ($1, $2) RETURNING *",
    [longUrl, shortCode],
  );
  res.json({
    message: "URL shortened successfully",
    shortURl: `http://localhost:3000/${shortCode}`,
  });
});

app.get("/:code", async (req, res) => {
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
});

app.listen(3000, () => {
  console.log("Server running");
});
