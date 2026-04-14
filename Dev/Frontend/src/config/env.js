/** URLs des microservices (variables Vite). */
export const ENV = {
  auth: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  student: import.meta.env.VITE_STUDENT_API_URL || 'http://localhost:8001',
  offres:
    import.meta.env.VITE_OFFRES_API_URL ||
    import.meta.env.VITE_OFFERS_API_URL ||
    'http://localhost:8002',
  candidatures:
    import.meta.env.VITE_APPLICATION_API_URL ||
    import.meta.env.VITE_CANDIDATURE_API_URL ||
    'http://localhost:8003',
  entreprise: import.meta.env.VITE_ENTREPRISE_API_URL || 'http://localhost:8004',
  notifications: import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8005',
  ai: import.meta.env.VITE_AI_API_URL || 'http://localhost:8006',
  matching: import.meta.env.VITE_MATCHING_API_URL || 'http://localhost:8007',
}
