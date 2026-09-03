# Google Play listing — Gotta Go

Everything Play Console asks for, pre-written. Package `com.oscarleung.gottago`.
Prerequisite: one-time $25 Google Play developer registration (yours to do —
account creation and payment can't be delegated).

---

## App title (30 char max)

    Gotta Go: Restroom Finder

(25 chars)

## Short description (80 char max)

    The closest public bathroom, instantly. One tap to directions. No signup.

(72 chars)

## Full description (4000 char max)

    You need a bathroom. Not a feed, not an account, not a tutorial.

    Gotta Go opens to one big GO button. Tap it and you get the closest public
    restroom to where you're standing. One more tap opens turn-by-turn
    directions in Google Maps. That's the whole app.

    WHAT MAKES IT DIFFERENT

    Anyone can fix any listing. Most bathroom apps only let you leave a rating,
    so when a restroom gets a keypad lock, changes hours, or closes for good,
    the listing stays wrong forever. In Gotta Go you can update the name, hours,
    accessibility, gender-neutral status, and whether it costs money — on any
    entry, not just ones you added.

    You can also add a restroom from anywhere. No need to be physically standing
    on top of it, which is the rule most apps enforce and the reason their maps
    have holes.

    FILTERS THAT MATTER WHEN IT'S URGENT

    • Accessible — step-free, grab bars, wider stalls
    • Gender-neutral — single-occupancy or all-gender
    • Free — no purchase or customer-only requirement
    • Open now — filtered against posted hours

    ALSO IN THE APP

    • Swipe to skip to the next-nearest if the first one won't work
    • Map view of everything around you
    • Voice control — say "find a bathroom" and go
    • Search anywhere: plan ahead for an address, landmark, or city
    • Larger-text and accessibility mode with bigger buttons and a calmer screen
    • Works offline for places you've already loaded
    • A streak counter and achievements, if you like that sort of thing

    WHERE THE DATA COMES FROM

    Listings are merged and deduplicated from OpenStreetMap and Refuge
    Restrooms, two open community databases. When you add a restroom you can
    optionally push it back to Refuge Restrooms so the open data improves for
    everyone, not just Gotta Go users.

    HONEST LIMITATIONS

    Coverage is strongest in US metro areas and thinner in small towns. Reviews
    are stored on your device for now. It's a young app with a small community
    compared to the big incumbents — the trade is that anyone can correct the
    map instead of just complaining about it.

    PRIVACY

    No account. No sign-up. No ad tracking in the app. Your location is used on
    your device to sort restrooms by distance and is not sold or shared.

    Free to use. There's a tip jar if you want to support development; you
    should never feel you need to.

## Category

    Maps & Navigation
    (alternate: Travel & Local)

## Tags / keywords

    restroom finder, bathroom finder, public toilet, toilet finder,
    accessible restroom, gender neutral bathroom, travel

## Content rating questionnaire — expected answers

    Violence: none · Sexual content: none · Profanity: none
    Controlled substances: none · User-generated content: YES
      → Users can add and edit restroom listings and leave reviews.
      → Expected rating: Everyone / PEGI 3.

## Data safety form — expected answers

    Location (approximate + precise): collected, NOT shared.
      Purpose: app functionality (sorting restrooms by distance).
      Processed ephemerally / on-device where possible. Not required to use
      the app — a user can search an address instead of granting location.
    Personal info: none collected. No account system.
    Device IDs: none.
    Data deletion: no account exists, so nothing to delete server-side.

## Privacy policy

    REQUIRED by Play before publishing. Not yet written — this is a gap.
    Host at: https://oscar-leung.github.io/restroom-finder/privacy.html
    Must cover: location use, the optional Refuge Restrooms submission,
    AdSense on the guides pages (not in the app), and the tip jar.

## Graphics checklist

    • App icon — 512×512 PNG, 32-bit, no alpha. Source: public/icon-512.svg
    • Feature graphic — 1024×500 PNG. Required.
    • Phone screenshots — 2 minimum, 8 max, 16:9 or 9:16, min 320px.
      Captured from the emulator (1080×2400) and stored in store-assets/:
        1. Main GO screen with a result — the whole pitch in one image
        2. Filters row (accessible / gender-neutral / free / open now)
        3. Map view
        4. Add/edit a restroom
      Suggested caption overlays (optional but they lift conversion):
        1. "One tap. Closest bathroom."
        2. "Filter for what you actually need."
        3. "See everything around you."
        4. "Found it wrong? Fix it yourself."

## Release track plan

    1. Internal testing — sideload/APK, verify on a real device
    2. Closed testing — Play requires a period of closed testing with real
       testers before a personal developer account can go to production.
       Recruit testers early; this is the long pole, not the build.
    3. Production

## Build commands

    # Debug APK (works today)
    VITE_BASE=/ npm run build && npx cap sync android
    cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug

    # Release AAB (what Play wants) — needs a signing keystore first
    cd android && ./gradlew bundleRelease

    Signing: generate an upload keystore, keep it OUT of git, and store the
    passwords in android/keystore.properties (gitignored). Losing this file
    means you can never update the app under the same listing.
