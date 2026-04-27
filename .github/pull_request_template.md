## What
<!-- 1-2 sentences. The "you'll see this in git log" version. -->

## Why
<!-- The user/business reason this exists. -->

## Screenshots / video
<!-- Drag in before/after for any UI change. Skip if backend-only. -->

## Test plan
- [ ] `npm run dev` and click through the changed surface
- [ ] PR preview build is green (see auto-comment below)
- [ ] If touching analytics, verified the event fires in dev with
      `window.gtag` console logs

## Feature-flag / A/B
- [ ] Behind a flag in `src/utils/featureFlags.js`?
- [ ] If A/B: variant defined, GA4 `experiment_view` will fire,
      success metric agreed up front
- [ ] Rollout plan (e.g. 10% → 50% → 100%):

## Rollback plan
<!-- If this breaks production, what's the 30-second revert? -->

## Checklist
- [ ] Lint passes
- [ ] No new console errors
- [ ] No `console.log` left in committed code
- [ ] `STATUS.md` updated if user-facing change
- [ ] No secrets committed (run `git diff --cached | grep -i 'api\\|key\\|secret\\|token'`)
