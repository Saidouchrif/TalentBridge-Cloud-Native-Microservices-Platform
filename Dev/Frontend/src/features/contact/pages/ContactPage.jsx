import { useState } from 'react'
import { toast } from 'react-toastify'

import { ENV } from '../../../config/env'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${ENV.notifications}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || data?.detail || 'Erreur serveur')
      }
      toast.success('Message envoye avec succes')
      setForm({ nom: '', email: '', message: '' })
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de l envoi'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-contact-page">
      <div className="tb-contact-header">
        <span className="tb-eyebrow">Contact</span>
        <h1>Nous contacter</h1>
        <p className="tb-subtitle">
          Une question, un partenariat ou un retour ? Ecrivez-nous et nous vous repondrons dans les meilleurs delais.
        </p>
      </div>

      <form className="tb-contact-form tb-form" onSubmit={onSubmit}>
        <div className="tb-contact-field">
          <label htmlFor="contact-nom">Nom</label>
          <input id="contact-nom" value={form.nom} onChange={onChange('nom')} placeholder="Votre nom complet" required />
        </div>
        <div className="tb-contact-field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" value={form.email} onChange={onChange('email')} placeholder="votre@email.com" required />
        </div>
        <div className="tb-contact-field">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" rows={6} value={form.message} onChange={onChange('message')} placeholder="Decrivez votre demande..." required />
        </div>
        <button type="submit" className="tb-btn tb-btn-solid tb-btn-lg" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  )
}
