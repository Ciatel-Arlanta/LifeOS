# LifeOS

Personal Android app for expenses, subscriptions, TickTick reminders, and account identity.

Expenses, subscriptions, and accounts persist locally. TickTick lists come from a token in Settings. LifeOS reminders sit on those tasks.

## Run

```bash
bun install
bun run android
```

Other scripts: `bun run dev`, `bun run typecheck`, `bun run db:generate`.

Use Bun, not npm.

## Layout

- `app/` Expo Router screens
- `components/` shared UI
- `features/` module types and mock data
- `db/` Drizzle schema and SQLite client
- `store/` Zustand client state only
- `notifications/` Expo Notifications isolation
- `integrations/ticktick/` TickTick interface
- `services/` later business operations

Start here: [`AGENTS.md`](AGENTS.md) (stack, locked decisions, design, what to build next).  
Product spec: [`Plan.md`](Plan.md). Layout reference only: [`docs/mockups/`](docs/mockups/).
