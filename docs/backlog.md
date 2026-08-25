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

Add widgets (Android/iOS home-screen widgets) surfacing LifeOS info at a glance — candidates: upcoming reminders, recent expenses, subscription renewals due soon. No decisions yet on which widgets or platform scope.

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
