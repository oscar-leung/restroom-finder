# iOS (Capacitor)

Scaffolded and configured — `Info.plist` carries the location permission
string, and the web app syncs from `dist/` via `npx cap sync ios`.

**Build requirement:** Capacitor 8 distributes its iOS runtime as a binary
xcframework built with a recent Swift toolchain. Compiling this project
needs **Xcode 16+** (which itself needs macOS 14.5 or newer). On Xcode
15.x the build fails with misleading errors like `CAPPluginCall has no
member 'reject'` — that's the binary-module incompatibility, not a code
bug.

Once Xcode is updated:

    VITE_BASE=/ npm run build
    npx cap sync ios
    npx cap open ios   # then run on a simulator — no paid account needed

The $99/yr Apple Developer enrollment is only needed for TestFlight and
App Store distribution (see LAUNCH_CHECKLIST.md step 4).
