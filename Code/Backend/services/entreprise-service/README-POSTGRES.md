# Configuration PostgreSQL pour Entreprise Service

## Installation et Démarrage

### 1. Avec Docker (Recommandé)
```bash
# Démarrer PostgreSQL
docker-compose up -d entreprise-postgres

# Insérer les données et démarrer le service
start-postgres.bat
```

### 2. Manuellement

#### Étape 1: Démarrer PostgreSQL
```bash
docker-compose up -d entreprise-postgres
```

#### Étape 2: Insérer les données
```bash
node.exe seed-postgres.js
```

#### Étape 3: Démarrer le serveur
```bash
node.exe src/server.js
```

## Configuration

Le fichier `.env` contient la configuration PostgreSQL:
- **Host**: localhost
- **Port**: 5432
- **Database**: entreprise_db
- **User**: postgres
- **Password**: postgres

## Endpoints de test

- **Entreprises**: http://localhost:5002/api/entreprises
- **Offres**: http://localhost:5002/api/offers
- **Santé**: http://localhost:5002/health

## Données de test

Le script `seed-postgres.js` insère:
- 5 entreprises (TechCorp, Digital Marketing, HealthCare, Green Energy, Finance Innovation)
- 6 offres (développement, data science, marketing, etc.)
- 7 candidatures (pending/accepted/rejected)

## Vérification

Pour vérifier que PostgreSQL fonctionne:
```bash
# Vérifier le conteneur
docker ps

# Se connecter à la base
docker exec -it talentbridge-entreprise-postgres psql -U postgres -d entreprise_db

# Lister les tables
\dt
```
