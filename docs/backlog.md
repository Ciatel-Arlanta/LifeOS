# Backlog — ideas for later

Not scheduled, not designed yet. Logged here after a week of daily use so they aren't lost. Implement only when explicitly picked up.

---

## 1. Reminder notification sound

Reminder notifications currently fire silently (or on default OS sound — needs checking). Add a sound to LifeOS reminder notifications so they're noticeable.

Touches: `notifications/` (Expo Notifications config/channel setup).

---

## 2. Account Manager — rethink account/identity-provider modeling

Current Account Manager (Module 4 in `Plan.md`) needs more thought on how accounts and identity providers relate to each other. Specifics TBD — user wants to discuss the model before any implementation.

Open questions to raise when this gets picked up:
- How providers, accounts, and identities are structured relative to each other
- Whether the current schema (`providers` / `accounts` / services / account-service links) still fits

Do not implement until the user has walked through the redesign.

---

## 3. Home-screen widgets

~~Add Android home-screen widgets surfacing LifeOS info at a glance.~~ **Done 2026-08-25.**

- Platform: Android only, via `react-native-android-widget` 0.22.1 (needs a dev-client build). iOS WidgetKit deferred.
- Lineup: Spend 2×2 (resizes to 4×1), Renewals 4×2, Reminders 4×2, Glance 4×4. No quick-add launcher.
- Theme: auto light/dark (`renderWidget({light,dark})`). Dark = `#18181B` card, `#FAFAFA` text, inverted tape ramp. Light = white card, existing tokens.
- Type: Fraunces amounts, IBM Plex Mono labels/dates (uppercase), Figtree names — ttf bundled in `assets/fonts/` and registered via the config plugin.
- Content maps 1:1 to dashboard helpers: `monthTotal` + `categoryBreakdown`, `upcomingSubscriptions` + `monthlyCommitmentMinor`, `upcomingReminders`. Tape bar is the only chart.
- Rows deep-link via `OPEN_URI` on `lifeos://` (spend → `lifeos://expenses`, renewal → `lifeos://subscription/{id}`, reminder → `lifeos://reminder/{taskId}`).
- Refresh: `updatePeriodMillis: 1800000` (30 min, handles midnight rollover) + `requestWidgetUpdate` on every `hydrateExpenses`/`hydrateSubscriptions`/`hydrateReminders`.
- Code: `widgets/`, `widget-task-handler.tsx`, `index.ts` (entry), `app.json` plugin, `package.json` main.
- Mockups (AI, layout ref): `docs/mockups/widgets/widget-{spend,renewals,reminders,glance,dark}.png`.

---

## 4. Subscription pause/cancel marking

Flag a subscription inactive instead of deleting it, so its history (posted expenses, cost record) survives. Detail: does an inactive subscription still count toward "monthly commitments"? Likely excluded. Schema touch: probably an `inactive_at` nullable column on `subscriptions`.

---

## 5. Snooze reminder from notification

Action button on the reminder notification that re-schedules the same reminder +1 hour or +1 day without opening the app. Touches: `notifications/` (notification actions/response handling) and reminder rescheduling logic.

---

## 6. Month-over-month delta on dashboard

Small line under the MonthTape total comparing this month to last: "₹2,400 more than July" (or less). Screenshot-friendly, matches the quiet-metadata style. All helpers exist; needs `monthTotal` for previous month + a formatted delta.

---

## 7. Past-month expense view

Expense history persists but is only reachable by scrolling the Expenses tab list, and the dashboard chart is locked to the current month (`app/(tabs)/index.tsx` computes from `new Date()`). Add a way to see a specific past month's tape/breakdown — candidates: month navigation arrows on the dashboard tape, or a month picker on the Expenses tab. `expensesForMonth` / `categoryBreakdown` already take arbitrary year/month, so this is mostly UI.

---

## 8. Notification-permission guard

If Android notification permission is off, show a banner on the Reminders tab with a button to open app settings. Without it, reminders silently do nothing. Touches: `notifications/` (permission check helper), `app/(tabs)/reminders.tsx` (banner).

---

## 9. Default reminder presets

Quick chips when adding reminders to a TickTick task: "+1 hour before due" / "+1 day before", computed from the task's `dueAtMs`. Raw datetime picking stays available as the fallback. Touches: reminder add form.

---

## 10. Haptic feedback

Light haptic on add/save/delete actions across forms and destructive confirms. Touches: small utility (Expo Haptics) wired into existing action handlers; keep it subtle.

---

## 11. App icon + splash

Final app icon and splash screen (Fraunces wordmark) instead of Expo defaults. Effectively Phase 6 polish territory.
