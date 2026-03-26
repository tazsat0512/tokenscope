const { getClient } = require("../lib/proxy-client");

const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const client = getClient();

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
