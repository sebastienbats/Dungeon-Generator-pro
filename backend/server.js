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
