const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Routing Mode",
    "",
    "To change routing mode, visit your dashboard:",
    `  ${DASHBOARD_URL}/settings`,
    "",
    "Available modes:",
    "  auto         — balance cost and quality (default)",
    "  conservative — prefer quality, save less",
    "  aggressive   — maximize savings",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Set routing mode (via dashboard)" };
