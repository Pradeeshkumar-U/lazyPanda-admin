import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Image as ImageIcon, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ChannelModal({
  isOpen,
  onClose,
  channel,
  station,
  categories,
  onSaveSuccess,
}) {
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageXs, setImageXs] = useState('');
  const [imageM, setImageM] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (channel) {
      setName(channel.channel_name || '');
      setStreamUrl(channel.streaming_link || '');
      setCategory(channel.category || '');
      setImageXs(channel.image_xs || '');
      setImageM(channel.image_m || '');
      setIsCustomCategory(false);
    } else {
      setName('');
      setStreamUrl('');
      setCategory(categories[0] || 'Top');
      setCustomCategory('');
      setIsCustomCategory(false);
      setImageXs('');
      setImageM('');
    }
    setFormError(null);
    setUploadError(null);
  }, [channel, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const res = await api.uploadImage(file, station);
      setImageXs(res.image_xs);
      setImageM(res.image_m);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Image upload to Cloudflare failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    if (!name.trim()) {
      setFormError('Channel name is required.');
      return;
    }
    if (!streamUrl.trim()) {
      setFormError('Streaming URL is required.');
      return;
    }
    if (!finalCategory) {
      setFormError('Category is required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        channel_name: name.trim(),
        streaming_link: streamUrl.trim(),
        category: finalCategory,
        image_xs: imageXs,
        image_m: imageM,
      };

      if (channel && channel.uuid) {
        await api.updateChannel(station, channel.uuid, payload);
      } else {
        await api.addChannel(station, payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save channel in Supabase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>
              {channel ? 'Edit FM Channel' : 'Add New FM Channel'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Managing station: <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{station} FM</strong>
            </p>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary">
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Channel Name */}
          <div style={{ marginBottom: '18px' }}>
            <label>Channel Name *</label>
            <input
              type="text"
              placeholder="e.g. Radio Mirchi 98.3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Streaming URL */}
          <div style={{ marginBottom: '18px' }}>
            <label>Streaming Link (URL) *</label>
            <input
              type="url"
              placeholder="https://stream.zeno.fm/..."
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Category *</label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '6px'
                }}
              >
                {isCustomCategory ? 'Choose from list' : '+ Add custom category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                placeholder="Enter new category (e.g. Retro, News, Classic)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!categories.includes(category) && category && (
                  <option value={category}>{category}</option>
                )}
              </select>
            )}
          </div>

          {/* Cloudflare Image Upload */}
          <div style={{ marginBottom: '22px' }}>
            <label>Channel Logo (Processed & Hosted via Cloudflare)</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {uploading ? (
                    <RefreshCw size={20} className="spin" color="var(--accent-primary)" />
                  ) : (
                    <UploadCloud size={20} color="var(--accent-primary)" />
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {uploading ? 'Processing with Sharp & Uploading to Cloudflare...' : 'Click or drop logo image here'}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Generates 50x50 (xs) and 200x200 (m) Cloudflare images automatically
                </div>
              </div>
            </div>

            {uploadError && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '6px' }}>
                {uploadError}
              </div>
            )}

            {/* Image Previews */}
            {(imageXs || imageM) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '12px',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={imageM || imageXs}
                    alt="200px preview"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Medium (200px)
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <img
                    src={imageXs || imageM}
                    alt="50px preview"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Thumb (50px)
                  </div>
                </div>

                <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} />
                  Ready to link
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn btn-primary"
            >
              {submitting ? 'Saving...' : channel ? 'Update Channel' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
