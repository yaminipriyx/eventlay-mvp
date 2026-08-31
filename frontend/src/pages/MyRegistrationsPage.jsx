import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, Calendar, MapPin, QrCode, ArrowRight } from 'lucide-react';

export const MyRegistrationsPage = ({ onNavigate, onSelectRegistration }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getMyRegistrations()
      .then((data) => {
        setRegistrations(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load your registrations.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleViewTicket = (registration) => {
    if (onSelectRegistration) {
      onSelectRegistration(registration);
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Event Passes</h1>
          <p className="page-subtitle">View and download your digital QR tickets for registered events</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your event passes...
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Ticket size={48} style={{ color: 'var(--coral-main)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No registrations yet</h3>
          <p className="page-subtitle" style={{ marginBottom: '24px' }}>
            You haven't registered for any events yet. Browse our catalog to claim your pass!
          </p>
          <button className="btn btn-secondary" onClick={() => onNavigate('browse-events')}>
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {registrations.map((reg) => {
            const event = reg.eventId || {};
            return (
              <div key={reg._id} className="glass-card event-card">
                <div>
                  <div className="event-card-header">
                    <h3 className="event-title">{event.title || 'Event Title'}</h3>
                    <span className="status-badge published" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <QrCode size={12} /> Registered
                    </span>
                  </div>

                  <div className="event-meta">
                    <div className="meta-item">
                      <MapPin size={16} className="meta-icon" />
                      <span>{event.venue || 'TBA'}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} className="meta-icon" />
                      <span>{event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(13,2,4,0.5)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-burgundy)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ticket Token: </span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--amber-light)' }}>{reg.qrCode}</strong>
                  </div>
                </div>

                <div className="event-actions" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => handleViewTicket(reg)}
                  >
                    <QrCode size={16} />
                    View QR Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
