# Production Authentication Recovery Implementation Plan

> **For Codex:** Execute this plan on `codex/restore-production-updates` with TDD and verify the canonical Vercel alias before completion.

**Goal:** Restore production login at `https://vantage-h1.vercel.app/` using the user-provided shared credentials, while leaving both login fields empty by default and keeping the password out of browser-delivered code.

**Architecture:** Add a same-origin Vercel Function at `/api/auth` that validates credentials from encrypted Vercel environment variables and issues a short-lived, signed, HttpOnly session cookie. Add a browser-runtime adapter for that endpoint while retaining the existing Supabase implementation as an optional mode. In server-session mode, report content falls back to the existing browser-local content adapter so the presentation remains usable even though the former Supabase project is unavailable.

**Tech Stack:** Node.js/Vercel Functions, Web Fetch API, Node crypto, vanilla browser runtime, Node test runner scripts, Vercel CLI.

---

### Task 1: Lock the new authentication contract with failing tests

**Files:**
- Create: `tests/vantage-auth-function.test.mjs`
- Modify: `tests/vantage-browser-runtime.test.mjs`
- Modify: `tests/check-h1-supabase-editor-contract.mjs`
- Modify: `tests/check-h1-login-preload-autoplay.mjs`
- Modify: `tests/check-h1-login-figma-visual.mjs`

1. Test successful and failed server-side credential validation, signed Cookie restoration, cookie security attributes, and fail-closed missing configuration.
2. Test the browser server-session adapter with mocked fetch responses.
3. Change login-page contracts to require empty default values and prohibit browser-visible credentials.
4. Run targeted tests and confirm they fail for the expected missing implementation/default-value reasons.

### Task 2: Implement server-side session authentication

**Files:**
- Create: `api/auth.js`
- Modify: `src/vantage-browser-runtime.mjs`
- Modify: `scripts/build-production.mjs`
- Modify: `vercel.json`

1. Implement constant-time credential comparison and HMAC-signed, expiring HttpOnly cookies.
2. Implement POST login, GET session restoration, DELETE logout, no-store responses, and same-origin enforcement.
3. Add a server-session browser client and route production auth through `/api/auth`.
4. Preserve optional Supabase mode and local-development behavior.
5. Remove client-side login credentials from generated runtime configuration.

### Task 3: Make every login form blank by default

**Files:**
- Modify: `previews/vantage-h1-immersive.html`
- Modify: `index.html`

1. Remove populated account and password values from the immersive shell.
2. Initialize the legacy/root React login form with empty strings as well.
3. Keep autocomplete semantics and keyboard submission behavior intact.

### Task 4: Verify locally and review the diff

**Files:**
- Modify: `package.json`
- Modify: `tests/build-artifact-contract.test.mjs`

1. Add the auth-function test to the test suite.
2. Run targeted tests, full `npm test`, and a production build with no Supabase variables.
3. Inspect `dist/runtime-config.js` to confirm it contains neither supplied credential.
4. Run `vercel build --prod` to prove the static output and function package together.
5. Review the final diff and confirm only intended files changed.

### Task 5: Commit, publish configuration, deploy, and verify production

1. Commit on `codex/restore-production-updates` and push that branch.
2. Set `VANTAGE_LOGIN_USERNAME`, `VANTAGE_LOGIN_PASSWORD`, and a random `VANTAGE_SESSION_SECRET` for Production without logging secret values.
3. Deploy to production and ensure `vantage-h1.vercel.app` aliases the new deployment.
4. Verify Vercel reports `READY` and the deployment commit SHA equals the new Git commit.
5. Run a real browser smoke test: inputs initially empty, wrong credentials rejected, supplied credentials accepted, report opens, and no password appears in fetched client assets.
