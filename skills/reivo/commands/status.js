const { ProxyClient } = require("../lib/proxy-client");

const DASHBOARD_URL = "https://app.reivo.dev";

function getApiKey() {
  const key = process.env.REIVO_API_KEY;
  if (!key) {
    throw new Error(
      "REIVO_API_KEY is not set. Get your key at https://reivo.dev/settings and set it as an environment variable."
    );
  }
  return key;
}

async function execute() {
  const client = new ProxyClient(getApiKey());

  let healthStatus;
  try {
    healthStatus = await client.checkHealth();
  } catch (err) {
    return `Reivo proxy is unreachable: ${err.message}`;
  }

  const lines = [
    "Reivo Status",
    `├── Proxy: connected (${client.baseUrl})`,
    `├── API Key: set (REIVO_API_KEY)`,
    `├── Health: ${healthStatus.status || "ok"}`,
    `└── Dashboard: ${DASHBOARD_URL}`,
    "",
    "View detailed stats, routing decisions, and cost breakdowns at:",
    `  ${DASHBOARD_URL}`,
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Check proxy connectivity and show dashboard link" };
