import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, UserCheck, Shield, ArrowRight } from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const data = await api.register({ name, email, password, role });
        login(data.token, data.user);
        if (onAuthSuccess) onAuthSuccess(data.user.role);
      } else {
        const data = await api.login({ email, password });
        login(data.token, data.user);
        if (onAuthSuccess) onAuthSuccess(data.user.role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '480px', marginTop: '40px' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="logo-badge" style={{ margin: '0 auto 16px', width: '56px', height: '56px' }}>
            <Sparkles size={30} />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="page-subtitle">
            {isRegister ? 'Join EventLay as an Organizer or Participant' : 'Sign in to access your events & tickets'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Select Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  className={`btn ${role === 'participant' ? 'btn-coral' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setRole('participant')}
                >
                  <UserCheck size={18} />
                  Participant
                </button>
                <button
                  type="button"
                  className={`btn ${role === 'organizer' ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setRole('organizer')}
                >
                  <Shield size={18} />
                  Organizer
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                {isRegister ? 'Sign Up' : 'Log In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          </span>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--amber-main)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
