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
