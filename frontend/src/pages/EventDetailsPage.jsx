import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ArrowLeft, Calendar, MapPin, User, Ticket, CheckCircle2 } from 'lucide-react';

export const EventDetailsPage = ({ eventId, onNavigate, onTicketGenerated }) => {
  const { user, role } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      api.getEventById(eventId)
        .then((data) => {
          setEvent(data);
          // If participant logged in, check if already registered
          if (user && role === 'participant') {
            api.getMyRegistrations()
              .then((regs) => {
                const found = regs.find(r => r.eventId?._id === eventId || r.eventId === eventId);
                if (found) {
                  setIsAlreadyRegistered(true);
                }
              })
              .catch(() => {});
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load event details.');
        })
        .finally(() => setLoading(false));
    }
  }, [eventId, user, role]);

  const handleRegister = async () => {
    if (!user) {
      onNavigate('auth');
      return;
    }

    if (role !== 'participant') {
      alert('Only Participant accounts can register for events. Please sign in as a Participant.');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      const res = await api.registerForEvent(eventId);
      // Pass registration result (including QR data) to ticket page
      if (onTicketGenerated) {
        onTicketGenerated(res);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading event details...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="app-container">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '840px' }}>
      <button
        className="btn btn-outline"
        onClick={() => onNavigate('browse-events')}
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to Events Catalog
      </button>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            style={{ width: '100%', height: '280px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '180px',
              background: 'linear-gradient(135deg, var(--burgundy-main) 0%, var(--burgundy-light) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber-light)',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            EventLay Hosted Event
          </div>
        )}

        <div style={{ padding: '36px' }}>
          <div className="event-card-header" style={{ marginBottom: '20px' }}>
            <h1 className="page-title" style={{ fontSize: '2rem' }}>{event.title}</h1>
            <span className={`status-badge ${event.status}`}>
              {event.status}
            </span>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px', background: 'rgba(13,2,4,0.6)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-burgundy)' }}>
            <div className="meta-item">
              <Calendar size={20} className="meta-icon" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date & Time</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(event.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="meta-item">
              <MapPin size={20} className="meta-icon" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Venue Location</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.venue}</div>
              </div>
            </div>

            <div className="meta-item">
              <User size={20} className="meta-icon" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Organizer</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.organizerId?.name || 'Event Host'}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--amber-light)', fontWeight: 700 }}>About This Event</h3>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7' }}>
              {event.description}
            </p>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ticket Price: </span>
              <strong style={{ color: 'var(--amber-light)', fontSize: '1.2rem', marginLeft: '6px' }}>Free RSVP</strong>
            </div>

            {isAlreadyRegistered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="alert alert-success" style={{ margin: 0, padding: '8px 14px' }}>
                  <CheckCircle2 size={18} />
                  Already Registered
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => onNavigate('my-registrations')}
                >
                  <Ticket size={18} />
                  View My Ticket
                </button>
              </div>
            ) : (
              <button
                className="btn btn-coral"
                style={{ padding: '14px 28px', fontSize: '1.05rem' }}
                onClick={handleRegister}
                disabled={registering}
              >
                <Ticket size={20} />
                {registering ? 'Securing Spot...' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
