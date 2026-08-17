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

## Build an APK

Sideloadable release APK. JS is bundled into the package, so the phone does not need Metro.

### Local (this machine)

Needs [Android Studio](https://developer.android.com/studio) once, so the Android SDK and a JDK are available. The script uses Android Studio's bundled JBR and `%LOCALAPPDATA%\Android\Sdk` when `JAVA_HOME` / `ANDROID_HOME` are unset.

On Windows the script shortens Ninja object paths: it copies `react-native-gesture-handler` to `C:\g` and writes CMake output to `C:\c`. Those folders are local build helpers, not part of the app.

The local APK is **arm64-v8a** (normal phones). It will not run on an x86 emulator.

```bash
bun install
bun run build:apk
```

Output: `dist/LifeOS-0.1.0.apk`.

Install on the phone:

1. Copy the APK over USB, Drive, or Nearby Share.
2. On Android, allow install from that source if asked.
3. Open the APK and install.

The release APK is signed with the Android debug keystore so you can install it without extra key setup. Uninstall an older debug-signed build of the same package if Android refuses the update.

To rebuild after code changes, run `bun run build:apk` again. `android/` is generated and gitignored.

### EAS cloud (optional)

If you would rather not install the Android SDK:

```bash
bunx eas-cli login
bunx eas-cli init
bunx eas-cli build -p android --profile preview
```

The `preview` profile in `eas.json` produces an APK. Download the artifact from the Expo build page.

## TickTick API token

LifeOS talks to the [TickTick Open API](https://developer.ticktick.com/) (`https://api.ticktick.com/open/v1`). Paste an **OAuth access token** in **Settings → TickTick**. LifeOS only reads incomplete tasks. It never completes or edits them.

TickTick web **Settings → Account → API Token** is a different token (MCP). Do not paste that one.

### 1. Create a developer app

1. Sign in at [developer.ticktick.com/manage](https://developer.ticktick.com/manage).
2. Create an app. Name it anything, for example `LifeOS`.
3. Set the OAuth redirect URI to exactly:

   `http://127.0.0.1:8080/callback`

4. Save. Copy the **Client ID** and **Client Secret**.

### 2. Authorize and copy the code

Open this URL in a browser. Replace `YOUR_CLIENT_ID`:

```
https://ticktick.com/oauth/authorize?scope=tasks:read&client_id=YOUR_CLIENT_ID&state=lifeos&redirect_uri=http://127.0.0.1:8080/callback&response_type=code
```

Approve access. The browser will try to open `http://127.0.0.1:8080/callback?code=...`. The page can fail to load. That is fine. Copy the `code` query value from the address bar.

The code is single-use and expires quickly. Exchange it in the next step right away.

### 3. Exchange the code for an access token

PowerShell:

```powershell
$clientId = "YOUR_CLIENT_ID"
$clientSecret = "YOUR_CLIENT_SECRET"
$code = "THE_CODE_FROM_THE_URL"
$redirect = "http://127.0.0.1:8080/callback"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${clientId}:${clientSecret}"))

curl.exe -s -X POST "https://ticktick.com/oauth/token" `
  -H "Authorization: Basic $basic" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "grant_type=authorization_code&code=$code&redirect_uri=$redirect&scope=tasks:read"
```

The JSON includes `access_token`. Copy that string.

### 4. Paste it into LifeOS

1. Open LifeOS → **Settings → TickTick**.
2. Paste the access token.
3. Tap **Connect TickTick**.

The token stays on this device (SecureStore on Android). LifeOS does not run the OAuth browser flow or refresh tokens yet. If connect fails later, mint a new access token with the same app and paste it again.

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
