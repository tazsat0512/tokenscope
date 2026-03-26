import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Reivo',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 27, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. What We Collect</h2>
          <p className="mt-2">
            Reivo collects the minimum data required to provide cost tracking, budget enforcement,
            and smart routing services:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Account information</strong> — email address and
              display name via Clerk authentication.
            </li>
            <li>
              <strong className="text-foreground">Request metadata</strong> — model name, token
              counts (input/output), cost, latency, session ID, and agent ID for each proxied
              request.
            </li>
            <li>
              <strong className="text-foreground">Prompt hashes</strong> — SHA-256 hashes of
              normalized prompts for loop detection. We do not store raw prompt content.
            </li>
            <li>
              <strong className="text-foreground">Provider API keys</strong> — encrypted at rest
              using AES-256-GCM. Keys are decrypted only at the moment of proxying and never logged.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. What We Do NOT Collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Raw prompt or completion content — the proxy forwards payloads without reading or
              storing them.
            </li>
            <li>Conversation history or message bodies.</li>
            <li>Personal data beyond what is needed for authentication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Display cost analytics and usage trends on your dashboard.</li>
            <li>Enforce budget limits and detect runaway loops.</li>
            <li>Route requests to optimal models when Smart Routing is enabled.</li>
            <li>Send Slack notifications when budget or anomaly thresholds are reached.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Data Storage & Security</h2>
          <p className="mt-2">
            Request metadata is stored in Turso (libSQL). Budget state is cached in Cloudflare KV
            for low-latency reads. Provider API keys are encrypted with AES-256-GCM before storage.
            The proxy itself is stateless — it does not persist request or response bodies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
          <p className="mt-2">We use the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Clerk</strong> — authentication and user
              management.
            </li>
            <li>
              <strong className="text-foreground">Cloudflare Workers</strong> — proxy runtime and KV
              storage.
            </li>
            <li>
              <strong className="text-foreground">Turso</strong> — database for request logs and
              user settings.
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> — payment processing (we do not
              store card details).
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong> — dashboard hosting.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
          <p className="mt-2">
            Request logs are retained for 7 days on the Free plan and 90 days on the Pro plan. You
            can delete your account and all associated data at any time from the Settings page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal data at any time
            by contacting us at{' '}
            <a href="mailto:hello@reivo.dev" className="text-primary hover:underline">
              hello@reivo.dev
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Changes</h2>
          <p className="mt-2">
            We may update this policy from time to time. Material changes will be communicated via
            email or dashboard notification.
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
