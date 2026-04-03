const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5001/api";

const mockJobs = {
  1: {
    id: 1,
    title: "Développeur Full Stack",
    company: "TalentBridge",
    location: "Remote",
    description:
      "Nous cherchons un profil Full Stack pour renforcer notre équipe cloud-native. Stack : Node.js, React, PostgreSQL, Docker.",
  },
};

const APPLICATIONS_STORAGE_KEY = "tb_mock_applications";

function readStoredApplications() {
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let mockApplications = readStoredApplications();

function persistApplications() {
  try {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
  } catch {
    /* ignore */
  }
}

function buildId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function handleMockRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  if (method === "GET" && path.startsWith("/jobs/")) {
    const jobId = path.split("/").pop();
    const key = Number(jobId) || 1;
    return mockJobs[key] || mockJobs[1];
  }

  if (method === "POST" && path === "/applications") {
    const jid = Number(body?.jobId) || 1;
    const job = mockJobs[jid] || mockJobs[1];
    const application = {
      id: buildId(),
      jobId: jid,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...body,
    };
    mockApplications = [application, ...mockApplications];
    persistApplications();
    return application;
  }

  if (method === "GET" && path.startsWith("/applications")) {
    const query = path.includes("?") ? path.split("?")[1] : "";
    const params = new URLSearchParams(query);
    const candidateId = params.get("candidateId");
    if (candidateId) {
      return mockApplications.filter((item) => item.candidateId === candidateId);
    }
    return mockApplications;
  }

  if (method === "PATCH" && path.includes("/applications/") && path.endsWith("/status")) {
    const parts = path.split("/").filter(Boolean);
    const applicationId = parts[parts.length - 2];
    mockApplications = mockApplications.map((item) =>
      String(item.id) === String(applicationId)
        ? { ...item, status: body?.status || "PENDING" }
        : item
    );
    persistApplications();
    return mockApplications.find((item) => String(item.id) === String(applicationId)) || null;
  }

  throw new Error("Opération non supportée en mode démo.");
}

async function request(path, options = {}) {
  const mockOnly = import.meta.env?.VITE_USE_MOCK === "true";
  if (mockOnly) {
    return handleMockRequest(path, options);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { message: text || "Réponse invalide" };
    }

    if (!response.ok) {
      const message = payload?.message || `Erreur ${response.status}`;
      throw new Error(message);
    }

    return payload;
  } catch (err) {
    if (err instanceof TypeError || err.name === "TypeError") {
      console.warn("[TalentBridge] API indisponible, mode démo local.", err.message);
      return handleMockRequest(path, options);
    }
    throw err;
  }
}

export async function getJobDetails(jobId) {
  return request(`/jobs/${jobId}`);
}

export async function submitApplication(jobId, applicationData) {
  return request(`/applications`, {
    method: "POST",
    body: JSON.stringify({
      jobId: Number(jobId),
      ...applicationData,
    }),
  });
}

export async function getMyApplications(candidateId) {
  const query = candidateId ? `?candidateId=${encodeURIComponent(candidateId)}` : "";
  return request(`/applications${query}`);
}

export async function updateApplicationStatus(applicationId, status) {
  return request(`/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
