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
bun run test       # bun test, pure helpers (tests/)
bun run db:generate
```

Android first. Same Expo codebase can target iOS later; do not add iOS-specific work unless asked. There is no device available for iOS testing.

Web preview (`expo start --web`) is useful for layout. SQLite WASM is not wired on web; expense persistence on web uses `localStorage` via `features/expenses/repository.ts`. Native uses `features/expenses/repository.native.ts` + Drizzle.

**Keep the two repositories in sync.** Every `features/<module>/repository.ts` (web,
`localStorage`) must export exactly what its `repository.native.ts` (Drizzle) exports,
with the same signatures. Metro picks one by platform, so nothing catches drift at
runtime. `types/repository-parity.ts` asserts the pair matches and `bun run typecheck`
fails if it does not — when you add or change a repository function, change both files
in the same edit.

---

## Stack (actual)

| Layer | Choice |
|---|---|
| App | Expo 56, React Native, TypeScript, Expo Router |
| Styling | NativeWind v5 + Tailwind CSS v4 (CSS-first, `global.css`) |
| UI kit | **Gluestack UI v5** (`@gluestack-ui/core`), copy-paste components in `components/ui/` |
| Client state | Zustand — UI/session only |
| Data | SQLite + Drizzle on Android; localStorage fallback on web |
| Notifications | Expo Notifications — reminders + subscription renewal notices |
| Widgets | `react-native-android-widget` 0.22.1 — Android home-screen widgets |
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
index.ts                  Expo Router entry + widget handler registration (main)
widget-task-handler.tsx    headless handler — routes widget names to renderers
widgets/                  palette, data, refresh, Spend/Renewals/Reminders/Glance widgets (FlexWidget/TextWidget)
assets/fonts/             Fraunces/IBMPlexMono/Figtree ttf bundled for widgets + app
app/                      Expo Router screens
  (tabs)/                 Home, Expenses, Subscriptions, Reminders, Accounts
  expense/                add + detail/edit
  subscription/           add + detail (UI only)
  reminder/               TickTick task + LifeOS reminder list (UI only)
  account/                lookup, identity detail, membership add, identity add
  settings/               categories (live), TickTick stub
components/               app-level pieces (Screen, Amount, Chip, MonthTape, …)
components/ui/            Gluestack components
features/<module>/        types, helpers (pure, testable), mock or repository, store
db/                       schema, client, DatabaseProvider
  provider.tsx            web: hydrate expenses from localStorage
  provider.native.tsx     Android: migrations then hydrate
drizzle/                  generated SQL migrations — commit these
store/                    Zustand (TickTick status, theme mode, renewal lead days)
notifications/            isolated; reminder schedule/cancel + subscription renewal notices
integrations/ticktick/    interface + stub
services/                 later business ops (subscription auto-post stub)
docs/mockups/             AI mockups + widget spec boards (widgets/*.png)
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
| Billing | Closed set: weekly / monthly / yearly + a `renewal_date`. Subscriptions can be paused/resumed (`inactive_at`). Paused items do not post auto-expenses and sit in a separate paused section. |
| Subscription category | Required for auto-posting so the generated expense has a category. Enforced in the new + detail forms and in schema (`NOT NULL`, migration 0006). A category still used by a subscription cannot be removed. |
| Account fields | **Identity**: provider (issuer), identifier, type (`personal` / `college` / `work` / `other`), purpose, created date. **Membership** (service account): service provider + signed-in identity, optional note/date. Multiple memberships per service allowed. **No status** |
| Provider registry | Single `providers` table — any provider can issue identities or host service accounts. No `isIdentity`/`isService` flags |
| Service lookup | Search a service → **Accounts here** (memberships at that service) vs **Not used** (identities with no membership there). No Recommended flag |
| TickTick | Incomplete tasks only, grouped by TickTick lists. LifeOS never completes or edits the task |
| Reminders | Multiple one-shot local datetimes per TickTick task. Quick presets (+1h / +1d before due). Interactive snooze (1h / 1d) from notification actions with custom sound `lifeos_reminder.wav` (`lifeos-reminders-v3` channel). No recurrence in v1 |
| LifeOS login | None. Single-device local app |
| Passwords | Never stored |
| Chart & Dashboard | Dashboard month breakdown tape with month-over-month delta and previous-month chevron browsing (`<` / `>`). Not a reports suite |
| Theme | System / Light / Dark, chosen in **Settings → Appearance**, persisted in `lifeos.theme-mode`. `system` follows the phone. Dark palette is the same charcoal ladder inverted — still no green |
| Renewal notices | One local notification per active subscription, at 09:00, `n` days before `renewal_date`. Lead time is Off / 1 / 2 / 3 / 7 days in **Settings → Notifications**, default 2. Paused subscriptions never notify. The whole set is cancelled and rebuilt on every subscription hydrate, so no notification ids are stored |
| Backup | JSON export/import of expenses, subscriptions, categories, providers, identities, memberships — **ids included**, so the links survive. Import **replaces everything** (confirm dialog first); there is no merge. CSV is expenses only and export-only. TickTick task refs and reminder schedules are not backed up |

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

- `providers` — name only (services merged into it)
- `identities` — issuer provider + identifier + type, no status
- `memberships` — service provider + identity, optional note/date (multiple per service allowed)
- `expense_categories`, `expenses` (`subscription_id` nullable)
- `subscriptions` — `category_id` (not null), optional `membership_id`, `inactive_at` (pause/resume)

SQLite foreign keys are **off** (nothing issues `PRAGMA foreign_keys = ON`), so declared `onDelete` actions never fire. Referential rules that matter are enforced in the repository — see `deleteCategory` in `features/expenses/repository.native.ts`.
- `ticktick_task_refs`, `reminder_configs`

Money is integer paise. After schema changes: `bun run db:generate` and commit `drizzle/`.

### Persistence today

| Data | Android | Web preview |
|---|---|---|
| Expenses + categories | SQLite | `lifeos.expense-data` |
| Subscriptions | SQLite | `lifeos.subscription-data` |
| Accounts / providers / services | SQLite | `lifeos.identity-data` |
| Reminder configs + task refs | SQLite | `lifeos.reminder-data` |
| TickTick token | SecureStore | `lifeos.ticktick-token` |
| Preferences (theme, renewal lead) | `expo-sqlite/kv-store` | `localStorage` |

Preferences go through `lib/preferences.ts` / `.native.ts`. Reads are **synchronous** on
purpose — the theme is resolved before the first paint, and an async read would flash the
wrong scheme.

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
- Subscriptions persist: cost, period, renewal, autopay, required category (`NOT NULL`), **account + service**
- Subscriptions pause/resume: toggle pause (`inactive_at`), excluded from active commitments and auto-posting
- Linking a subscription to an account+service writes `memberships`
- Account detail lists subscriptions on that identity
- **Account redesign (identities + memberships)**: providers merged (no role flags); many memberships per service, each anchored to a sign-in identity (e.g. `achintya@gmail.com → Claude #1`, `achintya2@gmail.com → Claude #2`); subscriptions link via optional `membership_id`; lookup lists memberships vs identities without memberships (migrations `0004`/`0005`).
- Due subscription cycles post expenses and advance `renewal_date`
- Reminders persist per TickTick task ref; quick presets (+1h / +1d); Expo Notifications on native with custom sound `lifeos_reminder.wav` and interactive snooze actions (1h / 1d)
- TickTick: paste Open API token in Settings, pull incomplete tasks grouped by list
- LifeOS never completes TickTick tasks

**Phase 6 — widgets + polish (live)**

- Android home-screen widgets: Spend (2×2→4×1), Renewals 4×2, Reminders 4×2, Glance 4×4; auto light/dark; `react-native-android-widget` 0.22.1 via config plugin; fonts bundled in `assets/fonts/`; `updatePeriodMillis` 30 min + `requestWidgetUpdate` on every hydrate; deep links via `lifeos://` (`OPEN_URI`); entry moved to `index.ts` so the headless handler is registered.
- Polish (see `docs/polish-checklist.md`, all code items done): boot/loading gates on native + web (`BootLoading`/`BootError`, retry on DB/migration/hydrate failure), `ready` gates in all tabs, EmptyState everywhere incl. inline variants, NotFound screens with Go back for stale deep links, AlertDialog confirms for destructive deletes, per-field form validation (`FormControl isInvalid`), native date/time pickers on Android (`@react-native-community/datetimepicker`) with text fallback on web, double-submit guards, duplicate-category guard, account provider role rule, TickTick friendly error copy + invalid-token UI, haptics (`tapSuccess` on save, `tapWarning` on destructive), a11y roles/labels/hitSlops on rows/chips/Fabs/inputs.
- Dependency alignment: `bunx expo install --fix` brought 11 packages onto Expo 56. `bunx expo-doctor` is now 21/22; the one failure is the Hermes V1 memory regression, which only an SDK 57 upgrade fixes.
- `react-native-screens` is deliberately held at `4.27.0` via `overrides`/`resolutions`, **not** the SDK's `~4.26.0`. At `4.26.x`, `expo-router` pulls its own nested `4.27.0` and you end up with two copies of a native library. Duplicate beats one minor ahead, so it is listed in `expo.install.exclude` to keep `expo-doctor` honest. Do not "fix" it back.
- TypeScript is `~6.0.3`. `baseUrl` is gone (deprecated in TS 6); `paths` resolves relative to `tsconfig.json`, and `types/bun.d.ts` pulls in Bun's types via `/// <reference types="bun" />` since that no longer resolves via `typeRoots` without `baseUrl`.
- CI: `.github/workflows/ci.yml` runs `bun install --frozen-lockfile`, `bun run typecheck`, `bun run test` on push to `master` and on PRs.
- Tests: `bun test` over `features/*/helpers.ts` and `utils/`, config in `bunfig.toml`, mocks in `tests/setup.ts`.
- Fixed during polish: `notifications/index.ts` unhandled rejection of `setNotificationCategoryAsync` on web crashed Expo's node SSR process.

**Phase 7 — settings + backup (live)**

- **Theme**: System / Light / Dark in Settings → Appearance. `store/ui.ts` holds the mode,
  `lib/use-color-scheme.ts` resolves `system` against the device, `lib/theme.ts` supplies the
  matching chrome palette to the root Stack and the tab bar. The vendored
  `GluestackUIProvider` now maps `system` to `Appearance.setColorScheme('unspecified')`
  instead of passing the literal string through.
- **Haptics**: moved onto the `Fab` primitive so every FAB taps without repeating the call;
  added to the dashboard and reminder primary actions and to notification-action snoozes.
- **Renewal notices**: `notifications/renewals.ts` on channel `lifeos-renewals-v1`.
  `syncRenewalNotifications` cancels every notification tagged
  `data.kind === 'subscription-renewal'` and reschedules from scratch on each
  `hydrateSubscriptions`, so edits, pauses and deletes stay correct without a schema change.
  It never prompts for permission — the Reminders tab owns asking, and an ungranted
  permission just means nothing is scheduled.
- **Backup**: Settings → Backup. Export writes through the Storage Access Framework so the
  user picks a real folder; import uses `File.pickFileAsync` from expo-file-system 56. No new
  native dependency was added — `expo-file-system` was already installed transitively and is
  now declared in `package.json`.

**Not implemented**

- TickTick OAuth browser flow (token paste only)
- Recurring LifeOS reminders

---

## What to do next

Phase 7 code is done. Remaining: **device-only verification** — reminder and renewal
notifications fire on a real Android device, the SAF export and file-picker import work
against Downloads/Drive, widgets render/light-dark/refresh, TickTick token + invalid-token UI
on device. Dark mode has only been checked in the web preview. Do not add product features.

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
