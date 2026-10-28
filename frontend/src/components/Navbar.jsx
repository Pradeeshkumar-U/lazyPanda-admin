import React from 'react';
import { Layers, AlertOctagon, GitBranch, Users, LogOut } from 'lucide-react';

const STATIONS = [
  { id: 'tamil', name: 'Tamil FM', tag: 'tamil' },
  { id: 'hindi', name: 'Hindi FM', tag: 'hindi' },
  { id: 'malayalam', name: 'Mallu FM', tag: 'malayalam' },
];

export default function Navbar({
  activeStation,
  onSelectStation,
  activeTab,
  onSelectTab,
  reportCount = 0,
  user,
  onLogout,
}) {
  const showStationSelector = activeTab === 'channels' || activeTab === 'reports';

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 16,
      zIndex: 100,
      margin: '0 auto 24px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Brand & Station Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              lazy<span className="gradient-text">Panda</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              FM CENTRAL ADMIN
            </div>
          </div>
        </div>

        {/* Station Selectors - Only available in channels and reports tabs */}
        {showStationSelector && (
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            gap: '4px'
          }}>
            {STATIONS.map((station) => {
              const isSelected = activeStation === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => onSelectStation(station.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    background: isSelected ? 'var(--accent-primary)' : 'transparent',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
                  }}
                >
                  <span>{station.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onSelectTab('channels')}
          className={`btn ${activeTab === 'channels' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <Layers size={16} />
          Channels
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', position: 'relative' }}
        >
          <AlertOctagon size={16} color={reportCount > 0 ? 'var(--color-danger)' : 'currentColor'} />
          Reports
          {reportCount > 0 && (
            <span style={{
              background: 'var(--color-danger)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '999px',
              marginLeft: '4px'
            }}>
              {reportCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('version')}
          className={`btn ${activeTab === 'version' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <GitBranch size={16} />
          App Versions
        </button>

        <button
          onClick={() => onSelectTab('admins')}
          className={`btn ${activeTab === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          <Users size={16} />
          Admins Access
        </button>
      </div>

      {/* User Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'Admin'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {(user?.email?.[0] || 'A').toUpperCase()}
            </div>
          )}
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              {user?.name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign Out"
          className="btn btn-secondary btn-icon"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
