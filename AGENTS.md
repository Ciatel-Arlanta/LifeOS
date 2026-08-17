# LifeOS — Agent Handoff

Read this file first in every new session. Then read `Plan.md` for the original product spec.

This file is the working agreement: locked decisions, current stack, design language, what is built, and what to do next. Do not invent product features. Do not silently expand scope.

---

## What this is

LifeOS is a **personal Android app** for one person. It is not a commercial product.

Four modules, one app:

1. Expense tracker
2. Subscription tracker (also holds recurring costs such as rent)
3. Reminders on top of TickTick tasks
4. Account / identity manager (“which account did I use for this service?”)

**TickTick owns the task. LifeOS owns extra reminder schedules.**
**This is not a password manager. Never store passwords.**
**Do not rebuild TickTick.**
**Do not turn this into a general productivity suite.**

Product requirements live in `Plan.md`. When this file and `Plan.md` disagree on a later decision, **this file wins** for locked implementation choices. `Plan.md` still wins for product scope unless a decision below explicitly changes it.

---

## How to run

Use **Bun**, not npm.

```bash
bun install
bun run android    # primary target
bun run dev        # Expo start
bun run web        # browser preview only
bun run typecheck
bun run db:generate
```

Android first. Same Expo codebase can target iOS later; do not add iOS-specific work unless asked. There is no device available for iOS testing.

Web preview (`expo start --web`) is useful for layout. SQLite WASM is not wired on web; expense persistence on web uses `localStorage` via `features/expenses/repository.ts`. Native uses `features/expenses/repository.native.ts` + Drizzle.

---

## Stack (actual)

| Layer | Choice |
|---|---|
| App | Expo 56, React Native, TypeScript, Expo Router |
| Styling | NativeWind v5 + Tailwind CSS v4 (CSS-first, `global.css`) |
| UI kit | **Gluestack UI v5** (`@gluestack-ui/core`), copy-paste components in `components/ui/` |
| Client state | Zustand — UI/session only |
| Data | SQLite + Drizzle on Android; localStorage fallback on web |
| Notifications | Expo Notifications (stub only so far) |
| Package manager | Bun |

`Plan.md` originally listed React Native Reusables. That was replaced with Gluestack. Do not reintroduce Reusables.

Gluestack rules that matter here:

- Prefer Gluestack primitives (`Box`, `VStack`, `HStack`, `Text`, `Heading`, `Button` + `ButtonText`, `Input` + `InputField`) over raw React Native views.
- `InputIcon` must sit inside `InputSlot`.
- Color classes: semantic tokens only (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`). No `green-*`, `teal-*`, `emerald-*` as theme/accent.
- Theme tokens live in `global.css` (`@theme inline`).

---

## Folder map

```
app/                      Expo Router screens
  (tabs)/                 Home, Expenses, Subscriptions, Reminders, Accounts
  expense/                add + detail/edit
  subscription/           add + detail (UI only)
  reminder/               TickTick task + LifeOS reminder list (UI only)
  account/                lookup, provider, account detail (mock data)
  settings/               categories (live), TickTick stub
components/               app-level pieces (Screen, Amount, Chip, MonthTape, …)
components/ui/            Gluestack components
features/<module>/        types, mock or repository, store
db/                       schema, client, DatabaseProvider
  provider.tsx            web: hydrate expenses from localStorage
  provider.native.tsx     Android: migrations then hydrate
drizzle/                  generated SQL migrations — commit these
store/                    Zustand (TickTick connection status)
notifications/            isolated; schedule/cancel not implemented
integrations/ticktick/    interface + stub
services/                 later business ops (subscription auto-post stub)
docs/mockups/             AI mockups for layout reference only
Plan.md                   original spec
AGENTS.md                 this file
```

---

## Locked product decisions

Do not reopen these unless the user explicitly changes them.

| Topic | Decision |
|---|---|
| Audience | One person, personal use |
| Platform | Android first |
| Currency | INR only. Store integer **paise**. Multi-currency later if asked |
| Expense fields | Amount, category, payment mode, date. **No note** |
| Payment modes | Closed: GPay, Cash, Card |
| Categories | Start empty. User adds them in **Settings**, not on the daily expense screen |
| Recurring costs | Live in **Subscriptions** (Netflix, rent, gym — same entity) |
| Subscription → expense | When a cycle is due, LifeOS **creates an expense**. Optional `subscription_id` on expenses. Advance `renewal_date` by the period. Catch up missed cycles. Autopay Other maps to Card |
| Billing | Closed set: weekly / monthly / yearly + a `renewal_date` |
| Subscription category | Required for auto-posting so the generated expense has a category |
| Account fields | Provider, identifier, type (`personal` / `college` / `work` / `other`), purpose, created date, linked services. **No status** |
| Provider roles | `isIdentity` and/or `isService`. Dual is allowed (GitHub) |
| Service lookup | Used / Not used only among **identity** accounts (Google, Microsoft, GitHub, …). Not Anthropic/OpenAI/etc. **No Recommended flag** |
| TickTick | Incomplete tasks only, grouped by TickTick lists. LifeOS never completes or edits the task |
| Reminders | Multiple one-shot local datetimes per TickTick task. No recurrence in v1 |
| LifeOS login | None. Single-device local app |
| Passwords | Never stored |
| Chart | Dashboard month breakdown is in scope (screenshot-friendly). Not a reports suite |

---

## Design language

Reference images (layout only): `docs/mockups/`.

They are AI-generated. **Ignore extra features** they invented. Steal structure and density, not product.

### Take from the mockups

- Light canvas, white cards, large amount type, quiet metadata
- Home as stacked summary cards (spend, upcoming bills, reminders) — not an analytics dashboard
- Expenses grouped by day (Today / Yesterday / date)
- Subscriptions as compact rows: name, cost, period, next renewal, autopay, linked account
- Account lookup: search a **service**, then Used / Not used for **sign-in identities**
- Providers as grouped lists (expand/collapse is fine later)
- Reminders: TickTick task is the heading; LifeOS reminder rows sit under it
- One obvious primary action (add expense / add reminder)
- Soft 16–20px card radius, generous padding, hairline dividers
- Tab bar: Home, Expenses, Subscriptions, Reminders, Accounts. Settings is **not** a tab

### Do not take from the mockups

- Green, teal, mint, or emerald as brand/accent (progress bars, FABs, tab tint, badges)
- Budget targets, weekly spend goals, “70% of target”
- Bank balances, cards as financial accounts (Chase, Discover)
- Profile photo, “Good morning, Sarah”, home search
- Extra tabs: Tasks, Journal, Goals, Profile
- Completing TickTick tasks / checkbox-to-done
- Calendar imports (Outlook)
- Account **status** chips (Active / Used recently)
- **Recommended** account row (user declined this)
- Multi-user / shared / family plan product
- Password fields

Functional color is allowed: a small success/error mark on Used / Not used, destructive delete. Those are not theme accents.

### Palette (current)

Defined in `global.css` and `lib/theme.ts`:

| Token | Light | Role |
|---|---|---|
| background | `#F4F4F5` | cool paper |
| card | `#FFFFFF` | surfaces |
| foreground / primary | `#18181B` | ink |
| muted-foreground | `#71717A` | meta |
| border | `#E4E4E7` | rules |
| destructive | `#B91C1C` | delete / error |
| tape-1…5 | charcoal / stone | category chart only |

No green in these tokens. Keep it that way.

Type:

- UI: Figtree
- Amounts / display: Fraunces
- Dates, emails, periods: IBM Plex Mono

Voice: short, sentence case, no filler. Empty states say what to do next.

---

## Data

### Schema (Drizzle)

See `db/schema.ts`.

- `providers` — `isIdentity`, `isService`
- `accounts` — no status
- `services`, `account_services`
- `expense_categories`, `expenses` (`subscription_id` nullable)
- `subscriptions` — optional `account_id`, `service_id`, `category_id`
- `ticktick_task_refs`, `reminder_configs`

Money is integer paise. After schema changes: `bun run db:generate` and commit `drizzle/`.

### Persistence today

| Data | Android | Web preview |
|---|---|---|
| Expenses + categories | SQLite | `lifeos.expense-data` |
| Subscriptions | SQLite | `lifeos.subscription-data` |
| Accounts / providers / services | SQLite | `lifeos.account-data` |
| Reminder configs + task refs | SQLite | `lifeos.reminder-data` |
| TickTick token | SecureStore | `lifeos.ticktick-token` |

Stores: `features/expenses/store.ts`, `features/subscriptions/store.ts`, `features/accounts/store.ts`, `features/reminders/store.ts`. App boot: `features/app/hydrate.ts`.

---

## What is implemented

**Phase 0–1 — shell**

- Navigation, theme, Gluestack provider, folder layout
- All major screens exist
- Dashboard, lists, forms, settings chrome
- TickTick + notification modules are stubs

**Phase 2 — expenses (live)**

- Add / edit / delete expense
- Categories CRUD in Settings
- Dashboard month tape + recent spend from live data
- Categories start empty

**Phase 3–5 — subscriptions, accounts, TickTick**

- Accounts persist: add identity/service, link/unlink services, lookup Used/Not used
- Subscriptions persist: cost, period, renewal, autopay, category, **account + service**
- Linking a subscription to an account+service also writes `account_services`
- Account detail lists subscriptions on that identity
- Due subscription cycles post expenses and advance `renewal_date`
- Reminders persist per TickTick task ref; add/delete; Expo Notifications on native
- TickTick: paste Open API token in Settings, pull incomplete tasks grouped by list
- LifeOS never completes TickTick tasks

**Not implemented**

- Phase 6: polish only (no new features)
- TickTick OAuth browser flow (token paste only)
- Recurring LifeOS reminders

---

## What to do next

Default next step: **Phase 6 — polish**.

Empty/loading/error states, form tightness, accessibility, verify notifications on a real Android device, verify TickTick token + failed-connection UI. Do not add product features.

At the end of each phase report: what changed, files, schema, tests, limitations, next phase.

---

## Agent rules

1. Prefer the simplest approach, fewer dependencies, local-first.
2. Do not add features because a mockup or similar app has them.
3. Do not put business data in Zustand.
4. Keep TickTick behind `integrations/ticktick`.
5. Keep notifications behind `notifications/`.
6. New UI: Gluestack + semantic tokens. No green/teal accents.
7. Package manager is Bun.
8. After UI changes, verify on a phone-sized viewport when a browser preview is available.
9. When a decision affects product meaning and is not locked above, explain the tradeoff before coding.

If you change a locked decision, update **this file in the same change**.
