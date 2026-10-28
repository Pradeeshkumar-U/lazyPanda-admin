import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { api } from '../services/api';

export default function AdminsModal() {
  const [adminsData, setAdminsData] = useState({ databaseAdmins: [], envAdmins: [] });
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdmins();
      setAdminsData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please provide a valid Gmail address');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.addAdmin(newEmail, newName);
      setSuccess(`Admin ${newEmail} successfully authorized.`);
      setNewEmail('');
      setNewName('');
      await fetchAdmins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to authorize admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${email}?`)) {
      return;
    }

    try {
      await api.removeAdmin(email);
      await fetchAdmins();
    } catch (err) {
      alert('Failed to remove admin: ' + err.message);
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
              <Users size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.4rem' }}>Authorized Admin Accounts</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Only Google accounts matching these registered Gmail addresses are allowed to log in.
            </p>
          </div>

          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="btn btn-secondary btn-icon"
            title="Refresh Admin List"
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
          }}>
            {success}
          </div>
        )}

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} style={{
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '28px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} color="var(--accent-primary)" />
            Authorize New Gmail Admin
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label>Gmail Address *</label>
              <input
                type="email"
                placeholder="developer@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Admin Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '10px 18px', height: '42px' }}
            >
              <UserPlus size={16} />
              {submitting ? 'Adding...' : 'Grant Access'}
            </button>
          </div>
        </form>

        {/* List of Admins */}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Active Whitelist
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Database Admins */}
            {adminsData.databaseAdmins.map((adm) => (
              <div
                key={adm.id || adm.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={16} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{adm.email}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {adm.name ? `${adm.name} • ` : ''}Stored
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveAdmin(adm.email)}
                  className="btn-icon btn-danger"
                  title="Revoke Access"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Environment Variable Fallback Admins */}
            {adminsData.envAdmins.map((email) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShieldCheck size={18} color="var(--color-success)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{email}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-success)' }}>
                      Root Admin
                    </div>
                  </div>
                </div>

                <span className="badge badge-success">Protected</span>
              </div>
            ))}

            {adminsData.databaseAdmins.length === 0 && adminsData.envAdmins.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No registered admins found. Please configure.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
