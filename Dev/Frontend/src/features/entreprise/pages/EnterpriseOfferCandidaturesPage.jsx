import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { ENV } from '../../../config/env'
import { PATHS } from '../../../routes/paths'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { listerCandidaturesParOffre, mettreAJourStatutCandidature } from '../../candidatures/services/candidatures.service'
import { recommandationsCandidats } from '../../matching/services/matching.service'

function formatDate(value) {
  if (!value) return ' - '
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('fr-FR')
}

function statusBadge(statut) {
  if (statut === 'accepte') return 'tb-status-badge tb-status-accepte'
  if (statut === 'refuse') return 'tb-status-badge tb-status-refuse'
  return 'tb-status-badge tb-status-attente'
}

function statusLabel(statut) {
  if (statut === 'accepte') return 'Accept\u00e9'
  if (statut === 'refuse') return 'Refus\u00e9'
  return 'En attente'
}

function buildDocUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${ENV.candidatures}${path}`
}

function CandidatureCard({ c, scores, busyId, onStatut }) {
  const cvLink = buildDocUrl(c.cv_url)
  const lettreLink = buildDocUrl(c.lettre_url)
  const score = scores[c.user_id]

  return (
    <div className="tb-cand-card">
      <div className="tb-cand-card-header">
        <div>
          <strong>{c.candidat_nom || `Candidat #${c.user_id}`}</strong>
          {c.candidat_email ? (
            <span className="tb-cand-email">{c.candidat_email}</span>
          ) : null}
          {score != null ? (
            <span className="tb-cand-score">Score : {Math.round(score * 100) / 100}</span>
          ) : null}
        </div>
        <span className={statusBadge(c.statut)}>{statusLabel(c.statut)}</span>
      </div>

      <div className="tb-cand-card-meta">
        <span>{"Postul\u00e9 le "}{formatDate(c.dateCandidature)}</span>
      </div>

      {c.message ? (
        <div className="tb-cand-card-section">
          <strong>Message</strong>
          <p className="tb-cand-message">{c.message}</p>
        </div>
      ) : null}

      <div className="tb-cand-card-section">
        <strong>Documents</strong>
        <div className="tb-cand-docs">
          {cvLink ? (
            <a href={cvLink} target="_blank" rel="noopener noreferrer" className="tb-cand-doc-link">
              Telecharger CV
            </a>
          ) : (
            <span className="tb-muted-small">Pas de CV</span>
          )}
          {lettreLink ? (
            <a href={lettreLink} target="_blank" rel="noopener noreferrer" className="tb-cand-doc-link">
              Telecharger Lettre
            </a>
          ) : (
            <span className="tb-muted-small">Pas de lettre</span>
          )}
        </div>
      </div>

      {c.statut === 'en_attente' ? (
        <div className="tb-cand-card-actions">
          <button
            type="button"
            className="tb-btn tb-btn-solid tb-btn-sm"
            disabled={busyId === c.id}
            onClick={() => onStatut(c.id, 'accepte')}
          >
            Accepter
          </button>
          <button
            type="button"
            className="tb-btn tb-btn-ghost tb-btn-sm"
            disabled={busyId === c.id}
            onClick={() => onStatut(c.id, 'refuse')}
          >
            Refuser
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function EnterpriseOfferCandidaturesPage() {
  const { offreId } = useParams()
  const { accessToken } = useAuth()
  const idNum = Number(offreId)

  const [rows, setRows] = useState([])
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!Number.isInteger(idNum) || idNum < 1) {
        setError('Offre invalide')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const [liste, reco] = await Promise.all([
          listerCandidaturesParOffre(accessToken, idNum),
          recommandationsCandidats(accessToken, idNum).catch(() => []),
        ])
        if (!active) return
        setRows(Array.isArray(liste) ? liste : [])
        const map = {}
        if (Array.isArray(reco)) {
          reco.forEach((r) => { map[r.user_id] = r.score })
        }
        setScores(map)
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Impossible de charger les candidatures'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [accessToken, idNum])

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const sa = scores[a.user_id]
      const sb = scores[b.user_id]
      if (sa != null && sb != null) return sb - sa
      if (sa != null) return -1
      if (sb != null) return 1
      return new Date(b.dateCandidature) - new Date(a.dateCandidature)
    })
  }, [rows, scores])

  const onStatut = async (candidatureId, statut) => {
    setBusyId(candidatureId)
    try {
      await mettreAJourStatutCandidature(accessToken, candidatureId, statut)
      toast.success(statut === 'accepte' ? 'Candidature accept\u00e9e' : 'Candidature refus\u00e9e')
      setRows((prev) => prev.map((r) => (r.id === candidatureId ? { ...r, statut } : r)))
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Action impossible'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <FormCard title="Candidatures" subtitle="Chargement...">
        <div className="tb-loading-wrap">
          <span className="tb-loading-spinner" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      </FormCard>
    )
  }

  return (
    <FormCard title="Candidatures" subtitle={`${(sorted[0] && sorted[0].offre_titre) || `Offre #${offreId}`} \u2014 ${sorted.length} candidature(s)`}>
      <StatusMessage type="error">{error}</StatusMessage>

      <div className="tb-actions tb-mb">
        <Link className="tb-btn tb-btn-ghost" to={PATHS.ENTREPRISE_OFFERS}>Retour \u00e0 mes offres</Link>
        <Link className="tb-btn tb-btn-ghost" to={`/offres/${offreId}`}>Voir l'offre</Link>
      </div>

      {sorted.length === 0 ? (
        <p className="tb-empty-state">Aucune candidature pour cette offre.</p>
      ) : (
        <div className="tb-cand-list">
          {sorted.map((c) => (
            <CandidatureCard key={c.id} c={c} scores={scores} busyId={busyId} onStatut={onStatut} />
          ))}
        </div>
      )}
    </FormCard>
  )
}
