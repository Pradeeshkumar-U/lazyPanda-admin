import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Copy, Check, Radio as RadioIcon, RefreshCw, ExternalLink } from 'lucide-react';

export default function ChannelList({
  channels,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAddChannel,
  onEditChannel,
  onDeleteChannel,
  station,
  loading,
  onRefresh,
}) {
  const [copiedUuid, setCopiedUuid] = useState(null);

  const handleCopyLink = (channel) => {
    navigator.clipboard.writeText(channel.streaming_link);
    setCopiedUuid(channel.uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Action Bar */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder={`Search channels by name or category...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-secondary btn-icon"
            title="Refresh Channels"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>

          <button onClick={onAddChannel} className="btn btn-primary">
            <Plus size={18} />
            Add Channel
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div className="spin" style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          Loading {station} FM channels...
        </div>
      ) : channels.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <RadioIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Channels Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
            {searchQuery
              ? `No channels matching "${searchQuery}" in ${station} FM.`
              : `There are currently no channels in the ${station} FM database.`}
          </p>
          <button onClick={onAddChannel} className="btn btn-primary">
            <Plus size={16} />
            Create First Channel
          </button>
        </div>
      ) : (
        <>
          {/* Category Filter Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => onSelectCategory('ALL')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: activeCategory === 'ALL' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                color: activeCategory === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              All Stations ({channels.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                  color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {channels.map((ch) => {
              return (
                <div
                  key={ch.uuid || ch.channel_name}
                  className="glass-panel"
                  style={{
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition)'
                  }}
                >
                  {/* Header: Logo, Name, Category */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                      {/* Logo Image */}
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {ch.image_m || ch.image_xs ? (
                          <img
                            src={ch.image_m || ch.image_xs}
                            alt={ch.channel_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <RadioIcon size={24} color="var(--accent-primary)" />
                        )}
                      </div>

                      {/* Name & Category Badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '4px'
                        }}>
                          {ch.channel_name}
                        </div>
                        <span className="badge badge-indigo">
                          {ch.category || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Streaming URL preview */}
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      background: 'rgba(0,0,0,0.25)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '14px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {ch.streaming_link}
                    </div>
                  </div>

                  {/* Footer Controls: Copy Link, Edit, Delete */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(ch)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: copiedUuid === ch.uuid ? 'var(--color-success)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {copiedUuid === ch.uuid ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                      {copiedUuid === ch.uuid ? 'Copied URL!' : 'Copy Stream Link'}
                    </button>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onEditChannel(ch)}
                        className="btn-icon btn-secondary"
                        style={{ width: '32px', height: '32px' }}
                        title="Edit Channel"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => onDeleteChannel(ch)}
                        className="btn-icon btn-danger"
                        style={{ width: '32px', height: '32px' }}
                        title="Delete Channel"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>

      )
      }
    </div >
  );
}
