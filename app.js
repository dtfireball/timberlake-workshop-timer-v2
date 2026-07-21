const STORAGE_KEY = "timberlake-workshop-timer-v1";

const state = loadState();
for (const job of state.jobs) {
  job.customer = job.customer || job.label || "";
  job.make = job.make || "";
  job.model = job.model || "";
  job.mileage = job.mileage || job.jobNumber || "";
}
saveState();

const activeJobsEl = document.querySelector("#activeJobs");
const completedJobsEl = document.querySelector("#completedJobs");
const activeCountEl = document.querySelector("#activeCount");
const emptyActiveEl = document.querySelector("#emptyActive");
const emptyCompletedEl = document.querySelector("#emptyCompleted");
const searchInput = document.querySelector("#searchInput");
const jobDialog = document.querySelector("#jobDialog");
const detailsDialog = document.querySelector("#detailsDialog");
const detailsContent = document.querySelector("#detailsContent");
const jobForm = document.querySelector("#jobForm");

document.querySelector("#newJobButton").addEventListener("click", () => jobDialog.showModal());
document.querySelector("#closeDialog").addEventListener("click", () => jobDialog.close());
document.querySelector("#cancelDialog").addEventListener("click", () => jobDialog.close());
document.querySelector("#exportButton").addEventListener("click", exportCsv);
searchInput.addEventListener("input", render);

jobForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(jobForm);
  const now = Date.now();

  pauseAnyRunningJob();

  state.jobs.push({
   id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    customer: data.get("customer").trim(),
    registration: data.get("registration").trim().toUpperCase(),
    mileage: data.get("mileage").trim(),
    make: data.get("make").trim(),
    model: data.get("model").trim(),
    notes: data.get("notes").trim(),
    createdAt: now,
    completedAt: null,
    status: "active",
    sessions: [{ start: now, end: null }]
  });

  saveState();
  jobForm.reset();
  jobDialog.close();
  render();
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { jobs: [] };
  } catch {
    return { jobs: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pauseAnyRunningJob(exceptId = null) {
  const now = Date.now();
  for (const job of state.jobs) {
    if (job.id === exceptId) continue;
    const session = job.sessions.at(-1);
    if (job.status === "active" && session && session.end === null) {
      session.end = now;
    }
  }
}

function isRunning(job) {
  const session = job.sessions.at(-1);
  return job.status === "active" && session && session.end === null;
}

function jobTitle(job) {
  return job.customer || "Unnamed Customer";
}

function vehicleName(job) {
  return [job.make, job.model].filter(Boolean).join(" ") || "Vehicle not entered";
}

function totalMilliseconds(job) {
  return job.sessions.reduce((total, session) => {
    const end = session.end ?? Date.now();
    return total + Math.max(0, end - session.start);
  }, 0);
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");
}

function formatDateTime(timestamp) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function startJob(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job || job.status !== "active" || isRunning(job)) return;

  const running = state.jobs.find(item => isRunning(item));
  if (running && running.id !== id) {
    const ok = confirm(`${jobTitle(running)} is currently running. Pause it and start ${jobTitle(job)}?`);
    if (!ok) return;
  }

  pauseAnyRunningJob(id);
  job.sessions.push({ start: Date.now(), end: null });
  saveState();
  render();
}

function pauseJob(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job || !isRunning(job)) return;
  job.sessions.at(-1).end = Date.now();
  saveState();
  render();
}

function completeJob(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job) return;

  const total = formatDuration(totalMilliseconds(job));
  const ok = confirm(`Complete ${jobTitle(job)} and save ${total} of recorded labour?`);
  if (!ok) return;

  if (isRunning(job)) {
    job.sessions.at(-1).end = Date.now();
  }
  job.status = "completed";
  job.completedAt = Date.now();
  saveState();
  render();
}

function reopenJob(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job) return;
  const ok = confirm(`Reopen ${jobTitle(job)}?`);
  if (!ok) return;
  job.status = "active";
  job.completedAt = null;
  saveState();
  detailsDialog.close();
  render();
}

function deleteJob(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job) return;
  const ok = confirm(`Delete ${jobTitle(job)}? This cannot be undone.`);
  if (!ok) return;
  state.jobs = state.jobs.filter(item => item.id !== id);
  saveState();
  detailsDialog.close();
  render();
}

function showDetails(id) {
  const job = state.jobs.find(job => job.id === id);
  if (!job) return;

  const sessions = job.sessions.map((session, index) => `
    <li>
      Session ${index + 1}: ${formatDateTime(session.start)} – ${formatDateTime(session.end)}
      (${formatDuration((session.end ?? Date.now()) - session.start)})
    </li>
  `).join("");

  detailsContent.innerHTML = `
    <div class="dialog-header">
      <h2>${escapeHtml(jobTitle(job))}</h2>
      <button class="icon-button" onclick="detailsDialog.close()" aria-label="Close">×</button>
    </div>
    <p><strong>Customer:</strong> ${escapeHtml(job.customer || "—")}<br>
    <strong>Vehicle:</strong> ${escapeHtml(vehicleName(job))}<br>
    <strong>Registration:</strong> ${escapeHtml(job.registration || "—")}<br>
    <strong>Mileage:</strong> ${escapeHtml(job.mileage || "—")}<br>
    <strong>Started:</strong> ${formatDateTime(job.createdAt)}<br>
    <strong>Completed:</strong> ${formatDateTime(job.completedAt)}<br>
    <strong>Total:</strong> ${formatDuration(totalMilliseconds(job))}</p>
    <p><strong>Notes:</strong><br>${escapeHtml(job.notes || "—")}</p>
    <div>
      <strong>Time sessions</strong>
      <ol class="session-list">${sessions || "<li>No sessions</li>"}</ol>
    </div>
    <div class="dialog-actions">
      ${job.status === "completed" ? `<button class="secondary" onclick="reopenJob('${job.id}')">Reopen Job</button>` : ""}
      <button class="danger" onclick="deleteJob('${job.id}')">Delete</button>
      <button class="primary" onclick="detailsDialog.close()">Close</button>
    </div>
  `;
  detailsDialog.showModal();
}

function render() {
  const activeJobs = state.jobs
    .filter(job => job.status === "active")
    .sort((a, b) => {
      const runningDifference = Number(isRunning(b)) - Number(isRunning(a));
      return runningDifference || b.createdAt - a.createdAt;
    });

  activeCountEl.textContent = activeJobs.length;
  emptyActiveEl.hidden = activeJobs.length > 0;

  activeJobsEl.innerHTML = activeJobs.map(job => {
    const running = isRunning(job);
    return `
      <article class="job-card ${running ? "running" : ""}">
        <span class="status ${running ? "running" : ""}">${running ? "Running" : "Paused"}</span>
        <h3>${escapeHtml(jobTitle(job))}</h3>
        <p class="job-meta">
          ${escapeHtml(vehicleName(job))}
          ${job.registration ? ` • ${escapeHtml(job.registration)}` : ""}
          ${job.mileage ? `<br>${escapeHtml(job.mileage)} km` : ""}
          <br>Started ${formatDateTime(job.createdAt)}
        </p>
        <div class="timer" data-job-id="${job.id}">${formatDuration(totalMilliseconds(job))}</div>
        <div class="card-actions">
          <button class="success" onclick="startJob('${job.id}')" ${running ? "disabled" : ""}>▶ Start</button>
          <button class="secondary" onclick="pauseJob('${job.id}')" ${running ? "" : "disabled"}>⏸ Pause</button>
          <button class="primary complete" onclick="completeJob('${job.id}')">✓ Complete Job</button>
          <button class="secondary complete" onclick="showDetails('${job.id}')">View Details</button>
        </div>
      </article>
    `;
  }).join("");

  const query = searchInput.value.trim().toLowerCase();
  const completedJobs = state.jobs
    .filter(job => job.status === "completed")
    .filter(job => [job.customer, job.registration, job.make, job.model, job.mileage]
      .some(value => String(value || "").toLowerCase().includes(query)))
    .sort((a, b) => b.completedAt - a.completedAt);

  emptyCompletedEl.hidden = completedJobs.length > 0;
  completedJobsEl.innerHTML = completedJobs.map(job => `
    <tr>
      <td>${formatDateTime(job.createdAt)}</td>
      <td>${formatDateTime(job.completedAt)}</td>
      <td>${escapeHtml(jobTitle(job))}</td>
      <td>${escapeHtml(vehicleName(job))}</td>
      <td>${escapeHtml(job.registration || "—")}</td>
      <td>${escapeHtml(job.mileage || "—")}</td>
      <td>${formatDuration(totalMilliseconds(job))}</td>
      <td><button class="link-button" onclick="showDetails('${job.id}')">View</button></td>
    </tr>
  `).join("");
}

function exportCsv() {
  const jobs = state.jobs.filter(job => job.status === "completed");
  if (!jobs.length) {
    alert("There are no completed jobs to export yet.");
    return;
  }

  const rows = [
    ["Start Date", "Completed Date", "Customer", "Make", "Model", "Registration", "Mileage", "Total Time", "Notes"],
    ...jobs.map(job => [
      formatDateTime(job.createdAt),
      formatDateTime(job.completedAt),
      job.customer,
      job.make,
      job.model,
      job.registration,
      job.mileage,
      formatDuration(totalMilliseconds(job)),
      job.notes
    ])
  ];

  const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `workshop-jobs-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setInterval(() => {
  for (const timer of document.querySelectorAll(".timer")) {
    const job = state.jobs.find(item => item.id === timer.dataset.jobId);
    if (job) timer.textContent = formatDuration(totalMilliseconds(job));
  }
}, 1000);

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
