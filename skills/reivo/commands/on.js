const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Smart Routing",
    "",
    "To enable or configure smart routing, visit your dashboard:",
    `  ${DASHBOARD_URL}/settings`,
    "",
    "Routing modes:",
    "  auto         — balance cost and quality",
    "  conservative — prefer quality, save less",
    "  aggressive   — maximize savings",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Enable smart routing (via dashboard)" };
