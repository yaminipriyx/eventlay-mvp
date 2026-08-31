import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { CreateEditEventPage } from './pages/CreateEditEventPage';
import { EventParticipantsPage } from './pages/EventParticipantsPage';
import { BrowseEventsPage } from './pages/BrowseEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { QRTicketPage } from './pages/QRTicketPage';

const MainContent = () => {
  const { user, role, loading } = useAuth();
  const [currentView, setCurrentView] = useState('browse-events');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Default initial view based on auth status & role
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (role === 'organizer' && currentView === 'auth') {
          setCurrentView('my-events');
        } else if (role === 'participant' && currentView === 'auth') {
          setCurrentView('browse-events');
        }
      }
    }
  }, [user, role, loading]);

  const handleNavigate = (view, eventId = null) => {
    if (eventId) setSelectedEventId(eventId);
    setCurrentView(view);
  };

  const handleAuthSuccess = (userRole) => {
    if (userRole === 'organizer') {
      setCurrentView('my-events');
    } else {
      setCurrentView('browse-events');
    }
  };

  const handleTicketGenerated = (resultPayload) => {
    setSelectedRegistration(resultPayload);
    setCurrentView('qr-ticket');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', color: 'var(--amber-light)', fontWeight: 600 }}>
        Initializing EventLay...
      </div>
    );
  }

  return (
    <>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedEventId={setSelectedEventId}
      />

      <main>
        {currentView === 'auth' && (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}

        {currentView === 'my-events' && (
          role === 'organizer' ? (
            <MyEventsPage onNavigate={handleNavigate} />
          ) : (
            <BrowseEventsPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'create-event' && (
          role === 'organizer' ? (
            <CreateEditEventPage eventId={null} onNavigate={handleNavigate} />
          ) : (
            <BrowseEventsPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'edit-event' && (
          role === 'organizer' ? (
            <CreateEditEventPage eventId={selectedEventId} onNavigate={handleNavigate} />
          ) : (
            <BrowseEventsPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'event-participants' && (
          role === 'organizer' ? (
            <EventParticipantsPage eventId={selectedEventId} onNavigate={handleNavigate} />
          ) : (
            <BrowseEventsPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'browse-events' && (
          <BrowseEventsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'event-details' && (
          <EventDetailsPage
            eventId={selectedEventId}
            onNavigate={handleNavigate}
            onTicketGenerated={handleTicketGenerated}
          />
        )}

        {currentView === 'my-registrations' && (
          role === 'participant' ? (
            <MyRegistrationsPage
              onNavigate={handleNavigate}
              onSelectRegistration={(reg) => {
                setSelectedRegistration(reg);
                setCurrentView('qr-ticket');
              }}
            />
          ) : (
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          )
        )}

        {currentView === 'qr-ticket' && (
          <QRTicketPage
            registrationData={selectedRegistration}
            onNavigate={handleNavigate}
          />
        )}
      </main>
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
