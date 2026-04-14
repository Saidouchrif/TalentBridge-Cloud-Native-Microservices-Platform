const STUDENT_API_BASE_URL = import.meta.env.VITE_STUDENT_API_URL || 'http://localhost:8001'

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  if (!text) {
    return {}
  }
  return { message: text }
}

function buildError(status, payload) {
  const detail = payload?.message || payload?.detail || 'Requete etudiant echouee'
  const error = new Error(detail)
  error.status = status
  error.payload = payload
  return error
}

async function studentRequest(path, accessToken, options = {}) {
  const response = await fetch(`${STUDENT_API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw buildError(response.status, payload)
  }

  return payload
}

export function createStudentProfile(data, accessToken) {
  return studentRequest('/api/etudiant/profile', accessToken, {
    method: 'POST',
    body: data,
  })
}

export function getMyStudentProfile(accessToken) {
  return studentRequest('/api/etudiant/me', accessToken)
}

export function updateMyStudentProfile(data, accessToken) {
  return studentRequest('/api/etudiant/me', accessToken, {
    method: 'PUT',
    body: data,
  })
}

export function listStudentFormations(accessToken) {
  return studentRequest('/api/etudiant/formation', accessToken)
}

export function addStudentFormation(data, accessToken) {
  return studentRequest('/api/etudiant/formation', accessToken, {
    method: 'POST',
    body: data,
  })
}

export function listStudentExperiences(accessToken) {
  return studentRequest('/api/etudiant/experience', accessToken)
}

export function addStudentExperience(data, accessToken) {
  return studentRequest('/api/etudiant/experience', accessToken, {
    method: 'POST',
    body: data,
  })
}

export function deleteStudentExperience(experienceId, accessToken) {
  return studentRequest(`/api/etudiant/experience/${experienceId}`, accessToken, {
    method: 'DELETE',
  })
}

export function listStudentCompetences(accessToken) {
  return studentRequest('/api/etudiant/competence', accessToken)
}

export function addStudentCompetence(data, accessToken) {
  return studentRequest('/api/etudiant/competence', accessToken, {
    method: 'POST',
    body: data,
  })
}

export function listStudentLangues(accessToken) {
  return studentRequest('/api/etudiant/langue', accessToken)
}

export function addStudentLangue(data, accessToken) {
  return studentRequest('/api/etudiant/langue', accessToken, {
    method: 'POST',
    body: data,
  })
}

export async function uploadStudentCv(file, accessToken, { nom, prenom } = {}) {
  const formData = new FormData()
  formData.append('cv', file)
  if (nom) formData.append('nom', nom)
  if (prenom) formData.append('prenom', prenom)

  const response = await fetch(`${STUDENT_API_BASE_URL}/api/etudiant/upload-cv`, {
    method: 'POST',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw buildError(response.status, payload)
  }

  return payload
}

export function getCvDownloadUrl(cvPath) {
  if (!cvPath) return null
  if (/^https?:\/\//i.test(cvPath)) return cvPath
  return `${STUDENT_API_BASE_URL}${cvPath}`
}

export async function getStudentWorkspace(accessToken) {
  const [profile, formations, experiences, competences, langues] = await Promise.all([
    getMyStudentProfile(accessToken),
    listStudentFormations(accessToken),
    listStudentExperiences(accessToken),
    listStudentCompetences(accessToken),
    listStudentLangues(accessToken),
  ])

  return {
    profile,
    formations,
    experiences,
    competences,
    langues,
  }
}
