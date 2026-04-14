import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import {
  addStudentCompetence,
  addStudentExperience,
  addStudentFormation,
  addStudentLangue,
  createStudentProfile,
  deleteStudentExperience,
  getCvDownloadUrl,
  getStudentWorkspace,
  updateMyStudentProfile,
  uploadStudentCv,
} from '../services/student.service'

const LANGUAGE_OPTIONS = [
  'Arabe',
  'Anglais',
  'Francais',
  'Espagnol',
  'Allemand',
  'Italien',
  'Portugais',
  'Neerlandais',
  'Turc',
  'Chinois',
  'Japonais',
  'Coreen',
  'Russe',
  'Hindi',
  'Bengali',
  'Ourdou',
  'Swahili',
  'Amazigh',
  'Hassania',
  'Autre',
]

const NIVEAU_OPTIONS = [
  'Bac',
  'Bac+2',
  'Bac+3',
  'Bac+5',
  'Master',
  'Doctorat',
]

const LANGUE_NIVEAU_OPTIONS = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
]

function emptyFormation() {
  return {
    etablissement: '',
    diplome: '',
    dateDebut: '',
    dateFin: '',
  }
}

function emptyExperience() {
  return {
    poste: '',
    entreprise: '',
    dateDebut: '',
    dateFin: '',
    description: '',
  }
}

function emptyCompetence() {
  return {
    nom: '',
    niveau: '',
  }
}

function emptyLangue() {
  return {
    nom: '',
    niveau: '',
  }
}

function formatDate(value) {
  if (!value) return 'En cours'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
  })
}

function sortByDateDesc(items) {
  return [...items].sort((left, right) => String(right.dateDebut || '').localeCompare(String(left.dateDebut || '')))
}

function sortByName(items) {
  return [...items].sort((left, right) => String(left.nom || '').localeCompare(String(right.nom || ''), 'fr'))
}

function pickChangedAccountFields(user, form) {
  const payload = {}

  if ((user?.nom || '') !== form.nom.trim()) {
    payload.nom = form.nom.trim()
  }
  if ((user?.prenom || '') !== form.prenom.trim()) {
    payload.prenom = form.prenom.trim()
  }
  if ((user?.email || '') !== form.email.trim()) {
    payload.email = form.email.trim()
  }

  return payload
}

function validateBaseProfile(form) {
  if (!form.universite.trim() || !form.niveau.trim() || !form.localisation.trim()) {
    return 'Universite, niveau et localisation sont obligatoires.'
  }

  return ''
}

function validateFormation(form) {
  if (!form.etablissement.trim() || !form.diplome.trim() || !form.dateDebut) {
    return 'Ajoutez un etablissement, un diplome et une date de debut.'
  }

  return ''
}

function validateExperience(form) {
  if (!form.poste.trim() || !form.entreprise.trim() || !form.dateDebut) {
    return 'Ajoutez un poste, une entreprise et une date de debut.'
  }

  return ''
}

function validateSimpleLevel(form, entityLabel) {
  if (!form.nom.trim() || !form.niveau.trim()) {
    return `Ajoutez un ${entityLabel} et son niveau.`
  }

  return ''
}

function buildProfilePayload(form) {
  return {
    universite: form.universite.trim(),
    niveau: form.niveau.trim(),
    localisation: form.localisation.trim(),
  }
}

function MetricCard({ label, value, accent = 'primary' }) {
  return (
    <article className={`tb-metric-card tb-metric-card-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function WorkspaceItem({ title, subtitle, children, action }) {
  return (
    <article className="tb-collection-item">
      <div className="tb-collection-copy">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
        {children}
      </div>
      {action ? <div className="tb-collection-action">{action}</div> : null}
    </article>
  )
}

function PendingCount({ count, label }) {
  return (
    <div className="tb-mini-stat">
      <strong>{count}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function StudentWorkspace({ mode = 'profile' }) {
  const navigate = useNavigate()
  const { accessToken, loadProfile, refreshStudentAccess, updateMyProfile, user } = useAuth()
  const isSetup = mode === 'setup'

  const [workspaceLoading, setWorkspaceLoading] = useState(!isSetup)
  const [feedback, setFeedback] = useState({ type: 'info', message: '' })

  const [accountForm, setAccountForm] = useState({
    nom: '',
    prenom: '',
    email: '',
  })

  const [studentForm, setStudentForm] = useState({
    universite: '',
    niveau: '',
    localisation: '',
    cv: '',
  })

  const [formations, setFormations] = useState([])
  const [experiences, setExperiences] = useState([])
  const [competences, setCompetences] = useState([])
  const [langues, setLangues] = useState([])

  const [draftFormation, setDraftFormation] = useState(emptyFormation())
  const [draftExperience, setDraftExperience] = useState(emptyExperience())
  const [draftCompetence, setDraftCompetence] = useState(emptyCompetence())
  const [draftLangue, setDraftLangue] = useState(emptyLangue())

  const [savingIdentity, setSavingIdentity] = useState(false)
  const [savingSetup, setSavingSetup] = useState(false)
  const [addingFormation, setAddingFormation] = useState(false)
  const [addingExperience, setAddingExperience] = useState(false)
  const [addingCompetence, setAddingCompetence] = useState(false)
  const [addingLangue, setAddingLangue] = useState(false)
  const [deletingExperienceId, setDeletingExperienceId] = useState(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvFileName, setCvFileName] = useState('')

  useEffect(() => {
    if (!user) return

    setAccountForm({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
    })
  }, [user])

  useEffect(() => {
    if (isSetup || !accessToken) {
      return
    }

    let active = true

    const loadWorkspace = async () => {
      setWorkspaceLoading(true)
      setFeedback({ type: 'info', message: '' })

      try {
        const data = await getStudentWorkspace(accessToken)
        if (!active) return

        setStudentForm({
          universite: data.profile.universite || '',
          niveau: data.profile.niveau || '',
          localisation: data.profile.localisation || '',
          cv: data.profile.cv || '',
        })
        setFormations(sortByDateDesc(data.formations || []))
        setExperiences(sortByDateDesc(data.experiences || []))
        setCompetences(sortByName(data.competences || []))
        setLangues(sortByName(data.langues || []))
      } catch (error) {
        if (!active) return
        setFeedback({
          type: 'error',
          message: extractErrorMessage(error, 'Impossible de charger l espace etudiant.'),
        })
      } finally {
        if (active) {
          setWorkspaceLoading(false)
        }
      }
    }

    loadWorkspace()

    return () => {
      active = false
    }
  }, [accessToken, isSetup])

  const handleAccountField = (key) => (event) => {
    const value = event.target.value
    setAccountForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleStudentField = (key) => (event) => {
    const value = event.target.value
    setStudentForm((previous) => ({ ...previous, [key]: value }))
  }

  const submitIdentityAndStudentProfile = async (event) => {
    event.preventDefault()
    setFeedback({ type: 'info', message: '' })

    const validationMessage = validateBaseProfile(studentForm)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setSavingIdentity(true)
    try {
      const accountPayload = pickChangedAccountFields(user, accountForm)
      if (Object.keys(accountPayload).length > 0) {
        await updateMyProfile(accountPayload)
        await loadProfile()
      }

      await updateMyStudentProfile(buildProfilePayload(studentForm), accessToken)
      setFeedback({
        type: 'success',
        message: 'Votre profil etudiant a ete mis a jour avec succes.',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Mise a jour du profil etudiant impossible.'),
      })
    } finally {
      setSavingIdentity(false)
    }
  }

  const queueFormation = () => {
    const validationMessage = validateFormation(draftFormation)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setFormations((previous) => sortByDateDesc([
      { ...draftFormation, id: `draft-formation-${Date.now()}` },
      ...previous,
    ]))
    setDraftFormation(emptyFormation())
    setFeedback({ type: 'info', message: 'Formation ajoutee au dossier de creation.' })
  }

  const queueExperience = () => {
    const validationMessage = validateExperience(draftExperience)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setExperiences((previous) => sortByDateDesc([
      { ...draftExperience, id: `draft-experience-${Date.now()}` },
      ...previous,
    ]))
    setDraftExperience(emptyExperience())
    setFeedback({ type: 'info', message: 'Experience ajoutee au dossier de creation.' })
  }

  const queueCompetence = () => {
    const validationMessage = validateSimpleLevel(draftCompetence, 'competence')
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setCompetences((previous) => sortByName([
      { ...draftCompetence, id: `draft-competence-${Date.now()}` },
      ...previous,
    ]))
    setDraftCompetence(emptyCompetence())
    setFeedback({ type: 'info', message: 'Competence ajoutee au dossier de creation.' })
  }

  const queueLangue = () => {
    const validationMessage = validateSimpleLevel(draftLangue, 'langue')
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setLangues((previous) => sortByName([
      { ...draftLangue, id: `draft-langue-${Date.now()}` },
      ...previous,
    ]))
    setDraftLangue(emptyLangue())
    setFeedback({ type: 'info', message: 'Langue ajoutee au dossier de creation.' })
  }

  const removeDraftItem = (collectionSetter, itemId, successMessage) => {
    collectionSetter((previous) => previous.filter((item) => item.id !== itemId))
    setFeedback({ type: 'info', message: successMessage })
  }

  const submitStudentSetup = async (event) => {
    event.preventDefault()
    setFeedback({ type: 'info', message: '' })

    const validationMessage = validateBaseProfile(studentForm)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setSavingSetup(true)
    try {
      const accountPayload = pickChangedAccountFields(user, accountForm)
      if (Object.keys(accountPayload).length > 0) {
        await updateMyProfile(accountPayload)
        await loadProfile()
      }

      await createStudentProfile(buildProfilePayload(studentForm), accessToken)

      const jobs = [
        ...formations.map((item) => ({
          label: `formation ${item.diplome}`,
          execute: () => addStudentFormation(item, accessToken),
        })),
        ...experiences.map((item) => ({
          label: `experience ${item.poste}`,
          execute: () => addStudentExperience(item, accessToken),
        })),
        ...competences.map((item) => ({
          label: `competence ${item.nom}`,
          execute: () => addStudentCompetence(item, accessToken),
        })),
        ...langues.map((item) => ({
          label: `langue ${item.nom}`,
          execute: () => addStudentLangue(item, accessToken),
        })),
      ]

      const results = await Promise.allSettled(jobs.map((job) => job.execute()))
      const failedLabels = results
        .map((result, index) => (result.status === 'rejected' ? jobs[index].label : ''))
        .filter(Boolean)

      await refreshStudentAccess()

      if (failedLabels.length > 0) {
        setFeedback({
          type: 'info',
          message: `Profil active. Quelques blocs restent a reprendre depuis votre profil: ${failedLabels.join(', ')}.`,
        })
      } else {
        setFeedback({
          type: 'success',
          message: 'Votre espace etudiant est actif et toutes vos informations ont ete enregistrees.',
        })
      }

      window.setTimeout(() => {
        navigate(PATHS.PROFILE, { replace: true })
      }, failedLabels.length > 0 ? 1600 : 900)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Activation de l espace etudiant impossible.'),
      })
    } finally {
      setSavingSetup(false)
    }
  }

  const addFormationNow = async () => {
    const validationMessage = validateFormation(draftFormation)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setAddingFormation(true)
    setFeedback({ type: 'info', message: '' })
    try {
      const created = await addStudentFormation(draftFormation, accessToken)
      setFormations((previous) => sortByDateDesc([created, ...previous]))
      setDraftFormation(emptyFormation())
      setFeedback({ type: 'success', message: 'Formation ajoutee avec succes.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Impossible d ajouter la formation.'),
      })
    } finally {
      setAddingFormation(false)
    }
  }

  const addExperienceNow = async () => {
    const validationMessage = validateExperience(draftExperience)
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setAddingExperience(true)
    setFeedback({ type: 'info', message: '' })
    try {
      const created = await addStudentExperience(draftExperience, accessToken)
      setExperiences((previous) => sortByDateDesc([created, ...previous]))
      setDraftExperience(emptyExperience())
      setFeedback({ type: 'success', message: 'Experience ajoutee avec succes.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Impossible d ajouter l experience.'),
      })
    } finally {
      setAddingExperience(false)
    }
  }

  const addCompetenceNow = async () => {
    const validationMessage = validateSimpleLevel(draftCompetence, 'competence')
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setAddingCompetence(true)
    setFeedback({ type: 'info', message: '' })
    try {
      const created = await addStudentCompetence(draftCompetence, accessToken)
      setCompetences((previous) => sortByName([created, ...previous]))
      setDraftCompetence(emptyCompetence())
      setFeedback({ type: 'success', message: 'Competence ajoutee avec succes.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Impossible d ajouter la competence.'),
      })
    } finally {
      setAddingCompetence(false)
    }
  }

  const addLangueNow = async () => {
    const validationMessage = validateSimpleLevel(draftLangue, 'langue')
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setAddingLangue(true)
    setFeedback({ type: 'info', message: '' })
    try {
      const created = await addStudentLangue(draftLangue, accessToken)
      setLangues((previous) => sortByName([created, ...previous]))
      setDraftLangue(emptyLangue())
      setFeedback({ type: 'success', message: 'Langue ajoutee avec succes.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Impossible d ajouter la langue.'),
      })
    } finally {
      setAddingLangue(false)
    }
  }

  const deleteExperienceNow = async (experienceId) => {
    setDeletingExperienceId(experienceId)
    setFeedback({ type: 'info', message: '' })
    try {
      await deleteStudentExperience(experienceId, accessToken)
      setExperiences((previous) => previous.filter((item) => item.id !== experienceId))
      setFeedback({ type: 'success', message: 'Experience supprimee avec succes.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Suppression de l experience impossible.'),
      })
    } finally {
      setDeletingExperienceId(null)
    }
  }

  if (workspaceLoading) {
    return (
      <FormCard title="Mon espace etudiant" subtitle="Chargement de vos informations">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Preparation de votre dossier etudiant...</span>
        </div>
        <StatusMessage type={feedback.type}>{feedback.message}</StatusMessage>
      </FormCard>
    )
  }

  const headerTitle = isSetup ? 'Activez votre espace etudiant' : 'Mon profil etudiant'
  const headerSubtitle = isSetup
    ? 'Remplissez votre dossier puis validez.'
    : 'Toutes vos informations etudiant au meme endroit.'

  return (
    <FormCard title={headerTitle} subtitle={headerSubtitle} withBranding={isSetup}>
      <section className="tb-simple-summary">
        <PendingCount count={formations.length} label="Formations" />
        <PendingCount count={experiences.length} label="Experiences" />
        <PendingCount count={competences.length} label="Competences" />
        <PendingCount count={langues.length} label="Langues" />
      </section>

      <section className="tb-metrics-grid">
        <MetricCard label="Email" value={user?.email_verifie ? 'Verifie' : 'En attente'} accent={user?.email_verifie ? 'success' : 'warning'} />
        <MetricCard label="CV" value={studentForm.cv ? 'Televerse' : 'A ajouter'} accent={studentForm.cv ? 'primary' : 'warning'} />
        <MetricCard label="Niveau" value={studentForm.niveau.trim() || 'A definir'} />
        <MetricCard label="Localisation" value={studentForm.localisation.trim() || 'A completer'} />
      </section>

      <StatusMessage type={feedback.type}>{feedback.message}</StatusMessage>

      <form className="tb-student-shell" onSubmit={isSetup ? submitStudentSetup : submitIdentityAndStudentProfile}>
        <section className="tb-workspace-card">
          <div className="tb-section-heading">
            <div>
              <h3>Identite et positionnement</h3>
              <p>Informations principales de votre profil.</p>
            </div>
            {!isSetup ? (
              <button type="submit" className="tb-btn tb-btn-solid" disabled={savingIdentity}>
                {savingIdentity ? 'Enregistrement...' : 'Enregistrer le profil'}
              </button>
            ) : null}
          </div>

          <div className="tb-form-grid">
            <div className="tb-field">
              <label htmlFor="student-account-nom">Nom</label>
              <input id="student-account-nom" value={accountForm.nom} onChange={handleAccountField('nom')} required />
            </div>
            <div className="tb-field">
              <label htmlFor="student-account-prenom">Prenom</label>
              <input id="student-account-prenom" value={accountForm.prenom} onChange={handleAccountField('prenom')} required />
            </div>
            <div className="tb-field">
              <label htmlFor="student-account-email">Email</label>
              <input
                id="student-account-email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountField('email')}
                required
              />
            </div>
            <div className="tb-field">
              <label htmlFor="student-universite">Universite</label>
              <input
                id="student-universite"
                value={studentForm.universite}
                onChange={handleStudentField('universite')}
                required
                maxLength={500}
              />
            </div>
            <div className="tb-field">
              <label htmlFor="student-niveau">Niveau</label>
              <select
                id="student-niveau"
                value={studentForm.niveau}
                onChange={handleStudentField('niveau')}
                required
              >
                <option value="">Selectionner un niveau</option>
                {NIVEAU_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="tb-field">
              <label htmlFor="student-localisation">Localisation</label>
              <input
                id="student-localisation"
                value={studentForm.localisation}
                onChange={handleStudentField('localisation')}
                required
                maxLength={300}
                placeholder="Ville, pays..."
              />
            </div>
          </div>

          <div className="tb-cv-upload-section">
            <span className="tb-eyebrow">CV (PDF, DOC, DOCX - max 5 Mo)</span>
            <div className="tb-cv-upload-row">
              <label className="tb-cv-upload-label" htmlFor="student-cv-file">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Z" />
                </svg>
                {cvUploading ? 'Telechargement...' : 'Choisir un fichier'}
                <input
                  id="student-cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="tb-cv-file-input"
                  disabled={cvUploading}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    setCvFileName(file.name)
                    setCvUploading(true)
                    setFeedback({ type: 'info', message: '' })
                    try {
                      const result = await uploadStudentCv(file, accessToken, {
                        nom: accountForm.nom || user?.nom || '',
                        prenom: accountForm.prenom || user?.prenom || '',
                      })
                      setStudentForm((prev) => ({ ...prev, cv: result.cv_url }))
                      setFeedback({ type: 'success', message: 'CV televerse avec succes.' })
                    } catch (err) {
                      setFeedback({
                        type: 'error',
                        message: extractErrorMessage(err, 'Impossible de televerser le CV.'),
                      })
                    } finally {
                      setCvUploading(false)
                      event.target.value = ''
                    }
                  }}
                />
              </label>
              {cvFileName ? <span className="tb-cv-filename">{cvFileName}</span> : null}
            </div>

            {studentForm.cv ? (
              <div className="tb-cv-preview">
                <a
                  href={getCvDownloadUrl(studentForm.cv)}
                  target="_blank"
                  rel="noreferrer"
                  className="tb-btn tb-btn-ghost tb-btn-mini"
                >
                  Voir le CV
                </a>
                <span className="tb-cv-path">{studentForm.cv.split('/').pop()}</span>
              </div>
            ) : (
              <p className="tb-muted-small">Aucun CV televerse pour le moment.</p>
            )}
          </div>
        </section>

        <section className="tb-workspace-card">
          <div className="tb-section-heading">
            <div>
              <h3>Formations</h3>
              <p>Ajoutez vos etudes et diplomes.</p>
            </div>
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={isSetup ? false : addingFormation}
              onClick={isSetup ? queueFormation : addFormationNow}
            >
              {isSetup ? 'Ajouter au dossier' : addingFormation ? 'Ajout...' : 'Ajouter une formation'}
            </button>
          </div>

          <div className="tb-inline-form tb-inline-form-4">
            <input
              placeholder="Etablissement"
              value={draftFormation.etablissement}
              onChange={(event) => setDraftFormation((previous) => ({ ...previous, etablissement: event.target.value }))}
            />
            <input
              placeholder="Diplome"
              value={draftFormation.diplome}
              onChange={(event) => setDraftFormation((previous) => ({ ...previous, diplome: event.target.value }))}
            />
            <input
              type="date"
              value={draftFormation.dateDebut}
              onChange={(event) => setDraftFormation((previous) => ({ ...previous, dateDebut: event.target.value }))}
            />
            <input
              type="date"
              value={draftFormation.dateFin}
              onChange={(event) => setDraftFormation((previous) => ({ ...previous, dateFin: event.target.value }))}
            />
          </div>

          <div className="tb-collection">
            {formations.length > 0 ? (
              formations.map((formation) => (
                <WorkspaceItem
                  key={formation.id}
                  title={formation.diplome}
                  subtitle={`${formation.etablissement} | ${formatDate(formation.dateDebut)} - ${formatDate(formation.dateFin)}`}
                  action={
                    isSetup ? (
                      <button
                        type="button"
                        className="tb-btn tb-btn-ghost tb-btn-mini"
                        onClick={() => removeDraftItem(setFormations, formation.id, 'Formation retiree du dossier de creation.')}
                      >
                        Retirer
                      </button>
                    ) : null
                  }
                />
              ))
            ) : (
              <div className="tb-empty-state">Aucune formation enregistree pour le moment.</div>
            )}
          </div>
        </section>

        <section className="tb-workspace-card">
          <div className="tb-section-heading">
            <div>
              <h3>Experiences</h3>
              <p>Ajoutez vos stages, missions ou emplois.</p>
            </div>
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={isSetup ? false : addingExperience}
              onClick={isSetup ? queueExperience : addExperienceNow}
            >
              {isSetup ? 'Ajouter au dossier' : addingExperience ? 'Ajout...' : 'Ajouter une experience'}
            </button>
          </div>

          <div className="tb-inline-form tb-inline-form-4">
            <input
              placeholder="Poste"
              value={draftExperience.poste}
              onChange={(event) => setDraftExperience((previous) => ({ ...previous, poste: event.target.value }))}
            />
            <input
              placeholder="Entreprise"
              value={draftExperience.entreprise}
              onChange={(event) => setDraftExperience((previous) => ({ ...previous, entreprise: event.target.value }))}
            />
            <input
              type="date"
              value={draftExperience.dateDebut}
              onChange={(event) => setDraftExperience((previous) => ({ ...previous, dateDebut: event.target.value }))}
            />
            <input
              type="date"
              value={draftExperience.dateFin}
              onChange={(event) => setDraftExperience((previous) => ({ ...previous, dateFin: event.target.value }))}
            />
          </div>

          <textarea
            className="tb-textarea"
            rows={4}
            placeholder="Description courte de votre impact, missions ou outils utilises"
            value={draftExperience.description}
            onChange={(event) => setDraftExperience((previous) => ({ ...previous, description: event.target.value }))}
          />

          <div className="tb-collection">
            {experiences.length > 0 ? (
              experiences.map((experience) => (
                <WorkspaceItem
                  key={experience.id}
                  title={`${experience.poste} | ${experience.entreprise}`}
                  subtitle={`${formatDate(experience.dateDebut)} - ${formatDate(experience.dateFin)}`}
                  action={
                    isSetup ? (
                      <button
                        type="button"
                        className="tb-btn tb-btn-ghost tb-btn-mini"
                        onClick={() => removeDraftItem(setExperiences, experience.id, 'Experience retiree du dossier de creation.')}
                      >
                        Retirer
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="tb-btn tb-btn-danger tb-btn-mini"
                        disabled={deletingExperienceId === experience.id}
                        onClick={() => deleteExperienceNow(experience.id)}
                      >
                        {deletingExperienceId === experience.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    )
                  }
                >
                  {experience.description ? <p>{experience.description}</p> : null}
                </WorkspaceItem>
              ))
            ) : (
              <div className="tb-empty-state">Aucune experience enregistree pour le moment.</div>
            )}
          </div>
        </section>

        <section className="tb-workspace-card">
          <div className="tb-section-heading">
            <div>
              <h3>Competences</h3>
              <p>Ajoutez vos competences principales.</p>
            </div>
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={isSetup ? false : addingCompetence}
              onClick={isSetup ? queueCompetence : addCompetenceNow}
            >
              {isSetup ? 'Ajouter au dossier' : addingCompetence ? 'Ajout...' : 'Ajouter une competence'}
            </button>
          </div>

          <div className="tb-inline-form tb-inline-form-2">
            <input
              placeholder="Nom de la competence"
              value={draftCompetence.nom}
              onChange={(event) => setDraftCompetence((previous) => ({ ...previous, nom: event.target.value }))}
            />
            <input
              placeholder="Niveau"
              value={draftCompetence.niveau}
              onChange={(event) => setDraftCompetence((previous) => ({ ...previous, niveau: event.target.value }))}
            />
          </div>

          <div className="tb-pill-list">
            {competences.length > 0 ? (
              competences.map((competence) => (
                <div className="tb-pill" key={competence.id}>
                  <strong>{competence.nom}</strong>
                  <span>{competence.niveau}</span>
                  {isSetup ? (
                    <button
                      type="button"
                      className="tb-link"
                      onClick={() => removeDraftItem(setCompetences, competence.id, 'Competence retiree du dossier de creation.')}
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="tb-empty-state">Aucune competence enregistree pour le moment.</div>
            )}
          </div>
        </section>

        <section className="tb-workspace-card">
          <div className="tb-section-heading">
            <div>
              <h3>Langues</h3>
              <p>Choisissez une langue puis son niveau.</p>
            </div>
            <button
              type="button"
              className="tb-btn tb-btn-ghost"
              disabled={isSetup ? false : addingLangue}
              onClick={isSetup ? queueLangue : addLangueNow}
            >
              {isSetup ? 'Ajouter au dossier' : addingLangue ? 'Ajout...' : 'Ajouter une langue'}
            </button>
          </div>

          <div className="tb-inline-form tb-inline-form-2">
            <select
              value={draftLangue.nom}
              onChange={(event) => setDraftLangue((previous) => ({ ...previous, nom: event.target.value }))}
            >
              <option value="">Selectionner une langue</option>
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <select
              value={draftLangue.niveau}
              onChange={(event) => setDraftLangue((previous) => ({ ...previous, niveau: event.target.value }))}
            >
              <option value="">Selectionner un niveau</option>
              {LANGUE_NIVEAU_OPTIONS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="tb-pill-list">
            {langues.length > 0 ? (
              langues.map((langue) => (
                <div className="tb-pill" key={langue.id}>
                  <strong>{langue.nom}</strong>
                  <span>{langue.niveau}</span>
                  {isSetup ? (
                    <button
                      type="button"
                      className="tb-link"
                      onClick={() => removeDraftItem(setLangues, langue.id, 'Langue retiree du dossier de creation.')}
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="tb-empty-state">Aucune langue enregistree pour le moment.</div>
            )}
          </div>
        </section>

        {isSetup ? (
          <section className="tb-workspace-card tb-workspace-card-accent">
            <div className="tb-section-heading">
              <div>
                <h3>Finaliser mon espace</h3>
                <p>Une fois valide, vous serez redirige vers votre profil etudiant complet.</p>
              </div>
              <button type="submit" className="tb-btn tb-btn-solid" disabled={savingSetup}>
                {savingSetup ? 'Activation en cours...' : 'Activer mon espace etudiant'}
              </button>
            </div>
          </section>
        ) : null}
      </form>
    </FormCard>
  )
}
