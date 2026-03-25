export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizePrompt(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d{10,}/g, '<TIMESTAMP>')
    .trim();
}

export async function hashPrompt(body: unknown): Promise<string> {
  const messages = extractMessages(body);
  const normalized = normalizePrompt(messages);
  return sha256(normalized);
}

function extractMessages(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const b = body as Record<string, unknown>;

  if (Array.isArray(b.messages)) {
    return b.messages
      .map((m: Record<string, unknown>) => {
        if (typeof m.content === 'string') return m.content;
        if (Array.isArray(m.content)) {
          return m.content
            .filter((p: Record<string, unknown>) => p.type === 'text' && typeof p.text === 'string')
            .map((p: Record<string, unknown>) => p.text)
            .join(' ');
        }
        return '';
      })
      .join('\n');
  }

  // Google format
  if (Array.isArray(b.contents)) {
    return b.contents
      .map((c: Record<string, unknown>) => {
        if (Array.isArray(c.parts)) {
          return c.parts
            .map((p: Record<string, unknown>) => (typeof p.text === 'string' ? p.text : ''))
            .join(' ');
        }
        return '';
      })
      .join('\n');
  }

  return JSON.stringify(body);
}
