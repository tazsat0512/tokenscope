'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

// Representative models with actual pricing ($/M tokens) and their routing targets
const MODELS = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    input: 2.5,
    output: 10.0,
    routeTo: 'GPT-4o-mini',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    provider: 'OpenAI',
    input: 2.0,
    output: 8.0,
    routeTo: 'GPT-4.1-mini',
    routeInput: 0.4,
    routeOutput: 1.6,
  },
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet 4',
    provider: 'Anthropic',
    input: 3.0,
    output: 15.0,
    routeTo: 'Claude Haiku',
    routeInput: 0.8,
    routeOutput: 4.0,
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus 4',
    provider: 'Anthropic',
    input: 15.0,
    output: 75.0,
    routeTo: 'Claude Sonnet',
    routeInput: 3.0,
    routeOutput: 15.0,
  },
  {
    id: 'o3',
    label: 'o3',
    provider: 'OpenAI',
    input: 10.0,
    output: 40.0,
    routeTo: 'o3-mini',
    routeInput: 1.1,
    routeOutput: 4.4,
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    input: 1.25,
    output: 10.0,
    routeTo: 'Gemini 2.5 Flash',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'OpenAI',
    input: 10.0,
    output: 30.0,
    routeTo: 'GPT-4o-mini',
    routeInput: 0.15,
    routeOutput: 0.6,
  },
] as const;

// Use cases with different routing rates
const USE_CASES = [
  {
    id: 'chatbot',
    label: 'Customer Support / Chatbot',
    routeRate: 0.75,
    inputRatio: 0.25,
    outputRatio: 0.75,
    description: 'FAQ, simple Q&A — most requests are routine',
  },
  {
    id: 'rag',
    label: 'RAG / Document Q&A',
    routeRate: 0.6,
    inputRatio: 0.6,
    outputRatio: 0.4,
    description: 'Retrieval-heavy, long context input',
  },
  {
    id: 'coding',
    label: 'Coding Agent',
    routeRate: 0.45,
    inputRatio: 0.35,
    outputRatio: 0.65,
    description: 'Code generation and review — moderate complexity mix',
  },
  {
    id: 'content',
    label: 'Content Generation',
    routeRate: 0.55,
    inputRatio: 0.2,
    outputRatio: 0.8,
    description: 'Blog posts, summaries, translations',
  },
  {
    id: 'data',
    label: 'Data Extraction / Classification',
    routeRate: 0.8,
    inputRatio: 0.7,
    outputRatio: 0.3,
    description: 'Structured output — highly routable to smaller models',
  },
  {
    id: 'agent',
    label: 'Autonomous Agent (Multi-step)',
    routeRate: 0.35,
    inputRatio: 0.4,
    outputRatio: 0.6,
    description: 'Complex reasoning chains — fewer downgrade opportunities',
  },
  {
    id: 'mixed',
    label: 'Mixed / General',
    routeRate: 0.55,
    inputRatio: 0.3,
    outputRatio: 0.7,
    description: 'Variety of tasks across the board',
  },
] as const;

type UseCaseId = (typeof USE_CASES)[number]['id'];

function computeSavings(monthlySpend: number, selectedModels: string[], useCaseId: UseCaseId) {
  if (selectedModels.length === 0) return { savings: 0, percent: 0, breakdown: [] };

  const useCase = USE_CASES.find((u) => u.id === useCaseId)!;
  const perModel = monthlySpend / selectedModels.length;

  const breakdown = selectedModels.map((id) => {
    const m = MODELS.find((x) => x.id === id)!;
    const originalCostPerM = m.input * useCase.inputRatio + m.output * useCase.outputRatio;
    const routedCostPerM = m.routeInput * useCase.inputRatio + m.routeOutput * useCase.outputRatio;

    const afterRouting =
      perModel * (1 - useCase.routeRate) +
      perModel * useCase.routeRate * (routedCostPerM / originalCostPerM);
    const saved = perModel - afterRouting;

    return {
      model: m.label,
      routeTo: m.routeTo,
      spend: perModel,
      afterRouting,
      saved,
      percent: perModel > 0 ? Math.round((saved / perModel) * 100) : 0,
    };
  });

  const totalSavings = breakdown.reduce((sum, b) => sum + b.saved, 0);
  const totalPercent = monthlySpend > 0 ? Math.round((totalSavings / monthlySpend) * 100) : 0;

  return { savings: totalSavings, percent: totalPercent, breakdown };
}

export function SavingsCalculator() {
  const [spend, setSpend] = useState(500);
  const [selected, setSelected] = useState<string[]>(['gpt-4o', 'claude-sonnet']);
  const [useCase, setUseCase] = useState<UseCaseId>('mixed');

  const toggleModel = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const { savings, percent, breakdown } = useMemo(
    () => computeSavings(spend, selected, useCase),
    [spend, selected, useCase],
  );

  const activeUseCase = USE_CASES.find((u) => u.id === useCase)!;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-8">
      <h3 className="text-center text-2xl font-bold">How much would you save?</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Select your use case, models, and monthly spend
      </p>

      <div className="mx-auto mt-8 max-w-2xl">
        {/* Use case selector */}
        <div>
          <p className="text-sm font-medium">Primary use case</p>
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value as UseCaseId)}
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {USE_CASES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeUseCase.description} &mdash; ~{Math.round(activeUseCase.routeRate * 100)}% of
            requests routable
          </p>
        </div>

        {/* Model selector */}
        <div className="mt-6">
          <p className="text-sm font-medium">Models you use</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModel(m.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected.includes(m.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {m.label}
                <span className="ml-1 opacity-60">({m.provider})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spend slider */}
        <div className="mt-6">
          <p className="text-sm font-medium">Monthly API spend</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-lg font-bold text-muted-foreground">$</span>
            <input
              type="range"
              min={50}
              max={10000}
              step={50}
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <span className="min-w-[80px] text-right text-xl font-bold">
              ${spend.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[100, 500, 1000, 3000, 5000, 10000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSpend(p)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  spend === p
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {selected.length > 0 ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Monthly Savings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ${Math.round(savings).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Yearly Savings</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  ${Math.round(savings * 12).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-green-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Cost Reduction</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{percent}%</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              {breakdown.map((b) => (
                <div
                  key={b.model}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.model}</span>
                    <span className="text-muted-foreground">&rarr;</span>
                    <span className="text-green-600">{b.routeTo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      ${Math.round(b.spend)}&rarr;${Math.round(b.afterRouting)}
                    </span>
                    <span className="font-semibold text-green-600">-{b.percent}%</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Routing rate ({Math.round(activeUseCase.routeRate * 100)}%) and token split (
              {Math.round(activeUseCase.inputRatio * 100)}/
              {Math.round(activeUseCase.outputRatio * 100)} in/out) are estimated for{' '}
              {activeUseCase.label.toLowerCase()} workloads. Actual savings depend on your specific
              tasks.
            </p>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Select at least one model above to see your estimated savings.
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/sign-up"
            className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start saving now &mdash; Free
          </Link>
        </div>
      </div>
    </div>
  );
}
