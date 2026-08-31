import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Download, Calendar, MapPin, Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const QRTicketPage = ({ registrationData, onNavigate }) => {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  if (!registrationData) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px' }}>
        <p className="page-subtitle">No ticket data selected.</p>
        <button className="btn btn-outline" onClick={() => onNavigate('my-registrations')} style={{ marginTop: '16px' }}>
          Back to My Registrations
        </button>
      </div>
    );
  }

  // Handle both registration creation payload structure & list retrieval structure
  const registration = registrationData.registration || registrationData;
  const event = registrationData.event || registration.eventId || {};
  const qrToken = registration.qrCode;
  const qrDataUrl = registrationData.qrDataUrl || registration.qrDataUrl;

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `EventLay_Ticket_${event.title || 'Pass'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: draw from hidden canvas if available
      const canvas = document.getElementById('ticket-qr-canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `EventLay_Ticket_${event.title || 'Pass'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '580px' }}>
      <button
        className="btn btn-outline"
        onClick={() => onNavigate('my-registrations')}
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={18} />
        Back to Registrations
      </button>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '2px solid var(--amber-dark)' }}>
        {/* Ticket Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--burgundy-main) 0%, var(--burgundy-light) 100%)', padding: '28px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-burgundy)', position: 'relative' }}>
          <div className="logo-badge" style={{ position: 'absolute', top: '20px', left: '20px', width: '36px', height: '36px' }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--amber-light)' }}>
            Official Event Ticket
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {event.title || 'Event Pass'}
          </h2>
        </div>

        {/* QR Code Container */}
        <div style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(13,2,4,0.9)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-light)', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
            <CheckCircle2 size={16} /> Verified RSVP Ticket
          </div>

          <div className="qr-container">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Ticket" className="qr-image" />
            ) : (
              <QRCodeSVG value={qrToken} size={220} fgColor="#4A0E17" bgColor="#FFFFFF" />
            )}
            {/* Hidden canvas for canvas download fallback */}
            <div style={{ display: 'none' }}>
              <QRCodeCanvas id="ticket-qr-canvas" value={qrToken} size={400} fgColor="#4A0E17" bgColor="#FFFFFF" />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Ticket Token ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--amber-light)', fontWeight: 700, marginTop: '4px' }}>
              {qrToken}
            </div>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div style={{ padding: '24px', background: 'var(--bg-card)', borderTop: '1px dashed var(--border-burgundy)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendee</div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{user?.name || 'Participant'}</strong>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Date</div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{new Date(registration.registeredAt || Date.now()).toLocaleDateString()}</strong>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Venue</div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{event.venue || 'TBA'}</strong>
            </div>
          </div>

          <div style={{ marginTop: '28px' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              onClick={handleDownload}
            >
              <Download size={18} />
              Download Ticket PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
