import { useEffect, useState } from "react";
import { api, clearToken, getToken, login, register } from "./api";
import {
  DEMO_REPO,
  DEPLOY_CHECKLIST,
  LLM_PROJECT_PROMPT,
  isLikelyHeavyRepo,
  requiresSmallAppConfirmation,
} from "./deployRules";

function BrandIcon() {
  return (
    <div className="brand-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 16V8l8-4 8 4v8l-8 4-8-4z"
          stroke="#6cb6ff"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M12 4v16M4 8l8 4 8-4" stroke="#3ecf8e" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

function Brand({ subtitle }) {
  return (
    <div className="brand">
      <BrandIcon />
      <div>
        <h1>StackPilot</h1>
        {subtitle && <p className="tagline">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status ${status}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function Alert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState(DEMO_REPO);
  const [selectedProject, setSelectedProject] = useState("");
  const [confirmSmallApp, setConfirmSmallApp] = useState(false);
  const [showLlmPrompt, setShowLlmPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authed) return;
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [authed]);

  async function refresh() {
    try {
      setProjects(await api.projects());
      setDeployments(await api.deployments());
      setError("");
    } catch (e) {
      setError(String(e.message));
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") await register(email, password);
      await login(email, password);
      setAuthed(true);
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  function validateRepo(url, requireConfirm) {
    if (isLikelyHeavyRepo(url)) {
      return "This repository looks like a large or complex stack. StackPilot runs on a free Azure Student VM (~1 GiB RAM). Use the demo repo or a minimal single-service project.";
    }
    if (requireConfirm && requiresSmallAppConfirmation(url) && !confirmSmallApp) {
      return "Confirm below that your repo is a minimal app, or use the recommended demo repository.";
    }
    return "";
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    const validation = validateRepo(repoUrl, true);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.createProject(projectName, repoUrl);
      setProjectName("");
      await refresh();
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeploy() {
    if (!selectedProject) {
      setError("Select a project first");
      return;
    }
    const project = projects.find((p) => String(p.id) === String(selectedProject));
    const validation = validateRepo(project?.repo_url || "", true);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.createDeployment(Number(selectedProject));
      await refresh();
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleStop(id) {
    setBusy(true);
    try {
      await api.stopDeployment(id);
      await refresh();
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleRestart(id) {
    setBusy(true);
    try {
      await api.restartDeployment(id);
      await refresh();
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id) {
    if (!window.confirm("Remove this deployment permanently?")) return;
    setBusy(true);
    try {
      await api.deleteDeployment(id);
      await refresh();
    } catch (err) {
      setError(String(err.message));
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearToken();
    setAuthed(false);
  }

  function useDemoRepo() {
    setRepoUrl(DEMO_REPO);
    if (!projectName) setProjectName("goodnotes-demo");
    setConfirmSmallApp(false);
  }

  async function copyLlmPrompt() {
    try {
      await navigator.clipboard.writeText(LLM_PROJECT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  const selected = projects.find((p) => String(p.id) === String(selectedProject));
  const repoNeedsConfirm = requiresSmallAppConfirmation(repoUrl);
  const repoBlocked = isLikelyHeavyRepo(repoUrl);

  const stats = {
    total: deployments.length,
    running: deployments.filter((d) => d.status === "running").length,
    building: deployments.filter((d) => ["building", "pending"].includes(d.status)).length,
    failed: deployments.filter((d) => d.status === "failed").length,
  };

  if (!authed) {
    return (
      <div className="container">
        <div className="hero">
          <Brand subtitle="Cloud-native DevOps platform — deploy Node.js & Python apps from GitHub in one click." />
          <div className="feature-pills">
            <span className="pill">Docker</span>
            <span className="pill">One-click deploy</span>
            <span className="pill">Live logs</span>
            <span className="pill">CI/CD ready</span>
          </div>
        </div>
        <div className="card auth-card">
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <form onSubmit={handleAuth}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@university.edu"
              autoComplete="email"
            />
            <label htmlFor="password">Password (min 8 characters)</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "New user? Register" : "Have an account? Sign in"}
            </button>
          </form>
          <Alert message={error} onDismiss={() => setError("")} />
        </div>
        <p className="footer-note">Built for cloud &amp; DevOps portfolios — Docker, CI/CD, AWS EC2, Nginx.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <Brand subtitle="Deployment dashboard" />
        <button className="secondary" onClick={logout} style={{ width: "auto" }}>
          Logout
        </button>
      </header>

      <Alert message={error} onDismiss={() => setError("")} />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card running">
          <div className="stat-value">{stats.running}</div>
          <div className="stat-label">Running</div>
        </div>
        <div className="stat-card building">
          <div className="stat-value">{stats.building}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-card failed">
          <div className="stat-value">{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div className="banner banner-warn">
        <strong>Student-tier hosting</strong>
        <p>
          StackPilot runs on a free Azure for Students VM with about <strong>1 GiB RAM</strong>.
          Do not deploy large monorepos, database-backed apps, or heavy Docker builds (Next.js,
          multi-service stacks). Builds may hang or affect the platform for everyone.
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>
            <span className="card-icon" aria-hidden="true">
              +
            </span>
            New project
          </h2>
          <div className="banner banner-info">
            <strong>Recommended for testing</strong>
            <p>
              Use{" "}
              <a href={DEMO_REPO} target="_blank" rel="noreferrer">
                goodnotes
              </a>{" "}
              — lightweight notes &amp; todos built for this platform.
            </p>
            <button type="button" className="secondary small" onClick={useDemoRepo}>
              Use demo repo
            </button>
          </div>
          <form onSubmit={handleCreateProject}>
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              placeholder="goodnotes-demo"
            />
            <label htmlFor="repo-url">GitHub URL or sample path</label>
            <input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              placeholder={DEMO_REPO}
              className={repoBlocked ? "input-blocked" : ""}
            />
            <p className="hint warn-label">
              Small single-service repos only — root Dockerfile required. Samples: /samples/node-hello ·
              /samples/python-hello · local PC: C:/Users/you/projects/my-app (set HOST_PROJECTS_PATH in .env)
            </p>
            {repoBlocked && (
              <p className="error inline-error">
                This URL looks too heavy for student-tier hosting. Use the demo repo instead.
              </p>
            )}
            {repoNeedsConfirm && !repoBlocked && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={confirmSmallApp}
                  onChange={(e) => setConfirmSmallApp(e.target.checked)}
                />
                <span>
                  I confirm this is minimal: one Dockerfile at repo root, single service, no database,
                  no heavy frontend build.
                </span>
              </label>
            )}
            <button type="submit" disabled={busy || repoBlocked}>
              Create project
            </button>
          </form>
        </div>

        <div className="card">
          <h2>
            <span className="card-icon" aria-hidden="true">
              ▶
            </span>
            Deploy
          </h2>
          <label htmlFor="project-select">Project</label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {selected && <p className="hint">Will deploy: {selected.repo_url}</p>}
          {projects.length === 0 && (
            <p className="hint">Create a project first, then deploy it here.</p>
          )}
          <button onClick={handleDeploy} disabled={busy || !selectedProject} style={{ marginTop: "0.5rem" }}>
            {busy ? "Deploying…" : "Deploy now"}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>
          <span className="card-icon" aria-hidden="true">
            ✓
          </span>
          Make your project compatible
        </h2>
        <ul className="checklist">
          {DEPLOY_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button
          type="button"
          className="secondary small"
          onClick={() => setShowLlmPrompt((v) => !v)}
        >
          {showLlmPrompt ? "Hide" : "Show"} LLM prompt for a mini deployable project
        </button>
        {showLlmPrompt && (
          <div className="llm-prompt-wrap">
            <button type="button" className="secondary small copy-btn" onClick={copyLlmPrompt}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <pre className="llm-prompt">{LLM_PROJECT_PROMPT}</pre>
          </div>
        )}
      </div>

      <div className="card">
        <h2>
          <span className="card-icon" aria-hidden="true">
            ⬡
          </span>
          Deployments
          {deployments.length > 0 && (
            <span className="hint" style={{ margin: 0, fontWeight: 400 }}>
              ({deployments.length})
            </span>
          )}
        </h2>
        {deployments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              🚀
            </div>
            <p>No deployments yet.</p>
            <p className="hint">Create a project above, then hit Deploy now.</p>
          </div>
        )}
        {deployments.map((d) => (
          <div key={d.id} className="deployment">
            <div className="deployment-head">
              <span className="deployment-id">#{d.id}</span>
              <StatusBadge status={d.status} />
              <div className="deployment-actions">
                {["running", "building", "pending"].includes(d.status) && (
                  <button
                    className="secondary small"
                    onClick={() => handleStop(d.id)}
                    disabled={busy}
                  >
                    {d.status === "running" ? "Stop" : "Cancel"}
                  </button>
                )}
                {["stopped", "failed"].includes(d.status) && (
                  <button
                    className="secondary small"
                    onClick={() => handleRestart(d.id)}
                    disabled={busy}
                  >
                    Restart
                  </button>
                )}
                <button
                  className="secondary small danger-text"
                  onClick={() => handleRemove(d.id)}
                  disabled={busy}
                >
                  Remove
                </button>
              </div>
            </div>
            {d.public_url && d.status === "running" && (
              <p className="deployment-meta">
                Live app:{" "}
                <a href={d.public_url} target="_blank" rel="noreferrer">
                  {d.public_url}
                </a>
              </p>
            )}
            {d.host_port && <p className="hint">Internal port: {d.host_port}</p>}
            {d.logs && <pre className="logs">{d.logs.slice(-3000)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
