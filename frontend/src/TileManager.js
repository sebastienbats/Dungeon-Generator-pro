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
