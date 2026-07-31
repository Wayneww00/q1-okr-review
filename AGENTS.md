# Project deployment rules

- The canonical production URL is `https://vantage-h1.vercel.app/`.
- Any user-requested production deployment must make this exact URL resolve to the new deployment.
- Do not use `https://vantage-h1-review-2026.vercel.app/` or a unique Vercel deployment URL as the final delivery link.
- After every production deployment, verify `vantage-h1.vercel.app` is `READY` and its deployment commit SHA matches the intended Git commit before reporting success.
- A `READY` deployment is not sufficient if only another alias points to it.
- Do not initiate a deployment unless the user has requested one; when deployment is requested, the canonical URL above is the required target.

# Canonical iteration branch

- The canonical branch for all future iterations and production releases is `codex/restore-production-updates`.
- Before editing, committing, pushing, or deploying, verify that the work will land on `codex/restore-production-updates`.
- Do not use `main`, `codex/pages-a`, or another feature branch as a production source unless the user explicitly changes this rule.
