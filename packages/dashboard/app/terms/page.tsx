import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Reivo',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 27, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Service Description</h2>
          <p className="mt-2">
            Reivo is a proxy service that sits between your AI agents and LLM providers (OpenAI,
            Anthropic, Google). It provides cost tracking, budget enforcement, loop detection, and
            smart model routing. Reivo does not provide the underlying LLM services — you must
            supply your own provider API keys.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Account & API Keys</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              You are responsible for keeping your Reivo API key and provider API keys secure.
            </li>
            <li>
              Provider API keys are encrypted at rest. However, you acknowledge that Reivo
              necessarily decrypts them at runtime to forward requests to providers.
            </li>
            <li>
              Do not share your Reivo API key. Any usage through your key is your responsibility.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Acceptable Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Use the service to violate any applicable law or regulation.</li>
            <li>
              Attempt to circumvent rate limits, budget enforcement, or other safety mechanisms.
            </li>
            <li>Reverse-engineer the proxy or routing logic for competitive purposes.</li>
            <li>Use the service to attack, degrade, or interfere with LLM provider services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Service Availability</h2>
          <p className="mt-2">
            Reivo is provided &ldquo;as is&rdquo; without warranty. We aim for high availability but
            do not guarantee uptime. The proxy adds minimal latency but is not responsible for
            provider-side outages or errors. We recommend not using Reivo as your sole production
            path if your application requires strict SLA guarantees.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Budget & Safety Features</h2>
          <p className="mt-2">
            Budget limits, loop detection, and anomaly detection are best-effort safety mechanisms.
            Due to the eventually-consistent nature of edge caching, there may be brief windows
            where spending slightly exceeds configured limits. Reivo is not liable for costs
            incurred through your LLM provider accounts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Smart Routing</h2>
          <p className="mt-2">
            When enabled, Smart Routing may automatically substitute the requested model with a
            cost-efficient alternative based on request analysis. Routing decisions are logged and
            visible on your dashboard. You can disable routing or choose a specific mode at any
            time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Pricing & Billing</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Free tier includes 10,000 requests per month.</li>
            <li>Pro and Team plans are billed monthly via Stripe.</li>
            <li>
              You may cancel at any time. Access continues until the end of your billing period.
            </li>
            <li>We reserve the right to change pricing with 30 days notice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, Reivo shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the service, including but
            not limited to LLM provider charges, lost revenue, or data loss.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your account if you violate these terms. You may delete your
            account at any time from the Settings page. Upon termination, your data will be deleted
            in accordance with our{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Changes</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the service after changes
            constitutes acceptance. Material changes will be communicated via email or dashboard
            notification.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Contact us at{' '}
            <a href="mailto:hello@reivo.dev" className="text-primary hover:underline">
              hello@reivo.dev
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
