const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Reivo Monthly Report",
    "",
    "Full monthly cost analysis and savings breakdown is available at:",
    `  ${DASHBOARD_URL}`,
    "",
    "The dashboard shows:",
    "  - Cost per model, session, and agent",
    "  - Routing breakdown and savings percentage",
    "  - Budget usage and pace projection",
    "  - Quality score history",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Monthly cost and savings summary (via dashboard)" };
