const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Budget Settings",
    "",
    "To set or change your monthly budget cap, visit your dashboard:",
    `  ${DASHBOARD_URL}/settings`,
    "",
    "Budget features:",
    "  - Monthly spending cap in USD",
    "  - Pace control (warns when spending exceeds projection)",
    "  - Alerts at 50%, 80%, and 100% of budget",
    "  - Auto-block requests when limit is reached",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Set monthly budget cap (via dashboard)" };
