export const DEMO_REPO = "https://github.com/shivin4/goodnotes.git";

export const RECOMMENDED_HINT =
  "Try the demo repo first: https://github.com/shivin4/goodnotes.git";

const HEAVY_PATTERNS = [
  /next\.?js/i,
  /nuxt/i,
  /angular/i,
  /microservice/i,
  /monorepo/i,
  /turborepo/i,
  /kubernetes/i,
  /\bk8s\b/i,
  /spring-?boot/i,
  /django/i,
  /laravel/i,
  /postgres/i,
  /mongodb/i,
  /redis/i,
  /elasticsearch/i,
  /terraform/i,
  /machine-?learning/i,
  /pytorch/i,
  /tensorflow/i,
  /full-?stack/i,
  /enterprise/i,
];

export function isRecommendedRepo(url) {
  const u = (url || "").trim().toLowerCase();
  return (
    u.includes("goodnotes") ||
    u.includes("node-hello") ||
    u.includes("python-hello") ||
    u.startsWith("/samples/")
  );
}

export function isLikelyHeavyRepo(url) {
  const u = (url || "").trim();
  if (!u || isRecommendedRepo(u)) return false;
  return HEAVY_PATTERNS.some((p) => p.test(u));
}

export function requiresSmallAppConfirmation(url) {
  const u = (url || "").trim();
  if (!u.startsWith("http")) return false;
  return !isRecommendedRepo(u);
}

export const LLM_PROJECT_PROMPT = `Build a minimal Node.js web app deployable on StackPilot (mini PaaS on a 1 GiB Azure VM).

Requirements:
- Single repo, Dockerfile at root, EXPOSE 3000
- Express server on 0.0.0.0:3000
- No database (use JSON files or in-memory data)
- No React/Vite/Next.js build step — use plain HTML/CSS/JS in a public/ folder OR a tiny JSON API only
- One npm install in Docker (express only if possible)
- Include GET /api/health
- API routes use paths like /api/... (relative to app root, not hard-coded host)
- Frontend fetch calls must work when app is served under a subpath like /apps/5/ (use relative URLs or detect base path from window.location)

Example compatible apps: notes app, todo list, counter, hello API, markdown viewer.

Do NOT use: PostgreSQL, Redis, multi-stage React builds, microservices, Kubernetes, or heavy ML libraries.`;

export const DEPLOY_CHECKLIST = [
  "Public GitHub repo with Dockerfile at the repository root",
  "EXPOSE 3000 or 8000 — app listens on 0.0.0.0 on the same port",
  "Single service only — no separate database container",
  "Small build: avoid React/Vite/Next.js multi-stage npm builds on 1 GiB RAM",
  "Use relative API paths if the UI is served under /apps/<id>/",
];
