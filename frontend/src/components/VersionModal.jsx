import React, { useState, useEffect } from 'react';
import { GitBranch, Save, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function VersionModal() {
  const [versionData, setVersionData] = useState({
    tamil_app_version: '',
    tamil_data_version: '',
    hindi_app_version: '',
    hindi_data_version: '',
    malayalam_app_version: '',
    malayalam_data_version: '',
    battery_version: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVersion();
      setVersionData(data);
    } catch (err) {
      setError(err.message || 'Failed to load app versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleChange = (field, value) => {
    setVersionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateVersion(versionData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update versions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitBranch size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.4rem' }}>App & Data Versions</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Manage runtime versions consumed by the mobile FM applications
            </p>
          </div>

          <button
            onClick={fetchVersions}
            disabled={loading}
            className="btn btn-secondary btn-icon"
            title="Reload from Supabase"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Check size={18} />
            Versions updated successfully across all mobile apps!
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div className="spin" style={{
              width: '28px',
              height: '28px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              margin: '0 auto 12px'
            }} />
            Loading version registry...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Tamil FM Card */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Tamil FM App
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label>App Version</label>
                  <input
                    type="text"
                    value={versionData.tamil_app_version || ''}
                    onChange={(e) => handleChange('tamil_app_version', e.target.value)}
                    placeholder="3.0.18"
                    required
                  />
                </div>
                <div>
                  <label>Data Version</label>
                  <input
                    type="text"
                    value={versionData.tamil_data_version || ''}
                    onChange={(e) => handleChange('tamil_data_version', e.target.value)}
                    placeholder="1.0.3"
                    required
                  />
                </div>
              </div>

              {/* Hindi FM Card */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Hindi FM App
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label>App Version</label>
                  <input
                    type="text"
                    value={versionData.hindi_app_version || ''}
                    onChange={(e) => handleChange('hindi_app_version', e.target.value)}
                    placeholder="1.0.3"
                    required
                  />
                </div>
                <div>
                  <label>Data Version</label>
                  <input
                    type="text"
                    value={versionData.hindi_data_version || ''}
                    onChange={(e) => handleChange('hindi_data_version', e.target.value)}
                    placeholder="1.0.0"
                    required
                  />
                </div>
              </div>

              {/* Malayalam FM Card */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Malayalam FM App
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label>App Version</label>
                  <input
                    type="text"
                    value={versionData.malayalam_app_version || ''}
                    onChange={(e) => handleChange('malayalam_app_version', e.target.value)}
                    placeholder="1.0.3"
                    required
                  />
                </div>
                <div>
                  <label>Data Version</label>
                  <input
                    type="text"
                    value={versionData.malayalam_data_version || ''}
                    onChange={(e) => handleChange('malayalam_data_version', e.target.value)}
                    placeholder="1.0.1"
                    required
                  />
                </div>
              </div>

              {/* Battery / Global Optimization Version Card */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Battery
                </div>
                <div>
                  <label>Battery Version</label>
                  <input
                    type="text"
                    value={versionData.battery_version || ''}
                    onChange={(e) => handleChange('battery_version', e.target.value)}
                    placeholder="1.0.3"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '12px 28px' }}
              >
                <Save size={18} />
                {saving ? 'Updating Database...' : 'Save All Versions'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
