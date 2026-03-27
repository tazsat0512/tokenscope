import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Reivo. The smart proxy that cuts your AI costs in half.
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
          <Link href="/commercial-disclosure" className="hover:text-foreground">
            特定商取引法
          </Link>
          <a href="mailto:hello@reivo.dev" className="hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
