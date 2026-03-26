import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">TS</span>
            </div>
            <span className="text-lg font-semibold">TokenScope</span>
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
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-6 inline-block rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            Now available as an OpenClaw Skill
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Don&apos;t just watch your AI burn money.
            <br />
            <span className="text-primary">Stop it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            TokenScope is a transparent proxy that tracks AI agent costs in real-time, enforces
            budget limits, and auto-stops runaway loops. Works with OpenAI, Anthropic, and Google.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="#openclaw"
              className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
            >
              Install OpenClaw Skill
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">One line change. Full visibility.</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Replace your provider&apos;s base URL with TokenScope&apos;s proxy. That&apos;s it.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  1
                </div>
                <h3 className="mt-4 font-semibold">Sign up & get API key</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create an account and generate your <code className="rounded bg-muted px-1">ts_</code> API key in Settings.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  2
                </div>
                <h3 className="mt-4 font-semibold">Change your base URL</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Point your SDK to the TokenScope proxy. Your code works exactly the same.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  3
                </div>
                <h3 className="mt-4 font-semibold">See costs & stay safe</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track spending on the dashboard. Set budgets. Loops are auto-detected and stopped.
                </p>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border bg-card">
              <div className="border-b px-4 py-2 text-sm font-medium text-muted-foreground">
                Python — OpenAI SDK
              </div>
              <pre className="overflow-x-auto p-6 text-sm">
                <code>
                  {`from openai import OpenAI

client = OpenAI(
    base_url="https://tokenscope-proxy.tazoelab.workers.dev/openai/v1",
    api_key="ts_your_tokenscope_key",
    default_headers={
        "X-Session-Id": "my-session",
        "X-Agent-Id": "my-agent"
    }
)`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Observe + Defend</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Unlike tools that only log, TokenScope actively protects your budget.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Cost Visibility</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real-time cost tracking across OpenAI, Anthropic, and Google. Per-session,
                  per-agent, and per-model breakdowns.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Budget Guardrails</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set spending limits. Get alerts at 50%, 80%, 100%. Requests auto-blocked
                  when budget is exceeded.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Loop Detection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detects agents stuck in repetitive loops via prompt hashing and TF-IDF similarity.
                  Auto-stops runaways.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OpenClaw Skill */}
        <section id="openclaw" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                Free OpenClaw Skill
              </div>
              <h2 className="text-3xl font-bold">Use TokenScope from OpenClaw</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Install the TokenScope skill and manage costs directly from your OpenClaw agent.
                No dashboard needed for basic usage.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Install */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Quick Install</h3>
                <div className="mt-4 overflow-hidden rounded-lg border bg-background">
                  <div className="border-b px-4 py-2 text-xs text-muted-foreground">Terminal</div>
                  <pre className="p-4 text-sm">
                    <code>{`npx clawhub@latest install tokenscope`}</code>
                  </pre>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Then set your API key:
                </p>
                <div className="mt-2 overflow-hidden rounded-lg border bg-background">
                  <pre className="p-4 text-sm">
                    <code>{`export TOKENSCOPE_API_KEY="ts_your_key"`}</code>
                  </pre>
                </div>
              </div>

              {/* What you can do */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Talk to Your Agent</h3>
                <div className="mt-4 space-y-3">
                  {[
                    ['"How much am I spending?"', 'Shows cost breakdown by model and agent'],
                    ['"Set my budget to $50"', 'Enforces monthly spending limit'],
                    ['"Which agent costs the most?"', 'Agent-by-agent cost comparison'],
                    ['"Show budget status"', 'Budget usage with loop/block counts'],
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
                  {`OpenClaw Agent
    │
    │  API calls routed through proxy
    ▼
TokenScope Proxy  ──────►  LLM Provider (OpenAI / Anthropic / Google)
    │
    │  telemetry: cost, tokens, loops
    ▼
TokenScope Dashboard (optional, for detailed analytics)`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-bold">Why TokenScope?</h2>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium" />
                    <th className="px-4 py-3 text-center font-medium">Helicone</th>
                    <th className="px-4 py-3 text-center font-medium text-primary">TokenScope</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Proxy-based (1-line setup)', true, true],
                    ['Cost tracking & analytics', true, true],
                    ['Multi-provider support', true, true],
                    ['Budget limits & auto-block', false, true],
                    ['Loop detection & auto-stop', false, true],
                    ['Anomaly detection (EWMA)', false, true],
                    ['OpenClaw skill', false, true],
                    ['Open source / self-hostable', false, true],
                  ].map(([feature, helicone, ts]) => (
                    <tr key={feature as string} className="border-b">
                      <td className="px-4 py-3">{feature as string}</td>
                      <td className="px-4 py-3 text-center">
                        {helicone ? (
                          <span className="text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ts ? (
                          <span className="font-semibold text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-1 text-sm text-muted-foreground">For individuals getting started</p>
                <p className="mt-4 text-3xl font-bold">
                  $0<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> OpenClaw Skill (full access)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 10,000 requests/month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 7-day cost history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Budget limits & loop detection
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
                <p className="mt-1 text-sm text-muted-foreground">For power users and small teams</p>
                <p className="mt-4 text-3xl font-bold">
                  $49<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 100,000 requests/month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> 90-day cost history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Model optimization suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Slack notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Session forensics replay
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
                <p className="mt-1 text-sm text-muted-foreground">For organizations running multiple agents</p>
                <p className="mt-4 text-3xl font-bold">
                  $199<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Unlimited requests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Multi-agent dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Auto model routing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> Team budget allocation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">&#10003;</span> REST API access
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-6 block rounded-md border py-2 text-center text-sm font-medium hover:bg-accent"
                >
                  Contact Us
                </Link>
              </div>
            </div>
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
            <h2 className="text-3xl font-bold">Ready to take control of your AI costs?</h2>
            <p className="mt-4 text-muted-foreground">
              Join the growing community of developers who track and protect their AI spending.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started Free
              </Link>
              <a
                href="https://github.com/tazsat0512/tokenscope"
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
          <p>&copy; {new Date().getFullYear()} TokenScope. The AI proxy with built-in guardrails.</p>
          <div className="flex gap-6">
            <a
              href="https://github.com/tazsat0512/tokenscope"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a href="mailto:REDACTED_EMAIL" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
