// src/pages/Auth.js
import React, { useState } from 'react';
import supabase from '../services/supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [linkSent, setLinkSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin, 
        },
      });

      if (error) throw error;
      
      setLinkSent(true);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4 animate-fade-in" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: '#333' }}>Journal 2026</h3>
          <p className="text-muted">Sign in to track your life</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger text-center py-2 mb-3" role="alert" style={{ fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Success State */}
        {linkSent ? (
          <div className="text-center animate-fade-in">
            <div className="mb-3 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5>Check your email!</h5>
            <p className="text-muted small">
              We've sent a magic link to <strong>{email}</strong>. 
              <br />Click the link to sign in.
            </p>
            <button 
              className="btn btn-link btn-sm text-decoration-none text-secondary" 
              onClick={() => setLinkSent(false)}
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Login Form */
          <>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label small text-uppercase fw-bold text-secondary" style={{ fontSize: '0.75rem' }}>Email Address</label>
                <input
                  id="email"
                  className="form-control form-control-lg bg-light border-0"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ fontSize: '1rem' }}
                />
              </div>
              <button className="btn btn-dark w-100 btn-lg mb-3 fw-bold" disabled={loading} style={{ fontSize: '1rem' }}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">OR</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Social Login */}
            <button 
                onClick={handleGoogleLogin}
                className="btn btn-outline-secondary w-100 fw-bold"
                style={{ fontSize: '0.9rem' }}
            >
              <i className="bi bi-google me-2"></i> Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}