const readline = require("readline/promises");
const { read } = require("node:fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function collectURL() {
  const longUrl = await rl.question("Enter your long URL: ");
  const response = await fetch("http://localhost:3000/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ longUrl: longUrl }),
  });
  const data = await response.json();
  console.log(data);
  rl.close();
}
collectURL();
// Check if link starts with http (if it does then pass the test, if not do not)
// WIP
//  Error Handling & Validating
