import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusCircle, Calendar, MapPin, Users, Edit3, Trash2, Globe, Eye, AlertCircle } from 'lucide-react';

export const MyEventsPage = ({ onNavigate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getMyEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch your events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleTogglePublish = async (event) => {
    try {
      const newStatus = event.status === 'published' ? 'draft' : 'published';
      await api.updateEvent(event._id, { status: newStatus });
      fetchMyEvents();
    } catch (err) {
      alert(err.message || 'Failed to update event status.');
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteEvent(eventId);
      fetchMyEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Managed Events</h1>
          <p className="page-subtitle">Create, publish, and manage your hosted events and track attendee registrations</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => onNavigate('create-event')}
        >
          <PlusCircle size={18} />
          Create New Event
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your events...
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Calendar size={48} style={{ color: 'var(--amber-main)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No events created yet</h3>
          <p className="page-subtitle" style={{ marginBottom: '24px' }}>
            Get started by creating your first event for participants to discover.
          </p>
          <button className="btn btn-secondary" onClick={() => onNavigate('create-event')}>
            <PlusCircle size={18} />
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {events.map((evt) => (
            <div key={evt._id} className="glass-card event-card">
              {evt.bannerUrl && (
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="event-banner"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              <div>
                <div className="event-card-header">
                  <h3 className="event-title">{evt.title}</h3>
                  <span className={`status-badge ${evt.status}`}>
                    {evt.status}
                  </span>
                </div>

                <div className="event-meta">
                  <div className="meta-item">
                    <MapPin size={16} className="meta-icon" />
                    <span>{evt.venue}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} className="meta-icon" />
                    <span>{new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} className="meta-icon" />
                    <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>
                      {evt.registrationCount || 0} Registered Participant{(evt.registrationCount !== 1) ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="event-actions">
                <button
                  className={`btn ${evt.status === 'published' ? 'btn-outline' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => handleTogglePublish(evt)}
                >
                  <Globe size={14} />
                  {evt.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => onNavigate('edit-event', evt._id)}
                >
                  <Edit3 size={14} />
                  Edit
                </button>

                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => onNavigate('event-participants', evt._id)}
                >
                  <Eye size={14} />
                  Participants ({evt.registrationCount || 0})
                </button>

                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', marginLeft: 'auto' }}
                  onClick={() => handleDelete(evt._id, evt.title)}
                  title="Delete Event"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
