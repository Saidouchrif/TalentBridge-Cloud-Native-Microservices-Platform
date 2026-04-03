import { useEffect, useState } from 'react'

import ConfirmationDialog from '../../../components/ui/ConfirmationDialog/ConfirmationDialog'
import { FormCard, StatusMessage } from '../../../components/ui/FormCard/FormCard'
import { useAuth } from '../../../services/auth/AuthContext'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

const EMPTY_EDIT = { nom: '', prenom: '', email: '', role: 'etudiant' }

export default function AdminUsersPage() {
  const { listUsers, listDeletedUsers, updateUserByAdmin, deleteUserByAdmin, restoreUserByAdmin } = useAuth()

  const [users, setUsers] = useState([])
  const [deletedUsers, setDeletedUsers] = useState([])
  const [editMap, setEditMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [active, deleted] = await Promise.all([listUsers(), listDeletedUsers()])
      setUsers(active)
      setDeletedUsers(deleted)

      const nextMap = {}
      active.forEach((u) => {
        nextMap[u.id] = {
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          role: u.role,
        }
      })
      setEditMap(nextMap)
    } catch (err) {
      setError(extractErrorMessage(err, 'Impossible de charger les utilisateurs'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateEdit = (userId, key, value) => {
    setEditMap((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || EMPTY_EDIT),
        [key]: value,
      },
    }))
  }

  const onSaveUser = async (userId) => {
    setMessage('')
    setError('')
    try {
      await updateUserByAdmin(userId, editMap[userId])
      setMessage('Utilisateur mis a jour')
      await loadData()
    } catch (err) {
      setError(extractErrorMessage(err, 'Mise a jour impossible'))
    }
  }

  const askDeleteUser = (user) => {
    setPendingAction({
      type: 'delete',
      userId: user.id,
      title: 'Confirmer la suppression',
      message: `Supprimer ${user.prenom} ${user.nom} ? Le compte sera archive (soft delete).`,
      confirmLabel: 'Oui, supprimer',
    })
  }

  const askRestoreUser = (user) => {
    setPendingAction({
      type: 'restore',
      userId: user.id,
      title: 'Confirmer la restauration',
      message: `Restaurer le compte ${user.prenom} ${user.nom} ?`,
      confirmLabel: 'Oui, restaurer',
    })
  }

  const onConfirmAction = async () => {
    if (!pendingAction) return

    setMessage('')
    setError('')
    setConfirmLoading(true)

    try {
      if (pendingAction.type === 'delete') {
        await deleteUserByAdmin(pendingAction.userId)
        setMessage('Utilisateur supprime (soft delete)')
      } else {
        await restoreUserByAdmin(pendingAction.userId)
        setMessage('Utilisateur restaure')
      }
      setPendingAction(null)
      await loadData()
    } catch (err) {
      setError(extractErrorMessage(err, 'Operation impossible'))
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <section className="tb-grid">
      <FormCard title="Utilisateurs actifs" subtitle="Edition, role, soft delete">
        <button type="button" className="tb-btn tb-btn-ghost" onClick={loadData} disabled={loading}>
          {loading ? 'Chargement...' : 'Recharger'}
        </button>

        <StatusMessage type="success">{message}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <div className="tb-table-wrap">
          <table className="tb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prenom</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verifie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <input value={editMap[u.id]?.nom || ''} onChange={(e) => updateEdit(u.id, 'nom', e.target.value)} />
                  </td>
                  <td>
                    <input
                      value={editMap[u.id]?.prenom || ''}
                      onChange={(e) => updateEdit(u.id, 'prenom', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={editMap[u.id]?.email || ''}
                      onChange={(e) => updateEdit(u.id, 'email', e.target.value)}
                    />
                  </td>
                  <td>
                    <select value={editMap[u.id]?.role || 'etudiant'} onChange={(e) => updateEdit(u.id, 'role', e.target.value)}>
                      <option value="admin">admin</option>
                      <option value="entreprise">entreprise</option>
                      <option value="etudiant">etudiant</option>
                    </select>
                  </td>
                  <td>{u.email_verifie ? 'Oui' : 'Non'}</td>
                  <td>
                    <div className="tb-actions-inline">
                      <button type="button" className="tb-btn tb-btn-mini" onClick={() => onSaveUser(u.id)}>
                        Save
                      </button>
                      <button type="button" className="tb-btn tb-btn-mini tb-btn-danger" onClick={() => askDeleteUser(u)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="tb-empty-cell">
                    Aucun utilisateur actif
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FormCard>

      <FormCard title="Utilisateurs supprimes" subtitle="Restauration admin">
        <div className="tb-table-wrap">
          <table className="tb-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prenom</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button type="button" className="tb-btn tb-btn-mini" onClick={() => askRestoreUser(u)}>
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
              {deletedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="tb-empty-cell">
                    Aucun utilisateur supprime
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FormCard>

      <ConfirmationDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.title || 'Confirmation'}
        message={pendingAction?.message || ''}
        confirmLabel={pendingAction?.confirmLabel || 'Confirmer'}
        danger={pendingAction?.type === 'delete'}
        loading={confirmLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={onConfirmAction}
      />
    </section>
  )
}
