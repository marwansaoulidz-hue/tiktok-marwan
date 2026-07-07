# Social Video App - Application Sociale Auto-Hébergée

Application web sociale auto-hébergée orientée vidéos courtes, avec feed, profils, recherche, messages privés, carte d'amis et administration.

## Fonctionnalités

- **Authentification** : Inscription, connexion, gestion de profil
- **Vidéos** : Upload (max 100MB, 45s), transcodage automatique, feed "Pour toi"
- **Social** : Likes, commentaires, abonnements, recherche
- **Messagerie** : Messages privés texte + GIF (Giphy)
- **Carte** : Partage de position entre amis
- **Administration** : Gestion utilisateurs, vidéos, modération
- **Stockage** : Limite de 150 Go pour les vidéos, 180 Go au total

## Stack Technique

- **Frontend** : Next.js 14, React, TailwindCSS, Lucide Icons
- **Backend** : NestJS, Prisma, MySQL
- **Administration BDD** : phpMyAdmin
- **Stockage** : MinIO (S3-compatible)
- **Cache** : Redis
- **Transcodage** : FFmpeg (via worker BullMQ)
- **Reverse Proxy** : Nginx
- **Déploiement** : Docker Compose

## Prérequis

- Docker et Docker Compose
- 4 Go RAM minimum
- 200 Go espace disque

## Installation

1. **Cloner le repository**

```bash
git clone <repository-url>
cd tiktok-marwan
```

2. **Configurer l'environnement**

Le fichier [.env](.env) est déjà présent avec des valeurs de départ. Vous pouvez l'ajuster si besoin.

3. **Lancer l'application**

```bash
docker compose up -d --build
```

4. **Si vous voulez repartir de zéro sur la base de données**

```bash
RESET_DB=true docker compose up -d --build
```

4. **Accéder à l'application**

- Frontend : http://localhost:4000
- API : http://localhost:4001
- MySQL : localhost:3307
- phpMyAdmin : http://localhost:5050
- Redis : localhost:6390
- MinIO : http://localhost:9100
- MinIO Console : http://localhost:9101

## Utilisateur Admin par défaut

- **Email** : admin@localhost
- **Mot de passe** : change_me_admin_password (configuré dans .env)
- **Pseudo** : admin

**Important** : Changez le mot de passe admin après le premier démarrage !

## Structure du Projet
social-video-app/
├── backend/ # API NestJS
│ ├── src/
│ │ ├── auth/ # Authentification JWT
│ │ ├── users/ # Gestion utilisateurs
│ │ ├── videos/ # Upload et gestion vidéos
│ │ ├── social/ # Likes, commentaires, abonnements
│ │ ├── messages/ # Messagerie temps réel
│ │ ├── locations/# Partage de position
│ │ ├── admin/ # Administration
│ │ ├── search/ # Recherche
│ │ ├── storage/ # MinIO client
│ │ └── queue/ # BullMQ pour jobs
│ └── prisma/
│ └── schema.prisma
├── worker/ # Worker transcodage vidéo FFmpeg
│ └── src/main.ts
├── frontend/ # Next.js
│ └── app/
│ ├── feed/ # Page feed principal
│ ├── upload/ # Page upload vidéo
│ ├── search/ # Page recherche
│ ├── messages/ # Page messagerie
│ ├── map/ # Page carte amis
│ ├── profile/ # Page profil
│ ├── admin/ # Page admin
│ └── settings/ # Page paramètres
├── nginx/ # Configuration Nginx
└── docker-compose.yml

## Limites de Stockage

| Élément | Valeur |
|---------|--------|
| Stockage vidéo max | 150 Go |
| Stockage total plateforme | ~180 Go |
| Durée max vidéo | 45 secondes |
| Résolution max | 1080x1920 |
| Taille max upload | 100 MB |
| Taille cible après conversion | 25-45 MB |
| Limite vidéos par utilisateur | 50 |

## Commandes Utiles

### Voir les logs

```bash
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f frontend
```

### Redémarrer un service

```bash
docker-compose restart api
```

### Arrêter tout

```bash
docker-compose down
```

### Supprimer les volumes (attention, données perdues)

```bash
docker-compose down -v
```

### Sauvegarde de la base de données

```bash
docker-compose exec mysql mysqldump -u socialapp -p socialapp > backup.sql
```

### Restauration de la base de données

```bash
cat backup.sql | docker-compose exec -T mysql mysql -u socialapp -p socialapp
```

### Générer une nouvelle migration Prisma

```bash
cd backend
npx prisma migrate dev --name nom_de_la_migration
```

## Accès phpMyAdmin

Interface web d'administration de la base de données MySQL :
1. Ouvrez http://localhost:5050
2. La connexion se fait automatiquement grâce aux identifiants configurés dans `.env`
3. Vous pouvez explorer les tables, exécuter des requêtes SQL et gérer les données directement

## Configuration Giphy (Optionnel)

Pour activer les GIF dans la messagerie :
1. Créez un compte sur https://developers.giphy.com/
2. Obtenez une API Key
3. Ajoutez `GIPHY_API_KEY=your_key` dans `.env`
4. Redémarrez les conteneurs

## Développement

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Worker

```bash
cd worker
npm install
npm run build
npm start
```

## Sécurité

- Mot de passe haché avec Argon2
- JWT pour l'authentification
- Validation stricte des uploads
- Rôles : USER, MODERATOR, ADMIN
- CORS configuré

## Support

Pour les problèmes ou questions, consultez la documentation ou ouvrez une issue sur le repository.

## Licence

Projet personnel - Usage privé autorisé.