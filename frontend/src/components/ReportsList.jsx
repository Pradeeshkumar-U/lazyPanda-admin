import React, { useState } from 'react';
import { AlertOctagon, Edit3, Trash2, Copy, Check, Radio as RadioIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ReportsList({
  reports,
  station,
  loading,
  onRefresh,
  onEditChannel,
  onDeleteChannel,
  onResolveReport,
}) {
  const [copiedUuid, setCopiedUuid] = useState(null);

  const handleCopyLink = (channel) => {
    if (!channel.streaming_link) return;
    navigator.clipboard.writeText(channel.streaming_link);
    setCopiedUuid(channel.uuid);
    setTimeout(() => setCopiedUuid(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertOctagon size={24} color="var(--color-danger)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Reported Channels & Issues
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Showing broken stream reports for <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{station} FM</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-secondary btn-icon"
            title="Refresh Reports"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Reports Grid */}
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
          Loading reports for {station} FM...
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--color-success-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={32} color="var(--color-success)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Broken Channels Reported!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            All channels in <strong>{station.toUpperCase()} FM</strong> are operating smoothly without user complaints.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px'
        }}>
          {reports.map((item) => {
            return (
              <div
                key={item.uuid}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top: Report Counter Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <AlertOctagon size={13} />
                      Reported {item.report_count} {item.report_count === 1 ? 'time' : 'times'}
                    </span>

                    {item.reported_at && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(item.reported_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
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
                      {item.image_m || item.image_xs ? (
                        <img
                          src={item.image_m || item.image_xs}
                          alt={item.channel_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <RadioIcon size={24} color="var(--accent-primary)" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px'
                      }}>
                        {item.channel_name}
                      </div>
                      <span className="badge badge-indigo">
                        {item.category || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Stream URL */}
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
                    {item.streaming_link || 'No stream link available'}
                  </div>
                </div>

                {/* Footer Actions: Dismiss, Edit, Delete */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  {/* Dismiss / Resolve Report Button */}
                  <button
                    onClick={() => onResolveReport(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--color-success)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                    title="Dismiss report if stream is working"
                  >
                    <CheckCircle2 size={14} />
                    Resolve / Dismiss
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Copy Link */}
                    {item.streaming_link && (
                      <button
                        onClick={() => handleCopyLink(item)}
                        className="btn-icon btn-secondary"
                        style={{ width: '32px', height: '32px' }}
                        title="Copy streaming URL"
                      >
                        {copiedUuid === item.uuid ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                      </button>
                    )}

                    {/* Edit Channel */}
                    <button
                      onClick={() => onEditChannel(item)}
                      className="btn-icon btn-secondary"
                      style={{ width: '32px', height: '32px' }}
                      title="Edit Channel to update stream URL or logo"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Delete Channel */}
                    <button
                      onClick={() => onDeleteChannel(item)}
                      className="btn-icon btn-danger"
                      style={{ width: '32px', height: '32px' }}
                      title="Delete Channel from station"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
