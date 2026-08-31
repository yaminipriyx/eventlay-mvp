import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export const CreateEditEventPage = ({ eventId, onNavigate }) => {
  const isEdit = Boolean(eventId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [status, setStatus] = useState('published'); // default to published or draft

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api.getEventById(eventId)
        .then((data) => {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setVenue(data.venue || '');
          // Format date for datetime-local input
          if (data.date) {
            const d = new Date(data.date);
            const isoStr = d.toISOString().slice(0, 16);
            setDate(isoStr);
          }
          setBannerUrl(data.bannerUrl || '');
          setStatus(data.status || 'published');
        })
        .catch((err) => {
          setError(err.message || 'Failed to load event details.');
        })
        .finally(() => setFetching(false));
    }
  }, [eventId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        venue,
        date,
        bannerUrl,
        status,
      };

      if (isEdit) {
        await api.updateEvent(eventId, payload);
      } else {
        await api.createEvent(payload);
      }

      onNavigate('my-events');
    } catch (err) {
      setError(err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading event details...
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '720px' }}>
      <button
        className="btn btn-outline"
        onClick={() => onNavigate('my-events')}
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to My Events
      </button>

      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="page-title">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="page-subtitle">Fill in the event details to list it on EventLay</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Global Tech Innovators Summit 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Venue / Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Grand Convention Hall & Virtual Stream"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date & Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Publish Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="published">Published (Visible to Participants)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Provide event details, agenda, key speakers, and instructions for attendees..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigate('my-events')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
