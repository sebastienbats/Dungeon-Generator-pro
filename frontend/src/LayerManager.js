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
