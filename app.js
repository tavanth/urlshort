const readline = require("readline/promises");
const { read } = require("node:fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function collectURL() {
  try {
    const longUrl = await rl.question("Enter your long URL: ");
    if (!longUrl.startsWith("http")) {
      throw new Error("Invalid link, please try again");
    }
    const response = await fetch("http://localhost:3000/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl: longUrl }),
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
  rl.close();
}
collectURL();
