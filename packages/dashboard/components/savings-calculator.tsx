'use client';

import Link from 'next/link';
import { useState } from 'react';

const PRESETS = [100, 500, 1000, 3000, 5000, 10000];

export function SavingsCalculator() {
  const [spend, setSpend] = useState(500);
  const savingsRate = 0.5; // 50% average
  const monthlySavings = spend * savingsRate;
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-8">
      <h3 className="text-center text-2xl font-bold">How much would you save?</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter your current monthly AI API spend
      </p>

      <div className="mx-auto mt-8 max-w-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-muted-foreground">$</span>
          <input
            type="range"
            min={50}
            max={10000}
            step={50}
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <span className="min-w-[80px] text-right text-2xl font-bold">
            ${spend.toLocaleString()}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSpend(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                spend === p
                  ? 'bg-primary text-primary-foreground'
                  : 'border bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              ${p.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-green-500/5 p-5 text-center">
            <p className="text-sm text-muted-foreground">Monthly Savings</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              ${monthlySavings.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">per month</p>
          </div>
          <div className="rounded-lg border bg-green-500/5 p-5 text-center">
            <p className="text-sm text-muted-foreground">Yearly Savings</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              ${yearlySavings.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">per year</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Based on 40-60% average cost reduction via Smart Routing. Actual savings vary by model mix
          and task complexity.
        </p>

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
