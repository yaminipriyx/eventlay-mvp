import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export const BrowseEventsPage = ({ onNavigate }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async (query = '') => {
    try {
      setLoading(true);
      const data = await api.getPublishedEvents(query);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(search);
  }, [search]);

  return (
    <div className="app-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discover Upcoming Events</h1>
          <p className="page-subtitle">Explore upcoming conferences, workshops, and meetups hosted on EventLay</p>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Discovering events...
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Sparkles size={48} style={{ color: 'var(--amber-main)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No events found</h3>
          <p className="page-subtitle">
            {search ? `No published events match "${search}".` : 'There are currently no published events listed.'}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {events.map((evt) => (
            <div key={evt._id} className="glass-card event-card">
              <div>
                {evt.bannerUrl ? (
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="event-banner"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="event-banner"
                    style={{
                      background: 'linear-gradient(135deg, var(--burgundy-deep) 0%, var(--burgundy-light) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--amber-light)',
                      fontWeight: 700,
                    }}
                  >
                    EventLay Exclusive
                  </div>
                )}

                <div className="event-card-header">
                  <h3 className="event-title">{evt.title}</h3>
                </div>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {evt.description}
                </p>

                <div className="event-meta">
                  <div className="meta-item">
                    <MapPin size={16} className="meta-icon" />
                    <span>{evt.venue}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} className="meta-icon" />
                    <span>{new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="event-actions" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Organized by {evt.organizerId?.name || 'Organizer'}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => onNavigate('event-details', evt._id)}
                >
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
