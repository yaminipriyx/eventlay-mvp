import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, PlusCircle, Ticket, LogOut, LogIn, Sparkles } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, setSelectedEventId }) => {
  const { user, role, logout } = useAuth();

  const handleNavClick = (view, eventId = null) => {
    if (setSelectedEventId) setSelectedEventId(eventId);
    setCurrentView(view);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => handleNavClick(role === 'organizer' ? 'my-events' : 'browse-events')} style={{ cursor: 'pointer' }}>
        <div className="logo-badge">
          <Sparkles size={22} />
        </div>
        <span>EventLay</span>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            {role === 'organizer' ? (
              <>
                <button
                  className={`nav-link ${currentView === 'my-events' ? 'active' : ''}`}
                  onClick={() => handleNavClick('my-events')}
                >
                  <Calendar size={18} />
                  My Events
                </button>
                <button
                  className={`btn btn-secondary ${currentView === 'create-event' ? 'active' : ''}`}
                  onClick={() => handleNavClick('create-event')}
                >
                  <PlusCircle size={18} />
                  Create Event
                </button>
              </>
            ) : (
              <>
                <button
                  className={`nav-link ${currentView === 'browse-events' ? 'active' : ''}`}
                  onClick={() => handleNavClick('browse-events')}
                >
                  <Calendar size={18} />
                  Browse Events
                </button>
                <button
                  className={`nav-link ${currentView === 'my-registrations' ? 'active' : ''}`}
                  onClick={() => handleNavClick('my-registrations')}
                >
                  <Ticket size={18} />
                  My Registrations
                </button>
              </>
            )}

            <div className="user-pill">
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span className={`role-tag ${user.role}`}>{user.role}</span>
              <button
                className="btn btn-outline"
                style={{ padding: '4px 8px', marginLeft: '6px' }}
                onClick={() => {
                  logout();
                  setCurrentView('auth');
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              className={`nav-link ${currentView === 'browse-events' ? 'active' : ''}`}
              onClick={() => handleNavClick('browse-events')}
            >
              <Calendar size={18} />
              Browse Events
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleNavClick('auth')}
            >
              <LogIn size={18} />
              Login / Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
