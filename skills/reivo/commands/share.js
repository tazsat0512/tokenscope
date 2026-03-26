const DASHBOARD_URL = "https://app.reivo.dev";

async function execute() {
  const lines = [
    "Share Report",
    "",
    "View and share your cost savings report at:",
    `  ${DASHBOARD_URL}`,
    "",
    "You can share your dashboard link with teammates to show",
    "real-time cost tracking and savings breakdown.",
  ];

  return lines.join("\n");
}

module.exports = { execute, description: "Generate a link to your dashboard" };
