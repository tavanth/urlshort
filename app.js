require("dotenv").config();
const readline = require("readline/promises");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function collectURL() {
  try {
    const longUrl = await rl.question("Enter your long URL: ");
    const url = new URL(longUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid link, please try again");
    }
    const response = await fetch(`${process.env.BASE_URL}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl: longUrl }),
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error.message);
  }
  rl.close();
}
collectURL();
