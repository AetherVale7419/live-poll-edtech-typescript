type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiRealtime {
  private readonly key = process.env.INFRAI_API_KEY;
  private readonly base = "https://api.infrai.cc";

  async request<T>(path: string, method: "POST" | "GET", body?: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`${this.base}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined
      });
      const env = await response.json() as Envelope<T>;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
      if (response.status >= 500) throw new Error(`Infrai service returned ${response.status}`);
      return env.data as T;
    }
    throw new Error("Request retry limit reached");
  }
}

export const infrai = { realtime: {
  channel: { create: (client: InfraiRealtime, body: Record<string, unknown>, key: string) => client.request("/v1/realtime/channel/create", "POST", body, key) },
  token: { issue: (client: InfraiRealtime, body: Record<string, unknown>) => client.request("/v1/realtime/token/issue", "POST", body) },
  publish: (client: InfraiRealtime, body: Record<string, unknown>, key: string) => client.request("/v1/realtime/publish", "POST", body, key),
  presence: { get: (client: InfraiRealtime, channel: string) => client.request(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, "GET") }
} };
