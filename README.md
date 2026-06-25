Voici tous les fichiers complets et corrigés de la dernière version de votre projet, prêts à être copiés-collés sur votre dépôt GitHub.

---

📁 Structure complète du projet

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

1. Backend Files

/backend/package.json

```json
{
  "name": "dungeon-backend",
  "version": "1.0.0",
  "description": "Backend pour générateur de donjon - API REST",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "2.8.5",
    "express": "4.18.2",
    "multer": "1.4.5-lts.1",
    "uuid": "9.0.0"
  },
  "devDependencies": {
    "nodemon": "2.0.22"
  }
}
```

/backend/server.js

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dossiers
const exportsDir = path.join(__dirname, 'exports');
const dataDir = path.join(__dirname, 'data');
const tilesFile = path.join(dataDir, 'tiles.json');

// Créer les dossiers
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser le fichier tiles.json
if (!fs.existsSync(tilesFile)) {
  const defaultTiles = {
    tiles: [
      { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
      { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
      { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' },
      { id: 'autel', color: '#9b59b6', label: 'Autel', icon: '🕯️' },
      { id: 'bibliotheque', color: '#3498db', label: 'Bibliothèque', icon: '📚' },
      { id: 'forge', color: '#e67e22', label: 'Forge', icon: '🔨' },
      { id: 'cantine', color: '#2ecc71', label: 'Cantine', icon: '🍖' },
      { id: 'donjon', color: '#2c3e50', label: 'Donjon', icon: '🏰' }
    ]
  };
  fs.writeFileSync(tilesFile, JSON.stringify(defaultTiles, null, 2));
}

// Servir les exports statiques
app.use('/exports', express.static(exportsDir));

// ============================================================
// ROUTES API - TUILES
// ============================================================

app.get('/api/tiles', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(tilesFile, 'utf8'));
    res.json({ success: true, tiles: data.tiles });
  } catch (error) {
    console.error('❌ Erreur de lecture des tuiles:', error);
    res.status(500).json({ success: false, error: 'Erreur de lecture des tuiles' });
  }
});

app.post('/api/tiles', (req, res) => {
  try {
    const { label, color, icon } = req.body;
    if (!label || !color) {
      return res.status(400).json({ success: false, error: 'Label et couleur sont requis' });
    }
    const data = JSON.parse(fs.readFileSync(tilesFile, 'utf8'));
    const id = label.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    if (data.tiles.some(t => t.id === id)) {
      return res.status(400).json({ success: false, error: 'Une tuile avec ce nom existe déjà' });
    }
    const newTile = { id, label, color, icon: icon || '' };
    data.tiles.push(newTile);
    fs.writeFileSync(tilesFile, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Tuile ajoutée avec succès', tile: newTile });
  } catch (error) {
    console.error('❌ Erreur d\'ajout de tuile:', error);
    res.status(500).json({ success: false, error: 'Erreur d\'ajout de tuile' });
  }
});

app.put('/api/tiles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { label, color, icon } = req.body;
    const data = JSON.parse(fs.readFileSync(tilesFile, 'utf8'));
    const index = data.tiles.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Tuile non trouvée' });
    }
    data.tiles[index] = {
      ...data.tiles[index],
      label: label || data.tiles[index].label,
      color: color || data.tiles[index].color,
      icon: icon !== undefined ? icon : data.tiles[index].icon
    };
    fs.writeFileSync(tilesFile, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Tuile modifiée avec succès', tile: data.tiles[index] });
  } catch (error) {
    console.error('❌ Erreur de modification de tuile:', error);
    res.status(500).json({ success: false, error: 'Erreur de modification de tuile' });
  }
});

app.delete('/api/tiles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(tilesFile, 'utf8'));
    const index = data.tiles.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Tuile non trouvée' });
    }
    data.tiles.splice(index, 1);
    fs.writeFileSync(tilesFile, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Tuile supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur de suppression de tuile:', error);
    res.status(500).json({ success: false, error: 'Erreur de suppression de tuile' });
  }
});

// ============================================================
// ROUTES API - EXPORTS
// ============================================================

app.post('/api/save-svg', (req, res) => {
  try {
    const { svg, filename } = req.body;
    if (!svg) {
      return res.status(400).json({ success: false, error: 'Données SVG manquantes' });
    }
    const name = filename || `dungeon_${Date.now()}.svg`;
    const filePath = path.join(exportsDir, name);
    const cleanSvg = svg.replace(/data:image\/svg\+xml;base64,[^\"]*/, '');
    fs.writeFileSync(filePath, cleanSvg, 'utf8');
    res.json({ success: true, message: 'SVG sauvegardé avec succès', url: `/exports/${name}`, filename: name });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du SVG:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde du SVG', details: error.message });
  }
});

app.post('/api/save-png', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Données image manquantes' });
    }
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const name = filename || `dungeon_${Date.now()}.png`;
    const filePath = path.join(exportsDir, name);
    fs.writeFileSync(filePath, base64Data, 'base64');
    res.json({ success: true, message: 'PNG sauvegardé avec succès', url: `/exports/${name}`, filename: name });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du PNG:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde du PNG', details: error.message });
  }
});

app.get('/api/exports', (req, res) => {
  try {
    const files = fs.readdirSync(exportsDir);
    const exports = files
      .filter(file => file.endsWith('.svg') || file.endsWith('.png'))
      .map(file => {
        const stat = fs.statSync(path.join(exportsDir, file));
        return {
          name: file,
          url: `/exports/${file}`,
          size: stat.size,
          sizeFormatted: formatFileSize(stat.size),
          created: stat.mtime,
          createdFormatted: stat.mtime.toLocaleString('fr-FR'),
          type: path.extname(file).substring(1).toUpperCase()
        };
      })
      .sort((a, b) => b.created - a.created);
    res.json({ success: true, count: exports.length, exports });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des exports:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la lecture des exports' });
  }
});

app.delete('/api/exports/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, error: 'Nom de fichier invalide' });
    }
    const filePath = path.join(exportsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Fichier non trouvé' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, message: `Fichier "${filename}" supprimé avec succès` });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
});

app.get('/api/exports/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, error: 'Nom de fichier invalide' });
    }
    const filePath = path.join(exportsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Fichier non trouvé' });
    }
    res.download(filePath);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du téléchargement' });
  }
});

// ============================================================
// UTILITAIRES
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================
// DÉMARRAGE
// ============================================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📁 Dossier d'exports: ${exportsDir}`);
  console.log(`📁 Dossier de données: ${dataDir}`);
  console.log(`🌐 API disponible sur /api`);
});
```

/backend/data/tiles.json

```json
{
  "tiles": [
    { "id": "tresor", "color": "#f1c40f", "label": "Trésor", "icon": "💰" },
    { "id": "piege", "color": "#e74c3c", "label": "Piège", "icon": "⚔️" },
    { "id": "portail", "color": "#8e44ad", "label": "Portail", "icon": "🌀" },
    { "id": "autel", "color": "#9b59b6", "label": "Autel", "icon": "🕯️" },
    { "id": "bibliotheque", "color": "#3498db", "label": "Bibliothèque", "icon": "📚" },
    { "id": "forge", "color": "#e67e22", "label": "Forge", "icon": "🔨" },
    { "id": "cantine", "color": "#2ecc71", "label": "Cantine", "icon": "🍖" },
    { "id": "donjon", "color": "#2c3e50", "label": "Donjon", "icon": "🏰" }
  ]
}
```

---

2. Frontend Files

/frontend/package.json

```json
{
  "name": "dungeon-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"],
    "rules": {
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}
```

/frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#1a1a2e" />
  <meta name="description" content="Générateur de donjon procédural - Application React" />
  <title>🏰 Générateur de Donjon</title>
</head>
<body>
  <noscript>Vous devez activer JavaScript pour utiliser cette application.</noscript>
  <div id="root"></div>

  <!-- ============================================================
  BIBLIOTHÈQUE DUNGEON GENERATOR - Version inline
  ============================================================ -->
  <script>
    /**
     * DungeonGenerator - Version complète inline
     * Intégration directe pour éviter les problèmes de modules ES6
     */
    (function(global) {
      'use strict';

      class DungeonGenerator {
        constructor(options = {}) {
          this.container = options.container || document.body;
          this.tileSize = options.tileSize || 32;
          this.width = options.width || 50;
          this.height = options.height || 40;
          this.customTileTypes = options.customTileTypes || [];
          
          this.layers = {};
          this.annotations = [];
          this.history = [];
          this.historyIndex = -1;
          this.scaleVisible = false;
          this.scaleUnit = 'm';
          this.scalePixelsPerUnit = 10;
          this.generators = {};
          this.isRendering = false;
          
          this.tileRegistry = {
            floor: { color: '#2d3436', label: 'Sol', icon: '' },
            wall: { color: '#636e72', label: 'Mur', icon: '' },
            corridor: { color: '#4a4a4a', label: 'Couloir', icon: '' },
            room: { color: '#3d3d3d', label: 'Salle', icon: '' }
          };
          
          this.customTileTypes.forEach(tile => {
            this.tileRegistry[tile.id] = {
              color: tile.color,
              label: tile.label,
              icon: tile.icon || ''
            };
          });
          
          this.registerDefaultGenerators();
          this.setupContainer();
          this.generate('rooms', { numRooms: 8, minRoomSize: 3, maxRoomSize: 6 });
        }

        setupContainer() {
          if (!this.container) return;
          this.container.innerHTML = '';
          
          this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          this.svg.setAttribute('width', this.width * this.tileSize);
          this.svg.setAttribute('height', this.height * this.tileSize);
          this.svg.setAttribute('viewBox', `0 0 ${this.width * this.tileSize} ${this.height * this.tileSize}`);
          this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          this.svg.style.backgroundColor = '#1a1a2e';
          this.svg.style.width = '100%';
          this.svg.style.height = 'auto';
          this.svg.style.borderRadius = '8px';
          
          this.container.appendChild(this.svg);
        }

        registerDefaultGenerators() {
          this.registerGenerator('rooms', this.generateRooms.bind(this));
          this.registerGenerator('bsp', this.generateBSP.bind(this));
          this.registerGenerator('sinuous', this.generateSinuous.bind(this));
          this.registerGenerator('cellular', this.generateCellular.bind(this));
          this.registerGenerator('drunkard', this.generateDrunkard.bind(this));
          this.registerGenerator('dla', this.generateDLA.bind(this));
          this.registerGenerator('dla-symmetry', this.generateDLASymmetry.bind(this));
          this.registerGenerator('graph-grammar', this.generateGraphGrammar.bind(this));
        }

        registerGenerator(name, generatorFn) {
          this.generators[name] = generatorFn;
        }

        generate(algorithm, params = {}, keepAnnotations = false) {
          if (this.isRendering) return;
          
          this.saveState();
          this.layers = {};
          if (!keepAnnotations) {
            this.annotations = [];
          }
          
          this.svg.innerHTML = '';
          
          const generator = this.generators[algorithm];
          if (generator) {
            generator(params);
          } else {
            console.warn(`⚠️ Algorithme "${algorithm}" non trouvé, utilisation de "rooms"`);
            this.generators['rooms'](params);
          }
          
          this.render();
        }

        // ============================================================
        // ALGORITHMES DE BASE
        // ============================================================

        generateRooms(params) {
          const numRooms = params?.numRooms || 10;
          const minSize = params?.minRoomSize || 3;
          const maxSize = params?.maxRoomSize || 6;
          
          const rooms = [];
          
          for (let i = 0; i < numRooms; i++) {
            const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;
            
            rooms.push({ x, y, width, height });
            
            for (let dy = 0; dy < height; dy++) {
              for (let dx = 0; dx < width; dx++) {
                const isWall = dy === 0 || dy === height - 1 || dx === 0 || dx === width - 1;
                const tileType = isWall ? 'wall' : 'floor';
                this.addTile('main', tileType, x + dx, y + dy);
              }
            }
          }
          
          for (let i = 0; i < rooms.length - 1; i++) {
            const r1 = rooms[i];
            const r2 = rooms[i + 1];
            const x1 = r1.x + Math.floor(r1.width / 2);
            const y1 = r1.y + Math.floor(r1.height / 2);
            const x2 = r2.x + Math.floor(r2.width / 2);
            const y2 = r2.y + Math.floor(r2.height / 2);
            
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            for (let x = minX; x <= maxX; x++) {
              this.addTile('main', 'corridor', x, y1);
            }
            for (let y = minY; y <= maxY; y++) {
              this.addTile('main', 'corridor', x2, y);
            }
          }
        }

        generateBSP(params) {
          const minSize = params?.minRoomSize || 3;
          const maxSize = params?.maxRoomSize || 6;
          const maxDepth = params?.maxDepth || 4;
          
          const rooms = [];
          this.splitRoom(0, 0, this.width, this.height, 0, maxDepth, minSize, maxSize, rooms);
          
          rooms.forEach(room => {
            for (let dy = 0; dy < room.height; dy++) {
              for (let dx = 0; dx < room.width; dx++) {
                const isWall = dy === 0 || dy === room.height - 1 || dx === 0 || dx === room.width - 1;
                const tileType = isWall ? 'wall' : 'floor';
                this.addTile('main', tileType, room.x + dx, room.y + dy);
              }
            }
          });
        }

        splitRoom(x, y, w, h, depth, maxDepth, minSize, maxSize, rooms) {
          if (depth >= maxDepth || w < minSize * 2 || h < minSize * 2) {
            const roomW = Math.min(w - 2, Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize);
            const roomH = Math.min(h - 2, Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize);
            const roomX = x + Math.floor((w - roomW) / 2);
            const roomY = y + Math.floor((h - roomH) / 2);
            if (roomW > 0 && roomH > 0) {
              rooms.push({ x: roomX, y: roomY, width: roomW, height: roomH });
            }
            return;
          }
          
          if (w > h) {
            const splitX = x + Math.floor(w / 2) + (Math.random() > 0.5 ? 1 : -1) * Math.floor(w / 4);
            this.splitRoom(x, y, splitX - x, h, depth + 1, maxDepth, minSize, maxSize, rooms);
            this.splitRoom(splitX, y, w - (splitX - x), h, depth + 1, maxDepth, minSize, maxSize, rooms);
          } else {
            const splitY = y + Math.floor(h / 2) + (Math.random() > 0.5 ? 1 : -1) * Math.floor(h / 4);
            this.splitRoom(x, y, w, splitY - y, depth + 1, maxDepth, minSize, maxSize, rooms);
            this.splitRoom(x, splitY, w, h - (splitY - y), depth + 1, maxDepth, minSize, maxSize, rooms);
          }
        }

        generateSinuous(params) {
          const steps = params?.steps || 500;
          const turnProb = params?.turnProbability || 0.3;
          const roomProb = params?.roomProbability || 0.05;
          const minSize = params?.minRoomSize || 3;
          const maxSize = params?.maxRoomSize || 5;
          
          let x = Math.floor(this.width / 2);
          let y = Math.floor(this.height / 2);
          let dir = 0;
          
          for (let i = 0; i < steps; i++) {
            if (Math.random() < turnProb) {
              dir = (dir + (Math.random() > 0.5 ? 1 : 3)) % 4;
            }
            
            switch(dir) {
              case 0: x++; break;
              case 1: y++; break;
              case 2: x--; break;
              case 3: y--; break;
            }
            
            x = Math.max(1, Math.min(this.width - 2, x));
            y = Math.max(1, Math.min(this.height - 2, y));
            
            this.addTile('main', 'corridor', x, y);
            
            if (Math.random() < roomProb) {
              const roomW = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
              const roomH = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
              const rx = Math.max(1, Math.min(this.width - roomW - 1, x - Math.floor(roomW / 2)));
              const ry = Math.max(1, Math.min(this.height - roomH - 1, y - Math.floor(roomH / 2)));
              
              for (let dy = 0; dy < roomH; dy++) {
                for (let dx = 0; dx < roomW; dx++) {
                  const isWall = dy === 0 || dy === roomH - 1 || dx === 0 || dx === roomW - 1;
                  const tileType = isWall ? 'wall' : 'floor';
                  this.addTile('main', tileType, rx + dx, ry + dy);
                }
              }
            }
          }
        }

        generateCellular(params) {
          const density = params?.density || 0.45;
          const iterations = params?.iterations || 5;
          const birthLimit = params?.birthLimit || 4;
          const deathLimit = params?.deathLimit || 3;
          
          let grid = [];
          for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
              grid[y][x] = Math.random() < density ? 1 : 0;
            }
          }
          
          for (let iter = 0; iter < iterations; iter++) {
            const newGrid = [];
            for (let y = 0; y < this.height; y++) {
              newGrid[y] = [];
              for (let x = 0; x < this.width; x++) {
                const neighbors = this.countNeighbors(grid, x, y);
                if (grid[y][x] === 1) {
                  newGrid[y][x] = neighbors < deathLimit ? 0 : 1;
                } else {
                  newGrid[y][x] = neighbors > birthLimit ? 1 : 0;
                }
              }
            }
            grid = newGrid;
          }
          
          for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
              if (grid[y][x] === 1) {
                this.addTile('main', 'wall', x, y);
              } else {
                this.addTile('main', 'floor', x, y);
              }
            }
          }
        }

        countNeighbors(grid, x, y) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && grid[ny][nx] === 1) {
                count++;
              }
            }
          }
          return count;
        }

        generateDrunkard(params) {
          const steps = params?.steps || 200;
          const walkers = params?.walkers || 5;
          const roomChance = params?.roomChance || 0.04;
          
          for (let w = 0; w < walkers; w++) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            
            for (let i = 0; i < steps; i++) {
              const dir = Math.floor(Math.random() * 4);
              switch(dir) {
                case 0: x++; break;
                case 1: y++; break;
                case 2: x--; break;
                case 3: y--; break;
              }
              
              x = Math.max(1, Math.min(this.width - 2, x));
              y = Math.max(1, Math.min(this.height - 2, y));
              
              this.addTile('main', 'corridor', x, y);
              
              if (Math.random() < roomChance) {
                const size = Math.floor(Math.random() * 3) + 2;
                for (let dy = 0; dy < size; dy++) {
                  for (let dx = 0; dx < size; dx++) {
                    const isWall = dy === 0 || dy === size - 1 || dx === 0 || dx === size - 1;
                    const tileType = isWall ? 'wall' : 'floor';
                    this.addTile('main', tileType, x + dx, y + dy);
                  }
                }
              }
            }
          }
        }

        generateDLA(params) {
          const particles = params?.particles || 150;
          const radius = params?.radius || 2;
          const spawnRadius = params?.spawnRadius || 12;
          
          const centerX = Math.floor(this.width / 2);
          const centerY = Math.floor(this.height / 2);
          
          this.addTile('main', 'wall', centerX, centerY);
          
          for (let p = 0; p < particles; p++) {
            let x, y;
            let attempts = 0;
            let placed = false;
            
            while (!placed && attempts < 1000) {
              const angle = Math.random() * 2 * Math.PI;
              const dist = Math.random() * spawnRadius + 1;
              x = Math.round(centerX + Math.cos(angle) * dist);
              y = Math.round(centerY + Math.sin(angle) * dist);
              
              x = Math.max(1, Math.min(this.width - 2, x));
              y = Math.max(1, Math.min(this.height - 2, y));
              
              let found = false;
              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const tile = this.getTileAt('main', nx, ny);
                    if (tile === 'wall' || tile === 'corridor') {
                      found = true;
                      break;
                    }
                  }
                }
                if (found) break;
              }
              
              if (found) {
                this.addTile('main', 'wall', x, y);
                placed = true;
              }
              attempts++;
            }
          }
        }

        generateDLASymmetry(params) {
          const symmetry = params?.symmetry || 'both';
          const particles = params?.particles || 150;
          const radius = params?.radius || 2;
          const spawnRadius = params?.spawnRadius || 12;
          
          const centerX = Math.floor(this.width / 2);
          const centerY = Math.floor(this.height / 2);
          
          this.addTile('main', 'wall', centerX, centerY);
          
          for (let p = 0; p < particles; p++) {
            let x, y;
            let attempts = 0;
            let placed = false;
            
            while (!placed && attempts < 1000) {
              const angle = Math.random() * 2 * Math.PI;
              const dist = Math.random() * spawnRadius + 1;
              x = Math.round(centerX + Math.cos(angle) * dist);
              y = Math.round(centerY + Math.sin(angle) * dist);
              
              x = Math.max(1, Math.min(this.width - 2, x));
              y = Math.max(1, Math.min(this.height - 2, y));
              
              let found = false;
              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const tile = this.getTileAt('main', nx, ny);
                    if (tile === 'wall' || tile === 'corridor') {
                      found = true;
                      break;
                    }
                  }
                }
                if (found) break;
              }
              
              if (found) {
                this.addTile('main', 'wall', x, y);
                
                const symX = (symmetry === 'x' || symmetry === 'both') ? this.width - 1 - x : x;
                const symY = (symmetry === 'y' || symmetry === 'both') ? this.height - 1 - y : y;
                
                if (symX !== x || symY !== y) {
                  this.addTile('main', 'wall', symX, symY);
                }
                
                placed = true;
              }
              attempts++;
            }
          }
        }

        // ============================================================
        // GRAPH GRAMMAR (avancé)
        // ============================================================

        generateGraphGrammar(params = {}) {
          const iterations = params?.iterations || 10;
          const spacing = params?.spacing || 4;
          const maxNodes = params?.maxNodes || 200;
          const startType = params?.startType || 'sol';
          const rules = params?.rules || [];

          if (rules.length === 0) {
            console.warn('⚠️ Aucune règle Graph Grammar définie, génération vide');
            return;
          }

          // Initialiser le graphe avec un nœud racine
          const centerX = Math.floor(this.width / 2);
          const centerY = Math.floor(this.height / 2);
          
          const nodes = [];
          const edges = [];
          let nodeId = 0;
          
          const createNode = (x, y, type, level = 0) => {
            const node = { id: nodeId++, x, y, type, level, children: [] };
            nodes.push(node);
            return node;
          };

          const addCorridor = (nodeA, nodeB, type = 'standard', props = {}) => {
            edges.push({ from: nodeA.id, to: nodeB.id, type, props });
            nodeA.children.push(nodeB.id);
          };

          const addSymmetrical = (node, axis) => {
            if (axis === 'x' || axis === 'both') {
              const symX = this.width - 1 - node.x;
              if (symX !== node.x) {
                const symNode = createNode(symX, node.y, node.type, node.level);
                addCorridor(node, symNode, 'standard');
              }
            }
            if (axis === 'y' || axis === 'both') {
              const symY = this.height - 1 - node.y;
              if (symY !== node.y) {
                const symNode = createNode(node.x, symY, node.type, node.level);
                addCorridor(node, symNode, 'standard');
              }
            }
          };

          const findFreeDirection = (node) => {
            const dirs = [
              [1, 0], [-1, 0], [0, 1], [0, -1]
            ];
            const shuffled = dirs.sort(() => Math.random() - 0.5);
            for (const [dx, dy] of shuffled) {
              const nx = node.x + dx * spacing;
              const ny = node.y + dy * spacing;
              if (isPositionFree(nx, ny)) {
                return { x: nx, y: ny };
              }
            }
            return null;
          };

          const isPositionFree = (x, y) => {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
            for (const node of nodes) {
              if (Math.abs(node.x - x) < spacing / 2 && Math.abs(node.y - y) < spacing / 2) {
                return false;
              }
            }
            return true;
          };

          // Contexte pour les règles
          const ctx = {
            solLayer: 'main',
            murLayer: 'main',
            corridorLayer: 'main',
            w: this.width,
            h: this.height,
            spacing: spacing,
            createNode,
            addCorridor,
            addSymmetrical,
            findFreeDirection,
            isPositionFree
          };

          // Créer le nœud racine
          const root = createNode(centerX, centerY, startType, 0);
          let activeNodes = [root];

          // Appliquer les règles itérativement
          for (let iter = 0; iter < iterations && nodes.length < maxNodes; iter++) {
            const newActive = [];
            for (const node of activeNodes) {
              // Choisir une règle aléatoire
              const rule = rules[Math.floor(Math.random() * rules.length)];
              if (typeof rule === 'function') {
                try {
                  // Copier le contexte avec le nœud courant
                  const ruleCtx = {
                    ...ctx,
                    node: node,
                    createNode: (x, y, type, level) => {
                      if (nodes.length < maxNodes && isPositionFree(x, y)) {
                        return createNode(x, y, type, level || node.level);
                      }
                      return null;
                    }
                  };
                  rule(ruleCtx);
                } catch (e) {
                  console.warn('⚠️ Erreur lors de l\'application d\'une règle:', e);
                }
              }
            }
            // Mettre à jour les nœuds actifs pour la prochaine itération
            activeNodes = nodes.filter(n => n.level <= iter + 1 && n.id !== root.id);
            if (activeNodes.length === 0) break;
          }

          // Dessiner les nœuds et les arêtes
          for (const edge of edges) {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) continue;

            // Dessiner le couloir
            const x1 = from.x * this.tileSize + this.tileSize / 2;
            const y1 = from.y * this.tileSize + this.tileSize / 2;
            const x2 = to.x * this.tileSize + this.tileSize / 2;
            const y2 = to.y * this.tileSize + this.tileSize / 2;

            // Tracer un chemin rectiligne
            const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
            for (let s = 0; s <= steps; s++) {
              const t = steps === 0 ? 0 : s / steps;
              const cx = Math.round(from.x + (to.x - from.x) * t);
              const cy = Math.round(from.y + (to.y - from.y) * t);
              const tileType = edge.type === 'door' ? 'corridor' : 
                               edge.type === 'secret' ? 'corridor' : 'corridor';
              this.addTile('main', tileType, cx, cy);
            }

            // Dessiner la porte si présente
            if (edge.props?.hasDoor) {
              const midX = Math.round((from.x + to.x) / 2);
              const midY = Math.round((from.y + to.y) / 2);
              this.addTile('main', 'wall', midX, midY);
            }

            // Dessiner le passage secret
            if (edge.props?.secretPassage) {
              const midX = Math.round((from.x + to.x) / 2);
              const midY = Math.round((from.y + to.y) / 2);
              this.addTile('main', 'corridor', midX, midY);
              // Ajouter une annotation
              this.annotations.push({
                x: midX,
                y: midY - 0.5,
                text: '🔒',
                color: '#ffd700',
                fontSize: 12
              });
            }

            // Couloir large
            if (edge.type === 'large') {
              const width = edge.props?.width || 3;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.max(Math.abs(dx), Math.abs(dy));
              const nx = dx === 0 ? 0 : dx / Math.abs(dx);
              const ny = dy === 0 ? 0 : dy / Math.abs(dy);
              for (let w = -1; w <= 1; w++) {
                for (let s = 0; s <= len; s++) {
                  const cx = Math.round(from.x + nx * s + (nx === 0 ? w : 0));
                  const cy = Math.round(from.y + ny * s + (ny === 0 ? w : 0));
                  if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
                    this.addTile('main', 'corridor', cx, cy);
                  }
                }
              }
            }
          }

          // Dessiner les salles (nœuds)
          for (const node of nodes) {
            const size = node.type === 'sol' ? 1 : 2;
            for (let dy = -size; dy <= size; dy++) {
              for (let dx = -size; dx <= size; dx++) {
                const isWall = Math.abs(dx) === size || Math.abs(dy) === size;
                const tileType = isWall ? 'wall' : 'floor';
                const x = node.x + dx;
                const y = node.y + dy;
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                  this.addTile('main', tileType, x, y);
                }
              }
            }
          }
        }

        // ============================================================
        // MÉTHODES UTILITAIRES
        // ============================================================

        addTile(layerName, tileType, x, y, props = {}) {
          if (!this.layers[layerName]) {
            this.layers[layerName] = [];
          }
          this.layers[layerName].push({ tileType, x, y, props });
        }

        getTileAt(layerName, x, y) {
          if (!this.layers[layerName]) return null;
          for (const tile of this.layers[layerName]) {
            if (tile.x === x && tile.y === y) {
              return tile.tileType;
            }
          }
          return null;
        }

        addAnnotation(x, y, text, color = '#ffd700', fontSize = 14) {
          this.annotations.push({ x, y, text, color, fontSize });
          this.render();
        }

        addLayer(name, visible = true) {
          if (!this.layers[name]) {
            this.layers[name] = [];
          }
          this.layers[name].visible = visible !== false;
        }

        setScale(visible, unit = 'm', pixelsPerUnit = 10) {
          this.scaleVisible = visible;
          this.scaleUnit = unit;
          this.scalePixelsPerUnit = pixelsPerUnit;
          this.render();
        }

        render() {
          if (!this.svg || this.isRendering) return;
          
          this.isRendering = true;
          
          try {
            this.svg.innerHTML = '';
            
            for (const layerName in this.layers) {
              const layer = this.layers[layerName];
              if (layer.visible === false) continue;
              for (const tile of layer) {
                const tileDef = this.tileRegistry[tile.tileType];
                if (!tileDef) continue;
                
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', tile.x * this.tileSize);
                rect.setAttribute('y', tile.y * this.tileSize);
                rect.setAttribute('width', this.tileSize);
                rect.setAttribute('height', this.tileSize);
                rect.setAttribute('fill', tileDef.color || '#333');
                rect.setAttribute('stroke', '#1a1a2e');
                rect.setAttribute('stroke-width', '0.5');
                this.svg.appendChild(rect);
                
                if (tileDef.icon) {
                  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                  text.setAttribute('x', tile.x * this.tileSize + this.tileSize / 2);
                  text.setAttribute('y', tile.y * this.tileSize + this.tileSize / 2 + 4);
                  text.setAttribute('text-anchor', 'middle');
                  text.setAttribute('font-size', this.tileSize * 0.6);
                  text.setAttribute('pointer-events', 'none');
                  text.textContent = tileDef.icon;
                  this.svg.appendChild(text);
                }
              }
            }
            
            for (const ann of this.annotations) {
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', ann.x * this.tileSize);
              text.setAttribute('y', ann.y * this.tileSize - 5);
              text.setAttribute('fill', ann.color || '#ffd700');
              text.setAttribute('font-size', ann.fontSize || 14);
              text.setAttribute('font-weight', 'bold');
              text.setAttribute('pointer-events', 'none');
              text.textContent = ann.text;
              this.svg.appendChild(text);
            }
            
            if (this.scaleVisible) {
              this.drawScale();
            }
            
          } finally {
            this.isRendering = false;
          }
        }

        drawScale() {
          const width = this.width * this.tileSize;
          const height = this.height * this.tileSize;
          
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('pointer-events', 'none');
          
          const barX = 20;
          const barY = height - 30;
          const barWidth = 100;
          
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', barX);
          rect.setAttribute('y', barY);
          rect.setAttribute('width', barWidth);
          rect.setAttribute('height', 4);
          rect.setAttribute('fill', '#ffffff');
          rect.setAttribute('opacity', '0.5');
          group.appendChild(rect);
          
          const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line1.setAttribute('x1', barX);
          line1.setAttribute('y1', barY - 5);
          line1.setAttribute('x2', barX);
          line1.setAttribute('y2', barY + 9);
          line1.setAttribute('stroke', '#ffffff');
          line1.setAttribute('stroke-width', '2');
          line1.setAttribute('opacity', '0.5');
          group.appendChild(line1);
          
          const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line2.setAttribute('x1', barX + barWidth);
          line2.setAttribute('y1', barY - 5);
          line2.setAttribute('x2', barX + barWidth);
          line2.setAttribute('y2', barY + 9);
          line2.setAttribute('stroke', '#ffffff');
          line2.setAttribute('stroke-width', '2');
          line2.setAttribute('opacity', '0.5');
          group.appendChild(line2);
          
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', barX + barWidth / 2);
          text.setAttribute('y', barY - 10);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', '#ffffff');
          text.setAttribute('font-size', '12');
          text.setAttribute('opacity', '0.7');
          text.textContent = `${Math.round(barWidth / this.scalePixelsPerUnit)} ${this.scaleUnit}`;
          group.appendChild(text);
          
          this.svg.appendChild(group);
        }

        saveState() {
          const state = {
            layers: JSON.parse(JSON.stringify(this.layers)),
            annotations: JSON.parse(JSON.stringify(this.annotations))
          };
          this.history = this.history.slice(0, this.historyIndex + 1);
          this.history.push(state);
          this.historyIndex = this.history.length - 1;
        }

        restoreState(state) {
          this.layers = JSON.parse(JSON.stringify(state.layers));
          this.annotations = JSON.parse(JSON.stringify(state.annotations));
          this.render();
        }

        undo() {
          if (this.historyIndex <= 0) return false;
          this.historyIndex--;
          this.restoreState(this.history[this.historyIndex]);
          return true;
        }

        redo() {
          if (this.historyIndex >= this.history.length - 1) return false;
          this.historyIndex++;
          this.restoreState(this.history[this.historyIndex]);
          return true;
        }

        exportSVG(filename = 'donjon.svg') {
          try {
            const svgData = new XMLSerializer().serializeToString(this.svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
            return true;
          } catch (error) {
            console.error('❌ Erreur export SVG:', error);
            return false;
          }
        }

        exportPNG(filename = 'donjon.png') {
          try {
            const svgData = new XMLSerializer().serializeToString(this.svg);
            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = this.width * this.tileSize * scale;
            canvas.height = this.height * this.tileSize * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            
            return new Promise((resolve) => {
              const img = new Image();
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);
              
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve(true);
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(false);
              };
              img.src = url;
            });
          } catch (error) {
            console.error('❌ Erreur export PNG:', error);
            return false;
          }
        }

        print() {
          window.print();
        }

        getSVGData() {
          return new XMLSerializer().serializeToString(this.svg);
        }

        getPNGData() {
          return new Promise((resolve) => {
            const svgData = this.getSVGData();
            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = this.width * this.tileSize * scale;
            canvas.height = this.height * this.tileSize * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(null);
            };
            img.src = url;
          });
        }
      }

      if (typeof window !== 'undefined') {
        window.DungeonGenerator = DungeonGenerator;
        console.log('✅ DungeonGenerator chargé avec succès!');
      }

      if (typeof module !== 'undefined' && module.exports) {
        module.exports = DungeonGenerator;
      }

    })(typeof window !== 'undefined' ? window : this);
  </script>
</body>
</html>
```

/frontend/src/index.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './diagnostic';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

/frontend/src/ErrorBoundary.js

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error Boundary a capturé une erreur:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #d63031',
          color: '#e0e0e0',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#d63031' }}>⚠️ Une erreur est survenue</h2>
          <p style={{ color: '#888' }}>{this.state.error?.message || 'Erreur inconnue'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#6c5ce7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
              fontSize: '1rem'
            }}
          >
            🔄 Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

/frontend/src/diagnostic.js

```javascript
const dungeonDiagnostic = {
  checkStatus: () => {
    console.log('🔍 DIAGNOSTIC DU DUNGEON VIEWER');
    console.log('================================');
    const viewer = document.querySelector('.dungeon-viewer');
    console.log('📦 Conteneur .dungeon-viewer:', viewer);
    if (viewer) {
      console.log('  - Enfants:', viewer.children);
      console.log('  - HTML:', viewer.innerHTML.substring(0, 200) + '...');
      const wrapper = document.getElementById('dungeon-wrapper');
      console.log('  - Wrapper #dungeon-wrapper:', wrapper);
      if (wrapper) {
        const svg = wrapper.querySelector('svg');
        console.log('  - SVG dans le wrapper:', svg);
        if (svg) {
          console.log('    - Dimensions:', svg.getAttribute('width'), 'x', svg.getAttribute('height'));
          console.log('    - Enfants SVG:', svg.children.length);
        }
      }
    }
    console.log('📚 window.DungeonGenerator:', typeof window.DungeonGenerator);
    console.log('🌱 Root React:', document.getElementById('root'));
    console.log('================================');
  },

  forceInit: () => {
    console.log('🔄 Tentative de forçage de l\'initialisation...');
    const viewer = document.querySelector('.dungeon-viewer');
    if (!viewer) {
      console.error('❌ Conteneur .dungeon-viewer non trouvé');
      return;
    }
    while (viewer.firstChild) {
      try { viewer.removeChild(viewer.firstChild); } catch (e) { break; }
    }
    if (typeof window.DungeonGenerator !== 'function') {
      console.error('❌ DungeonGenerator non disponible');
      return;
    }
    try {
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      viewer.appendChild(wrapper);
      console.log('🏗️ Wrapper créé');
      const instance = new window.DungeonGenerator({
        container: wrapper,
        tileSize: 32,
        width: 50,
        height: 40,
        customTileTypes: [
          { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
          { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
          { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' }
        ]
      });
      console.log('✅ Instance créée avec succès');
      console.log('📐 Dimensions:', instance.width, 'x', instance.height);
      window.__dungeonInstance = instance;
      setTimeout(() => {
        const svg = wrapper.querySelector('svg');
        console.log('🔍 SVG présent:', !!svg);
        if (svg) {
          console.log('📐 SVG dimensions:', svg.getAttribute('width'), 'x', svg.getAttribute('height'));
          console.log('📊 Nombre de tuiles:', svg.querySelectorAll('rect').length);
        }
      }, 100);
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  },

  createTestDungeon: () => {
    console.log('🎨 Création d\'un donjon de test...');
    const viewer = document.querySelector('.dungeon-viewer');
    if (!viewer) {
      console.error('❌ Conteneur non trouvé');
      return;
    }
    while (viewer.firstChild) {
      try { viewer.removeChild(viewer.firstChild); } catch (e) { break; }
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.style.backgroundColor = '#1a1a2e';
    svg.style.minHeight = '400px';
    const colors = ['#2d3436', '#636e72', '#4a4a4a', '#3d3d3d'];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 15; j++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i * 40 + 5);
        rect.setAttribute('y', j * 40 + 5);
        rect.setAttribute('width', 30);
        rect.setAttribute('height', 30);
        rect.setAttribute('fill', colors[(i + j) % colors.length]);
        rect.setAttribute('stroke', '#1a1a2e');
        rect.setAttribute('stroke-width', '1');
        svg.appendChild(rect);
      }
    }
    viewer.appendChild(svg);
    console.log('✅ Donjon de test créé');
  },

  cleanup: () => {
    console.log('🧹 Nettoyage du conteneur...');
    const viewer = document.querySelector('.dungeon-viewer');
    if (viewer) {
      while (viewer.firstChild) {
        try { viewer.removeChild(viewer.firstChild); } catch (e) { break; }
      }
      console.log('✅ Conteneur nettoyé');
    } else {
      console.log('⚠️ Conteneur non trouvé');
    }
  },

  reload: () => {
    console.log('🔄 Rechargement de la page...');
    window.location.reload();
  },

  fullCheck: function() {
    console.log('🔍 VÉRIFICATION COMPLÈTE');
    console.log('=======================');
    this.checkStatus();
    console.log('-----------------------');
    if (window.__dungeonInstance) {
      console.log('✅ Une instance existe déjà');
      console.log('📐 Dimensions:', window.__dungeonInstance.width, 'x', window.__dungeonInstance.height);
    } else {
      console.log('⚠️ Aucune instance trouvée');
      console.log('🔄 Tentative de forçage...');
      this.forceInit();
    }
    console.log('=======================');
  }
};

window.diagnostic = dungeonDiagnostic;

console.log('✅ Outils de diagnostic disponibles');
console.log('📋 Utilisez diagnostic.fullCheck() pour une vérification complète');
console.log('📋 Utilisez diagnostic.forceInit() pour forcer l\'initialisation');
console.log('📋 Utilisez diagnostic.createTestDungeon() pour créer un donjon de test');
console.log('📋 Utilisez diagnostic.checkStatus() pour vérifier l\'état actuel');
```

/frontend/src/App.js

```javascript
import React, { useRef, useState, useCallback, useEffect } from 'react';
import DungeonControls from './DungeonControls';
import DungeonViewer from './DungeonViewer';
import TileManager from './TileManager';
import Legend from './Legend';
import LayerManager from './LayerManager';
import GraphGrammarEditor from './GraphGrammarEditor';

function App() {
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [exportsList, setExportsList] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [showTileManager, setShowTileManager] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState('bottom-right');
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [showGraphGrammarEditor, setShowGraphGrammarEditor] = useState(false);
  const [layers, setLayers] = useState({});
  const isMountedRef = useRef(true);
  const generatorRef = useRef(null);
  const viewerRef = useRef(null);

  const setStatusMessage = useCallback((message, type = 'info') => {
    if (isMountedRef.current) {
      setStatus({ message, type });
    }
  }, []);

  // Rafraîchir la liste des calques
  const refreshLayers = useCallback(() => {
    const instance = generatorRef.current || window.__dungeonInstance;
    if (instance && instance.layers) {
      setLayers(instance.layers);
    }
  }, []);

  // Charger les tuiles
  const loadTiles = useCallback(async () => {
    try {
      const response = await fetch('/api/tiles');
      const data = await response.json();
      if (data.success) {
        setTiles(data.tiles);
        const instance = generatorRef.current || window.__dungeonInstance;
        if (instance) {
          data.tiles.forEach(tile => {
            instance.tileRegistry[tile.id] = {
              color: tile.color,
              label: tile.label,
              icon: tile.icon || ''
            };
          });
          instance.render();
        }
        return data.tiles;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur de chargement des tuiles:', error);
      return [];
    }
  }, []);

  const addTile = useCallback(async (tileData) => {
    try {
      const response = await fetch('/api/tiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tileData)
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`✅ Tuile "${data.tile.label}" ajoutée`, 'success');
        await loadTiles();
        return data.tile;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur d\'ajout de tuile:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      return null;
    }
  }, [loadTiles, setStatusMessage]);

  const updateTile = useCallback(async (id, tileData) => {
    try {
      const response = await fetch(`/api/tiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tileData)
      });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`✅ Tuile "${data.tile.label}" modifiée`, 'success');
        await loadTiles();
        return data.tile;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur de modification de tuile:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      return null;
    }
  }, [loadTiles, setStatusMessage]);

  const deleteTile = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/tiles/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`🗑️ Tuile supprimée`, 'info');
        await loadTiles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur de suppression de tuile:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }, [loadTiles, setStatusMessage]);

  const getExports = useCallback(async () => {
    try {
      const response = await fetch('/api/exports');
      const data = await response.json();
      if (data.success) {
        return data.exports;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur de récupération des exports:', error);
      return [];
    }
  }, []);

  const deleteExport = useCallback(async (filename) => {
    try {
      const response = await fetch(`/api/exports/${filename}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`🗑️ Fichier supprimé: ${filename}`, 'info');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }, [setStatusMessage]);

  const refreshExports = useCallback(async () => {
    if (!isMountedRef.current) return;
    const exports = await getExports();
    if (exports && isMountedRef.current) {
      setExportsList(exports);
    }
  }, [getExports]);

  const handleInstanceReady = useCallback((instance) => {
    console.log('📦 Instance prête dans App');
    generatorRef.current = instance;
    window.__dungeonInstance = instance;
    setIsLoaded(true);
    tiles.forEach(tile => {
      instance.tileRegistry[tile.id] = {
        color: tile.color,
        label: tile.label,
        icon: tile.icon || ''
      };
    });
    if (instance) {
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
    }
    refreshLayers();
    refreshExports();
  }, [tiles, refreshLayers, refreshExports]);

  // Gestion des calques
  const toggleLayerVisibility = useCallback((layerName) => {
    const instance = generatorRef.current || window.__dungeonInstance;
    if (!instance) return;
    if (instance.layers[layerName]) {
      instance.layers[layerName].visible = !instance.layers[layerName].visible;
      instance.render();
      refreshLayers();
    }
  }, [refreshLayers]);

  const addLayer = useCallback((layerName) => {
    const instance = generatorRef.current || window.__dungeonInstance;
    if (!instance) return;
    if (instance.layers[layerName]) {
      setStatusMessage(`❌ Le calque "${layerName}" existe déjà`, 'error');
      return;
    }
    instance.addLayer(layerName, true);
    instance.render();
    refreshLayers();
    setStatusMessage(`✅ Calque "${layerName}" ajouté`, 'success');
  }, [refreshLayers, setStatusMessage]);

  const deleteLayer = useCallback((layerName) => {
    const instance = generatorRef.current || window.__dungeonInstance;
    if (!instance) return;
    if (!instance.layers[layerName]) {
      setStatusMessage(`❌ Le calque "${layerName}" n'existe pas`, 'error');
      return;
    }
    if (layerName === 'main') {
      setStatusMessage('❌ Impossible de supprimer le calque principal', 'error');
      return;
    }
    delete instance.layers[layerName];
    instance.render();
    refreshLayers();
    setStatusMessage(`🗑️ Calque "${layerName}" supprimé`, 'info');
  }, [refreshLayers, setStatusMessage]);

  useEffect(() => {
    isMountedRef.current = true;
    loadTiles();
    return () => { isMountedRef.current = false; };
  }, [loadTiles]);

  useEffect(() => {
    if (isLoaded) return;
    const checkInterval = setInterval(() => {
      if (isLoaded) { clearInterval(checkInterval); return; }
      if (viewerRef.current && viewerRef.current.generator) {
        const instance = viewerRef.current.generator;
        generatorRef.current = instance;
        window.__dungeonInstance = instance;
        setIsLoaded(true);
        setHistory({
          canUndo: typeof instance.undo === 'function',
          canRedo: typeof instance.redo === 'function'
        });
        setStatusMessage('✅ Prêt', 'success');
        refreshLayers();
        refreshExports();
        clearInterval(checkInterval);
        return;
      }
      if (viewerRef.current && viewerRef.current.retry) {
        viewerRef.current.retry();
      }
    }, 1000);
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      if (!isLoaded) {
        if (viewerRef.current && viewerRef.current.retry) {
          viewerRef.current.retry();
        } else if (window.diagnostic && window.diagnostic.forceInit) {
          window.diagnostic.forceInit();
          setTimeout(() => {
            if (window.__dungeonInstance) {
              generatorRef.current = window.__dungeonInstance;
              setIsLoaded(true);
              setHistory({
                canUndo: typeof window.__dungeonInstance.undo === 'function',
                canRedo: typeof window.__dungeonInstance.redo === 'function'
              });
              setStatusMessage('✅ Prêt', 'success');
              refreshLayers();
              refreshExports();
            }
          }, 1000);
        }
      }
    }, 8000);
    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, [isLoaded, refreshLayers, refreshExports, setStatusMessage]);

  const handleGenerate = useCallback(async (algorithm, params) => {
    if (!isMountedRef.current) return;
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }

    setIsLoading(true);
    setStatusMessage(`🔄 Génération avec ${algorithm}...`, 'info');
    try {
      const instance = generatorRef.current;
      instance.generate(algorithm, params, false);
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
      refreshLayers();
      if (isMountedRef.current) {
        setStatusMessage(`✅ Donjon généré avec succès! (${algorithm})`, 'success');
        refreshExports();
      }
    } catch (error) {
      console.error('❌ Erreur de génération:', error);
      if (isMountedRef.current) {
        setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setStatusMessage, refreshExports, refreshLayers]);

  const handleAddAnnotation = useCallback((x, y, text, color = '#ffd700', fontSize = 14) => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      generatorRef.current.addAnnotation(x, y, text, color, fontSize);
      setStatusMessage(`📝 Annotation ajoutée à (${x}, ${y})`, 'info');
    } catch (error) {
      console.error('❌ Erreur d\'annotation:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  const handleUndo = useCallback(() => {
    if (!generatorRef.current) return;
    try {
      const success = generatorRef.current.undo();
      if (success) {
        setHistory({
          canUndo: typeof generatorRef.current.undo === 'function',
          canRedo: typeof generatorRef.current.redo === 'function'
        });
        setStatusMessage('↩️ Annulation effectuée', 'info');
        refreshLayers();
      }
    } catch (error) {
      console.error('❌ Erreur d\'annulation:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshLayers]);

  const handleRedo = useCallback(() => {
    if (!generatorRef.current) return;
    try {
      const success = generatorRef.current.redo();
      if (success) {
        setHistory({
          canUndo: typeof generatorRef.current.undo === 'function',
          canRedo: typeof generatorRef.current.redo === 'function'
        });
        setStatusMessage('↪️ Rétablissement effectué', 'info');
        refreshLayers();
      }
    } catch (error) {
      console.error('❌ Erreur de rétablissement:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshLayers]);

  const handleExportSVG = useCallback(() => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const filename = `donjon_${Date.now()}.svg`;
      generatorRef.current.exportSVG(filename);
      setStatusMessage(`📄 SVG exporté: ${filename}`, 'success');
      refreshExports();
    } catch (error) {
      console.error('❌ Erreur d\'export SVG:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshExports]);

  const handleExportPNG = useCallback(async () => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const filename = `donjon_${Date.now()}.png`;
      await generatorRef.current.exportPNG(filename);
      setStatusMessage(`🖼️ PNG exporté: ${filename}`, 'success');
      refreshExports();
    } catch (error) {
      console.error('❌ Erreur d\'export PNG:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshExports]);

  const handlePrint = useCallback(() => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      generatorRef.current.print();
      setStatusMessage('🖨️ Impression en cours...', 'info');
    } catch (error) {
      console.error('❌ Erreur d\'impression:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  const handleDeleteExport = useCallback(async (filename) => {
    const success = await deleteExport(filename);
    if (success) {
      refreshExports();
    }
  }, [deleteExport, refreshExports]);

  const handleLegendPositionChange = useCallback((position) => {
    setLegendPosition(position);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          🏰 Générateur de Donjon
          <span className="badge">Procédural</span>
        </h1>
        <div className="status-indicator">
          <span className={`status-dot ${isLoaded ? 'ready' : 'loading'}`} />
          {isLoaded ? '✅ Bibliothèque chargée' : '⏳ Chargement...'}
        </div>
      </header>

      <main className="app-main">
        <DungeonControls
          onGenerate={handleGenerate}
          onExportSVG={handleExportSVG}
          onExportPNG={handleExportPNG}
          onPrint={handlePrint}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddAnnotation={handleAddAnnotation}
          onRefreshExports={refreshExports}
          onDeleteExport={handleDeleteExport}
          onOpenTileManager={() => setShowTileManager(true)}
          onToggleLegend={() => setShowLegend(!showLegend)}
          onOpenLayerManager={() => setShowLayerManager(true)}
          onOpenGraphGrammarEditor={() => setShowGraphGrammarEditor(true)}
          isLoading={isLoading}
          history={history}
          exports={exportsList}
          isLoaded={isLoaded}
          tiles={tiles}
          showLegend={showLegend}
          legendPosition={legendPosition}
          onLegendPositionChange={handleLegendPositionChange}
          layersCount={Object.keys(layers).length}
        />

        <div className="dungeon-viewer-wrapper">
          <DungeonViewer
            ref={viewerRef}
            onInstanceReady={handleInstanceReady}
            onStatus={setStatusMessage}
            isLoaded={isLoaded}
            isLoading={isLoading}
            tiles={tiles}
          />
          {showLegend && isLoaded && tiles.length > 0 && (
            <Legend 
              tiles={tiles} 
              onClose={() => setShowLegend(false)}
              position={legendPosition}
            />
          )}
        </div>

        {showTileManager && (
          <TileManager
            tiles={tiles}
            onAddTile={addTile}
            onUpdateTile={updateTile}
            onDeleteTile={deleteTile}
            onClose={() => setShowTileManager(false)}
          />
        )}

        {showLayerManager && (
          <LayerManager
            layers={layers}
            onToggleLayer={toggleLayerVisibility}
            onAddLayer={addLayer}
            onDeleteLayer={deleteLayer}
            onClose={() => setShowLayerManager(false)}
          />
        )}

        {showGraphGrammarEditor && (
          <GraphGrammarEditor
            onGenerate={handleGenerate}
            onClose={() => setShowGraphGrammarEditor(false)}
            isGenerating={isLoading}
          />
        )}

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

/frontend/src/App.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 1rem 2rem;
  border-bottom: 2px solid #2a2a4a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #f7971e, #ffd200);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.app-header .badge {
  font-size: 0.8rem;
  background: #2a2a4a;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: #888;
  -webkit-text-fill-color: #888;
  border: 1px solid #3a3a5a;
  font-weight: 400;
}

.app-header .status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
  flex-shrink: 0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  transition: background 0.3s ease;
}
.status-dot.ready { background: #00b894; animation: pulse-green 2s infinite; }
.status-dot.loading { background: #fdcb6e; animation: pulse-yellow 1s infinite; }
.status-dot.error { background: #d63031; animation: none; }

@keyframes pulse-green {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
@keyframes pulse-yellow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dungeon-viewer-wrapper {
  position: relative;
  width: 100%;
  min-height: 400px;
}
.dungeon-viewer-wrapper .legend { pointer-events: auto; }

.dungeon-viewer {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  overflow: hidden;
  min-height: 400px;
  position: relative;
  width: 100%;
  contain: layout style paint;
  isolation: isolate;
}
.dungeon-viewer > div {
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.dungeon-viewer svg {
  display: block;
  max-width: 100%;
  height: auto;
  background: #1a1a2e;
  border-radius: 8px;
  animation: none !important;
  transition: none !important;
}
.dungeon-viewer * { animation: none !important; transition: none !important; }

.dungeon-placeholder {
  color: #555;
  text-align: center;
  padding: 3rem;
  width: 100%;
  pointer-events: none;
  user-select: none;
}
.dungeon-placeholder span { display: block; font-size: 4rem; margin-bottom: 1rem; }
.dungeon-placeholder p { margin: 0.5rem 0; }

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26,26,46,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  gap: 1rem;
  z-index: 10;
  backdrop-filter: blur(4px);
  pointer-events: none;
}
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #2a2a4a;
  border-top-color: #f7971e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.status-message {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
  flex-shrink: 0;
}
.status-message.success { background: rgba(0,184,148,0.15); color: #00b894; border: 1px solid rgba(0,184,148,0.3); }
.status-message.error { background: rgba(214,48,49,0.15); color: #d63031; border: 1px solid rgba(214,48,49,0.3); }
.status-message.info { background: rgba(108,92,231,0.15); color: #6c5ce7; border: 1px solid rgba(108,92,231,0.3); }

@keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

@media (max-width: 768px) {
  .app-header { padding: 0.75rem 1rem; }
  .app-header h1 { font-size: 1.3rem; }
  .app-header .badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; }
  .app-main { padding: 0.75rem; gap: 1rem; }
  .dungeon-viewer-wrapper { min-height: 300px; }
  .dungeon-viewer { min-height: 300px; border-radius: 12px; }
  .dungeon-viewer > div { min-height: 300px; }
  .dungeon-placeholder { font-size: 1rem; padding: 2rem; }
  .dungeon-placeholder span { font-size: 3rem; }
}
@media (max-width: 480px) {
  .app-header h1 { font-size: 1.1rem; }
  .app-header .badge { font-size: 0.6rem; padding: 0.1rem 0.4rem; }
  .app-header .status-indicator { font-size: 0.7rem; }
  .app-main { padding: 0.5rem; gap: 0.75rem; }
  .dungeon-viewer-wrapper { min-height: 250px; }
  .dungeon-viewer { min-height: 250px; border-radius: 10px; }
  .dungeon-viewer > div { min-height: 250px; }
  .dungeon-placeholder { font-size: 0.9rem; padding: 1.5rem; }
  .dungeon-placeholder span { font-size: 2.5rem; }
  .loading-spinner { width: 40px; height: 40px; }
  .status-message { font-size: 0.75rem; padding: 0.4rem 0.75rem; }
}
@media (min-width: 1200px) {
  .app-main { padding: 2rem; }
  .dungeon-viewer-wrapper { min-height: 550px; }
  .dungeon-viewer { min-height: 550px; }
  .dungeon-viewer > div { min-height: 550px; }
}
@media print {
  .app-header { position: static; background: #fff; border-bottom: 1px solid #ddd; }
  .app-header h1 { -webkit-text-fill-color: #1a1a2e; color: #1a1a2e; }
  .app-header .badge, .app-header .status-indicator { display: none; }
  .dungeon-controls { display: none !important; }
  .dungeon-viewer-wrapper { min-height: auto; }
  .dungeon-viewer { border: none; padding: 0; min-height: auto; background: #fff; border-radius: 0; }
  .dungeon-viewer svg { max-width: 100%; height: auto; }
  .status-message { display: none !important; }
  .app-main { padding: 0; max-width: 100%; }
  .loading-overlay { display: none !important; }
  .legend { display: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
:focus-visible { outline: 2px solid #6c5ce7; outline-offset: 2px; }
::selection { background: #6c5ce7; color: #fff; }
::-moz-selection { background: #6c5ce7; color: #fff; }
```

/frontend/src/DungeonViewer.js

```javascript
import React, { useEffect, useRef, useState, useCallback, forwardRef } from 'react';

const DungeonViewer = forwardRef(({ 
  onInstanceReady, 
  onStatus, 
  isLoaded: externalIsLoaded,
  isLoading: externalIsLoading,
  tiles 
}, ref) => {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const wrapperRef = useRef(null);
  const iframeLoadedRef = useRef(false);

  useEffect(() => {
    if (generatorRef.current && tiles && tiles.length > 0) {
      const instance = generatorRef.current;
      tiles.forEach(tile => {
        instance.tileRegistry[tile.id] = {
          color: tile.color,
          label: tile.label,
          icon: tile.icon || ''
        };
      });
      instance.render();
    }
  }, [tiles]);

  React.useImperativeHandle(ref, () => ({
    iframe: iframeRef.current,
    generator: generatorRef.current,
    isLoaded,
    initError,
    retry: () => {
      setInitAttempts(0);
      setInitError(null);
      iframeLoadedRef.current = false;
      initGenerator();
    },
    getSVG: () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          return iframe.contentDocument.querySelector('svg');
        }
      } catch (e) {}
      return null;
    }
  }));

  const initGenerator = useCallback(() => {
    const attempt = initAttempts + 1;
    setInitAttempts(attempt);
    console.log(`🔄 Tentative d'initialisation #${attempt}`);
    if (!isMountedRef.current) { console.log('🔴 Composant démonté'); return; }
    const iframe = iframeRef.current;
    if (!iframe) {
      console.warn('⚠️ Iframe non disponible');
      if (attempt < 10) setTimeout(initGenerator, 500);
      return;
    }
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.warn('⚠️ Document de l\'iframe non disponible');
        if (attempt < 10) setTimeout(initGenerator, 500);
        return;
      }
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow || typeof iframeWindow.DungeonGenerator !== 'function') {
        console.warn('⏳ DungeonGenerator non disponible dans l\'iframe');
        if (attempt < 10) setTimeout(initGenerator, 500);
        return;
      }
      iframeDoc.body.innerHTML = '';
      const wrapper = iframeDoc.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      wrapper.style.background = '#1a1a2e';
      iframeDoc.body.appendChild(wrapper);
      iframeDoc.body.style.margin = '0';
      iframeDoc.body.style.padding = '0';
      iframeDoc.body.style.background = '#1a1a2e';
      wrapperRef.current = wrapper;

      const customTileTypes = tiles.map(t => ({
        id: t.id,
        color: t.color,
        label: t.label,
        icon: t.icon || ''
      }));

      const instance = new iframeWindow.DungeonGenerator({
        container: wrapper,
        tileSize: 32,
        width: 50,
        height: 40,
        customTileTypes: customTileTypes.length > 0 ? customTileTypes : [
          { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
          { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
          { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' }
        ]
      });

      if (!instance) throw new Error('L\'instance DungeonGenerator est null');
      if (typeof instance.generate !== 'function') throw new Error('L\'instance DungeonGenerator n\'a pas la méthode generate');

      generatorRef.current = instance;
      window.__dungeonInstance = instance;
      setIsLoaded(true);
      setInitError(null);
      if (onInstanceReady) onInstanceReady(instance);
      if (onStatus) onStatus('✅ Prêt', 'success');

      setTimeout(() => {
        try {
          if (instance && typeof instance.generate === 'function') {
            instance.generate('rooms', { numRooms: 8, minRoomSize: 3, maxRoomSize: 6 });
            console.log('🎲 Donjon par défaut généré');
          }
        } catch (e) { console.warn('⚠️ Erreur lors de la génération par défaut:', e); }
      }, 200);

    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      setInitError(error.message);
      if (onStatus) onStatus(`❌ Erreur: ${error.message}`, 'error');
      if (attempt < 10 && isMountedRef.current) setTimeout(initGenerator, 1000);
    }
  }, [onInstanceReady, onStatus, initAttempts, tiles]);

  useEffect(() => {
    isMountedRef.current = true;
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;
    const iframe = iframeRef.current;

    const handleIframeLoad = () => {
      iframeLoadedRef.current = true;
      const checkLibrary = () => {
        try {
          const currentIframe = iframeRef.current;
          if (currentIframe && currentIframe.contentWindow) {
            if (typeof currentIframe.contentWindow.DungeonGenerator === 'function') {
              initGenerator();
              return;
            }
          }
          setTimeout(checkLibrary, 200);
        } catch (e) { setTimeout(checkLibrary, 500); }
      };
      checkLibrary();
    };

    if (iframe && iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setTimeout(handleIframeLoad, 100);
    } else if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    const timeoutId = setTimeout(() => {
      if (!isLoaded && !initError) initGenerator();
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      if (iframe) iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [initGenerator, isLoaded, initError]);

  useEffect(() => {
    if (externalIsLoaded && !isLoaded && !initError) initGenerator();
  }, [externalIsLoaded, isLoaded, initError, initGenerator]);

  return (
    <div className="dungeon-viewer" style={{
      width: '100%',
      minHeight: '400px',
      background: '#1a1a2e',
      borderRadius: '16px',
      border: '1px solid #2a2a4a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <iframe
        ref={iframeRef}
        title="Dungeon Generator"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
          background: '#1a1a2e'
        }}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <script>
                (function() {
                  try {
                    if (window.parent && window.parent.DungeonGenerator) {
                      window.DungeonGenerator = window.parent.DungeonGenerator;
                      console.log('✅ Bibliothèque copiée depuis le parent');
                    }
                  } catch (e) { console.warn('⚠️ Erreur lors de la copie de la bibliothèque:', e); }
                })();
              </script>
              <style>
                body { margin: 0; padding: 0; background: #1a1a2e; }
                #dungeon-wrapper { width: 100%; height: 100%; min-height: 400px; display: flex; justify-content: center; align-items: center; position: relative; background: #1a1a2e; }
                .dungeon-placeholder { color: #555; text-align: center; padding: 3rem; width: 100%; }
                .dungeon-placeholder span { font-size: 4rem; display: block; margin-bottom: 1rem; }
                .dungeon-placeholder p { margin: 0.5rem 0; }
              </style>
            </head>
            <body>
              <div id="dungeon-wrapper">
                <div class="dungeon-placeholder">
                  <span>🏗️</span>
                  <p>Chargement du générateur...</p>
                  <p style="font-size: 0.8rem; color: #444;">Initialisation en cours</p>
                </div>
              </div>
            </body>
          </html>
        `}
      />
      {initError && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#d63031', textAlign: 'center', padding: '2rem', width: '100%', background: 'rgba(26,26,46,0.95)', zIndex: 20, borderRadius: '16px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <p style={{ fontWeight: 'bold' }}>Erreur d'initialisation</p>
          <p style={{ fontSize: '0.9rem', color: '#888' }}>{initError}</p>
          <button onClick={() => { setInitAttempts(0); setInitError(null); initGenerator(); }} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>🔄 Réessayer</button>
        </div>
      )}
      {externalIsLoading && isLoaded && (
        <div className="loading-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,26,46,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', gap: '1rem', zIndex: 10 }}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '4px solid #2a2a4a', borderTop-color: '#f7971e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#888' }}>Génération en cours...</p>
        </div>
      )}
    </div>
  );
});

DungeonViewer.displayName = 'DungeonViewer';
export default DungeonViewer;
```

/frontend/src/DungeonControls.js

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import './DungeonControls.css';

const ALGORITHMS = {
  'rooms': { label: '🏠 Salles + couloirs en L', params: { numRooms: { label: 'Nombre de salles', min: 3, max: 30, default: 12 }, minRoomSize: { label: 'Taille min salle', min: 2, max: 8, default: 3 }, maxRoomSize: { label: 'Taille max salle', min: 4, max: 15, default: 7 } } },
  'bsp': { label: '🌳 BSP', params: { minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 }, maxRoomSize: { label: 'Taille max salle', min: 4, max: 12, default: 6 }, maxDepth: { label: 'Profondeur max', min: 2, max: 8, default: 4 } } },
  'sinuous': { label: '🌀 Couloirs sinueux', params: { steps: { label: 'Pas', min: 100, max: 2000, default: 500 }, turnProbability: { label: 'Probabilité de tourner', min: 0.1, max: 0.9, step: 0.05, default: 0.3 }, roomProbability: { label: 'Probabilité de salle', min: 0.01, max: 0.2, step: 0.01, default: 0.05 }, minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 }, maxRoomSize: { label: 'Taille max salle', min: 4, max: 10, default: 5 } } },
  'cellular': { label: '🕳️ Automates cellulaires', params: { density: { label: 'Densité initiale', min: 0.3, max: 0.7, step: 0.05, default: 0.45 }, iterations: { label: 'Itérations', min: 3, max: 10, default: 5 }, birthLimit: { label: 'Seuil naissance', min: 2, max: 5, default: 4 }, deathLimit: { label: 'Seuil mort', min: 2, max: 5, default: 3 } } },
  'drunkard': { label: '🚶 Drunkard\'s Walk', params: { steps: { label: 'Pas par marcheur', min: 50, max: 500, default: 200 }, walkers: { label: 'Nombre de marcheurs', min: 1, max: 20, default: 5 }, roomChance: { label: 'Chance de salle', min: 0.01, max: 0.1, step: 0.01, default: 0.04 }, directionChange: { label: 'Changement direction', min: 0.1, max: 0.9, step: 0.05, default: 0.5 } } },
  'dla': { label: '🌿 DLA Central Attractor', params: { particles: { label: 'Particules', min: 50, max: 500, default: 150 }, radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 }, spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 } } },
  'dla-symmetry': { label: '🔄 DLA Symétrie', params: { particles: { label: 'Particules', min: 50, max: 500, default: 150 }, radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 }, spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 }, symmetry: { label: 'Symétrie', options: ['x', 'y', 'both'], default: 'both' } } },
  'graph-grammar': { label: '🧠 Graph Grammar', params: {} }
};

const LEGEND_POSITIONS = [
  { value: 'bottom-right', label: '⬇️ ➡️ Bas droite' },
  { value: 'bottom-left', label: '⬇️ ⬅️ Bas gauche' },
  { value: 'top-right', label: '⬆️ ➡️ Haut droite' },
  { value: 'top-left', label: '⬆️ ⬅️ Haut gauche' }
];

const DungeonControls = ({ 
  onGenerate, onExportSVG, onExportPNG, onPrint, onUndo, onRedo,
  onAddAnnotation, onRefreshExports, onDeleteExport,
  onOpenTileManager, onToggleLegend, onOpenLayerManager, onOpenGraphGrammarEditor, onLegendPositionChange,
  isLoading, history, exports: exportsList, isLoaded, tiles,
  showLegend, legendPosition, layersCount
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState('rooms');
  const [params, setParams] = useState({});
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState({ x: 10, y: 10, text: 'Entrée', color: '#ffd700' });
  const [showExports, setShowExports] = useState(false);

  useEffect(() => {
    if (ALGORITHMS[selectedAlgo]) {
      const defaultParams = {};
      if (selectedAlgo === 'graph-grammar') {
        // Les paramètres sont gérés par l'éditeur Graph Grammar
        return;
      }
      Object.entries(ALGORITHMS[selectedAlgo].params).forEach(([key, config]) => {
        defaultParams[key] = config.default;
      });
      setParams(defaultParams);
    }
  }, [selectedAlgo]);

  const handleAlgoChange = useCallback((e) => {
    const algo = e.target.value;
    setSelectedAlgo(algo);
    if (algo === 'graph-grammar') {
      // Ouvrir l'éditeur Graph Grammar
      onOpenGraphGrammarEditor();
    }
  }, [onOpenGraphGrammarEditor]);

  const handleParamChange = useCallback((key, value) => setParams(prev => ({ ...prev, [key]: value })), []);
  
  const handleGenerate = useCallback(() => {
    if (!isLoaded) { alert('Le générateur n\'est pas encore chargé.'); return; }
    onGenerate(selectedAlgo, params);
  }, [selectedAlgo, params, onGenerate, isLoaded]);

  const handleAnnotationAdd = useCallback(() => { onAddAnnotation(annotation.x, annotation.y, annotation.text, annotation.color); setShowAnnotation(false); }, [annotation, onAddAnnotation]);
  const handlePositionChange = useCallback((e) => onLegendPositionChange(e.target.value), [onLegendPositionChange]);

  const renderParamInput = useCallback((key, config) => {
    const value = params[key] !== undefined ? params[key] : config.default;
    const inputId = `param-${key}`;
    if (config.options) {
      return <select id={inputId} name={key} value={value} onChange={(e) => handleParamChange(key, e.target.value)} className="param-select">{config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>;
    }
    return (
      <div className="param-input-group">
        <input type="range" id={inputId} name={key} min={config.min} max={config.max} step={config.step || 1} value={value} onChange={(e) => handleParamChange(key, parseFloat(e.target.value))} className="param-slider" />
        <span className="param-value">{value}</span>
      </div>
    );
  }, [params, handleParamChange]);

  return (
    <div className="dungeon-controls" role="form" aria-label="Contrôles du générateur">
      <div className="controls-row">
        <div className="control-group">
          <label htmlFor="algorithm-select">Algorithme</label>
          <select id="algorithm-select" name="algorithm" value={selectedAlgo} onChange={handleAlgoChange} className="algo-select" disabled={!isLoaded}>
            {Object.entries(ALGORITHMS).map(([key, algo]) => <option key={key} value={key}>{algo.label}</option>)}
          </select>
        </div>
        <div className="control-group params-group">
          <label>Paramètres</label>
          {selectedAlgo === 'graph-grammar' ? (
            <div style={{ padding: '0.5rem', color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
              ⚙️ Configurez les règles dans l'éditeur Graph Grammar
            </div>
          ) : (
            <div className="params-grid">
              {Object.entries(ALGORITHMS[selectedAlgo]?.params || {}).map(([key, config]) => (
                <div key={key} className="param-item">
                  <label htmlFor={`param-${key}`} className="param-label">{config.label}</label>
                  {renderParamInput(key, config)}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="control-group actions-group">
          <button onClick={handleGenerate} disabled={isLoading || !isLoaded} className="btn btn-generate">
            {isLoading ? '⏳ Génération...' : '🎲 Générer'}
          </button>
        </div>
      </div>

      <div className="controls-row controls-row-actions">
        <div className="control-group">
          <button onClick={() => setShowAnnotation(!showAnnotation)} className="btn btn-annotation" disabled={!isLoaded}>📝 Annotation</button>
          {showAnnotation && (
            <div className="annotation-panel" role="group" aria-label="Ajout d'annotation">
              <div className="annotation-field"><label htmlFor="annotation-x">X</label><input id="annotation-x" name="annotation-x" type="number" value={annotation.x} onChange={(e) => setAnnotation({ ...annotation, x: parseInt(e.target.value) || 0 })} className="annotation-input" /></div>
              <div className="annotation-field"><label htmlFor="annotation-y">Y</label><input id="annotation-y" name="annotation-y" type="number" value={annotation.y} onChange={(e) => setAnnotation({ ...annotation, y: parseInt(e.target.value) || 0 })} className="annotation-input" /></div>
              <div className="annotation-field"><label htmlFor="annotation-text">Texte</label><input id="annotation-text" name="annotation-text" type="text" value={annotation.text} onChange={(e) => setAnnotation({ ...annotation, text: e.target.value })} placeholder="Texte" className="annotation-input text" /></div>
              <div className="annotation-field"><label htmlFor="annotation-color">Couleur</label><input id="annotation-color" name="annotation-color" type="color" value={annotation.color} onChange={(e) => setAnnotation({ ...annotation, color: e.target.value })} className="annotation-color" /></div>
              <button onClick={handleAnnotationAdd} className="btn btn-small btn-add">Ajouter</button>
            </div>
          )}
        </div>

        <div className="control-group">
          <button onClick={onUndo} disabled={!history?.canUndo || !isLoaded} className="btn btn-history">↩️ Annuler</button>
          <button onClick={onRedo} disabled={!history?.canRedo || !isLoaded} className="btn btn-history">↪️ Rétablir</button>
        </div>

        <div className="control-group export-group">
          <button onClick={onOpenTileManager} className="btn btn-tiles">🎨 Tuiles</button>
          <button onClick={onOpenLayerManager} className="btn btn-layers">📂 Calques {layersCount > 0 && <span className="layer-badge">{layersCount}</span>}</button>
          <button onClick={onOpenGraphGrammarEditor} className="btn btn-gg">🧠 Graph Grammar</button>
          <div className="legend-controls">
            <button onClick={onToggleLegend} className="btn btn-legend">{showLegend ? '📋 Cacher' : '📋 Légende'}</button>
            {showLegend && <select value={legendPosition} onChange={handlePositionChange} className="legend-position-select" aria-label="Position de la légende">{LEGEND_POSITIONS.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}</select>}
          </div>
          <button onClick={onExportSVG} className="btn btn-export-svg" disabled={!isLoaded}>📄 SVG</button>
          <button onClick={onExportPNG} className="btn btn-export-png" disabled={!isLoaded}>🖼️ PNG</button>
          <button onClick={onPrint} className="btn btn-export-print" disabled={!isLoaded}>🖨️ Imprimer</button>
          <button onClick={() => setShowExports(!showExports)} className="btn btn-export-print" style={{ background: '#6c5ce7' }}>📁 Exports</button>
        </div>
      </div>

      {showExports && (
        <div className="exports-panel" role="list" aria-label="Liste des exports">
          <div className="exports-header"><span>📁 Exports sauvegardés ({exportsList?.length || 0})</span><button onClick={onRefreshExports} className="btn btn-small" style={{ background: '#2d3436', color: '#dfe6e9' }}>🔄 Rafraîchir</button></div>
          <div className="exports-list">
            {exportsList && exportsList.length > 0 ? exportsList.map((file) => (
              <div key={file.name} className="export-item" role="listitem">
                <span className="export-name">{file.name}</span>
                <span className="export-size">{file.sizeFormatted}</span>
                <span className="export-date">{file.createdFormatted}</span>
                <div className="export-actions">
                  <a href={file.url} download={file.name} className="btn btn-small" style={{ background: '#00b894', color: '#fff' }} aria-label={`Télécharger ${file.name}`}>⬇️</a>
                  <button onClick={() => onDeleteExport(file.name)} className="btn btn-small" style={{ background: '#d63031', color: '#fff' }} aria-label={`Supprimer ${file.name}`}>🗑️</button>
                </div>
              </div>
            )) : <div className="export-empty" role="status">Aucun export sauvegardé pour le moment</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DungeonControls;
```

/frontend/src/DungeonControls.css (ajout du style pour le bouton Graph Grammar)

```css
/* Ajouter à la fin du fichier */
.btn-gg {
  background: #e17055;
  color: #fff;
}

.btn-gg:hover:not(:disabled) {
  background: #d63031;
}
```

/frontend/src/TileManager.js

```javascript
import React, { useState, useCallback } from 'react';
import './TileManager.css';

const TileManager = ({ tiles, onAddTile, onUpdateTile, onDeleteTile, onClose }) => {
  const [editingTile, setEditingTile] = useState(null);
  const [formData, setFormData] = useState({ label: '', color: '#6c5ce7', icon: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#6c5ce7');

  const predefinedColors = [
    '#f1c40f', '#e74c3c', '#8e44ad', '#3498db', '#e67e22', '#2ecc71',
    '#2c3e50', '#1abc9c', '#9b59b6', '#e84393', '#00b894', '#fdcb6e',
    '#6c5ce7', '#00cec9', '#fd79a8', '#0984e3'
  ];

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.label.trim()) { alert('Veuillez saisir un nom pour la tuile'); return; }
    if (isEditing && editingTile) {
      await onUpdateTile(editingTile.id, formData);
    } else {
      await onAddTile(formData);
    }
    setFormData({ label: '', color: '#6c5ce7', icon: '' });
    setSelectedColor('#6c5ce7');
    setIsEditing(false);
    setEditingTile(null);
  }, [formData, isEditing, editingTile, onAddTile, onUpdateTile]);

  const handleEdit = useCallback((tile) => {
    setEditingTile(tile);
    setFormData({ label: tile.label, color: tile.color, icon: tile.icon || '' });
    setSelectedColor(tile.color);
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setFormData({ label: '', color: '#6c5ce7', icon: '' });
    setSelectedColor('#6c5ce7');
    setIsEditing(false);
    setEditingTile(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tuile ?')) {
      await onDeleteTile(id);
    }
  }, [onDeleteTile]);

  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
    setFormData(prev => ({ ...prev, color }));
  }, []);

  return (
    <div className="tile-manager-overlay" onClick={onClose}>
      <div className="tile-manager" onClick={(e) => e.stopPropagation()}>
        <div className="tile-manager-header">
          <h2>🎨 Gestion des Tuiles</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="tile-form">
          <div className="form-group">
            <label htmlFor="tile-label">Nom de la tuile</label>
            <input id="tile-label" type="text" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Ex: Trésor, Porte, Piège..." required />
          </div>
          <div className="form-group">
            <label>Couleur</label>
            <div className="color-picker-grid">
              {predefinedColors.map((color) => (
                <button key={color} type="button" className={`color-btn ${selectedColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => handleColorSelect(color)} aria-label={`Couleur ${color}`} />
              ))}
              <input type="color" value={formData.color} onChange={(e) => handleColorSelect(e.target.value)} className="color-custom" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tile-icon">Icône (emoji)</label>
            <input id="tile-icon" type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="💰" maxLength={2} />
          </div>
          <div className="form-group">
            <label>Aperçu</label>
            <div className="tile-preview">
              <span className="preview-color" style={{ backgroundColor: formData.color }} />
              <span className="preview-icon">{formData.icon || '⬜'}</span>
              <span className="preview-label">{formData.label || 'Nouvelle tuile'}</span>
            </div>
          </div>
          <div className="form-actions">
            {isEditing && <button type="button" className="btn btn-secondary" onClick={handleCancel}>Annuler</button>}
            <button type="submit" className="btn btn-primary">{isEditing ? '💾 Modifier' : '➕ Ajouter'}</button>
          </div>
        </form>
        <div className="tiles-list">
          <h3>Tuiles existantes ({tiles.length})</h3>
          <div className="tiles-grid">
            {tiles.map((tile) => (
              <div key={tile.id} className="tile-item">
                <div className="tile-item-content">
                  <span className="tile-color-dot" style={{ backgroundColor: tile.color }} />
                  <span className="tile-icon">{tile.icon || '⬜'}</span>
                  <span className="tile-label">{tile.label}</span>
                  <span className="tile-id">#{tile.id}</span>
                </div>
                <div className="tile-item-actions">
                  <button className="btn btn-small btn-edit" onClick={() => handleEdit(tile)} title="Modifier">✏️</button>
                  <button className="btn btn-small btn-delete" onClick={() => handleDelete(tile.id)} title="Supprimer">🗑️</button>
                </div>
              </div>
            ))}
          </div>
          {tiles.length === 0 && <p className="empty-message">Aucune tuile personnalisée</p>}
        </div>
      </div>
    </div>
  );
};

export default TileManager;
```

/frontend/src/TileManager.css

```css
.tile-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}
.tile-manager {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}
.tile-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.tile-manager-header h2 { color: #e0e0e0; font-size: 1.5rem; margin: 0; }
.close-btn { background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px; transition: background 0.2s; }
.close-btn:hover { background: #2a2a4a; color: #e0e0e0; }
.tile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #0f0f1a;
  border-radius: 8px;
  border: 1px solid #2a2a4a;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-group label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.form-group input[type="text"], .form-group input[type="color"] {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input[type="text"]:focus { border-color: #6c5ce7; }
.color-picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.color-btn:hover { transform: scale(1.1); }
.color-btn.active { border-color: #fff; box-shadow: 0 0 0 2px #6c5ce7; }
.color-custom {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #2a2a4a;
  cursor: pointer;
  padding: 2px;
  background: transparent;
}
.tile-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #1a1a2e;
  border-radius: 6px;
  border: 1px solid #2a2a4a;
}
.preview-color { width: 32px; height: 32px; border-radius: 4px; border: 1px solid #2a2a4a; flex-shrink: 0; }
.preview-icon { font-size: 1.5rem; }
.preview-label { color: #e0e0e0; font-size: 0.9rem; }
.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
.btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary { background: #6c5ce7; color: #fff; }
.btn-primary:hover { background: #7d6def; transform: translateY(-1px); }
.btn-secondary { background: #2d3436; color: #dfe6e9; }
.btn-secondary:hover { background: #3d4a4c; }
.btn-small { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
.btn-edit { background: #fdcb6e; color: #1a1a2e; }
.btn-edit:hover { background: #fdcb6e; }
.btn-delete { background: #d63031; color: #fff; }
.btn-delete:hover { background: #e74c3c; }
.tiles-list { margin-top: 1rem; }
.tiles-list h3 { color: #888; font-size: 0.9rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 0.75rem; }
.tiles-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}
.tiles-grid::-webkit-scrollbar { width: 6px; }
.tiles-grid::-webkit-scrollbar-track { background: #0f0f1a; border-radius: 3px; }
.tiles-grid::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
.tiles-grid::-webkit-scrollbar-thumb:hover { background: #3a3a5a; }
.tile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #1a1a2e;
  border-radius: 6px;
  border: 1px solid #2a2a4a;
  transition: background 0.2s;
}
.tile-item:hover { background: #2a2a4a; }
.tile-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.tile-color-dot { width: 20px; height: 20px; border-radius: 4px; border: 1px solid #2a2a4a; flex-shrink: 0; }
.tile-icon { font-size: 1.2rem; }
.tile-label { color: #e0e0e0; font-size: 0.9rem; }
.tile-id { color: #555; font-size: 0.75rem; font-family: monospace; }
.tile-item-actions { display: flex; gap: 0.25rem; }
.empty-message { text-align: center; color: #555; padding: 1rem; font-size: 0.9rem; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .tile-manager { padding: 1rem; max-width: 95%; margin: 0.5rem; }
  .color-picker-grid { gap: 0.3rem; }
  .color-btn { width: 28px; height: 28px; }
  .tile-item { flex-wrap: wrap; gap: 0.5rem; }
  .tile-item-actions { width: 100%; justify-content: flex-end; }
  .form-actions { flex-direction: column; }
  .form-actions .btn { width: 100%; justify-content: center; }
}
```

/frontend/src/LayerManager.js

```javascript
import React, { useState, useCallback } from 'react';
import './LayerManager.css';

const LayerManager = ({ layers, onToggleLayer, onAddLayer, onDeleteLayer, onClose }) => {
  const [newLayerName, setNewLayerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLayer = useCallback(() => {
    if (newLayerName.trim()) {
      onAddLayer(newLayerName.trim());
      setNewLayerName('');
      setIsAdding(false);
    }
  }, [newLayerName, onAddLayer]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') handleAddLayer();
  }, [handleAddLayer]);

  return (
    <div className="layer-manager-overlay" onClick={onClose}>
      <div className="layer-manager" onClick={(e) => e.stopPropagation()}>
        <div className="layer-manager-header">
          <h2>📂 Gestion des Calques</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="layer-manager-content">
          <div className="layer-list">
            {Object.keys(layers).length === 0 ? (
              <p className="empty-message">Aucun calque</p>
            ) : (
              Object.entries(layers).map(([name, layer]) => (
                <div key={name} className="layer-item">
                  <div className="layer-info">
                    <span className="layer-name">{name}</span>
                    <span className="layer-tile-count">{layer.length} tuile{layer.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="layer-actions">
                    <label className="layer-toggle">
                      <input type="checkbox" checked={layer.visible !== false} onChange={() => onToggleLayer(name)} />
                      <span className="toggle-slider"></span>
                    </label>
                    <button className="btn btn-small btn-delete-layer" onClick={() => onDeleteLayer(name)} title="Supprimer le calque">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="layer-add-section">
            {isAdding ? (
              <div className="layer-add-form">
                <input type="text" value={newLayerName} onChange={(e) => setNewLayerName(e.target.value)} onKeyPress={handleKeyPress} placeholder="Nom du calque" autoFocus />
                <button className="btn btn-small btn-add-layer" onClick={handleAddLayer}>Ajouter</button>
                <button className="btn btn-small btn-cancel" onClick={() => { setIsAdding(false); setNewLayerName(''); }}>Annuler</button>
              </div>
            ) : (
              <button className="btn btn-add-layer-main" onClick={() => setIsAdding(true)}>➕ Ajouter un calque</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerManager;
```

/frontend/src/LayerManager.css

```css
.layer-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}
.layer-manager {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}
.layer-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.layer-manager-header h2 { color: #e0e0e0; font-size: 1.5rem; margin: 0; }
.close-btn { background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px; transition: background 0.2s; }
.close-btn:hover { background: #2a2a4a; color: #e0e0e0; }
.layer-manager-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.layer-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}
.layer-list::-webkit-scrollbar { width: 6px; }
.layer-list::-webkit-scrollbar-track { background: #0f0f1a; border-radius: 3px; }
.layer-list::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
.layer-list::-webkit-scrollbar-thumb:hover { background: #3a3a5a; }
.layer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #0f0f1a;
  border-radius: 8px;
  border: 1px solid #2a2a4a;
  transition: background 0.2s;
}
.layer-item:hover { background: #1a1a2e; }
.layer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}
.layer-name { color: #e0e0e0; font-size: 0.9rem; font-weight: 500; }
.layer-tile-count { color: #888; font-size: 0.75rem; background: #2a2a4a; padding: 0.1rem 0.5rem; border-radius: 10px; }
.layer-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.layer-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  cursor: pointer;
  display: inline-block;
}
.layer-toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute;
  inset: 0;
  background: #2a2a4a;
  border-radius: 22px;
  transition: background 0.3s;
}
.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background: #888;
  border-radius: 50%;
  transition: transform 0.3s, background 0.3s;
}
.layer-toggle input:checked + .toggle-slider { background: #6c5ce7; }
.layer-toggle input:checked + .toggle-slider::before { transform: translateX(18px); background: #fff; }

.btn-small { padding: 0.2rem 0.5rem; font-size: 0.75rem; border: none; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.btn-delete-layer { background: #d63031; color: #fff; }
.btn-delete-layer:hover { background: #e74c3c; }

.layer-add-section { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #2a2a4a; }
.layer-add-form { display: flex; gap: 0.5rem; align-items: center; }
.layer-add-form input { flex: 1; background: #0f0f1a; color: #e0e0e0; border: 1px solid #2a2a4a; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
.layer-add-form input:focus { border-color: #6c5ce7; }
.btn-add-layer { background: #6c5ce7; color: #fff; }
.btn-add-layer:hover { background: #7d6def; }
.btn-cancel { background: #2d3436; color: #dfe6e9; }
.btn-cancel:hover { background: #3d4a4c; }
.btn-add-layer-main {
  background: none;
  border: none;
  color: #6c5ce7;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  width: 100%;
  text-align: center;
  border: 1px dashed #2a2a4a;
  border-radius: 6px;
  transition: background 0.2s, border-color 0.2s;
}
.btn-add-layer-main:hover { background: #2a2a4a; border-color: #6c5ce7; }
.empty-message { text-align: center; color: #555; padding: 1rem; font-size: 0.9rem; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .layer-manager { padding: 1rem; max-width: 95%; margin: 0.5rem; }
  .layer-item { flex-wrap: wrap; gap: 0.5rem; }
  .layer-actions { width: 100%; justify-content: flex-end; }
  .layer-add-form { flex-wrap: wrap; }
  .layer-add-form input { width: 100%; }
}
```

/frontend/src/Legend.js

```javascript
import React, { useState, useCallback } from 'react';
import './Legend.css';

const Legend = ({ tiles, onClose, position = 'bottom-right' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = useCallback(() => setIsCollapsed(!isCollapsed), [isCollapsed]);
  const visibleTiles = tiles.filter(t => t.icon || t.color);
  if (visibleTiles.length === 0) return null;

  return (
    <div className={`legend legend-${position} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="legend-header" onClick={toggleCollapse}>
        <span className="legend-title">📋 Légende</span>
        <div className="legend-actions">
          <button className="legend-toggle" aria-label="Réduire">{isCollapsed ? '▶' : '▼'}</button>
          {onClose && <button className="legend-close" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Fermer">✕</button>}
        </div>
      </div>
      {!isCollapsed && (
        <div className="legend-content">
          <div className="legend-section">
            <div className="legend-section-title">🏷️ Tuiles personnalisées</div>
            {visibleTiles.map((tile) => (
              <div key={tile.id} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: tile.color }} />
                <span className="legend-icon">{tile.icon || '⬜'}</span>
                <span className="legend-label">{tile.label}</span>
              </div>
            ))}
          </div>
          <div className="legend-divider" />
          <div className="legend-section">
            <div className="legend-section-title">📐 Tuiles par défaut</div>
            <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#2d3436' }} /><span className="legend-icon">⬜</span><span className="legend-label">Sol</span></div>
            <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#636e72' }} /><span className="legend-icon">⬛</span><span className="legend-label">Mur</span></div>
            <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#4a4a4a' }} /><span className="legend-icon">▫️</span><span className="legend-label">Couloir</span></div>
            <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#3d3d3d' }} /><span className="legend-icon">◻️</span><span className="legend-label">Salle</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;
```

/frontend/src/Legend.css

```css
.legend {
  position: absolute;
  background: rgba(26,26,46,0.92);
  backdrop-filter: blur(8px);
  border: 1px solid #2a2a4a;
  border-radius: 12px;
  padding: 0.75rem;
  min-width: 180px;
  max-width: 250px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  z-index: 20;
  transition: all 0.3s ease;
  pointer-events: auto;
}
.legend-bottom-right { bottom: 1rem; right: 1rem; }
.legend-bottom-left { bottom: 1rem; left: 1rem; }
.legend-top-right { top: 1rem; right: 1rem; }
.legend-top-left { top: 1rem; left: 1rem; }
.legend.collapsed { min-width: auto; padding: 0.5rem 0.75rem; }
.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.75rem;
}
.legend-title { font-size: 0.85rem; font-weight: 600; color: #e0e0e0; }
.legend-actions { display: flex; align-items: center; gap: 0.25rem; }
.legend-toggle, .legend-close {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0.1rem 0.25rem;
  font-size: 0.8rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
  line-height: 1;
}
.legend-toggle:hover, .legend-close:hover { background: #2a2a4a; color: #e0e0e0; }
.legend-content {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 350px;
  overflow-y: auto;
}
.legend-content::-webkit-scrollbar { width: 4px; }
.legend-content::-webkit-scrollbar-track { background: transparent; }
.legend-content::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 2px; }
.legend-section-title { font-size: 0.7rem; text-transform: uppercase; color: #666; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 0.25rem; }
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.3rem;
  border-radius: 4px;
  transition: background 0.2s;
}
.legend-item:hover { background: #2a2a4a; }
.legend-color { width: 16px; height: 16px; border-radius: 3px; border: 1px solid #2a2a4a; flex-shrink: 0; }
.legend-icon { font-size: 0.9rem; width: 20px; text-align: center; flex-shrink: 0; }
.legend-label { font-size: 0.8rem; color: #ccc; flex: 1; }
.legend-divider { border-top: 1px solid #2a2a4a; margin: 0.3rem 0; }

@media (max-width: 768px) {
  .legend { min-width: 140px; max-width: 180px; padding: 0.5rem; }
  .legend-bottom-right { bottom: 0.5rem; right: 0.5rem; }
  .legend-bottom-left { bottom: 0.5rem; left: 0.5rem; }
  .legend-top-right { top: 0.5rem; right: 0.5rem; }
  .legend-top-left { top: 0.5rem; left: 0.5rem; }
  .legend-title { font-size: 0.75rem; }
  .legend-label { font-size: 0.7rem; }
  .legend-color { width: 12px; height: 12px; }
  .legend-icon { font-size: 0.75rem; width: 16px; }
  .legend-section-title { font-size: 0.6rem; }
}
```

/frontend/src/GraphGrammarEditor.js

```javascript
import React, { useState, useCallback, useEffect } from 'react';
import './GraphGrammarEditor.css';

const DEFAULT_RULES = [
  {
    id: 'enfilade',
    name: 'Enfilade simple',
    description: 'Ajoute une salle en ligne droite',
    code: `(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'standard');
  }
}`
  },
  {
    id: 'enfilade-sym',
    name: 'Enfilade symétrique',
    description: 'Ajoute une salle et son symétrique',
    code: `(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'standard');
    ctx.addSymmetrical(newNode, 'both');
  }
}`
  },
  {
    id: 'couloir-large',
    name: 'Couloir large',
    description: 'Ajoute un couloir large (3 tuiles)',
    code: `(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'large', { width: 3 });
  }
}`
  },
  {
    id: 'porte',
    name: 'Couloir avec porte',
    description: 'Ajoute un couloir avec une porte à mi-chemin',
    code: `(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'door', { hasDoor: true });
  }
}`
  },
  {
    id: 'passage-secret',
    name: 'Passage secret',
    description: 'Ajoute un passage secret entre deux salles',
    code: `(ctx) => {
  const dirs = [[2,0],[-2,0],[0,2],[0,-2]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level);
    ctx.addCorridor(ctx.node, newNode, 'secret', { secretPassage: true });
  }
}`
  },
  {
    id: 'hierarchie',
    name: 'Niveau hiérarchique',
    description: 'Ajoute une salle de niveau supérieur',
    code: `(ctx) => {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const nx = ctx.node.x + dir[0] * ctx.spacing;
  const ny = ctx.node.y + dir[1] * ctx.spacing;
  if (ctx.isPositionFree(nx, ny) && nx > 0 && nx < ctx.w && ny > 0 && ny < ctx.h) {
    const newNode = ctx.createNode(nx, ny, 'sol', ctx.node.level + 1);
    ctx.addCorridor(ctx.node, newNode, 'standard');
  }
}`
  }
];

const GraphGrammarEditor = ({ 
  rules = DEFAULT_RULES, 
  onRulesChange, 
  onClose,
  onGenerate,
  isGenerating 
}) => {
  const [localRules, setLocalRules] = useState(rules);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRule, setNewRule] = useState({ name: '', description: '', code: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [params, setParams] = useState({
    iterations: 10,
    spacing: 4,
    maxNodes: 200,
    startType: 'sol'
  });

  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  const handleRuleChange = useCallback((index, field, value) => {
    const updated = [...localRules];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRules(updated);
    if (onRulesChange) {
      onRulesChange(updated);
    }
  }, [localRules, onRulesChange]);

  const handleDeleteRule = useCallback((index) => {
    const updated = localRules.filter((_, i) => i !== index);
    setLocalRules(updated);
    if (onRulesChange) {
      onRulesChange(updated);
    }
  }, [localRules, onRulesChange]);

  const handleAddRule = useCallback(() => {
    if (newRule.name && newRule.code) {
      const updated = [...localRules, { 
        id: `custom-${Date.now()}`,
        ...newRule 
      }];
      setLocalRules(updated);
      setNewRule({ name: '', description: '', code: '' });
      setShowAddForm(false);
      if (onRulesChange) {
        onRulesChange(updated);
      }
    }
  }, [newRule, localRules, onRulesChange]);

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (onGenerate) {
      onGenerate('graph-grammar', {
        ...params,
        rules: localRules.map(r => {
          try {
            return new Function('ctx', r.code);
          } catch (e) {
            console.error('❌ Erreur de parsing de la règle:', e);
            return (ctx) => {};
          }
        })
      });
    }
  }, [localRules, params, onGenerate]);

  return (
    <div className="graph-grammar-editor-overlay" onClick={onClose}>
      <div className="graph-grammar-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <h2>🧠 Graph Grammar - Éditeur de Règles</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="editor-content">
          {/* Paramètres */}
          <div className="editor-params">
            <h3>⚙️ Paramètres de génération</h3>
            <div className="params-grid">
              <div className="param-group">
                <label htmlFor="gg-iterations">Itérations</label>
                <input
                  id="gg-iterations"
                  type="number"
                  value={params.iterations}
                  onChange={(e) => handleParamChange('iterations', parseInt(e.target.value) || 5)}
                  min={1}
                  max={50}
                />
              </div>
              <div className="param-group">
                <label htmlFor="gg-spacing">Espacement</label>
                <input
                  id="gg-spacing"
                  type="number"
                  value={params.spacing}
                  onChange={(e) => handleParamChange('spacing', parseInt(e.target.value) || 3)}
                  min={2}
                  max={8}
                />
              </div>
              <div className="param-group">
                <label htmlFor="gg-maxnodes">Max nœuds</label>
                <input
                  id="gg-maxnodes"
                  type="number"
                  value={params.maxNodes}
                  onChange={(e) => handleParamChange('maxNodes', parseInt(e.target.value) || 200)}
                  min={10}
                  max={500}
                />
              </div>
              <div className="param-group">
                <label htmlFor="gg-starttype">Type de départ</label>
                <select
                  id="gg-starttype"
                  value={params.startType}
                  onChange={(e) => handleParamChange('startType', e.target.value)}
                >
                  <option value="sol">Sol</option>
                  <option value="salle">Salle</option>
                  <option value="couloir">Couloir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des règles */}
          <div className="rules-list">
            <div className="rules-header">
              <h3>📋 Règles ({localRules.length})</h3>
              <button 
                className="btn btn-add-rule" 
                onClick={() => setShowAddForm(!showAddForm)}
              >
                ➕ Ajouter une règle
              </button>
            </div>

            {showAddForm && (
              <div className="rule-add-form">
                <input
                  type="text"
                  placeholder="Nom de la règle"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
                <textarea
                  placeholder="Code de la règle (fonction avec ctx)"
                  value={newRule.code}
                  onChange={(e) => setNewRule({ ...newRule, code: e.target.value })}
                  rows={4}
                />
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleAddRule}>Ajouter</button>
                  <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
                </div>
              </div>
            )}

            <div className="rules-grid">
              {localRules.map((rule, index) => (
                <div key={rule.id || index} className="rule-item">
                  <div className="rule-header">
                    <span className="rule-name">{rule.name}</span>
                    <div className="rule-actions">
                      <button 
                        className="btn btn-small btn-edit" 
                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      >
                        {editingIndex === index ? '✕' : '✏️'}
                      </button>
                      <button 
                        className="btn btn-small btn-delete" 
                        onClick={() => handleDeleteRule(index)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="rule-desc">{rule.description}</p>
                  
                  {editingIndex === index && (
                    <div className="rule-edit">
                      <textarea
                        value={rule.code}
                        onChange={(e) => handleRuleChange(index, 'code', e.target.value)}
                        rows={6}
                      />
                      <div className="edit-actions">
                        <button 
                          className="btn btn-small btn-primary" 
                          onClick={() => handleRuleChange(index, 'name', rule.name)}
                        >
                          💾 Sauvegarder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button 
              className="btn btn-generate" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '⏳ Génération...' : '🎲 Générer avec Graph Grammar'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphGrammarEditor;
```

/frontend/src/GraphGrammarEditor.css

```css
.graph-grammar-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.graph-grammar-editor {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  padding: 2rem;
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.editor-header h2 {
  color: #e0e0e0;
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #2a2a4a;
  color: #e0e0e0;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #0f0f1a;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #2a2a4a;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #3a3a5a;
}

/* Paramètres */
.editor-params h3 {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  background: #0f0f1a;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #2a2a4a;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-group label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.param-group input,
.param-group select {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.param-group input:focus,
.param-group select:focus {
  border-color: #6c5ce7;
}

/* Règles */
.rules-list {
  flex: 1;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rules-header h3 {
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.btn-add-rule {
  background: #6c5ce7;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-rule:hover {
  background: #7d6def;
}

.rule-add-form {
  background: #0f0f1a;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #2a2a4a;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-add-form input,
.rule-add-form textarea {
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  outline: none;
  font-family: monospace;
  transition: border-color 0.2s;
}

.rule-add-form input:focus,
.rule-add-form textarea:focus {
  border-color: #6c5ce7;
}

.rule-add-form textarea {
  resize: vertical;
  min-height: 80px;
}

.rules-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.rule-item {
  background: #0f0f1a;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #2a2a4a;
  transition: border-color 0.2s;
}

.rule-item:hover {
  border-color: #4a4a6a;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-name {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 0.95rem;
}

.rule-actions {
  display: flex;
  gap: 0.25rem;
}

.rule-desc {
  color: #888;
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
}

.rule-edit {
  margin-top: 0.5rem;
}

.rule-edit textarea {
  width: 100%;
  background: #1a1a2e;
  color: #e0e0e0;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-family: monospace;
  font-size: 0.8rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.rule-edit textarea:focus {
  border-color: #6c5ce7;
}

.edit-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

/* Boutons */
.editor-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #2a2a4a;
}

.btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6c5ce7;
  color: #fff;
}

.btn-primary:hover {
  background: #7d6def;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #2d3436;
  color: #dfe6e9;
}

.btn-secondary:hover {
  background: #3d4a4c;
}

.btn-small {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
}

.btn-edit {
  background: #fdcb6e;
  color: #1a1a2e;
}

.btn-edit:hover {
  background: #fdcb6e;
}

.btn-delete {
  background: #d63031;
  color: #fff;
}

.btn-delete:hover {
  background: #e74c3c;
}

.btn-generate {
  background: linear-gradient(135deg, #f7971e, #ffd200);
  color: #1a1a2e;
  font-size: 1rem;
  padding: 0.7rem 1.8rem;
}

.btn-generate:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(247, 151, 30, 0.3);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .graph-grammar-editor {
    padding: 1rem;
    max-width: 100%;
    margin: 0.5rem;
  }

  .params-grid {
    grid-template-columns: 1fr 1fr;
  }

  .editor-actions {
    flex-direction: column;
  }

  .editor-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .rules-grid {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .params-grid {
    grid-template-columns: 1fr;
  }

  .rule-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
```

---

3. Fichiers racine

/.gitignore

```gitignore
# Backend
backend/node_modules/
backend/exports/
backend/data/
backend/*.log
backend/.env

# Frontend
frontend/node_modules/
frontend/build/
frontend/.env
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
*.pem
*.key
*.crt
```

---

4. README.md

```markdown
# 🏰 Dungeon Generator App

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

**Dungeon Generator App** est une application web complète permettant de générer procéduralement des donjons avec :

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
git clone https://github.com/sebastienbats/Dungeon-Generator-App.git
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
```

---

Installation finale

```bash
# 1. Nettoyer les fichiers inutiles
cd frontend
rm -f convert-to-iife.js babel.config.js config-overrides.js
rm -f public/dungeon-generator.js public/dungeon-generator.iife.js

# 2. Nettoyer les dépendances
rm -rf node_modules package-lock.json

# 3. Réinstaller
npm install --legacy-peer-deps

# 4. Démarrer
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Votre projet est maintenant complet avec l'intégration de l'algorithme Graph Grammar avancé ! 🚀