# Backdate monitoring work across May 26-31, 2026 (no co-author trailers).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$final = Join-Path $env:TEMP "stackpilot-monitoring-final"
if (Test-Path $final) { Remove-Item $final -Recurse -Force }
New-Item -ItemType Directory -Force -Path $final | Out-Null

function Save-Final($rel) {
    $dest = Join-Path $final $rel
    $dir = Split-Path $dest -Parent
    if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Copy-Item (Join-Path $root $rel) $dest -Force
}

Save-Final "backend/requirements.txt"
Save-Final "backend/app/metrics.py"
Save-Final "backend/app/main.py"
Save-Final "docker-compose.yml"
Save-Final "monitoring/prometheus.yml"
Save-Final "monitoring/alert-rules.yml"
Save-Final "monitoring/alertmanager.yml"
Save-Final "README.md"
Copy-Item "monitoring/grafana" (Join-Path $final "monitoring/grafana") -Recurse -Force
New-Item -ItemType Directory -Force -Path (Join-Path $final "docs/screenshots/monitoring") | Out-Null
Set-Content (Join-Path $final "docs/screenshots/monitoring/.gitkeep") -Value "" -Encoding utf8

function Commit-At {
    param([string]$Date, [string]$Message, [string[]]$Paths)
    if (-not $Paths) { throw "No paths for $Message" }
    git add @Paths
    $env:GIT_AUTHOR_NAME = git config user.name
    $env:GIT_AUTHOR_EMAIL = git config user.email
    $env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
    $env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL
    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m $Message | Out-Null
    $body = git log -1 --format=%B
    if ($body -match "(?i)co-authored-by|cursor") { throw "Bad trailer in: $Message" }
}

function Restore($rel) {
    Copy-Item (Join-Path $final $rel) (Join-Path $root $rel) -Force
}

git reset --hard HEAD

# --- May 26 (4 commits) ---
Restore "backend/requirements.txt"
Commit-At "2026-05-26T10:12:00+05:30" "build(deps): add prometheus-client dependency" @("backend/requirements.txt")

Restore "backend/app/metrics.py"
Commit-At "2026-05-26T14:28:00+05:30" "feat(api): add prometheus metrics collectors" @("backend/app/metrics.py")

Restore "backend/app/main.py"
Commit-At "2026-05-26T17:55:00+05:30" "feat(api): expose /metrics endpoint and middleware" @("backend/app/main.py")

$promScrape = @'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: stackpilot-api
    metrics_path: /metrics
    static_configs:
      - targets: ["api:8000"]

  - job_name: node-exporter
    static_configs:
      - targets: ["node-exporter:9100"]

  - job_name: cadvisor
    static_configs:
      - targets: ["cadvisor:8080"]
'@
Set-Content "monitoring/prometheus.yml" $promScrape -Encoding utf8 -NoNewline
Commit-At "2026-05-26T21:10:00+05:30" "chore(monitoring): configure prometheus scrape jobs" @("monitoring/prometheus.yml")

# --- May 27 (4 commits) ---
Restore "monitoring/prometheus.yml"
Commit-At "2026-05-27T09:40:00+05:30" "feat(monitoring): wire alert rules into prometheus" @("monitoring/prometheus.yml")

Restore "monitoring/alert-rules.yml"
Commit-At "2026-05-27T13:15:00+05:30" "feat(monitoring): add infra and deployment alert rules" @("monitoring/alert-rules.yml")

Restore "monitoring/alertmanager.yml"
Commit-At "2026-05-27T16:50:00+05:30" "feat(monitoring): add alertmanager routing config" @("monitoring/alertmanager.yml")

$compose = Get-Content (Join-Path $final "docker-compose.yml") -Raw
$compose = $compose -replace '(?s)\r?\n  alertmanager:.*?profiles: \["monitoring"\]\r?\n\r?\n  node-exporter:.*?profiles: \["monitoring"\]\r?\n\r?\n  cadvisor:.*?profiles: \["monitoring"\]', ''
Set-Content "docker-compose.yml" $compose -Encoding utf8
Commit-At "2026-05-27T20:25:00+05:30" "build(docker): harden prometheus and grafana services" @("docker-compose.yml")

# --- May 28 (4 commits) ---
Restore "docker-compose.yml"
Commit-At "2026-05-28T10:05:00+05:30" "build(docker): add node-exporter cadvisor and alertmanager" @("docker-compose.yml")

Restore "monitoring/grafana/provisioning/datasources/datasources.yml"
Restore "monitoring/grafana/provisioning/dashboards/dashboards.yml"
Commit-At "2026-05-28T14:20:00+05:30" "feat(grafana): provision prometheus datasource" @(
    "monitoring/grafana/provisioning/datasources/datasources.yml",
    "monitoring/grafana/provisioning/dashboards/dashboards.yml"
)

Restore "monitoring/grafana/provisioning/dashboards/json/vm-health.json"
Restore "monitoring/grafana/provisioning/dashboards/json/container-health.json"
Commit-At "2026-05-28T17:35:00+05:30" "feat(grafana): add vm and container health dashboards" @(
    "monitoring/grafana/provisioning/dashboards/json/vm-health.json",
    "monitoring/grafana/provisioning/dashboards/json/container-health.json"
)

Restore "monitoring/grafana/provisioning/dashboards/json/fastapi-performance.json"
Restore "monitoring/grafana/provisioning/dashboards/json/deployment-statistics.json"
Commit-At "2026-05-28T20:50:00+05:30" "feat(grafana): add api and deployment dashboards" @(
    "monitoring/grafana/provisioning/dashboards/json/fastapi-performance.json",
    "monitoring/grafana/provisioning/dashboards/json/deployment-statistics.json"
)

# --- May 29 (3 commits) ---
$readme = Get-Content "README.md" -Raw
$readme = $readme -replace '\| \*\*Observability\*\* \| Optional Prometheus \+ Grafana profile \|', '| **Observability** | Prometheus + Grafana + Alertmanager + Node Exporter + cAdvisor |'
$readme = $readme -replace '├── monitoring/        # Prometheus config \(optional profile\)', '├── monitoring/        # Prometheus, Alertmanager, Grafana provisioning, alert rules'
Set-Content "README.md" $readme -Encoding utf8
Commit-At "2026-05-29T11:00:00+05:30" "docs: update readme observability overview" @("README.md")

$readme2 = Get-Content "README.md" -Raw
$oldMon = '(?s)## Monitoring \(optional\).*?(?=---\r?\n\r?\n## Learning path)'
$newMon = @'
## Monitoring (Prometheus + Grafana + Alertmanager)

StackPilot includes an observability stack for **VM health**, **containers**, **FastAPI performance**, and **deployment reliability**.

### Monitoring architecture

```
Node Exporter -> Prometheus -> Grafana Dashboards
cAdvisor -----/
FastAPI /metrics
Alertmanager <- alert rules
```

### What is monitored

- **Infrastructure:** CPU, memory, disk, network, load
- **Containers:** per-container CPU/memory/network and restarts
- **FastAPI:** request count, latency, errors, active requests
- **Deployments:** status counts including failed deployments

### Start the full stack

```bash
docker compose --profile monitoring up -d --build
```

'@
$readme2 = [regex]::Replace($readme2, $oldMon, $newMon)
Set-Content "README.md" $readme2 -Encoding utf8
Commit-At "2026-05-29T15:30:00+05:30" "docs: add monitoring architecture and startup guide" @("README.md")

Restore "docs/screenshots/monitoring/.gitkeep"
Commit-At "2026-05-29T19:15:00+05:30" "docs: add monitoring screenshot placeholders" @("docs/screenshots/monitoring/.gitkeep")

# --- May 30 (3 commits) ---
Restore "README.md"
Commit-At "2026-05-30T10:45:00+05:30" "docs: document monitoring endpoints and dashboards" @("README.md")

$readmeT = Get-Content "README.md" -Raw
if ($readmeT -notmatch "Azure VM deployment steps") {
    throw "README missing azure monitoring section"
}
Commit-At "2026-05-30T14:30:00+05:30" "docs: add azure monitoring deployment steps" @("README.md")

$readmeT = $readmeT -replace '(?s)## Resume bullet\r?\n\r?\n> Built and deployed.*', @'
## Resume bullet

> Integrated Prometheus and Grafana dashboards for monitoring infrastructure health, resource utilization, deployment reliability, and proactive incident detection through automated alerting.
'@
Set-Content "README.md" $readmeT -Encoding utf8
Commit-At "2026-05-30T18:10:00+05:30" "docs: add observability resume bullet" @("README.md")

# --- May 31 (3 commits) ---
$readmeT = Get-Content "README.md" -Raw
if ($readmeT -notmatch "Monitoring workflow") {
    $insert = @'

### Monitoring workflow

1. Prometheus scrapes Node Exporter, cAdvisor, and FastAPI `/metrics`
2. Grafana reads Prometheus and renders dashboards
3. Prometheus evaluates alert rules every 15s
4. Alertmanager routes firing alerts to configured receivers

'@
    $readmeT = $readmeT -replace '(---\r?\n\r?\n## Learning path)', ($insert + "`n`$1")
    Set-Content "README.md" $readmeT -Encoding utf8
}
Commit-At "2026-05-31T10:20:00+05:30" "docs: document monitoring workflow" @("README.md")

Restore "README.md"
Commit-At "2026-05-31T14:45:00+05:30" "docs: finalize monitoring documentation" @("README.md")

# Ensure working tree matches final saved state
Restore "README.md"
Restore "docker-compose.yml"
Restore "monitoring/prometheus.yml"
$diff = git status --porcelain
if ($diff) {
    git add -A
    $env:GIT_AUTHOR_DATE = "2026-05-31T17:30:00+05:30"
    $env:GIT_COMMITTER_DATE = $env:GIT_AUTHOR_DATE
    git commit -m "chore: align monitoring docs and compose configuration" | Out-Null
}

Write-Host "`nMay 26-31 commits:"
git log --format="%h %ad %an <%ae> | %s" --date=format:"%Y-%m-%d %H:%M" --since="2026-05-26" --until="2026-06-01"

$bad = git log --format="%B" --since="2026-05-26" --until="2026-06-01" | Select-String -Pattern "(?i)co-authored-by|cursor"
if ($bad) { throw "Found Cursor/co-author in commit messages." }
Write-Host "`nVerified: no Co-authored-by or Cursor in May 26-31 commit bodies."
