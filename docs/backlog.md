# Backlog — ideas for later

Not scheduled, not designed yet. Logged here so they aren't lost. Implement only when explicitly picked up.

---

## Open

### Account Manager — rethink account/identity-provider modeling

Current Account Manager (Module 4 in `Plan.md`) needs more thought on how accounts and identity providers relate to each other. Specifics TBD — user wants to discuss the model before any implementation.

Open questions to raise when this gets picked up:

- How providers, accounts, and identities are structured relative to each other
- Whether the current schema (`providers` / `accounts` / services / account-service links) still fits

Do not implement until the user has walked through the redesign.

---

## Done

| Item | When | Merge commit |
|---|---|---|
| Reminder notification sound (custom chime, channel v3) | 2026-08-26 | `40e6f04` |
| Home-screen widgets (Spend/Renewals/Reminders/Glance) | 2026-08-25 | `8604740` |
| Subscription pause/cancel marking (`inactive_at`, excluded from auto-posting) | | `ebb6175` |
| Snooze reminder from notification actions | | `05ab144` |
| Month-over-month delta on dashboard tape | | `d6394ec` |
| Past-month expense view (tape month navigation) | | `a17013c` |
| Notification-permission guard banner on Reminders tab | | `6606214` |
| Default reminder presets (+1h/+1d before due) | | `6747790` |
| Haptic feedback on save/destructive actions | | `45bc2e3` |
| App icon, adaptive icon, splash (v0.2.0) | | `bb06b7e` |

Details for completed items live in their merge commits.
