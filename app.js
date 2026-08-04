const APP_VERSION = "v2.2-dev";
const STORAGE_KEY = "timberlake-workshop-timer-v1";
const SETTINGS_KEY = "fs-workshop-settings-v1";
const CUSTOMERS_KEY = "fs-workshop-customers-v1";
const state = loadState();
for (const job of state.jobs) {
  job.customer = job.customer || job.label || "";
  job.year = job.year || "";
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

const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const settingsButton = document.querySelector("#settingsButton");
const closeSettingsButton = document.querySelector("#closeSettings");
const cancelSettingsButton = document.querySelector("#cancelSettings");
const businessNameHeader = document.querySelector("#businessNameHeader");
const customersDialog = document.querySelector("#customersDialog");
const customersForm = document.querySelector("#customersForm");
const customersButton = document.querySelector("#customersButton");
const closeCustomersButton = document.querySelector("#closeCustomers");
const cancelCustomersButton = document.querySelector("#cancelCustomers");
const customersList = document.querySelector("#customersList");
const emptyCustomers = document.querySelector("#emptyCustomers");
const jobForm = document.querySelector("#jobForm");
const jobDialogTitle = document.querySelector("#jobDialogTitle");
const jobSubmitButton = document.querySelector("#jobSubmitButton");
function openNewJobDialog() {
  jobForm.reset();
  jobForm.elements.editingJobId.value = "";
  jobDialogTitle.textContent = "New Job";
  jobSubmitButton.textContent = "Create & Start";
  jobDialog.showModal();
}

function openEditJobDialog(jobId) {
  const job = state.jobs.find((item) => item.id === jobId);

  if (!job) {
    alert("This job could not be found.");
    return;
  }

  jobForm.reset();

  jobForm.elements.editingJobId.value = job.id;
  jobForm.elements.customer.value = job.customer || "";
  jobForm.elements.year.value = job.year || "";
  jobForm.elements.make.value = job.make || "";
  jobForm.elements.model.value = job.model || "";
  jobForm.elements.registration.value = job.registration || "";
  jobForm.elements.mileage.value = job.mileage || "";
  jobForm.elements.notes.value = job.notes || "";

  jobDialogTitle.textContent = "Edit Job";
  jobSubmitButton.textContent = "Save Changes";

  jobDialog.showModal();
}
function loadCustomers() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}
function renderCustomers() {
const customers = loadCustomers().sort((a, b) =>
  a.name.localeCompare(b.name)
);

  customersList.innerHTML = "";

  if (customers.length === 0) {
    emptyCustomers.hidden = false;
    return;
  }

  emptyCustomers.hidden = true;

 customers
  .filter((customer) => {
    const search = customerSearch.value.trim().toLowerCase();

    if (!search) return true;

    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search) ||
      customer.mobile.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search)
    );
  })
  .forEach((customer) => {
    const customerCard = document.createElement("div");
    customerCard.className = "customer-item";
    customerCard.dataset.customerId = customer.id;

customerCard.innerHTML = `
  <div class="customer-details">
    <strong>${customer.name}</strong>
    <span>${customer.mobile || customer.phone || "No phone number"}</span>
    <span>${customer.email || "No email address"}</span>
  </div>

  <button
    type="button"
    class="danger customer-delete"
    data-customer-id="${customer.id}"
  >
    Delete
  </button>
`;

    customersList.appendChild(customerCard);

customerCard
  .querySelector(".customer-details")
  .addEventListener("click", () => {
    customersForm.elements.editingCustomerId.value = customer.id;
    customersForm.elements.customerName.value = customer.name;
    customersForm.elements.phone.value = customer.phone;
    customersForm.elements.mobile.value = customer.mobile;
    customersForm.elements.email.value = customer.email;
  });

customerCard
  .querySelector(".customer-delete")
  .addEventListener("click", () => {
    const confirmed = confirm(`Delete ${customer.name}?`);

    if (!confirmed) return;

    const updatedCustomers = loadCustomers().filter(
      (savedCustomer) => savedCustomer.id !== customer.id
    );

    saveCustomers(updatedCustomers);
    renderCustomers();
  });
  });
}
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function populateSettingsForm() {
  const settings = loadSettings();

  settingsForm.elements.businessName.value = settings.businessName || "";
  settingsForm.elements.abn.value = settings.abn || "";
  settingsForm.elements.streetAddress.value = settings.streetAddress || "";
  settingsForm.elements.suburb.value = settings.suburb || "";
  settingsForm.elements.postcode.value = settings.postcode || "";
  settingsForm.elements.state.value = settings.state || "";
  settingsForm.elements.phone.value = settings.phone || "";
  settingsForm.elements.mobile.value = settings.mobile || "";
  settingsForm.elements.email.value = settings.email || "";
  settingsForm.elements.website.value = settings.website || "";
  settingsForm.elements.labourRate.value = settings.labourRate || "";
  settingsForm.elements.gstRegistered.value = settings.gstRegistered || "yes";
}

function updateBusinessNameHeader() {
  const settings = loadSettings();

  businessNameHeader.textContent =
    settings.businessName || "Timberlake Automotive";
}

function openSettingsDialog() {
  populateSettingsForm();
  settingsDialog.showModal();
}

settingsButton.addEventListener("click", openSettingsDialog);
closeSettingsButton.addEventListener("click", () => settingsDialog.close());
cancelSettingsButton.addEventListener("click", () => settingsDialog.close());
customerSearch.addEventListener("input", () => {
  renderCustomers();
});
customersButton.addEventListener("click", () => {
  customersForm.reset();
  renderCustomers();
  customersDialog.showModal();
});

closeCustomersButton.addEventListener("click", () => {
    customersDialog.close();
});

cancelCustomersButton.addEventListener("click", () => {
    customersDialog.close();
});
customersForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(customersForm);
  const customerName = data.get("customerName").trim();

  if (!customerName) {
    alert("Please enter a customer name.");
    return;
  }

const customers = loadCustomers();
const editingCustomerId =
  customersForm.elements.editingCustomerId.value;
  const duplicateCustomer = customers.find((customer) => {
  const sameName =
    customer.name.trim().toLowerCase() === customerName.toLowerCase();

  const isDifferentCustomer =
    !editingCustomerId || customer.id !== editingCustomerId;

  return sameName && isDifferentCustomer;
});

if (duplicateCustomer) {
  const continueSaving = confirm(
    `A customer named "${duplicateCustomer.name}" already exists. Save another customer with the same name?`
  );

  if (!continueSaving) return;
}

const customerData = {
  name: customerName,
  phone: data.get("phone").trim(),
  mobile: data.get("mobile").trim(),
  email: data.get("email").trim()
};

if (editingCustomerId) {
  const customerIndex = customers.findIndex(
    (customer) => customer.id === editingCustomerId
  );

  if (customerIndex !== -1) {
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...customerData,
      updatedAt: Date.now()
    };
  }
} else {
  customers.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...customerData,
    createdAt: Date.now()
  });
}

saveCustomers(customers);
customersForm.reset();
customersForm.elements.editingCustomerId.value = "";
renderCustomers();

  alert("Customer saved.");
});
settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(settingsForm);

  const settings = {
    businessName: data.get("businessName").trim(),
    abn: data.get("abn").trim(),
    streetAddress: data.get("streetAddress").trim(),
    suburb: data.get("suburb").trim(),
    postcode: data.get("postcode").trim(),
    state: data.get("state").trim(),
    phone: data.get("phone").trim(),
    mobile: data.get("mobile").trim(),
    email: data.get("email").trim(),
    website: data.get("website").trim(),
    labourRate: data.get("labourRate").trim(),
    gstRegistered: data.get("gstRegistered")
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  updateBusinessNameHeader();
  settingsDialog.close();
});
document.querySelector("#newJobButton").addEventListener("click", openNewJobDialog);
document.querySelector("#closeDialog").addEventListener("click", () => jobDialog.close());
document.querySelector("#cancelDialog").addEventListener("click", () => jobDialog.close());
document.querySelector("#exportButton").addEventListener("click", exportCsv);
searchInput.addEventListener("input", render);

jobForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(jobForm);
  const editingJobId = data.get("editingJobId");
  const customer = data.get("customer").trim();

  if (!customer) {
    alert("Please enter a customer name.");
    return;
  }

  const jobData = {
    customer,
    year: data.get("year").trim(),
    make: data.get("make").trim().toUpperCase(),
    model: data.get("model").trim().toUpperCase(),
    registration: data.get("registration").trim().toUpperCase(),
    mileage: data.get("mileage").trim(),
    notes: data.get("notes").trim()
  };

  if (editingJobId) {
    const job = state.jobs.find((item) => item.id === editingJobId);

    if (!job) {
      alert("This job could not be found.");
      return;
    }

    Object.assign(job, jobData);
  } else {
    const now = Date.now();

    pauseAnyRunningJob();

    state.jobs.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ...jobData,
      createdAt: now,
      completedAt: null,
      status: "active",
      sessions: [{ start: now, end: null }]
    });
  }

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
  return [job.year, job.make, job.model]
    .filter(Boolean)
    .join(" ") || "Vehicle not entered";
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
function moveJobToTop(jobId) {
  const jobIndex = state.jobs.findIndex((job) => job.id === jobId);

  if (jobIndex <= 0) return;

  const [job] = state.jobs.splice(jobIndex, 1);
  state.jobs.unshift(job);
}
function startJob(id) {
  const job = state.jobs.find((job) => job.id === id);

  if (!job || job.status !== "active" || isRunning(job)) return;

  const running = state.jobs.find((item) => isRunning(item));

  if (running && running.id !== id) {
    const ok = confirm(
      `${jobTitle(running)} is currently running. Pause it and start ${jobTitle(job)}?`
    );

    if (!ok) return;
  }

  pauseAnyRunningJob(id);

  job.sessions.push({
    start: Date.now(),
    end: null
  });

  moveJobToTop(id);

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
const activeJobs = state.jobs.filter(
  (job) => job.status === "active"
);

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
          <button class="secondary" onclick="openEditJobDialog('${job.id}')">Edit</button>
          <button class="danger" onclick="deleteJob('${job.id}')">Delete</button>
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
<td>
  <button class="link-button" onclick="openEditJobDialog('${job.id}')">Edit</button>
  <button class="link-button danger-link" onclick="deleteJob('${job.id}')">Delete</button>
  <button class="link-button" onclick="showDetails('${job.id}')">View</button>
</td>
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
updateBusinessNameHeader();
render();

/*
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
*/

const registrationInput = document.querySelector('input[name="registration"]');

registrationInput.addEventListener("input", () => {
  registrationInput.value = registrationInput.value.toUpperCase();
});
