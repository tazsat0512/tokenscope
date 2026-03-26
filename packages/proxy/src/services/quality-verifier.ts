/**
 * Quality Verifier v0 — logprob-based confidence scoring for routed requests.
 *
 * When a request is downgraded to a cheaper model, we inject `logprobs: true`
 * and assess the response's confidence.  If average token entropy exceeds a
 * threshold, the response is flagged for fallback to the original model.
 *
 * Limitations (v0):
 *   - OpenAI non-streaming only (logprobs not available for Anthropic/Google)
 *   - Fallback adds one extra round-trip (2× latency for that request)
 */

export interface QualityAssessment {
  /** 0-1, where 1 = maximum confidence */
  score: number;
  /** Mean logprob across all tokens (negative; closer to 0 = more confident) */
  meanLogprob: number;
  /** Mean per-token entropy (lower = more certain) */
  meanEntropy: number;
  /** Number of tokens assessed */
  tokenCount: number;
  /** Human-readable reason */
  reason: string;
  /** Whether the caller should retry with the original model */
  shouldFallback: boolean;
}

// Entropy threshold: above this, the model is "uncertain" and we should fallback.
// -1.0 mean logprob ≈ model is ~37% confident on average — a reasonable boundary.
const MEAN_LOGPROB_THRESHOLD = -1.0;

// Minimum tokens to make a judgement — too few tokens → skip verification
const MIN_TOKENS_FOR_ASSESSMENT = 5;

interface LogprobEntry {
  token: string;
  logprob: number;
  top_logprobs?: { token: string; logprob: number }[];
}

/**
 * Extract logprobs array from an OpenAI chat completion response.
 * Returns null if logprobs are not present.
 */
function extractLogprobs(parsedResponse: unknown): LogprobEntry[] | null {
  const res = parsedResponse as Record<string, unknown> | null;
  if (!res || typeof res !== 'object') return null;

  const choices = res.choices as Record<string, unknown>[] | undefined;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const choice = choices[0];
  // Non-streaming: logprobs is on choice directly
  const logprobs = choice.logprobs as Record<string, unknown> | undefined;
  if (!logprobs || typeof logprobs !== 'object') return null;

  const content = logprobs.content as LogprobEntry[] | undefined;
  if (!Array.isArray(content) || content.length === 0) return null;

  return content;
}

/**
 * Compute entropy from top_logprobs distribution for a single token.
 * H = -Σ p * log(p) where p = exp(logprob)
 */
function tokenEntropy(entry: LogprobEntry): number {
  if (!entry.top_logprobs || entry.top_logprobs.length === 0) {
    // No top_logprobs: use the single logprob as a rough estimate
    const p = Math.exp(entry.logprob);
    return p > 0 ? -p * Math.log(p) : 0;
  }

  let h = 0;
  for (const tp of entry.top_logprobs) {
    const p = Math.exp(tp.logprob);
    if (p > 0) {
      h -= p * Math.log(p);
    }
  }
  return h;
}

/**
 * Assess quality of a response based on logprobs.
 * Only meaningful for OpenAI non-streaming responses where logprobs: true was set.
 */
export function assessQuality(parsedResponse: unknown): QualityAssessment {
  const logprobs = extractLogprobs(parsedResponse);

  if (!logprobs || logprobs.length < MIN_TOKENS_FOR_ASSESSMENT) {
    return {
      score: 1,
      meanLogprob: 0,
      meanEntropy: 0,
      tokenCount: logprobs?.length ?? 0,
      reason: 'insufficient_tokens',
      shouldFallback: false,
    };
  }

  const sumLogprob = logprobs.reduce((acc, e) => acc + e.logprob, 0);
  const meanLogprob = sumLogprob / logprobs.length;

  const sumEntropy = logprobs.reduce((acc, e) => acc + tokenEntropy(e), 0);
  const meanEntropy = sumEntropy / logprobs.length;

  // Score: map mean logprob to 0-1 range
  // logprob 0 → score 1 (perfect), logprob -2 → score 0
  const score = Math.max(0, Math.min(1, 1 + meanLogprob / 2));

  const shouldFallback = meanLogprob < MEAN_LOGPROB_THRESHOLD;

  const reason = shouldFallback
    ? `low_confidence (mean_logprob=${meanLogprob.toFixed(3)})`
    : `confident (mean_logprob=${meanLogprob.toFixed(3)})`;

  return {
    score,
    meanLogprob,
    meanEntropy,
    tokenCount: logprobs.length,
    reason,
    shouldFallback,
  };
}

/**
 * Strip logprobs from response before returning to client.
 * We injected logprobs for internal quality checking — the client
 * didn't request them, so we remove them to avoid confusion.
 */
export function stripLogprobs(parsedResponse: unknown): unknown {
  const res = parsedResponse as Record<string, unknown> | null;
  if (!res || typeof res !== 'object') return parsedResponse;

  const choices = res.choices as Record<string, unknown>[] | undefined;
  if (!Array.isArray(choices)) return parsedResponse;

  const cleaned = {
    ...res,
    choices: choices.map((c) => {
      const { logprobs: _, ...rest } = c;
      return rest;
    }),
  };
  return cleaned;
}
