import type { AlertPayload, AlertType } from '@tokenscope/shared';

export async function sendSlackNotification(
  webhookUrl: string,
  alert: AlertPayload,
): Promise<void> {
  const blocks = buildSlackBlocks(alert);

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });
}

function buildSlackBlocks(alert: AlertPayload) {
  const emoji = alertEmoji(alert.type);
  const _color = alertColor(alert.type);
  const title = alertTitle(alert.type);

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} ${title}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: alert.message,
      },
    },
    {
      type: 'section',
      fields: Object.entries(alert.details).map(([key, value]) => ({
        type: 'mrkdwn',
        text: `*${key}:*\n${value}`,
      })),
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `TokenScope Alert • ${new Date(alert.timestamp).toISOString()}`,
        },
      ],
    },
  ];
}

function alertEmoji(type: AlertType): string {
  switch (type) {
    case 'budget_warning':
      return '⚠️';
    case 'budget_exceeded':
      return '🚫';
    case 'loop_detected':
      return '🔄';
    case 'anomaly_detected':
      return '📈';
  }
}

function alertColor(type: AlertType): string {
  switch (type) {
    case 'budget_warning':
      return '#f0ad4e';
    case 'budget_exceeded':
      return '#d9534f';
    case 'loop_detected':
      return '#5bc0de';
    case 'anomaly_detected':
      return '#f0ad4e';
  }
}

function alertTitle(type: AlertType): string {
  switch (type) {
    case 'budget_warning':
      return 'Budget Warning';
    case 'budget_exceeded':
      return 'Budget Exceeded';
    case 'loop_detected':
      return 'Loop Detected';
    case 'anomaly_detected':
      return 'Anomaly Detected';
  }
}
