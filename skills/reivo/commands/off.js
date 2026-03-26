const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Disable Routing",
    "",
    "To disable smart routing, visit your dashboard:",
    `  ${DASHBOARD_URL}/settings`,
    "",
    "When routing is off, all requests pass through to the",
    "original provider without model switching.",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Disable smart routing (via dashboard)" };
