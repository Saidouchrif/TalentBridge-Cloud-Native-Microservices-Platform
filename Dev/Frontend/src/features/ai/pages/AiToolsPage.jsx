import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { adapterOffre, genererCv, genererEmail, genererLettre } from '../services/aiDocument.service'

const TYPE_LABELS = {
  cv: 'CV',
  lettre: 'Lettre de motivation',
  email: 'Email professionnel',
  adapt: 'Document adapte',
}

const FILE_NAMES = {
  cv: 'CV',
  lettre: 'Lettre_de_motivation',
  email: 'Email_professionnel',
  adapt: 'Document_adapte',
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilePart(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function buildDocumentFilename(type, user, ext = 'doc') {
  const base = FILE_NAMES[type] || 'Document'
  const userRaw = `${user?.prenom || ''}_${user?.nom || ''}`.replace(/^_+|_+$/g, '')
  const fallbackUser = (user?.email || 'Utilisateur').split('@')[0]
  const owner = sanitizeFilePart(userRaw || fallbackUser || 'Utilisateur') || 'Utilisateur'
  return `${base}_${owner}.${ext}`
}

function buildWordBlob(text, title = 'Document TalentBridge') {
  const html = [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
    '<head><meta charset="utf-8" />',
    `<title>${escapeHtml(title)}</title>`,
    '<style>',
    'body{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.6;color:#111827;margin:32px;}',
    'h1{font-size:20pt;margin:0 0 14px;}',
    'p{margin:0 0 10px;}',
    '</style></head><body>',
    `<h1>${escapeHtml(title)}</h1>`,
    ...String(text || '')
      .split(/\r?\n/)
      .map((line) => `<p>${escapeHtml(line) || '&nbsp;'}</p>`),
    '</body></html>',
  ].join('')

  return new Blob([`\uFEFF${html}`], { type: 'application/msword;charset=utf-8' })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadTextAsWord(text, filename, title) {
  downloadBlob(buildWordBlob(text, title), filename)
}

function CvForm({ accessToken, user, busy, onRun, offreContext }) {
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    resumeProfil: '',
    competences: offreContext?.competencesRequises || '',
    titreSouhaite: offreContext?.titre || '',
  })
  const up = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const body = {
      ...form,
      competences: form.competences
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    onRun('cv', () => genererCv(accessToken, body))
  }

  return (
    <form className="tb-ai-form" onSubmit={submit}>
      <h3>Generer un CV</h3>
      {offreContext?.titre ? (
        <p className="tb-ai-context-hint">
          Pre-rempli pour l offre : <strong>{offreContext.titre}</strong>
        </p>
      ) : null}
      <div className="tb-ai-form-grid">
        <div className="tb-ai-field">
          <label>Prenom</label>
          <input value={form.prenom} onChange={up('prenom')} placeholder="Votre prenom" />
        </div>
        <div className="tb-ai-field">
          <label>Nom</label>
          <input value={form.nom} onChange={up('nom')} placeholder="Votre nom" />
        </div>
        <div className="tb-ai-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={up('email')} placeholder="votre@email.com" />
        </div>
        <div className="tb-ai-field">
          <label>Poste vise</label>
          <input value={form.titreSouhaite} onChange={up('titreSouhaite')} placeholder="Developpeur Full Stack..." />
        </div>
        <div className="tb-ai-field tb-ai-field-full">
          <label>Competences</label>
          <input value={form.competences} onChange={up('competences')} placeholder="React, Node.js, Python..." />
        </div>
      </div>
      <div className="tb-ai-field">
        <label>Resume du profil</label>
        <textarea rows={3} value={form.resumeProfil} onChange={up('resumeProfil')} placeholder="Decrivez brievement votre parcours et objectifs..." />
      </div>
      <button type="submit" className="tb-btn tb-btn-solid" disabled={Boolean(busy)}>
        {busy === 'cv' ? 'Generation en cours...' : 'Generer mon CV'}
      </button>
    </form>
  )
}

function LettreForm({ accessToken, user, busy, onRun, offreContext }) {
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    entreprise: offreContext?.entreprise || '',
    offre_titre: offreContext?.titre || '',
    offre_description: offreContext?.description || '',
  })
  const up = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onRun('lettre', () => genererLettre(accessToken, form))
  }

  return (
    <form className="tb-ai-form" onSubmit={submit}>
      <h3>Lettre de motivation</h3>
      <div className="tb-ai-form-grid">
        <div className="tb-ai-field">
          <label>Prenom</label>
          <input value={form.prenom} onChange={up('prenom')} placeholder="Votre prenom" />
        </div>
        <div className="tb-ai-field">
          <label>Nom</label>
          <input value={form.nom} onChange={up('nom')} placeholder="Votre nom" />
        </div>
        <div className="tb-ai-field">
          <label>Entreprise cible</label>
          <input value={form.entreprise} onChange={up('entreprise')} placeholder="Nom de l entreprise" />
        </div>
        <div className="tb-ai-field">
          <label>Titre de l offre</label>
          <input value={form.offre_titre} onChange={up('offre_titre')} placeholder="Developpeur Full Stack..." />
        </div>
      </div>
      <div className="tb-ai-field">
        <label>Description de l offre</label>
        <textarea rows={3} value={form.offre_description} onChange={up('offre_description')} placeholder="Copiez la description de l offre ici..." />
      </div>
      <button type="submit" className="tb-btn tb-btn-solid" disabled={Boolean(busy)}>
        {busy === 'lettre' ? 'Generation en cours...' : 'Generer la lettre'}
      </button>
    </form>
  )
}

function EmailForm({ accessToken, user, busy, onRun, offreContext }) {
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    destinataire: offreContext?.entreprise || '',
    offre_titre: offreContext?.titre || '',
  })
  const up = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onRun('email', () => genererEmail(accessToken, form))
  }

  return (
    <form className="tb-ai-form" onSubmit={submit}>
      <h3>Email professionnel</h3>
      <div className="tb-ai-form-grid">
        <div className="tb-ai-field">
          <label>Prenom</label>
          <input value={form.prenom} onChange={up('prenom')} placeholder="Votre prenom" />
        </div>
        <div className="tb-ai-field">
          <label>Nom</label>
          <input value={form.nom} onChange={up('nom')} placeholder="Votre nom" />
        </div>
        <div className="tb-ai-field">
          <label>Destinataire</label>
          <input value={form.destinataire} onChange={up('destinataire')} placeholder="Nom du recruteur ou entreprise" />
        </div>
        <div className="tb-ai-field">
          <label>Titre de l offre</label>
          <input value={form.offre_titre} onChange={up('offre_titre')} placeholder="Stage Data Analyst..." />
        </div>
      </div>
      <button type="submit" className="tb-btn tb-btn-solid" disabled={Boolean(busy)}>
        {busy === 'email' ? 'Generation en cours...' : 'Generer l email'}
      </button>
    </form>
  )
}

function AdaptOffreForm({ accessToken, busy, onRun }) {
  const [form, setForm] = useState({
    contenu: '',
    titre: '',
    description: '',
    competencesRequises: '',
    localisation: '',
    type: 'emploi',
  })
  const up = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const body = {
      contenu: form.contenu,
      offre: {
        titre: form.titre,
        description: form.description,
        competencesRequises: form.competencesRequises,
        localisation: form.localisation,
        type: form.type,
      },
    }
    onRun('adapt', () => adapterOffre(accessToken, body))
  }

  return (
    <form className="tb-ai-form" onSubmit={submit}>
      <h3>Adapter une offre</h3>
      <div className="tb-ai-field">
        <label>Brouillon de l offre</label>
        <textarea rows={4} value={form.contenu} onChange={up('contenu')} placeholder="Collez le texte de votre offre ici..." />
      </div>
      <div className="tb-ai-form-grid">
        <div className="tb-ai-field">
          <label>Titre</label>
          <input value={form.titre} onChange={up('titre')} placeholder="Titre de l offre cible" />
        </div>
        <div className="tb-ai-field">
          <label>Localisation</label>
          <input value={form.localisation} onChange={up('localisation')} placeholder="Casablanca, Rabat..." />
        </div>
        <div className="tb-ai-field">
          <label>Competences requises</label>
          <input value={form.competencesRequises} onChange={up('competencesRequises')} placeholder="Java, Spring Boot..." />
        </div>
        <div className="tb-ai-field">
          <label>Type</label>
          <select value={form.type} onChange={up('type')}>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
          </select>
        </div>
      </div>
      <div className="tb-ai-field">
        <label>Description cible</label>
        <textarea rows={3} value={form.description} onChange={up('description')} placeholder="Decrivez le poste cible..." />
      </div>
      <button type="submit" className="tb-btn tb-btn-solid" disabled={Boolean(busy)}>
        {busy === 'adapt' ? 'Adaptation en cours...' : 'Adapter le texte'}
      </button>
    </form>
  )
}

function ResultSection({ output, lastType, user }) {
  const resultRef = useRef(null)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(
      () => toast.success('Copie dans le presse-papier'),
      () => toast.error('Impossible de copier'),
    )
  }, [output])

  const handleDownloadWord = useCallback(() => {
    const typeLabel = TYPE_LABELS[lastType] || 'Document'
    const filename = buildDocumentFilename(lastType, user, 'doc')
    downloadTextAsWord(output, filename, typeLabel)
    toast.success('Word telecharge')
  }, [output, lastType, user])

  const handleDownloadTxt = useCallback(() => {
    const filename = buildDocumentFilename(lastType, user, 'txt')
    downloadBlob(new Blob([output], { type: 'text/plain;charset=utf-8' }), filename)
  }, [output, lastType, user])

  if (!output) return null

  return (
    <section className="tb-panel tb-mt tb-ai-result" ref={resultRef}>
      <div className="tb-ai-result-header">
        <h3>{TYPE_LABELS[lastType] || 'Resultat'} genere</h3>
        <div className="tb-ai-result-actions">
          <button type="button" className="tb-btn tb-btn-solid tb-btn-sm" onClick={handleDownloadWord}>
            Telecharger Word
          </button>
          <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={handleDownloadTxt}>
            Telecharger TXT
          </button>
          <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={handleCopy}>
            Copier
          </button>
        </div>
      </div>
      <pre className="tb-pre">{output}</pre>
    </section>
  )
}

function GeneratedDocsSummary({ docs, offreContext, user }) {
  if (!docs.cv && !docs.lettre && !docs.email) return null

  return (
    <section className="tb-panel tb-mt">
      <h3 className="tb-ai-docs-title">Documents generes</h3>
      {offreContext?.titre ? (
        <p className="tb-ai-context-hint">Pour l offre : {offreContext.titre}</p>
      ) : null}
      <div className="tb-ai-docs-grid">
        {Object.entries(docs).map(([key, content]) => {
          if (!content) return null
          return (
            <div key={key} className="tb-ai-doc-card">
              <div className="tb-ai-doc-card-icon">{key === 'cv' ? 'DOC' : key === 'lettre' ? 'LETTRE' : 'EMAIL'}</div>
              <strong>{TYPE_LABELS[key]}</strong>
              <div className="tb-ai-doc-card-actions">
                <button
                  type="button"
                  className="tb-btn tb-btn-solid tb-btn-sm"
                  onClick={() => {
                    downloadTextAsWord(content, buildDocumentFilename(key, user, 'doc'), TYPE_LABELS[key] || 'Document')
                    toast.success('Word telecharge')
                  }}
                >
                  WORD
                </button>
                <button
                  type="button"
                  className="tb-btn tb-btn-ghost tb-btn-sm"
                  onClick={() => {
                    downloadBlob(
                      new Blob([content], { type: 'text/plain;charset=utf-8' }),
                      buildDocumentFilename(key, user, 'txt'),
                    )
                  }}
                >
                  TXT
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function AiToolsPage() {
  const { accessToken, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const offreContext = location.state?.offreContext || null
  const [output, setOutput] = useState('')
  const [lastType, setLastType] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [generatedDocs, setGeneratedDocs] = useState({ cv: '', lettre: '', email: '' })

  const run = async (key, fn) => {
    setBusy(key)
    setError('')
    setOutput('')
    setLastType(key)
    try {
      const data = await fn()
      const content = typeof data?.contenu === 'string' ? data.contenu : JSON.stringify(data, null, 2)
      setOutput(content)
      if (key === 'cv' || key === 'lettre' || key === 'email') {
        setGeneratedDocs((prev) => ({ ...prev, [key]: content }))
      }
      toast.success('Document genere avec succes')
    } catch (err) {
      const msg = extractErrorMessage(err, 'Service IA indisponible pour le moment')
      setError(msg)
      toast.error(msg)
    } finally {
      setBusy('')
    }
  }

  const isStudent = user?.role === 'etudiant'
  const isEntreprise = user?.role === 'entreprise'

  const goBackToOffer = () => {
    if (offreContext?.id) {
      navigate(`/offres/${offreContext.id}`)
    } else {
      navigate(PATHS.OFFERS_HOME)
    }
  }

  return (
    <FormCard title="Outils IA" subtitle="Generez des documents professionnels grace a l intelligence artificielle.">
      <StatusMessage type="error">{error}</StatusMessage>

      {offreContext?.titre ? (
        <div className="tb-ai-offre-banner">
          <span className="tb-eyebrow">Offre cible</span>
          <strong>{offreContext.titre}</strong>
          {offreContext.entreprise ? <span> - {offreContext.entreprise}</span> : null}
          {offreContext.localisation ? <span> ({offreContext.localisation})</span> : null}
          <div className="tb-ai-banner-actions">
            <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={goBackToOffer}>
              Retour a l offre
            </button>
          </div>
        </div>
      ) : null}

      {isStudent ? (
        <div className="tb-ai-sections">
          <section className="tb-panel">
            <CvForm accessToken={accessToken} user={user} busy={busy} onRun={run} offreContext={offreContext} />
          </section>
          <section className="tb-panel">
            <LettreForm accessToken={accessToken} user={user} busy={busy} onRun={run} offreContext={offreContext} />
          </section>
          <section className="tb-panel">
            <EmailForm accessToken={accessToken} user={user} busy={busy} onRun={run} offreContext={offreContext} />
          </section>
        </div>
      ) : null}

      {isEntreprise ? (
        <div className="tb-ai-sections">
          <section className="tb-panel">
            <AdaptOffreForm accessToken={accessToken} busy={busy} onRun={run} />
          </section>
        </div>
      ) : null}

      {!isStudent && !isEntreprise ? (
        <p className="tb-empty-state">Ces outils sont disponibles pour les profils etudiant et entreprise.</p>
      ) : null}

      {busy ? (
        <section className="tb-panel tb-mt">
          <div className="tb-loading-wrap">
            <span className="tb-loading-spinner" aria-hidden="true" />
            <span>Generation en cours, veuillez patienter...</span>
          </div>
        </section>
      ) : null}

      <ResultSection output={output} lastType={lastType} user={user} />

      <GeneratedDocsSummary docs={generatedDocs} offreContext={offreContext} user={user} />
    </FormCard>
  )
}

export { buildDocumentFilename, buildWordBlob, downloadBlob, downloadTextAsWord }
