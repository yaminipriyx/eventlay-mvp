import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user and token from localStorage
    const savedToken = localStorage.getItem('eventlay_token');
    const savedUser = localStorage.getItem('eventlay_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user credentials:', err);
        localStorage.removeItem('eventlay_token');
        localStorage.removeItem('eventlay_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('eventlay_token', newToken);
    localStorage.setItem('eventlay_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eventlay_token');
    localStorage.removeItem('eventlay_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
