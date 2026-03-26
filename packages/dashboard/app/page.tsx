import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SavingsCalculator } from '../components/savings-calculator';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Image
              src="/logo-light.png"
              alt="Reivo"
              width={400}
              height={100}
              className="h-7 w-auto dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="Reivo"
              width={400}
              height={100}
              className="hidden h-7 w-auto dark:block"
              priority
            />
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">
              How It Works
            </a>
            <a href="#openclaw" className="text-muted-foreground hover:text-foreground">
              OpenClaw Skill
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                Same output.
                <br />
                <span className="text-primary">Half the cost.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Reivo routes every API call to the cheapest model that delivers the same quality.
                One line change. Savings start immediately. Budget protection and loop detection
                included &mdash; free.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="rounded-md bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start Free &mdash; No Credit Card
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-md border px-6 py-3 text-center text-sm font-medium hover:bg-accent"
                >
                  See how it works &darr;
                </a>
              </div>
            </div>
            {/* Dashboard Preview */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
                <div className="border-b bg-muted/50 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="ml-3 text-xs text-muted-foreground">Reivo Dashboard</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {/* Mock KPI cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md border bg-background p-3">
                      <p className="text-[10px] text-muted-foreground">Saved (30d)</p>
                      <p className="text-lg font-bold text-green-600">$247.80</p>
                    </div>
                    <div className="rounded-md border bg-background p-3">
                      <p className="text-[10px] text-muted-foreground">Total Cost</p>
                      <p className="text-lg font-bold">$182.40</p>
                    </div>
                    <div className="rounded-md border bg-background p-3">
                      <p className="text-[10px] text-muted-foreground">Budget</p>
                      <p className="text-lg font-bold text-primary">42%</p>
                    </div>
                  </div>
                  {/* Mock chart */}
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">Cost Trend</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 35, 55, 45, 30, 25, 38, 28, 22, 20, 18, 15].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-primary/60"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[8px] text-muted-foreground">
                      <span>Mar 1</span>
                      <span>Mar 15</span>
                      <span>Mar 27</span>
                    </div>
                  </div>
                  {/* Mock routing row */}
                  <div className="rounded-md border bg-background p-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        gpt-4o
                      </span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="rounded bg-green-500/10 px-1.5 py-0.5 font-mono text-[10px] text-green-600">
                        gpt-4o-mini
                      </span>
                      <span className="ml-auto text-[10px] text-green-600 font-medium">
                        -87% cost
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="border-t border-b bg-muted/20 py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-5">
            <div>
              <p className="text-3xl font-bold text-primary">40-60%</p>
              <p className="mt-1 text-sm text-muted-foreground">avg cost reduction</p>
            </div>
            <div>
              <p className="text-3xl font-bold">97%+</p>
              <p className="mt-1 text-sm text-muted-foreground">quality maintained</p>
            </div>
            <div>
              <p className="text-3xl font-bold">&lt;30ms</p>
              <p className="mt-1 text-sm text-muted-foreground">latency added</p>
            </div>
            <div>
              <p className="text-3xl font-bold">60s</p>
              <p className="mt-1 text-sm text-muted-foreground">to integrate</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-3xl font-bold">32+</p>
              <p className="mt-1 text-sm text-muted-foreground">models supported</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">
              One line change. Savings start immediately.
            </h2>
            <p className="mt-4 text-center text-muted-foreground">
              Replace your provider&apos;s base URL with Reivo&apos;s proxy. That&apos;s it.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  1
                </div>
                <h3 className="mt-4 font-semibold">Sign up & get API key</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create an account and generate your{' '}
                  <code className="rounded bg-muted px-1">rv_</code> API key in Settings.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  2
                </div>
                <h3 className="mt-4 font-semibold">Change your base URL</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Point your SDK to the Reivo proxy. Your code works exactly the same.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  3
                </div>
                <h3 className="mt-4 font-semibold">Save automatically</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reivo analyzes each request and routes it to the optimal model. Your dashboard
                  shows exactly how much you saved.
                </p>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border bg-card">
              <div className="border-b px-4 py-2 text-sm font-medium text-muted-foreground">
                Python &mdash; OpenAI SDK
              </div>
              <pre className="overflow-x-auto p-6 text-sm">
                <code>
                  {`from openai import OpenAI

client = OpenAI(
    base_url="https://proxy.reivo.dev/openai/v1",
    api_key="rv_your_reivo_key",
    default_headers={
        "X-Agent-Id": "my-agent"
    }
)`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Optimize + Defend</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Reivo doesn&apos;t just watch your costs. It actively reduces them.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Smart Routing - THE headline feature */}
              <div className="rounded-lg border-2 border-primary p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Core
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Smart Model Routing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Automatically routes each request to the optimal model based on task complexity.
                  High-precision requests stay on the full model. Lightweight tasks go to
                  cost-efficient alternatives. Real-time analysis, zero latency added.
                </p>
              </div>

              {/* Quality Guarantee */}
              <div className="rounded-lg border-2 border-primary p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Core
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Quality Guarantee</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If a routed response doesn&apos;t meet quality thresholds, Reivo automatically
                  re-sends to the full model. You never see a bad response.
                </p>
              </div>

              {/* Cost Visibility */}
              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Cost Visibility</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session,
                  per-agent, and per-model breakdowns.
                </p>
              </div>

              {/* Budget + Loop combined */}
              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Budget Guardrails & Loop Detection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set spending limits with alerts at 50%, 80%, 100%. Detects agents stuck in
                  repetitive loops and auto-stops runaways before they burn your budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Routing Details */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">How Smart Routing Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Reivo analyzes every request in real-time and selects the optimal model based on task
              complexity. Complex tasks stay on the full model. Simple ones get routed to a cheaper
              alternative.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold">Request Analysis</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Evaluates task complexity and required precision in real-time. Zero latency added.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold">Auto Routing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keeps the full model for high-precision tasks. Routes lightweight tasks to
                  cost-optimal models automatically.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold">Full Audit Log</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  See exactly which model handled each request and why. Every routing decision is
                  logged in your dashboard.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Switch between <strong>conservative</strong>, <strong>aggressive</strong>, or{' '}
              <strong>off</strong> modes anytime in Settings. You&apos;re always in control.
            </p>
          </div>
        </section>

        {/* OpenClaw Skill */}
        <section id="openclaw" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                Free OpenClaw Skill
              </div>
              <h2 className="text-3xl font-bold">
                $100/month used to buy 15 days. Now it buys 30.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Your OpenClaw hits the monthly budget cap mid-month. Reivo routes 70% of requests to
                cheaper models automatically. Same quality. Full month of uptime.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Install */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Quick Install</h3>
                <div className="mt-4 overflow-hidden rounded-lg border bg-background">
                  <div className="border-b px-4 py-2 text-xs text-muted-foreground">Terminal</div>
                  <pre className="p-4 text-sm">
                    <code>{`npx clawhub@latest install reivo`}</code>
                  </pre>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Then set your API key:</p>
                <div className="mt-2 overflow-hidden rounded-lg border bg-background">
                  <pre className="p-4 text-sm">
                    <code>{`export REIVO_API_KEY="rv_your_key"`}</code>
                  </pre>
                </div>
              </div>

              {/* What you can do */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Talk to Your Agent</h3>
                <div className="mt-4 space-y-3">
                  {[
                    ['"How much did Reivo save me?"', 'Saved $127.30 this month (60% reduction)'],
                    ['"How much am I spending?"', 'Cost breakdown by model and agent'],
                    ['"Set my budget to $50"', 'Enforces monthly spending limit'],
                    ['"Which agent costs the most?"', 'Agent-by-agent cost comparison'],
                    ['"Open dashboard"', 'Link to full analytics dashboard'],
                  ].map(([cmd, desc]) => (
                    <div key={cmd} className="flex gap-3">
                      <div className="shrink-0">
                        <code className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                          {cmd}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture diagram */}
            <div className="mt-12 overflow-hidden rounded-lg border bg-card">
              <div className="border-b px-4 py-2 text-sm font-medium text-muted-foreground">
                How it works
              </div>
              <pre className="overflow-x-auto p-6 text-sm text-muted-foreground">
                <code>
                  {`Your Agent (OpenClaw / custom)
    |
    |  base_url = "https://proxy.reivo.dev/..."
    v
Reivo Smart Proxy
    |-- Smart Router: picks optimal model per request
    |-- Quality Verifier: ensures output quality
    |-- Budget Guard: enforces spending limits
    |-- Loop Detector: stops runaway agents
    v
LLM Provider (OpenAI / Anthropic / Google)`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Why Reivo?</h2>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium" />
                    <th className="px-4 py-3 text-center font-medium">Helicone</th>
                    <th className="px-4 py-3 text-center font-medium">Langfuse</th>
                    <th className="px-4 py-3 text-center font-medium">AgentBudget</th>
                    <th className="px-4 py-3 text-center font-medium text-primary">Reivo</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['Proxy-based (1-line setup)', true, false, false, true],
                      ['Cost tracking & analytics', true, true, false, true],
                      ['Budget enforcement', false, false, true, true],
                      ['Loop detection & auto-stop', false, false, 'partial', true],
                      ['Smart model routing', false, false, false, 'star'],
                      ['Quality verification', false, false, false, 'star'],
                      ['Auto cost reduction', false, false, false, '40-60%'],
                      ['OpenClaw skill', false, false, false, true],
                      ['Open source', true, true, true, true],
                    ] as [
                      string,
                      boolean | string,
                      boolean | string,
                      boolean | string,
                      boolean | string,
                    ][]
                  ).map(([feature, h, l, a, r]) => (
                    <tr key={feature} className="border-b">
                      <td className="px-4 py-3">{feature}</td>
                      {[h, l, a].map((val, i) => (
                        <td key={i} className="px-4 py-3 text-center">
                          {val === true ? (
                            <span className="text-green-600">&#10003;</span>
                          ) : val === 'partial' ? (
                            <span className="text-yellow-600">~</span>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        {r === true ? (
                          <span className="font-semibold text-green-600">&#10003;</span>
                        ) : r === 'star' ? (
                          <span className="font-bold text-primary">&#10003; &#9733;</span>
                        ) : typeof r === 'string' ? (
                          <span className="font-bold text-primary">{r}</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                AES-256 Encrypted
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Edge-deployed on Cloudflare
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Open Source
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                No prompt data stored
              </div>
            </div>
          </div>
        </section>

        {/* Savings Calculator */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <SavingsCalculator />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Protection is free. Optimization pays for itself.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-1 text-sm text-muted-foreground">Protection for everyone</p>
                <p className="mt-4 text-3xl font-bold">
                  $0<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Cost tracking & dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Budget limits & loop detection
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> OpenClaw Skill
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 10,000 requests/month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 7-day cost history
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-6 block rounded-md border py-2 text-center text-sm font-medium hover:bg-accent"
                >
                  Get Started
                </Link>
              </div>

              <div className="rounded-lg border-2 border-primary bg-card p-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Popular
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Pay $49, save $200+</p>
                <p className="mt-4 text-3xl font-bold">
                  $49<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-primary">&#9733;</span> Smart Model Routing
                    (auto)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-primary">&#9733;</span> Quality Verification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 100,000 requests/month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 90-day cost history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Slack notifications
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-6 block rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start Free Trial
                </Link>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Team</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  For organizations running multiple agents
                </p>
                <p className="mt-4 text-3xl font-bold">
                  $199<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-primary">&#9733;</span> Context Optimizer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Unlimited requests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Multi-agent dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Team budget allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> REST API access
                  </li>
                </ul>
                <a
                  href="#contact"
                  className="mt-6 block rounded-md border py-2 text-center text-sm font-medium hover:bg-accent"
                >
                  Talk to Us
                </a>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Cancel anytime. 14-day money-back guarantee on first purchase. See{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{' '}
              for details.
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-xl px-6">
            <h2 className="text-center text-3xl font-bold">Get in Touch</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
            </p>
            <form
              action="https://formspree.io/f/xeepqnpw"
              method="POST"
              className="mt-10 space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 w-full rounded-md border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 w-full rounded-md border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-1 w-full rounded-md border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold">Stop overpaying for AI. Start today.</h2>
            <p className="mt-4 text-muted-foreground">
              Same output quality. Half the API bill. One line to set up.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started Free
              </Link>
              <a
                href="https://github.com/tazsat0512/reivo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border px-8 py-3 text-sm font-medium hover:bg-accent"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Reivo. The smart proxy that cuts your AI costs in
            half.
          </p>
          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/tazsat0512/reivo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://clawhub.org/skills/reivo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              ClawHub
            </a>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a href="mailto:hello@reivo.dev" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
