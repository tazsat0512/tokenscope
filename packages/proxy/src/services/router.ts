import type { ProviderName } from '@reivo/shared';
import type { UserRecord } from '../types/index.js';

export interface RoutingDecision {
  originalModel: string;
  routedModel: string;
  reason: string;
  signals?: ComplexitySignals;
}

/**
 * Model downgrade mapping by provider.
 * Only models listed here are eligible for downgrade.
 */
const MODEL_DOWNGRADE_MAP: Record<string, Record<string, string>> = {
  openai: {
    'gpt-4o': 'gpt-4o-mini',
    'gpt-4-turbo': 'gpt-4o-mini',
    o3: 'o3-mini',
  },
  anthropic: {
    'claude-sonnet-4-20250514': 'claude-haiku-4-5-20251001',
    'claude-opus-4-20250514': 'claude-sonnet-4-20250514',
  },
  google: {
    'gemini-2.5-pro': 'gemini-2.5-flash',
  },
};

export interface ComplexitySignals {
  hasTools: boolean;
  hasJsonSchema: boolean;
  longConversation: boolean;
  shortOutput: boolean;
  lowTemperature: boolean;
  longSystemPrompt: boolean;
}

function analyzeComplexity(parsedBody: unknown): ComplexitySignals {
  const body = parsedBody as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return {
      hasTools: false,
      hasJsonSchema: false,
      longConversation: false,
      shortOutput: false,
      lowTemperature: true,
      longSystemPrompt: false,
    };
  }

  // tools or tool_choice present -> complex
  const hasTools =
    (Array.isArray(body.tools) && body.tools.length > 0) || body.tool_choice !== undefined;

  // response_format with json_schema -> complex
  const responseFormat = body.response_format as Record<string, unknown> | undefined;
  const hasJsonSchema =
    responseFormat !== undefined &&
    typeof responseFormat === 'object' &&
    responseFormat !== null &&
    (responseFormat.type === 'json_schema' || responseFormat.json_schema !== undefined);

  // messages array length > 10 -> complex (deep conversation)
  const messages = body.messages as unknown[] | undefined;
  const longConversation = Array.isArray(messages) && messages.length > 10;

  // max_tokens < 100 -> can downgrade (short output = likely simple)
  const maxTokens = (body.max_tokens ?? body.max_completion_tokens) as number | undefined;
  const shortOutput = typeof maxTokens === 'number' && maxTokens < 100;

  // temperature < 0.3 or not set -> can downgrade (factual = likely simple)
  const temperature = body.temperature as number | undefined;
  const lowTemperature =
    temperature === undefined || (typeof temperature === 'number' && temperature < 0.3);

  // system prompt > 2000 chars -> complex
  let systemPromptLength = 0;
  if (typeof body.system === 'string') {
    // Anthropic-style top-level system
    systemPromptLength = body.system.length;
  } else if (Array.isArray(messages)) {
    // OpenAI/Google-style system message in messages array
    for (const msg of messages) {
      const m = msg as Record<string, unknown>;
      if (m.role === 'system' && typeof m.content === 'string') {
        systemPromptLength += m.content.length;
      }
    }
  }
  const longSystemPrompt = systemPromptLength > 2000;

  return {
    hasTools,
    hasJsonSchema,
    longConversation,
    shortOutput,
    lowTemperature,
    longSystemPrompt,
  };
}

/**
 * Determines whether the given model should be downgraded based on the
 * request body signals.  Pure JSON analysis -- adds 0ms latency.
 *
 * @param routingMode Controls how aggressively the router downgrades:
 *   - 'conservative' (default): only downgrade when strongly confident
 *   - 'aggressive': downgrade unless complexity signals say otherwise
 *   - 'auto': alias for conservative
 *   - 'off': never downgrade
 */
function shouldDowngrade(
  signals: ComplexitySignals,
  mode: 'auto' | 'conservative' | 'aggressive' | 'off',
): { downgrade: boolean; reason: string } {
  // Hard blocks: any of these means keep full model regardless of mode
  if (signals.hasTools) return { downgrade: false, reason: 'tools_present' };
  if (signals.hasJsonSchema) return { downgrade: false, reason: 'json_schema_response' };
  if (signals.longConversation) return { downgrade: false, reason: 'long_conversation' };
  if (signals.longSystemPrompt) return { downgrade: false, reason: 'long_system_prompt' };

  if (mode === 'aggressive') {
    // Aggressive: downgrade unless blocked above
    return { downgrade: true, reason: 'aggressive_mode' };
  }

  // Conservative / auto: need positive signals for simplicity
  if (signals.shortOutput && signals.lowTemperature) {
    return { downgrade: true, reason: 'short_output_low_temp' };
  }
  if (signals.shortOutput) {
    return { downgrade: true, reason: 'short_output' };
  }
  if (signals.lowTemperature) {
    return { downgrade: true, reason: 'low_temperature' };
  }

  return { downgrade: false, reason: 'no_simplicity_signals' };
}

/**
 * Smart Router v0 -- rule-based model downgrade router.
 *
 * Analyzes the request body and returns a routing decision.
 * If the user has routing disabled or the model is not in the downgrade map,
 * the original model is returned unchanged.
 */
export function routeModel(
  parsedBody: unknown,
  provider: ProviderName,
  model: string,
  user: UserRecord,
  forceAggressive?: boolean,
): RoutingDecision {
  const passthrough: RoutingDecision = {
    originalModel: model,
    routedModel: model,
    reason: 'passthrough',
  };

  // When budget-driven downgrade is active, force aggressive routing even if
  // the user hasn't explicitly enabled routing.
  if (forceAggressive) {
    const providerMap = MODEL_DOWNGRADE_MAP[provider];
    if (!providerMap) return passthrough;
    const downgradeTarget = providerMap[model];
    if (!downgradeTarget) return { ...passthrough, reason: 'model_not_in_map' };

    const signals = analyzeComplexity(parsedBody);
    const { downgrade, reason } = shouldDowngrade(signals, 'aggressive');
    if (downgrade) {
      return {
        originalModel: model,
        routedModel: downgradeTarget,
        reason: `budget_${reason}`,
        signals,
      };
    }
    return { originalModel: model, routedModel: model, reason, signals };
  }

  // Check if routing is enabled for this user
  if (!user.routingEnabled) return passthrough;

  const mode = user.routingMode ?? 'auto';
  if (mode === 'off') return passthrough;

  // Check if model has a downgrade target
  const providerMap = MODEL_DOWNGRADE_MAP[provider];
  if (!providerMap) return passthrough;

  const downgradeTarget = providerMap[model];
  if (!downgradeTarget) return { ...passthrough, reason: 'model_not_in_map' };

  // Analyze complexity signals
  const signals = analyzeComplexity(parsedBody);
  const { downgrade, reason } = shouldDowngrade(signals, mode === 'auto' ? 'conservative' : mode);

  if (downgrade) {
    return { originalModel: model, routedModel: downgradeTarget, reason, signals };
  }

  return { originalModel: model, routedModel: model, reason, signals };
}
