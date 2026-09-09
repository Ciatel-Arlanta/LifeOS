# LifeOS — Roadmap & Checklist

This checklist tracks future enhancements, feature requests, and polish items to be ideated and implemented in future sessions.

## 📋 Backlog / Checklist

- [x] **Light / Dark Mode Toggle in Settings**
  - Settings → Appearance: System / Light / Dark.
  - Root Stack, tab bar and Gluestack provider all follow the choice; `system` follows the phone.
  - Persisted in `lifeos.theme-mode` (kv-store on Android, `localStorage` on web).

- [x] **Haptic Feedback**
  - Lives on the `Fab` primitive, so every FAB taps.
  - Also: dashboard "Add expense", reminder "Add reminder", notification-action snoozes,
    theme and lead-time chips — on top of the save / destructive taps already in place.

- [x] **Subscription Renewal Reminders**
  - 09:00 notification, Off / 1 / 2 / 3 / 7 days before renewal (default 2), on the
    `lifeos-renewals-v1` channel. Configured in Settings → Notifications.
  - Rebuilt on every subscription hydrate; paused subscriptions never notify.

- [x] **Data Export & Import**
  - Settings → Backup. JSON export/import of expenses, subscriptions, categories and
    accounts with ids intact, plus a CSV export of expenses for spreadsheets.
  - Import replaces everything and asks first. TickTick refs and reminder schedules are
    not included — they re-sync.

**Device verification still owed** for all four: notifications firing, the Storage Access
Framework export, the file-picker import, and dark mode on a real Android build.

---

## 💡 Future Ideation & Exploration

- Quick-add parsing / natural language input for expenses
- Biometric lock (Fingerprint / Face Unlock) for Accounts tab
- Home screen glance widgets (via `react-native-android-widget`)
- Monthly category breakdown & spending charts
- Widgets currently read the light palette only — teach them the theme preference
