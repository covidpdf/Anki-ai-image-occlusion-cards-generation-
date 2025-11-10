import { useEffect, useState } from 'react';
import { getCacheStats, clearAllData, exportDataAsJSON, importDataFromJSON } from '../services/db';
import '../styles/CacheSettings.css';

interface CacheStats {
  deckCount: number;
  ocrResultCount: number;
  occlusionMetadataCount: number;
  pendingExportsCount: number;
  totalSize: number;
}

export function CacheSettings(): JSX.Element {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async (): Promise<void> => {
    try {
      const data = await getCacheStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setMessage({ type: 'error', text: 'Failed to load cache statistics' });
    }
  };

  const handleClearCache = async (): Promise<void> => {
    if (
      !window.confirm(
        'Are you sure you want to clear all cached data? This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await clearAllData();
      setStats(null);
      setMessage({ type: 'success', text: 'Cache cleared successfully' });
      await refreshStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setMessage({ type: 'error', text: 'Failed to clear cache' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (): Promise<void> => {
    setLoading(true);
    try {
      const jsonData = await exportDataAsJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `anki-occlusion-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (error) {
      console.error('Failed to export data:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      await importDataFromJSON(text);
      setMessage({ type: 'success', text: 'Data imported successfully' });
      await refreshStats();
    } catch (error) {
      console.error('Failed to import data:', error);
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="cache-settings">
      <h2>Cache Management</h2>

      {message && <div className={`message message-${message.type}`}>{message.text}</div>}

      {stats && (
        <div className="cache-stats">
          <h3>Storage Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Decks</span>
              <span className="stat-value">{stats.deckCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">OCR Results</span>
              <span className="stat-value">{stats.ocrResultCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Occlusion Data</span>
              <span className="stat-value">{stats.occlusionMetadataCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Exports</span>
              <span className="stat-value">{stats.pendingExportsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Size</span>
              <span className="stat-value">{formatBytes(stats.totalSize)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="cache-actions">
        <button onClick={refreshStats} disabled={loading} className="btn btn-secondary">
          Refresh Stats
        </button>
        <button onClick={handleExportData} disabled={loading} className="btn btn-primary">
          Export Data
        </button>
        <label className="btn btn-primary">
          Import Data
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>
        <button onClick={handleClearCache} disabled={loading} className="btn btn-danger">
          Clear All Cache
        </button>
      </div>
    </div>
  );
}
