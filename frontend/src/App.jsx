import { useEffect, useState } from "react";
import { api, clearToken, getToken, login, register } from "./api";
import {
  DEMO_REPO,
  DEPLOY_CHECKLIST,
  LLM_PROJECT_PROMPT,
  isLikelyHeavyRepo,
  requiresSmallAppConfirmation,
} from "./deployRules";

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

  const selected = projects.find((p) => String(p.id) === String(selectedProject));
  const repoNeedsConfirm = requiresSmallAppConfirmation(repoUrl);
  const repoBlocked = isLikelyHeavyRepo(repoUrl);

  if (!authed) {
    return (
      <div className="container">
        <div className="hero">
          <h1>StackPilot</h1>
          <p className="tagline">
            Cloud-native DevOps platform — deploy Node.js &amp; Python apps from GitHub in one click.
          </p>
        </div>
        <div className="card">
          <form onSubmit={handleAuth}>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@university.edu"
            />
            <label>Password (min 8 characters)</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
            />
            <button type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "New user? Register" : "Have an account? Login"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
        <p className="footer-note">Built for cloud &amp; DevOps portfolios — Docker, CI/CD, AWS EC2, Nginx.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>StackPilot</h1>
          <p className="tagline">Deployment dashboard</p>
        </div>
        <button className="secondary" onClick={logout} style={{ width: "auto" }}>
          Logout
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="banner banner-warn">
        <strong>Student-tier hosting</strong>
        <p>
          StackPilot runs on a free Azure for Students VM with about <strong>1 GiB RAM</strong>.
          Do not deploy large monorepos, database-backed apps, or heavy Docker builds (Next.js,
          multi-service stacks). Builds may hang or affect the platform for everyone.
        </p>
      </div>

      <div className="card">
        <h2>New project</h2>
        <div className="banner banner-info">
          <strong>Recommended for testing</strong>
          <p>
            Use{" "}
            <a href={DEMO_REPO} target="_blank" rel="noreferrer">
              {DEMO_REPO}
            </a>{" "}
            — lightweight notes &amp; todos built for this platform.
          </p>
          <button type="button" className="secondary small" onClick={useDemoRepo}>
            Use demo repo
          </button>
        </div>
        <form onSubmit={handleCreateProject}>
          <label>Project name</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            placeholder="goodnotes-demo"
          />
          <label>GitHub URL or sample path</label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            placeholder={DEMO_REPO}
            className={repoBlocked ? "input-blocked" : ""}
          />
          <p className="hint warn-label">
            Small single-service repos only — root Dockerfile required. Samples: /samples/node-hello ·
            /samples/python-hello
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
        <h2>Make your project compatible</h2>
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
        {showLlmPrompt && <pre className="llm-prompt">{LLM_PROJECT_PROMPT}</pre>}
      </div>

      <div className="card">
        <h2>Deploy</h2>
        <label>Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.repo_url}
            </option>
          ))}
        </select>
        {selected && <p className="hint">Will deploy: {selected.repo_url}</p>}
        <button
          onClick={handleDeploy}
          disabled={busy || !selectedProject}
          style={{ marginTop: "1rem" }}
        >
          {busy ? "Deploying…" : "Deploy now"}
        </button>
      </div>

      <div className="card">
        <h2>Deployments</h2>
        {deployments.length === 0 && <p>No deployments yet. Create a project and deploy.</p>}
        {deployments.map((d) => (
          <div key={d.id} className="deployment">
            <div className="deployment-head">
              <strong>#{d.id}</strong>
              <span className={`status ${d.status}`}>{d.status}</span>
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
            {d.public_url && d.status === "running" && (
              <p>
                Live app:{" "}
                <a href={d.public_url} target="_blank" rel="noreferrer">
                  {d.public_url}
                </a>
              </p>
            )}
            {d.host_port && <p className="hint">Internal port: {d.host_port}</p>}
            {d.logs && (
              <pre className="logs">{d.logs.slice(-3000)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
