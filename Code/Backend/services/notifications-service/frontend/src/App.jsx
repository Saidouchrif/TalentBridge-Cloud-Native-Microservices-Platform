import { useEffect, useState } from "react";

const apiBase = "/api/notifications";

function App() {
  const [userId, setUserId] = useState("1");
  const [userRole, setUserRole] = useState("admin");
  const [userEmail, setUserEmail] = useState("test@example.com");
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("Prêt. Cliquez sur un bouton pour démarrer.");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    targetUserId: "5",
    type: "registration",
    canal: "in-app",
    priority: "normal",
    message: "Bienvenue sur TalentBridge !"
  });

  useEffect(() => {
    // Ne charge rien automatiquement pour garder le contrôle.
  }, []);

  const headers = () => ({
    "Content-Type": "application/json",
    "X-User-ID": userId,
    "X-User-Role": userRole,
    "X-User-Email": userEmail
  });

  const handleResponse = async (response, successMessage) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur API");
    }
    setStatus(successMessage);
    return data;
  };

  const fetchNotifications = async () => {
    try {
      setStatus("Chargement des notifications...");
      const response = await fetch(apiBase, { headers: headers() });
      const data = await handleResponse(response, "Notifications chargées.");
      setNotifications(data.notifications || []);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const getUnreadCount = async () => {
    try {
      setStatus("Récupération du nombre de notifications non lues...");
      const response = await fetch(`${apiBase}/unread/count`, { headers: headers() });
      const data = await handleResponse(response, "Compte récupéré.");
      setStatus(`Notifications non lues : ${data.unreadCount}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const createNotification = async () => {
    try {
      setStatus("Création de la notification...");
      const response = await fetch(apiBase, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          userId: Number(form.targetUserId),
          type: form.type,
          canal: form.canal,
          priority: form.priority,
          message: form.message
        })
      });
      const data = await handleResponse(response, "Notification créée.");
      setStatus(`Notification créée (ID ${data.notification?.id || "?"}).`);
      setNotifications((prev) => [data.notification, ...prev]);
      setShowCreate(false);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const patchNotification = async (id, action) => {
    try {
      setStatus(`${action === "read" ? "Lecture" : "Délecture"} en cours...`);
      const response = await fetch(`${apiBase}/${id}/${action}`, {
        method: "PATCH",
        headers: headers()
      });
      await handleResponse(response, `Notification ${id} ${action === "read" ? "marquée comme lue" : "marquée comme non lue"}.`);
      fetchNotifications();
    } catch (error) {
      setStatus(error.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setStatus("Suppression en cours...");
      const response = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
        headers: headers()
      });
      await handleResponse(response, `Notification ${id} supprimée.`);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Notifications Service</h1>
          <p>Frontend intégré au service, sans JWT. Utilise les headers personnalisés.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Identité de l'utilisateur</h2>
        <div className="grid">
          <label>
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
          <label>
            Role
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
              <option value="admin">admin</option>
              <option value="student">student</option>
              <option value="company">company</option>
            </select>
          </label>
          <label>
            Email
            <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="panel actions">
        <div className="actions-row">
          <button onClick={fetchNotifications}>Charger mes notifications</button>
          <button onClick={getUnreadCount}>Compter non-lues</button>
          <button onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? "Fermer" : "Créer une notification"}
          </button>
        </div>
        <p className="status">{status}</p>
      </section>

      {showCreate && (
        <section className="panel create-panel">
          <h2>Nouvelle notification</h2>
          <div className="grid">
            <label>
              User ID cible
              <input
                value={form.targetUserId}
                onChange={(e) => setForm((prev) => ({ ...prev, targetUserId: e.target.value }))}
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="registration">registration</option>
                <option value="new_offer">new_offer</option>
                <option value="application_status">application_status</option>
                <option value="admin_alert">admin_alert</option>
                <option value="document_generated">document_generated</option>
              </select>
            </label>
            <label>
              Canal
              <select
                value={form.canal}
                onChange={(e) => setForm((prev) => ({ ...prev, canal: e.target.value }))}
              >
                <option value="in-app">in-app</option>
                <option value="email">email</option>
                <option value="push">push</option>
              </select>
            </label>
            <label>
              Priorité
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              >
                <option value="normal">normal</option>
                <option value="high">high</option>
                <option value="low">low</option>
              </select>
            </label>
            <label className="full-width">
              Message
              <textarea
                rows="3"
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </label>
          </div>
          <button className="primary" onClick={createNotification}>
            Envoyer la notification
          </button>
        </section>
      )}

      <section className="panel list-panel">
        <h2>Liste des notifications</h2>
        {notifications.length === 0 ? (
          <p>Aucune notification chargée.</p>
        ) : (
          <div className="notifications-grid">
            {notifications.map((notification) => (
              <article key={notification.id} className="notification-card">
                <div className="notification-header">
                  <strong>{notification.type}</strong>
                  <span>{notification.canal}</span>
                </div>
                <p>{notification.message}</p>
                <div className="notification-meta">
                  <span>{notification.priority}</span>
                  <span>{notification.statut || "pending"}</span>
                </div>
                <div className="notification-actions">
                  <button onClick={() => patchNotification(notification.id, "read")}>Marquer lue</button>
                  <button onClick={() => patchNotification(notification.id, "unread")}>Marquer non lue</button>
                  <button className="danger" onClick={() => deleteNotification(notification.id)}>
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
