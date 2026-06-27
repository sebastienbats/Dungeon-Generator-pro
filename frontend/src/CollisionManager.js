import React, { useState, useCallback, useEffect, useRef } from 'react';
import './CollisionManager.css';

const CollisionManager = ({ instance, onClose, onStatus }) => {
  const [collisionMode, setCollisionMode] = useState('view');
  const [selectedTile, setSelectedTile] = useState(null);
  const [startTile, setStartTile] = useState(null);
  const [endTile, setEndTile] = useState(null);
  const [path, setPath] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const canvasRef = useRef(null);
  const [tileSize, setTileSize] = useState(16);

  const getCollisionMask = useCallback(() => {
    if (!instance) return [];
    return instance.getCollisionMask();
  }, [instance]);

  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !instance) return;
    const ctx = canvas.getContext('2d');
    const mask = getCollisionMask();
    const width = instance.width;
    const height = instance.height;
    const maxSize = 600;
    const newTileSize = Math.floor(Math.min(maxSize / width, maxSize / height, 32));
    setTileSize(newTileSize);
    canvas.width = width * newTileSize;
    canvas.height = height * newTileSize;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = mask[y]?.[x] ?? 2;
        const isStart = startTile && startTile.x === x && startTile.y === y;
        const isEnd = endTile && endTile.x === x && endTile.y === y;
        const isPath = path.some(p => p.x === x && p.y === y);
        const isHovered = hoveredTile && hoveredTile.x === x && hoveredTile.y === y;

        let color = '#2d3436';
        if (val === 2) color = '#636e72';
        else if (val === 1) color = '#e74c3c';
        else if (isPath) color = '#00b894';
        else if (isStart) color = '#fdcb6e';
        else if (isEnd) color = '#6c5ce7';
        else if (isHovered) color = '#4a4a6a';

        ctx.fillStyle = color;
        ctx.fillRect(x * newTileSize, y * newTileSize, newTileSize, newTileSize);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * newTileSize, y * newTileSize, newTileSize, newTileSize);

        if (collisionMode === 'edit' && val !== 2) {
          ctx.fillStyle = '#888';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${x},${y}`, x * newTileSize + newTileSize/2, y * newTileSize + newTileSize/2);
        }

        if (val === 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚫', x * newTileSize + newTileSize/2, y * newTileSize + newTileSize/2);
        }
      }
    }

    const legendY = canvas.height - 20;
    ctx.fillStyle = 'rgba(15,15,26,0.8)';
    ctx.fillRect(5, canvas.height - 25, 240, 20);
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬜ Sol  🧱 Mur  🚫 Bloqué  🟡 Départ  🟣 Arrivée  🟢 Chemin', 10, canvas.height - 15);
  }, [instance, getCollisionMask, startTile, endTile, path, hoveredTile, collisionMode]);

  useEffect(() => {
    renderGrid();
  }, [renderGrid, startTile, endTile, path, hoveredTile, collisionMode]);

  const handleCanvasClick = useCallback((e) => {
    if (!instance) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / tileSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / tileSize);
    if (x < 0 || x >= instance.width || y < 0 || y >= instance.height) return;

    if (collisionMode === 'edit') {
      instance.toggleCollision(x, y);
      setSelectedTile({ x, y });
      renderGrid();
    } else if (collisionMode === 'path') {
      if (!startTile) {
        setStartTile({ x, y });
        setPath([]);
      } else if (!endTile) {
        setEndTile({ x, y });
        const foundPath = instance.findPath(startTile.x, startTile.y, x, y);
        setPath(foundPath || []);
        if (foundPath) {
          onStatus?.('✅ Chemin trouvé !', 'success');
        } else {
          onStatus?.('❌ Aucun chemin trouvé', 'error');
        }
      } else {
        setStartTile(null);
        setEndTile(null);
        setPath([]);
        onStatus?.('🔄 Sélectionnez un nouveau point de départ', 'info');
      }
    } else {
      const tile = instance.getTileAt('main', x, y);
      const isWalkable = instance.isWalkable(x, y);
      const isBlocked = instance.isBlocked(x, y);
      const isWall = instance.isWall(x, y);
      setSelectedTile({ x, y, tile, isWalkable, isBlocked, isWall });
      onStatus?.(`📌 Tuile (${x},${y}) : ${tile || 'vide'} - ${isWalkable ? '✅ Accessible' : '❌ Bloqué'}`, 'info');
    }
  }, [instance, collisionMode, startTile, endTile, tileSize, renderGrid, onStatus]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!instance) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / tileSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / tileSize);
    if (x >= 0 && x < instance.width && y >= 0 && y < instance.height) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }
  }, [instance, tileSize]);

  const handleCanvasMouseLeave = useCallback(() => setHoveredTile(null), []);

  const resetAll = useCallback(() => {
    setStartTile(null);
    setEndTile(null);
    setPath([]);
    setSelectedTile(null);
    if (onStatus) onStatus('🔄 Réinitialisé', 'info');
  }, [onStatus]);

  const clearCollisions = useCallback(() => {
    if (!instance) return;
    if (window.confirm('Voulez-vous supprimer toutes les collisions manuelles ?')) {
      const mask = instance.getCollisionMask();
      for (let y = 0; y < instance.height; y++) {
        for (let x = 0; x < instance.width; x++) {
          if (mask[y]?.[x] === 1) {
            instance.toggleCollision(x, y);
          }
        }
      }
      renderGrid();
      if (onStatus) onStatus('🗑️ Toutes les collisions ont été supprimées', 'info');
    }
  }, [instance, renderGrid, onStatus]);

  const exportCollisionData = useCallback(() => {
    if (!instance) return;
    const data = instance.exportCollisionData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'collision-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onStatus) onStatus('📄 Données de collision exportées', 'success');
  }, [instance, onStatus]);

  return (
    <div className="collision-manager-overlay" onClick={onClose}>
      <div className="collision-manager" onClick={(e) => e.stopPropagation()}>
        <div className="collision-manager-header">
          <h2>🧱 Gestion des Collisions</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="collision-manager-content">
          <div className="collision-toolbar">
            <div className="mode-selector">
              <button className={`btn btn-mode ${collisionMode === 'view' ? 'active' : ''}`} onClick={() => { setCollisionMode('view'); resetAll(); }}>👁️ Vue</button>
              <button className={`btn btn-mode ${collisionMode === 'edit' ? 'active' : ''}`} onClick={() => { setCollisionMode('edit'); resetAll(); }}>✏️ Éditer</button>
              <button className={`btn btn-mode ${collisionMode === 'path' ? 'active' : ''}`} onClick={() => { setCollisionMode('path'); resetAll(); }}>🗺️ Chemin</button>
            </div>
            <div className="collision-actions">
              <button className="btn btn-clear" onClick={clearCollisions}>🗑️ Effacer</button>
              <button className="btn btn-export" onClick={exportCollisionData}>📥 Exporter</button>
            </div>
          </div>
          <div className="collision-info">
            {collisionMode === 'view' && <p>👁️ Cliquez sur une tuile pour voir ses informations</p>}
            {collisionMode === 'edit' && <p>✏️ Cliquez sur une tuile pour basculer son état de collision (accessible ↔ bloqué)</p>}
            {collisionMode === 'path' && <p>🗺️ Cliquez sur une tuile de départ, puis sur une tuile d'arrivée</p>}
          </div>
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                cursor: collisionMode === 'view' ? 'pointer' : 'crosshair',
                border: '1px solid #2a2a4a',
                borderRadius: '8px',
                background: '#0f0f1a'
              }}
            />
          </div>
          {selectedTile && collisionMode === 'view' && (
            <div className="tile-info">
              <h4>📌 Informations de la tuile</h4>
              <div className="info-grid">
                <div><span>Position :</span> ({selectedTile.x}, {selectedTile.y})</div>
                <div><span>Type :</span> {selectedTile.tile || 'vide'}</div>
                <div><span>Accessible :</span> {selectedTile.isWalkable ? '✅ Oui' : '❌ Non'}</div>
                <div><span>Mur :</span> {selectedTile.isWall ? '🧱 Oui' : '❌ Non'}</div>
                <div><span>Bloqué :</span> {selectedTile.isBlocked ? '🚫 Oui' : '❌ Non'}</div>
              </div>
            </div>
          )}
          {collisionMode === 'path' && startTile && (
            <div className="path-info">
              <div>📍 Départ : ({startTile.x}, {startTile.y})</div>
              {endTile && <div>📍 Arrivée : ({endTile.x}, {endTile.y})</div>}
              {path.length > 0 && <div>🟢 Longueur du chemin : {path.length} étapes</div>}
              {endTile && path.length === 0 && <div>❌ Aucun chemin trouvé</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollisionManager;
