# Polish Phase — Checklist

Status: all code items done. Device-only items remain (bottom section).
Account modeling (#2) deferred.

## Loading
- [x] `ready` flag in every tab/detail: tabs show `BootLoading` until their store is `ready`; detail screens can trust data since providers gate on hydrate.
- [x] `db/provider.native.tsx` — `BootLoading`/`BootError` with retry for open + migration + hydrate failure; children render only after `hydrateApp()` completes.
- [x] `db/provider.tsx` — web gates children behind a `BootLoading` spinner until localStorage hydration finishes.
- [x] `app/(tabs)/reminders.tsx` — `Refresh lists` disables while syncing and shows `ButtonSpinner`.

## Empty States
- [x] Home bare-text empties → `EmptyState` (`inline` variant inside cards: renewals, reminders; card variant: recent spend).
- [x] All six "not found" screens → shared `components/not-found.tsx` (`EmptyState` + Go back): expense/[id], subscription/[id], reminder/[taskId], reminder/new, account/[id], account/provider/[id].
- [x] Verified stale deep link (`/subscription/999`) lands on NotFound with working Go back (web route equivalent of `lifeos://subscription/999`).

## Error States
- [x] DB open/migration/hydrate errors all offer retry (native provider; migration retry remounts via key bump).
- [x] TickTick errors surface via `FormControlError` in Settings; client maps 401/403 → "rejected this token, paste a fresh one", 5xx → friendly copy, network failure → "Could not reach TickTick".
- [x] `subscription/new` validates renewalDate with `isValidIsoDate` before save.
- [x] `reminder/new` validates date/time format and requires fireAt in the future (scheduleLocalReminder's null path is unreachable after validation).
- [x] AlertDialog confirms: subscription delete, account delete, category remove (expense already had one). Category copy matches real behavior ("become Uncategorized").

## Forms
- [x] Native `DateTimePickerAndroid` for dates/times via `components/date-input.tsx` (`DateInput`/`TimeInput`); platform-guarded require keeps it out of web bundles; web fallback keeps text entry with numeric keyboard + maxLength.
- [x] `FormControl isInvalid` + error text on amount (new/edit expense), name/cost/renewal (subscription), date/time (reminder), token (TickTick), category name.
- [x] Save buttons disabled + spinner/label swap while awaiting create/update everywhere.
- [x] `account/new` rejects `isIdentity=false && isService=false`.
- [x] Duplicate category guard (case-insensitive) in Settings.
- [x] Chip padding bumped to px-4/py-2.5 + hitSlop 8; Remove/Unlink pressables hitSlop 12 + roles.
- [x] `tapSuccess` on successful saves; `tapLight` on validation error; `tapWarning` on destructive.

## A11y
- [x] `accessibilityRole="button"` + labels on list rows, lookup card, month chevrons, settings gear; Fab labels ("Add expense" etc.).
- [x] `accessibilityState={{ selected }}` on Chips; disabled state on next-month chevron.
- [x] hitSlop 8 on chips, 12 on destructive text presses, 8 on provider headers.
- [x] InputFields labeled: amount, cost, provider, identifier, token, category name, service link; DateInput/TimeInput expose label + value + hint.

## Navigation / Chrome
- [x] Widget URIs verified against routes by grep: `lifeos://expenses`, `lifeos://subscriptions`, `lifeos://reminders`, `lifeos://subscription/{id}`, `lifeos://reminder/{taskId}` all match router paths; stale ids land on NotFound.
- [x] Deletes go through dialogs then `router.back()` to the list.

## Device-Only Verification (still open)
- [ ] Notifications fire on real device.
- [ ] Widgets render/light-dark/refresh after hydrate on device.
- [ ] TickTick token + invalid-token UI on device; native date/time pickers feel right.
