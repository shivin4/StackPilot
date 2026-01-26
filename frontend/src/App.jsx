import { useEffect, useState } from "react";
import { api, clearToken, getToken, login, register } from "./api";

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
  const [repoUrl, setRepoUrl] = useState("/samples/node-hello");
  const [selectedProject, setSelectedProject] = useState("");

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

  async function handleCreateProject(e) {
    e.preventDefault();
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

  function logout() {
    clearToken();
    setAuthed(false);
  }

  const selected = projects.find((p) => String(p.id) === String(selectedProject));

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

      <div className="card">
        <h2>New project</h2>
        <form onSubmit={handleCreateProject}>
          <label>Project name</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            placeholder="my-api"
          />
          <label>GitHub URL or sample path</label>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            placeholder="/samples/node-hello or https://github.com/user/repo"
          />
          <p className="hint">Samples: /samples/node-hello · /samples/python-hello</p>
          <button type="submit" disabled={busy}>
            Create project
          </button>
        </form>
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
              {d.status === "running" && (
                <button
                  className="secondary small"
                  onClick={() => handleStop(d.id)}
                  disabled={busy}
                >
                  Stop
                </button>
              )}
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
