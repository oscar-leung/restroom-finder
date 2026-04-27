# Shipping to the App Store & Google Play

Capacitor is already scaffolded in this repo. Capacitor wraps the web app
in a native container — same React code runs on web, iOS, and Android.

---

## Prerequisites

| Thing | Cost | Time |
|---|---|---|
| Apple Developer Program | $99/year | 24–48 h for approval |
| Google Play Console | $25 one-time | 1–3 days for approval |
| Mac with Xcode | free (need a Mac) | 1 h install |
| Android Studio | free | 30 min install |
| App icons & screenshots | free w/ Figma | 2–4 h design |

You can ship **Android first** (faster, cheaper, lower review friction) —
that's often the recommended path for indie devs.

---

## Step-by-step

### 1. Add native platforms (5 min)

```bash
cd ~/restroom-finder
npm run build                 # build the web app into dist/
npx cap add ios               # creates ios/ folder
npx cap add android           # creates android/ folder
npx cap sync                  # copies dist/ into both
```

### 2. Swap to the native Geolocation API (better UX)

The browser's `navigator.geolocation` works inside Capacitor but prompts
via web permissions. For a native feel use `@capacitor/geolocation`
(already installed). Update `src/hooks/useGeolocation.js`:

```js
import { Geolocation } from "@capacitor/geolocation";

const pos = await Geolocation.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 10000,
});
```

This gives you:
- Native iOS "Allow 'Gotta Go' to use your location" prompt
- Better background accuracy
- Access to `watchPosition` for live updates

### 3. Configure permissions

**iOS** — edit `ios/App/App/Info.plist`, add:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Gotta Go uses your location to find the closest restrooms.</string>
```

**Android** — edit `android/app/src/main/AndroidManifest.xml`, add (inside
`<manifest>`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 4. Build and test

```bash
npm run build && npx cap sync
npx cap open ios              # opens Xcode → hit ▶ to run on simulator
npx cap open android          # opens Android Studio → ▶ to run
```

### 5. App Store assets (do this ONCE, reuse for both stores)

- **App icon**: 1024×1024 PNG, no transparency, no rounded corners (they
  round it for you)
- **Screenshots**:
  - iOS: 6.7" (1290×2796) — required. One extra size optional.
  - Android: any phone + tablet, 16:9 or 9:16
- **Short description**: 80 chars (Google Play)
- **Long description**: sell the emergency use case, keyword-dense but
  readable

Example long description (paste & tweak):

> **Find the closest public restroom in under 3 seconds.**
>
> Whether you're traveling, out shopping, or in an emergency, Restroom
> Finder instantly shows the nearest bathroom with walking time and
> one-tap directions. No sign-up, no fluff.
>
> • Closest restroom shown immediately on launch
> • Filter for accessible (wheelchair) and gender-neutral options
> • Works offline for your saved favorites (Pro)
> • Crowdsourced from 30,000+ locations via Refuge Restrooms
>
> Great for travel, shopping, people with IBS / Crohn's, parents with
> kids, and anyone who's ever googled "bathroom near me" in a panic.

### 6. App Store Optimization (ASO) keywords

Target these (high intent, low competition):
- `bathroom finder`, `public restroom`, `toilet near me`
- `accessible bathroom`, `wheelchair toilet`
- `gender neutral bathroom`
- `travel bathroom`, `emergency restroom`

### 7. Submit

**Google Play** (easier, faster):
1. Android Studio → Build → Generate Signed Bundle → upload `.aab`
2. Play Console → Create app → fill out store listing
3. Submit for review → typically 1–3 days

**Apple App Store**:
1. Xcode → Product → Archive → upload to App Store Connect
2. App Store Connect → create app, fill metadata, attach build
3. Submit for review → typically 1–2 days, sometimes rejected once
   (be ready for privacy policy + "what does this app do" questions)

---

## Ongoing releases

After the first ship:

```bash
# Make changes to React code
npm run build && npx cap sync
# iOS: Xcode → Product → Archive → upload
# Android: Studio → Build → Bundle → upload
```

Consider [EAS Build](https://expo.dev/eas) or **fastlane** later to
automate. Not worth it for v1.

---

## Privacy Policy (required by both stores)

You need a hosted privacy policy URL. Easiest route: generate one at
https://app-privacy-policy-generator.firebaseapp.com, put it as
`PRIVACY.md` in this repo, and link to the GitHub raw URL.

Key claims you need to cover:
- You collect location (to find nearby restrooms) — **not stored**
- Analytics collect anonymous usage (if you add GA/Plausible)
- No third-party data sharing beyond ad providers (if/when added)

---

## Revenue hookups for native

Once the native apps are live (see `MONETIZATION.md`):

- **AdMob**: `npm install @capacitor-community/admob` — banner at bottom
- **RevenueCat** for subscriptions: `npm install react-native-purchases`
  (Capacitor-compatible via their plugin)
- **Push Notifications** for re-engagement:
  `npm install @capacitor/push-notifications` — run a weekly "check in
  on a favorite restroom" campaign

---

## Realistic timeline

| Milestone | Weeks from now |
|---|---|
| Web live on Vercel | 0 (do today) |
| Google Play soft launch | 3–4 |
| Apple App Store | 5–6 |
| 1,000 MAU | 3–6 months (depends heavily on marketing) |
| First $100/mo | 4–8 months |
| First $1,000/mo | 12–18 months (if you keep shipping) |

Most apps don't make it to $1k/mo. The ones that do are the ones that
**kept going for 18 months** past the point where most quit.
