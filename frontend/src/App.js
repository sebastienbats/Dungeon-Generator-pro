import React, { useRef, useState, useCallback, useEffect } from 'react';
import DungeonControls from './DungeonControls';
import DungeonViewer from './DungeonViewer';
import TileManager from './TileManager';
import Legend from './Legend';
import LayerManager from './LayerManager';
import GraphGrammarEditor from './GraphGrammarEditor';
import CollisionManager from './CollisionManager';

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
  const [showCollisionManager, setShowCollisionManager] = useState(false);
  const [layers, setLayers] = useState({});
  const isMountedRef = useRef(true);
  const generatorRef = useRef(null);
  const viewerRef = useRef(null);

  const setStatusMessage = useCallback((message, type = 'info') => {
    if (isMountedRef.current) {
      setStatus({ message, type });
    }
  }, []);

  const refreshLayers = useCallback(() => {
    const instance = generatorRef.current || window.__dungeonInstance;
    if (instance && instance.layers) {
      setLayers(instance.layers);
    }
  }, []);

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

  const handleOpenCollisionManager = useCallback(() => {
    setShowCollisionManager(true);
  }, []);

  const handleCloseCollisionManager = useCallback(() => {
    setShowCollisionManager(false);
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
          onOpenCollisionManager={handleOpenCollisionManager}
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

        {showCollisionManager && (
          <CollisionManager
            instance={generatorRef.current || window.__dungeonInstance}
            onClose={handleCloseCollisionManager}
            onStatus={setStatusMessage}
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
