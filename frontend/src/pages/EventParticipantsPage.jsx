import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Users, Calendar, MapPin, Download } from 'lucide-react';

export const EventParticipantsPage = ({ eventId, onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      api.getEventRegistrations(eventId)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch registered participants.');
        })
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  const handleExportCSV = () => {
    if (!data || !data.registrations || data.registrations.length === 0) return;

    const headers = ['Participant Name', 'Email', 'Registration Date', 'Ticket ID'];
    const rows = data.registrations.map(reg => [
      `"${reg.participantId?.name || 'N/A'}"`,
      `"${reg.participantId?.email || 'N/A'}"`,
      `"${new Date(reg.registeredAt).toLocaleString()}"`,
      `"${reg.qrCode}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `participants_${data.event?.title || 'event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading registered participants...
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      <button
        className="btn btn-outline"
        onClick={() => onNavigate('my-events')}
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to My Events
      </button>

      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">{data?.event?.title || 'Event Participants'}</h1>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: 'var(--amber-main)' }} />
                  {data?.event?.venue}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} style={{ color: 'var(--amber-main)' }} />
                  {data?.event?.date ? new Date(data.event.date).toLocaleDateString() : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-pill" style={{ fontSize: '0.95rem', padding: '8px 16px' }}>
                <Users size={18} style={{ color: 'var(--amber-main)' }} />
                <span>Total Registrations: <strong style={{ color: 'var(--amber-light)' }}>{data?.totalCount || 0}</strong></span>
              </div>

              {data?.registrations?.length > 0 && (
                <button className="btn btn-secondary" onClick={handleExportCSV} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Download size={16} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {!data?.registrations || data.registrations.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Users size={48} style={{ color: 'var(--amber-main)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No registrations yet</h3>
              <p className="page-subtitle">
                Participants will appear in this table once they register for your event.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Participant Name</th>
                      <th>Email Address</th>
                      <th>Registered Timestamp</th>
                      <th>QR Ticket Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.registrations.map((reg, idx) => (
                      <tr key={reg._id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {reg.participantId?.name || 'N/A'}
                        </td>
                        <td>{reg.participantId?.email || 'N/A'}</td>
                        <td>{new Date(reg.registeredAt).toLocaleString()}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--amber-light)' }}>
                          {reg.qrCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
