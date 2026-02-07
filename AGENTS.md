Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

- After each implementation, run `bun scan:fix` and fix issues; ensure it runs clean.

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

# Agent Behavior

Be extremely concise. Sacrifice grammar for the sake of concision.

# GitHub

- Your primary method of interaction with GitHub should be GitHub CLI (`gh`).

# Commit Rules

- Use conventional commits with scope: `<keyword>(<folder>/<domain-slice>): <message>`
- Scope format: `<folder>/<domain-slice>` (e.g. `core/framework`, `ui/control`)
- Title short, summarize change; body ok for plan parts, key decisions, whys
- Commit plan file too

# Plan

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands. The application already running on port :3000 can be accessed at `http://localhost:3000`. Do not start a new server.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
