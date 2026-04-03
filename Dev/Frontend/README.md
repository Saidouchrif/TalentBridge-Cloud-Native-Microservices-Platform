# TalentBridge Frontend (Auth/User)

Frontend React/Vite de la plateforme TalentBridge (SaaS Auth + User management).

## 1) Architecture frontend

Le code est organise par responsabilite metier, avec separation claire des routes, services, layouts et features:

```text
Frontend/
  public/
    logo-talentbridge.png
  src/
    app/
      App.jsx
    routes/
      paths.js
      router.js
    services/
      auth/
        AuthContext.jsx
    layouts/
      AppShell/
        AppShell.jsx
    components/
      ui/
        FormCard/
          FormCard.jsx
        ConfirmationDialog/
          ConfirmationDialog.jsx
    features/
      auth/
        pages/
      admin/
        pages/
      dashboard/
        pages/
      profile/
        pages/
      system/
        pages/
      shared/
        extractErrorMessage.js
    index.css
    main.jsx
```

## 2) Configuration

Creer `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables principales:

```env
VITE_API_URL=http://localhost:8000
```

## 3) Lancement local

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## 4) Routes frontend

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password?token=...`
- `/email-verification?email=...`
- `/verify-email?token=...`
- `/dashboard`
- `/profile`
- `/admin/users`
- `/admin/create-user`

## 5) Strategie de protection des routes

- `guest-only`: login/register/forgot/reset/verify/email-verification
- `private`: dashboard/profile/admin/*
- `admin-only`: admin/users + admin/create-user

Comportement:
- user non authentifie sur route protegee => redirection `/login`
- user authentifie sur route guest-only => redirection `/dashboard`
- user non admin sur route admin => page `Unauthorized`

## 6) Session + securite

- Access token conserve en `sessionStorage`
- Refresh token conserve en `localStorage`
- Refresh automatique sur `401` via `/api/auth/refresh`
- Nettoyage session au logout
- Correction du bug de flash: pas d'ecran de boot inutile quand aucun token n'existe

## 7) UX/UI

- Theme SaaS TalentBridge
- Branding logo integre dans topbar et cartes auth
- Feedback unifie via composant `StatusMessage`
- Confirmations admin via modal `div` (`ConfirmationDialog`) pour les actions sensibles

## 8) Prerequis backend

Le backend Auth/User doit etre disponible sur `http://localhost:8000`.
