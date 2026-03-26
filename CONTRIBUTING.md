# Contributing to TokenScope

Thanks for your interest in contributing to TokenScope! Here's how to get started.

## Development Setup

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 8+
- [Cloudflare Workers](https://workers.cloudflare.com/) account (for proxy)
- [Turso](https://turso.tech/) account (for database)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/tazsat0512/tokenscope.git
cd tokenscope

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the proxy (Cloudflare Workers dev server)
pnpm --filter proxy dev

# Start the dashboard (Next.js dev server)
pnpm --filter dashboard dev
```

## Project Structure

```
tokenscope/
├── packages/
│   ├── proxy/       # Cloudflare Workers + Hono (the proxy)
│   ├── dashboard/   # Next.js + Vercel (the web dashboard)
│   ├── skill/       # OpenClaw skill package
│   └── shared/      # Shared types and constants
```

## How to Contribute

### Reporting Bugs

Open an issue using the **Bug Report** template. Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

### Suggesting Features

Open an issue using the **Feature Request** template. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you considered

### Submitting Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run type checks: `pnpm --filter dashboard exec tsc --noEmit`
4. Write clear commit messages
5. Open a PR with a description of your changes

### Code Style

- TypeScript for all code
- Use existing patterns (Hono for proxy routes, tRPC for dashboard API)
- Keep PRs focused — one feature or fix per PR

## Areas We Need Help With

- **Framework integrations** — LangChain, CrewAI, AutoGen callbacks/plugins
- **SDK packages** — Python and JavaScript client libraries
- **Cost optimization signals** — New detection patterns for the advisor
- **Documentation** — Self-hosting guides, API reference improvements
- **Testing** — Unit and integration tests

## Questions?

Open an issue or email [REDACTED_EMAIL](mailto:REDACTED_EMAIL).
