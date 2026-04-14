import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { entrepriseOfferApplicationsPath, PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { getEntreprisePublicInfo } from '../../entreprise/services/entreprise.service'
import { postuler, verifierCandidature } from '../../candidatures/services/candidatures.service'
import { genererCv, genererEmail, genererLettre } from '../../ai/services/aiDocument.service'
import { buildPdfBlob, downloadTextAsPdf } from '../../ai/pages/AiToolsPage'
import { deleteOffer, getOfferById } from '../services/offers.service'

function formatDate(value) {
  if (!value) return ' - '
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DocBadge({ label, content, onDownload, onPreview }) {
  if (!content) return null
  return (
    <div className="tb-doc-badge">
      <span className="tb-doc-badge-check" aria-hidden="true">&#10003;</span>
      <span className="tb-doc-badge-label">{label}</span>
      <div className="tb-doc-badge-actions">
        <button type="button" className="tb-link-btn" onClick={onPreview}>Apercu</button>
        <button type="button" className="tb-link-btn" onClick={onDownload}>PDF</button>
      </div>
    </div>
  )
}

export default function OfferDetailPage() {
  const { offreId } = useParams()
  const navigate = useNavigate()
  const { user, accessToken, isAuthenticated } = useAuth()
  const [offer, setOffer] = useState(null)
  const [entrepriseNom, setEntrepriseNom] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [alreadyApplied, setAlreadyApplied] = useState(false)

  const [genDocs, setGenDocs] = useState({ cv: '', lettre: '', email: '' })
  const [generating, setGenerating] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  const [cvFile, setCvFile] = useState(null)
  const [lettreFile, setLettreFile] = useState(null)
  const cvInputRef = useRef(null)
  const lettreInputRef = useRef(null)

  const idNum = Number(offreId)
  const isOwner =
    user?.role === 'entreprise' && offer && Number(offer.entreprise_id) === Number(user?.id)

  useEffect(() => {
    if (!accessToken || user?.role !== 'etudiant' || !Number.isInteger(idNum) || idNum < 1) return
    verifierCandidature(accessToken, idNum)
      .then((res) => { if (res?.applied) setAlreadyApplied(true) })
      .catch(() => {})
  }, [accessToken, user?.role, idNum])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!Number.isInteger(idNum) || idNum < 1) {
        setError('Offre introuvable')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await getOfferById(idNum)
        if (active) {
          setOffer(data)
          if (data?.entreprise_id) {
            getEntreprisePublicInfo(data.entreprise_id)
              .then((info) => { if (active && info?.nomEntreprise) setEntrepriseNom(info.nomEntreprise) })
              .catch(() => {})
          }
        }
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Impossible de charger cette offre'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [idNum])

  const buildOfferContext = () => ({
    id: offer?.id,
    titre: offer?.titre || '',
    description: offer?.description || '',
    competencesRequises: offer?.competencesRequises || '',
    localisation: offer?.localisation || '',
    type: offer?.type || '',
    entreprise: entrepriseNom || '',
  })

  const quickGenerate = async (type) => {
    if (!accessToken || generating) return
    setGenerating(type)
    try {
      const ctx = buildOfferContext()
      let data
      if (type === 'cv') {
        data = await genererCv(accessToken, {
          nom: user?.nom || '', prenom: user?.prenom || '', email: user?.email || '',
          competences: ctx.competencesRequises, titreSouhaite: ctx.titre,
        })
      } else if (type === 'lettre') {
        data = await genererLettre(accessToken, {
          nom: user?.nom || '', prenom: user?.prenom || '',
          entreprise: ctx.entreprise, offre_titre: ctx.titre, offre_description: ctx.description,
        })
      } else if (type === 'email') {
        data = await genererEmail(accessToken, {
          nom: user?.nom || '', prenom: user?.prenom || '',
          destinataire: ctx.entreprise, offre_titre: ctx.titre,
        })
      }
      const content = typeof data?.contenu === 'string' ? data.contenu : ''
      if (content) {
        setGenDocs((prev) => ({ ...prev, [type]: content }))
        toast.success(`${type === 'cv' ? 'CV' : type === 'lettre' ? 'Lettre' : 'Email'} genere avec succes`)

        if (type === 'cv') {
          const blob = buildPdfBlob(content)
          setCvFile(new File([blob], 'CV_TalentBridge.pdf', { type: 'application/pdf' }))
        }
        if (type === 'lettre') {
          const blob = buildPdfBlob(content)
          setLettreFile(new File([blob], 'Lettre_TalentBridge.pdf', { type: 'application/pdf' }))
        }
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de la generation'))
    } finally {
      setGenerating('')
    }
  }

  const goToAiWithOffer = () => {
    navigate(PATHS.AI_TOOLS, { state: { offreContext: buildOfferContext() } })
  }

  const onPostuler = async (event) => {
    event.preventDefault()
    if (!accessToken || user?.role !== 'etudiant') return
    setApplying(true)
    try {
      await postuler(accessToken, {
        offre_id: idNum,
        message: message.trim() || undefined,
        cvFile: cvFile || undefined,
        lettreFile: lettreFile || undefined,
        entreprise_nom: entrepriseNom || undefined,
      })
      toast.success('Candidature envoyee avec succes')
      setMessage('')
      setAlreadyApplied(true)
    } catch (err) {
      const msg = extractErrorMessage(err, 'Impossible d envoyer la candidature')
      if (err?.status === 409) setAlreadyApplied(true)
      toast.error(msg)
    } finally {
      setApplying(false)
    }
  }

  const onDelete = async () => {
    if (!isOwner || !accessToken) return
    if (!window.confirm('Supprimer definitivement cette offre ?')) return
    setDeleting(true)
    try {
      await deleteOffer(accessToken, idNum)
      toast.success('Offre supprimee')
      navigate(PATHS.ENTREPRISE_OFFERS, { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Suppression impossible'))
    } finally {
      setDeleting(false)
    }
  }

  const hasAnyDoc = genDocs.cv || genDocs.lettre || genDocs.email

  if (loading) {
    return (
      <div className="tb-detail-page">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="tb-detail-page">
        <StatusMessage type="error">{error || 'Offre introuvable'}</StatusMessage>
        <Link className="tb-btn tb-btn-ghost" to={PATHS.OFFERS_HOME}>Retour aux offres</Link>
      </div>
    )
  }

  return (
    <div className="tb-detail-page">
      <Link className="tb-back-link" to={PATHS.OFFERS_HOME}>&larr; Retour au catalogue</Link>

      <div className="tb-detail-hero">
        <div className="tb-detail-hero-top">
          <span className={`tb-offer-type tb-offer-type-lg tb-offer-type-${offer.type}`}>
            {offer.type === 'stage' ? 'Stage' : 'Emploi'}
          </span>
          <span className="tb-detail-date">Publiee le {formatDate(offer.datePublication)}</span>
        </div>
        <h1 className="tb-detail-title">{offer.titre}</h1>
        {entrepriseNom ? <p className="tb-detail-entreprise">{entrepriseNom}</p> : null}
        <div className="tb-detail-tags">
          {offer.localisation ? <span className="tb-detail-tag">{offer.localisation}</span> : null}
          {offer.salaire ? <span className="tb-detail-tag">{offer.salaire}</span> : null}
          <span className="tb-detail-tag">Statut : {offer.statut}</span>
        </div>
      </div>

      <div className="tb-detail-body">
        <div className="tb-detail-content">
          <section className="tb-detail-section">
            <h2>Description</h2>
            <p className="tb-readable">{offer.description}</p>
          </section>
          <section className="tb-detail-section">
            <h2>Competences requises</h2>
            <p className="tb-readable">{offer.competencesRequises}</p>
          </section>
        </div>

        <aside className="tb-detail-sidebar">
          {!isAuthenticated && offer.statut === 'actif' ? (
            <div className="tb-detail-sidebar-card">
              <h3>Interesse par cette offre ?</h3>
              <p>Connectez-vous pour postuler et generer vos documents.</p>
              <Link className="tb-btn tb-btn-solid tb-btn-lg tb-btn-block" to={PATHS.LOGIN}>
                Se connecter pour postuler
              </Link>
            </div>
          ) : null}

          {isAuthenticated && user?.role === 'etudiant' && offer.statut === 'actif' ? (
            <>
              <div className="tb-detail-sidebar-card">
                <h3>Generer vos documents</h3>
                <p className="tb-detail-sidebar-hint">Generez votre CV, lettre et email adaptes a cette offre.</p>
                <div className="tb-gen-buttons">
                  <button
                    type="button"
                    className={`tb-btn tb-btn-outline tb-btn-block${genDocs.cv ? ' tb-btn-done' : ''}`}
                    disabled={Boolean(generating)}
                    onClick={() => quickGenerate('cv')}
                  >
                    {generating === 'cv' ? 'Generation...' : genDocs.cv ? '✓ CV genere' : 'Generer CV'}
                  </button>
                  <button
                    type="button"
                    className={`tb-btn tb-btn-outline tb-btn-block${genDocs.lettre ? ' tb-btn-done' : ''}`}
                    disabled={Boolean(generating)}
                    onClick={() => quickGenerate('lettre')}
                  >
                    {generating === 'lettre' ? 'Generation...' : genDocs.lettre ? '✓ Lettre generee' : 'Generer Lettre'}
                  </button>
                  <button
                    type="button"
                    className={`tb-btn tb-btn-outline tb-btn-block${genDocs.email ? ' tb-btn-done' : ''}`}
                    disabled={Boolean(generating)}
                    onClick={() => quickGenerate('email')}
                  >
                    {generating === 'email' ? 'Generation...' : genDocs.email ? '✓ Email genere' : 'Generer Email'}
                  </button>
                </div>
                {generating ? (
                  <div className="tb-loading-wrap tb-loading-sm">
                    <span className="tb-loading-spinner" aria-hidden="true" />
                    <span>Generation IA en cours...</span>
                  </div>
                ) : null}
                <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm tb-btn-block" onClick={goToAiWithOffer}>
                  Ouvrir les outils IA avances
                </button>
              </div>

              {hasAnyDoc ? (
                <div className="tb-detail-sidebar-card">
                  <h3>Documents prets</h3>
                  <DocBadge label="CV" content={genDocs.cv}
                    onDownload={() => downloadTextAsPdf(genDocs.cv, 'CV_TalentBridge.pdf')}
                    onPreview={() => setPreviewDoc({ type: 'cv', content: genDocs.cv })} />
                  <DocBadge label="Lettre de motivation" content={genDocs.lettre}
                    onDownload={() => downloadTextAsPdf(genDocs.lettre, 'Lettre_TalentBridge.pdf')}
                    onPreview={() => setPreviewDoc({ type: 'lettre', content: genDocs.lettre })} />
                  <DocBadge label="Email professionnel" content={genDocs.email}
                    onDownload={() => downloadTextAsPdf(genDocs.email, 'Email_TalentBridge.pdf')}
                    onPreview={() => setPreviewDoc({ type: 'email', content: genDocs.email })} />
                </div>
              ) : null}

              {alreadyApplied ? (
                <div className="tb-detail-sidebar-card">
                  <div className="tb-already-applied-banner">
                    <span className="tb-check-icon" aria-hidden="true">&#10003;</span>
                    Vous avez d&eacute;j&agrave; postul&eacute; &agrave; cette offre
                  </div>
                  <Link className="tb-btn tb-btn-outline tb-btn-block" to={PATHS.APPLICATIONS} style={{ marginTop: 12 }}>
                    Voir mes candidatures
                  </Link>
                </div>
              ) : (
                <div className="tb-detail-sidebar-card">
                  <h3>Postuler</h3>
                  {hasAnyDoc ? (
                    <p className="tb-detail-sidebar-hint tb-text-success">
                      Vos documents IA generes seront envoyes automatiquement.
                    </p>
                  ) : null}

                  <form className="tb-form" onSubmit={onPostuler}>
                    <label htmlFor="cand-msg">Message (optionnel)</label>
                    <textarea
                      id="cand-msg"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={5000}
                      placeholder="Votre message pour le recruteur..."
                    />

                    <div className="tb-upload-group">
                      <div className="tb-upload-field">
                        <label>CV (PDF)</label>
                        <input
                          ref={cvInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) setCvFile(f)
                          }}
                        />
                        {cvFile ? <span className="tb-file-name">{cvFile.name}</span> : null}
                      </div>
                      <div className="tb-upload-field">
                        <label>Lettre de motivation (PDF)</label>
                        <input
                          ref={lettreInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) setLettreFile(f)
                          }}
                        />
                        {lettreFile ? <span className="tb-file-name">{lettreFile.name}</span> : null}
                      </div>
                    </div>

                    <button type="submit" className="tb-btn tb-btn-solid tb-btn-lg tb-btn-block" disabled={applying}>
                      {applying ? 'Envoi en cours...' : 'Postuler'}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : null}

          {isOwner ? (
            <div className="tb-detail-sidebar-card">
              <h3>Gestion</h3>
              <Link className="tb-btn tb-btn-solid tb-btn-block" to={`${PATHS.ENTREPRISE_OFFERS}?edit=${offer.id}`}>
                Modifier l offre
              </Link>
              <Link className="tb-btn tb-btn-ghost tb-btn-block" to={entrepriseOfferApplicationsPath(offer.id)}>
                Voir les candidatures
              </Link>
              <button type="button" className="tb-btn tb-btn-danger tb-btn-block" disabled={deleting} onClick={onDelete}>
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          ) : null}
        </aside>
      </div>

      {previewDoc ? (
        <div className="tb-preview-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="tb-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tb-preview-header">
              <h3>{previewDoc.type === 'cv' ? 'CV' : previewDoc.type === 'lettre' ? 'Lettre de motivation' : 'Email professionnel'}</h3>
              <button type="button" className="tb-btn tb-btn-ghost tb-btn-sm" onClick={() => setPreviewDoc(null)}>Fermer</button>
            </div>
            <pre className="tb-pre tb-preview-content">{previewDoc.content}</pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
