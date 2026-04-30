# Capacitor Native Build Runbook

This is the exact step-by-step to wrap Gotta Go as native iOS + Android
apps and ship them to the App Store and Play Store. Capacitor is
already installed; this runbook covers what's between "I have the dev
accounts" and "the apps are submitted."

## Prerequisites (Oscar — you must do these)

- [ ] **Apple Developer Program** — $99/year — https://developer.apple.com/programs/
  - Wait 24–48h for verification
  - Need: a real Apple ID, real address, possible D-U-N-S Number for
    business listing (for individual you can skip)
- [ ] **Google Play Console** — $25 one-time — https://play.google.com/console/signup
  - Verifies in ~24h
- [ ] **Xcode** installed (macOS only) — needed to build iOS
- [ ] **Android Studio** installed — needed to build Android
- [ ] **CocoaPods** for iOS deps: `brew install cocoapods`
- [ ] **JDK 17+** for Android: `brew install --cask temurin`

## Step 1: Add the iOS + Android platforms

```bash
cd ~/restroom-finder
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

This creates `ios/` and `android/` directories. They're gitignored.

## Step 2: Bundle splash + icons

```bash
# Install icon-asset generator if not already
npm install --save-dev @capacitor/assets

# We generate from the existing icon-512.svg + a splash.png
# (a 2732x2732 centered logo on the brand background)
npx capacitor-assets generate
```

If you don't have a `splash.png` yet, create a 2732×2732 PNG with the
GG wordmark centered on `#0f0a1f` background. Save to
`assets/splash.png` and re-run.

## Step 3: iOS — open in Xcode and build

```bash
npx cap open ios
```

In Xcode:
1. Select the project root (left sidebar)
2. **Signing & Capabilities** → set Team to your Apple Developer team
3. Set Bundle Identifier to `com.oscarleung.gottago` (already set in
   `capacitor.config.json`)
4. Add capability: **Background Modes** → tick "Location updates" if
   we ship the background-geo feature later
5. Edit `ios/App/App/Info.plist` to add the permission strings:
   - `NSLocationWhenInUseUsageDescription`: "Gotta Go uses your
     location to show the closest bathroom."
   - `NSCameraUsageDescription`: "Gotta Go uses the camera so you can
     attach photos to bathroom listings."
6. **Cmd+R** to run on a simulator. Test the GO button + maps.
7. **Product → Archive** to build a release. Distribute to App Store
   Connect.

## Step 4: Android — open in Android Studio and build

```bash
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync. Coffee.
2. **Build → Generate Signed Bundle/APK** → AAB → create a keystore
   the first time (write the password down somewhere not the chat)
3. Upload the AAB to Play Console → Production track

## Step 5: App Store Connect setup

- Create a new app under **My Apps → +** → name "Gotta Go"
- Pricing: Free
- Category: Travel (primary), Health & Fitness (secondary)
- Privacy:
  - Data Linked to You: Location (for GO), Diagnostics
  - Data Used to Track You: None (we don't fingerprint)
- Screenshots needed (use a 6.7" iPhone simulator):
  - Hero card on closest bathroom
  - Fullscreen map with route polyline
  - Add a bathroom modal with share-upstream toggle
  - Achievements list
  - Cyber theme on the hero (mode toggle as a screen)
- Review notes: emphasize that location is on-device, no account
  needed, privacy-by-default

## Step 6: Play Console setup

- Create a new app → name "Gotta Go"
- Pricing: Free
- Content rating: complete the questionnaire (E for Everyone)
- Target audience: 13+ (location use)
- Privacy Policy URL: https://oscar-leung.github.io/restroom-finder/privacy.html
  (TODO: write this — see `privacy-template.html`)
- Data safety: same as App Store privacy section above
- Screenshots: 1080×1920 PNGs, same shots as iOS

## Step 7: Update the live PWA to direct users to the native apps

When the apps go live, update `public/about.html` with App Store +
Play Store badges below the "Open the app" CTA:

```html
<a href="https://apps.apple.com/us/app/gotta-go/idXXXXXXXXX">
  <img src="/restroom-finder/badge-app-store.svg" alt="Download on the App Store" />
</a>
<a href="https://play.google.com/store/apps/details?id=com.oscarleung.gottago">
  <img src="/restroom-finder/badge-play-store.png" alt="Get it on Google Play" />
</a>
```

## What I (Claude) can do once you have dev accounts

- Run `cap add ios` + `cap sync` and verify the iOS project compiles
  (against a simulator)
- Same for Android
- Generate icons + splash from your `icon-512.svg`
- Write the privacy policy as a static HTML page
- Help draft App Store Connect copy (description, keywords, screenshots
  copy)
- Walk you through the signing + upload flow step-by-step

## What only you can do

- Sign in to Xcode with your Apple Developer credentials
- Sign in to Play Console
- Generate the Android keystore (the password must NEVER touch the
  chat — generate it locally with a password manager)
- Submit + respond to reviewer feedback
- Pay the dev account fees
