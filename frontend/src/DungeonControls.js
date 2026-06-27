import React, { useState, useEffect, useCallback } from 'react';
import './DungeonControls.css';

const ALGORITHMS = {
  'rooms': {
    label: '🏠 Salles + couloirs en L',
    params: {
      numRooms: { label: 'Nombre de salles', min: 3, max: 30, default: 12 },
      minRoomSize: { label: 'Taille min salle', min: 2, max: 8, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 15, default: 7 }
    }
  },
  'bsp': {
    label: '🌳 BSP',
    params: {
      minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 12, default: 6 },
      maxDepth: { label: 'Profondeur max', min: 2, max: 8, default: 4 }
    }
  },
  'sinuous': {
    label: '🌀 Couloirs sinueux',
    params: {
      steps: { label: 'Pas', min: 100, max: 2000, default: 500 },
      turnProbability: { label: 'Probabilité de tourner', min: 0.1, max: 0.9, step: 0.05, default: 0.3 },
      roomProbability: { label: 'Probabilité de salle', min: 0.01, max: 0.2, step: 0.01, default: 0.05 },
      minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 10, default: 5 }
    }
  },
  'cellular': {
    label: '🕳️ Automates cellulaires',
    params: {
      density: { label: 'Densité initiale', min: 0.3, max: 0.7, step: 0.05, default: 0.45 },
      iterations: { label: 'Itérations', min: 3, max: 10, default: 5 },
      birthLimit: { label: 'Seuil naissance', min: 2, max: 5, default: 4 },
      deathLimit: { label: 'Seuil mort', min: 2, max: 5, default: 3 }
    }
  },
  'drunkard': {
    label: '🚶 Drunkard\'s Walk',
    params: {
      steps: { label: 'Pas par marcheur', min: 50, max: 500, default: 200 },
      walkers: { label: 'Nombre de marcheurs', min: 1, max: 20, default: 5 },
      roomChance: { label: 'Chance de salle', min: 0.01, max: 0.1, step: 0.01, default: 0.04 },
      directionChange: { label: 'Changement direction', min: 0.1, max: 0.9, step: 0.05, default: 0.5 }
    }
  },
  'dla': {
    label: '🌿 DLA Central Attractor',
    params: {
      particles: { label: 'Particules', min: 50, max: 500, default: 150 },
      radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 },
      spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 }
    }
  },
  'dla-symmetry': {
    label: '🔄 DLA Symétrie',
    params: {
      particles: { label: 'Particules', min: 50, max: 500, default: 150 },
      radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 },
      spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 },
      symmetry: { label: 'Symétrie', options: ['x', 'y', 'both'], default: 'both' }
    }
  },
  'graph-grammar': {
    label: '🧠 Graph Grammar',
    params: {}
  },
  'lsystem': {
    label: '🌿 L-Systems (salles rondes)',
    params: {
      preset: {
        label: 'Type de L-System',
        options: ['cercle', 'spirale', 'flocon', 'hilbert', 'dragons'],
        default: 'cercle'
      },
      iterations: {
        label: 'Itérations',
        min: 1,
        max: 10,
        default: 4
      },
      stepSize: {
        label: 'Taille du pas',
        min: 0.5,
        max: 5,
        step: 0.5,
        default: 2
      },
      angle: {
        label: 'Angle (°)',
        min: 1,
        max: 90,
        default: 10
      },
      fill: {
        label: 'Remplir',
        options: ['true', 'false'],
        default: 'true'
      }
    }
  }
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
  onOpenTileManager, onToggleLegend, onOpenLayerManager, onOpenGraphGrammarEditor, onOpenCollisionManager, onLegendPositionChange,
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
      if (selectedAlgo === 'graph-grammar') return;
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
      return (
        <select
          id={inputId}
          name={key}
          value={String(value)}
          onChange={(e) => handleParamChange(key, e.target.value)}
          className="param-select"
        >
          {config.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <div className="param-input-group">
        <input
          type="range"
          id={inputId}
          name={key}
          min={config.min}
          max={config.max}
          step={config.step || 1}
          value={value}
          onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
          className="param-slider"
        />
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
          <button onClick={onOpenCollisionManager} className="btn btn-collision">🧱 Collisions</button>
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
