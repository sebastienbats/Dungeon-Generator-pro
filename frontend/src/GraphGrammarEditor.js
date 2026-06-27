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
          <div className="editor-params">
            <h3>⚙️ Paramètres de génération</h3>
            <div className="params-grid">
              <div className="param-group">
                <label htmlFor="gg-iterations">Itérations</label>
                <input id="gg-iterations" type="number" value={params.iterations} onChange={(e) => handleParamChange('iterations', parseInt(e.target.value) || 5)} min={1} max={50} />
              </div>
              <div className="param-group">
                <label htmlFor="gg-spacing">Espacement</label>
                <input id="gg-spacing" type="number" value={params.spacing} onChange={(e) => handleParamChange('spacing', parseInt(e.target.value) || 3)} min={2} max={8} />
              </div>
              <div className="param-group">
                <label htmlFor="gg-maxnodes">Max nœuds</label>
                <input id="gg-maxnodes" type="number" value={params.maxNodes} onChange={(e) => handleParamChange('maxNodes', parseInt(e.target.value) || 200)} min={10} max={500} />
              </div>
              <div className="param-group">
                <label htmlFor="gg-starttype">Type de départ</label>
                <select id="gg-starttype" value={params.startType} onChange={(e) => handleParamChange('startType', e.target.value)}>
                  <option value="sol">Sol</option>
                  <option value="salle">Salle</option>
                  <option value="couloir">Couloir</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rules-list">
            <div className="rules-header">
              <h3>📋 Règles ({localRules.length})</h3>
              <button className="btn btn-add-rule" onClick={() => setShowAddForm(!showAddForm)}>➕ Ajouter une règle</button>
            </div>

            {showAddForm && (
              <div className="rule-add-form">
                <input type="text" placeholder="Nom de la règle" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} />
                <input type="text" placeholder="Description" value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} />
                <textarea placeholder="Code de la règle (fonction avec ctx)" value={newRule.code} onChange={(e) => setNewRule({ ...newRule, code: e.target.value })} rows={4} />
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
                      <button className="btn btn-small btn-edit" onClick={() => setEditingIndex(editingIndex === index ? null : index)}>{editingIndex === index ? '✕' : '✏️'}</button>
                      <button className="btn btn-small btn-delete" onClick={() => handleDeleteRule(index)}>🗑️</button>
                    </div>
                  </div>
                  <p className="rule-desc">{rule.description}</p>
                  {editingIndex === index && (
                    <div className="rule-edit">
                      <textarea value={rule.code} onChange={(e) => handleRuleChange(index, 'code', e.target.value)} rows={6} />
                      <div className="edit-actions">
                        <button className="btn btn-small btn-primary" onClick={() => handleRuleChange(index, 'name', rule.name)}>💾 Sauvegarder</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="editor-actions">
            <button className="btn btn-generate" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? '⏳ Génération...' : '🎲 Générer avec Graph Grammar'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphGrammarEditor;
