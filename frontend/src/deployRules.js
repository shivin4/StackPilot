export const EXAMPLE_REPOS = [
  {
    id: "goodnotes",
    name: "goodnotes",
    url: "https://github.com/shivin4/goodnotes.git",
    blurb: "lightweight notes & todos",
  },
  {
    id: "recipe-box",
    name: "Recipe-Box",
    url: "https://github.com/shivin4/Recipe-Box.git",
    blurb: "simple recipe manager",
  },
];

export const DEMO_REPO = EXAMPLE_REPOS[0].url;

export const RECOMMENDED_HINT =
  "Try a demo repo: goodnotes or Recipe-Box (links below).";

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

const WINDOWS_PATH = /^[A-Za-z]:[/\\]/;

export function isLocalPath(url) {
  const u = (url || "").trim();
  if (!u) return false;
  if (u.startsWith("/samples/") || u === "/samples/node-hello" || u === "/samples/python-hello") {
    return true;
  }
  if (WINDOWS_PATH.test(u)) return true;
  if (u.startsWith("./") || u.startsWith("../")) return true;
  return u.startsWith("/") && !u.startsWith("http");
}

export function isRecommendedRepo(url) {
  const u = (url || "").trim().toLowerCase();
  return (
    u.includes("goodnotes") ||
    u.includes("recipe-box") ||
    u.includes("node-hello") ||
    u.includes("python-hello") ||
    u.startsWith("/samples/")
  );
}

export function isLikelyHeavyRepo(url) {
  const u = (url || "").trim();
  if (!u || isLocalPath(u) || isRecommendedRepo(u)) return false;
  return HEAVY_PATTERNS.some((p) => p.test(u));
}

export function requiresSmallAppConfirmation(url) {
  const u = (url || "").trim();
  if (isLocalPath(u)) return false;
  if (!u.startsWith("http")) return false;
  return !isRecommendedRepo(u);
}

export function rejectLocalRepo(url) {
  if (isLocalPath(url)) {
    return "Only public GitHub HTTPS URLs are supported (https://github.com/user/repo.git).";
  }
  if (url && url.trim() && !url.trim().startsWith("http")) {
    return "Only public GitHub HTTPS URLs are supported (https://github.com/user/repo.git).";
  }
  return "";
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

Example compatible apps: notes app, todo list, recipe box, counter, hello API.

Do NOT use: PostgreSQL, Redis, multi-stage React builds, microservices, Kubernetes, or heavy ML libraries.`;

export const DEPLOY_CHECKLIST = [
  "Public GitHub repo with Dockerfile at the repository root",
  "HTTPS URL format: https://github.com/username/repo.git",
  "EXPOSE 3000 or 8000 — app listens on 0.0.0.0 on the same port",
  "Single service only — no separate database container",
  "Small build: avoid React/Vite/Next.js multi-stage npm builds on 1 GiB RAM",
  "Use relative API paths if the UI is served under /apps/<id>/",
];
