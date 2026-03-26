const BASE_URL = "https://proxy.reivo.dev";

class ProxyClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async checkHealth() {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: this._headers(),
    });
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  }
}

function getClient() {
  const apiKey = process.env.REIVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "REIVO_API_KEY is not set. Get your key at https://reivo.dev/settings and set it as an environment variable."
    );
  }
  return new ProxyClient(apiKey);
}

module.exports = { ProxyClient, getClient };
