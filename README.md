# 🏰 Dungeon Generator Pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)

> Une application web complète pour la génération procédurale de donjons avec interface React et backend Node.js

---

## 📖 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Backend](#-api-backend)
- [Gestion des tuiles](#-gestion-des-tuiles)
- [Gestion des calques](#-gestion-des-calques)
- [Légende](#-légende)
- [Graph Grammar](#-graph-grammar)
- [Algorithmes de génération](#-algorithmes-de-génération)
- [Licence](#-licence)

---

## 🎯 Aperçu

**Dungeon Generator Pro** est une application web complète permettant de générer procéduralement des donjons avec :

- **8 algorithmes de génération** (dont Graph Grammar avancé)
- **Gestion des tuiles personnalisées** via une interface dédiée
- **Gestion des calques** avec visibilité, ajout et suppression
- **Légende interactive** affichant les tuiles utilisées
- **Export SVG/PNG** avec sauvegarde sur serveur
- **Historique** avec annulation/rétablissement

---

## 🚀 Fonctionnalités

### 🎮 Génération de donjons
- 8 algorithmes paramétrables en temps réel
- Génération instantanée avec feedback visuel
- Annotations sur le donjon

### 🎨 Tuiles personnalisées
- Ajout, modification, suppression de tuiles
- Choix de la couleur (palette prédéfinie + personnalisée)
- Icônes emojis

### 📂 Calques
- Affichage de la liste des calques avec nombre de tuiles
- Activation/désactivation de la visibilité par calque
- Ajout et suppression de calques (sauf le calque "main" protégé)

### 📋 Légende
- Affichage des tuiles personnalisées et par défaut
- Position déplaçable (4 coins)
- Réductible/agrandissable

### 🧠 Graph Grammar (avancé)
- **Salles en enfilade** : chaînage de salles en ligne droite
- **Symétries axiales/rotationnelles** : miroir des structures
- **Niveaux hiérarchiques** : organisation en profondeur
- **Couloirs larges** : couloirs de 3 tuiles de large
- **Couloirs avec portes** : portes à mi-chemin
- **Passages secrets** : chemins cachés entre les salles
- **Règles entièrement redéfinissables** : l'utilisateur peut créer ses propres règles via l'éditeur intégré

### 📤 Export
- SVG vectoriel
- PNG haute qualité
- Impression optimisée
- Sauvegarde sur serveur (API REST)

---

## 🏗 Architecture

```

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │    App.js    │───▶│DungeonControls │───▶│  DungeonViewer │ │
│  │              │    │   (Contrôles)  │    │   (Iframe)     │ │
│  └──────────────┘    └────────────────┘    └────────────────┘ │
│         │                    │                      │          │
│         ▼                    ▼                      ▼          │
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │  TileManager │    │  LayerManager  │    │    Legend      │ │
│  │  (Tuiles)    │    │   (Calques)    │    │  (Légende)     │ │
│  └──────────────┘    └────────────────┘    └────────────────┘ │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              GraphGrammarEditor (Règles)                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
│ HTTP (Fetch)
▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │  server.js   │───▶│  API Routes    │───▶│  File System  │ │
│  │  (Express)   │    │  /api/tiles    │    │  data/tiles.json│ │
│  └──────────────┘    │  /api/exports  │    │  exports/      │ │
│                      └────────────────┘    └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

```

---

## 📦 Installation

### Prérequis
- Node.js 18 ou supérieur
- npm 9 ou supérieur

### Étapes

```bash
# Cloner le dépôt
git clone https://github.com/sebastienbats/Dungeon-Generator-Pro.git
cd Dungeon-Generator-App

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Démarrer le backend (port 5000)
cd backend
npm run dev

# Démarrer le frontend (port 3000) dans un autre terminal
cd frontend
npm start
```

L'application est accessible sur http://localhost:3000.

---

🎮 Utilisation

Génération d'un donjon

1. Sélectionner un algorithme dans le menu déroulant
2. Ajuster les paramètres avec les sliders
3. Cliquer sur "Générer"

Gestion des tuiles

1. Cliquer sur "🎨 Tuiles"
2. Ajouter une nouvelle tuile (nom, couleur, icône)
3. Modifier ou supprimer une tuile existante

Gestion des calques

1. Cliquer sur "📂 Calques"
2. Activer/désactiver la visibilité d'un calque via le toggle
3. Ajouter un nouveau calque (nom)
4. Supprimer un calque (hors "main")

Légende

· La légende s'affiche automatiquement
· Cliquer sur "📋 Cacher" pour la masquer
· Changer la position via le sélecteur déroulant

Graph Grammar (avancé)

1. Sélectionner "🧠 Graph Grammar" dans le menu des algorithmes (ou cliquer sur le bouton dédié)
2. Ajuster les paramètres (itérations, espacement, max nœuds, type de départ)
3. Activer/désactiver les règles prédéfinies
4. Ajouter ou modifier des règles personnalisées
5. Cliquer sur "Générer avec Graph Grammar"

---

📁 Structure du projet

```
dungeon-generator-app/
├── backend/
│   ├── data/
│   │   └── tiles.json
│   ├── exports/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── DungeonViewer.js
│   │   ├── DungeonControls.js
│   │   ├── DungeonControls.css
│   │   ├── TileManager.js
│   │   ├── TileManager.css
│   │   ├── LayerManager.js
│   │   ├── LayerManager.css
│   │   ├── Legend.js
│   │   ├── Legend.css
│   │   ├── GraphGrammarEditor.js
│   │   ├── GraphGrammarEditor.css
│   │   ├── diagnostic.js
│   │   ├── ErrorBoundary.js
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

---

🔌 API Backend

Méthode Endpoint Description
GET /api/tiles Récupère toutes les tuiles
POST /api/tiles Ajoute une tuile
PUT /api/tiles/:id Modifie une tuile
DELETE /api/tiles/:id Supprime une tuile
POST /api/save-svg Sauvegarde un SVG
POST /api/save-png Sauvegarde un PNG
GET /api/exports Liste les exports
DELETE /api/exports/:filename Supprime un export
GET /api/exports/download/:filename Télécharge un export

---

🧩 Gestion des tuiles

Structure d'une tuile

```json
{
  "id": "tresor",
  "label": "Trésor",
  "color": "#f1c40f",
  "icon": "💰"
}
```

---

📂 Gestion des calques

· Le calque main est créé par défaut et ne peut pas être supprimé.
· Chaque calque possède une propriété visible (booléen) contrôlée par un toggle.
· Les tuiles sont stockées dans un tableau au sein de chaque calque.

---

🧠 Graph Grammar

L'algorithme Graph Grammar permet une génération très flexible grâce à des règles de réécriture de graphe.

Règles prédéfinies

Règle Description
Enfilade simple Ajoute une salle en ligne droite
Enfilade symétrique Ajoute une salle et son symétrique
Couloir large Ajoute un couloir de 3 tuiles de large
Couloir avec porte Ajoute un couloir avec une porte à mi-chemin
Passage secret Ajoute un passage secret entre deux salles
Niveau hiérarchique Ajoute une salle de niveau supérieur

Contexte des règles (ctx)

Propriété Description
node Nœud courant
createNode(x, y, type, level) Ajoute une nouvelle salle
addCorridor(nodeA, nodeB, type, props) Trace un couloir (standard, large, door, secret)
addSymmetrical(node, axis) Crée des symétriques (x, y, both)
findFreeDirection(node) Trouve une direction libre
isPositionFree(x, y) Vérifie si une position est libre
solLayer, murLayer, corridorLayer Calques pour dessiner
w, h Dimensions du donjon
spacing Espacement entre les salles

Exemple de règle personnalisée

```javascript
(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'door', { hasDoor: true });
  }
}
```

---

🧮 Algorithmes de génération

Algorithme Description
rooms Salles rectangulaires + couloirs en L
bsp Partitionnement binaire de l'espace
sinuous Couloirs sinueux avec salles occasionnelles
cellular Automates cellulaires (cavernes)
drunkard Marches aléatoires multiples
dla Agrégation limitée par diffusion
dla-symmetry DLA avec symétrie axiale
graph-grammar Réécriture de graphe avec règles personnalisables

---

📝 Licence

Distribué sous licence MIT. Voir LICENSE pour plus d'informations.

---

<div align="center">

Fait avec ❤️ et 🎲 par la communauté

⭐ N'oubliez pas de mettre une étoile si vous aimez ce projet !

</div>