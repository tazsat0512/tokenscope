const readline = require("readline");

const PROXY_BASE = "https://proxy.reivo.dev";

function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function validateKey(apiKey) {
  const res = await fetch(`${PROXY_BASE}/health`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Validation failed: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Reivo Setup\n");

    const apiKey = await prompt(rl, "Enter your Reivo API key (rv_...): ");

    if (!apiKey.startsWith("rv_")) {
      console.error("Error: API key must start with rv_");
      process.exit(1);
    }

    console.log("Validating key...");
    try {
      await validateKey(apiKey);
      console.log("Key validated.\n");
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }

    console.log("Set the following environment variable to use Reivo:\n");
    console.log(`  export REIVO_API_KEY="${apiKey}"\n`);
    console.log("Add it to your shell profile (~/.zshrc, ~/.bashrc, etc.) to persist it.");
    console.log('Then run "/reivo status" to confirm.');
  } finally {
    rl.close();
  }
}

main();
