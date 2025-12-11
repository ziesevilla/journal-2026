// src/pages/Auth.js
import { useState } from 'react';
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
          // This ensures the user is redirected back to your app after clicking the link
          emailRedirectTo: window.location.origin, 
        },
      });

      if (error) throw error;
      
      // If successful, switch the UI to the success state
      setLinkSent(true);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Function to handle Google Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="fw-bold">Journal 2026</h3>
          <p className="text-muted">Sign in to track your life</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-danger text-center" role="alert">
            {errorMsg}
          </div>
        )}

        {/* Success State (Link Sent) */}
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
              className="btn btn-link btn-sm text-decoration-none" 
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
                <label htmlFor="email" className="form-label small text-uppercase fw-bold text-secondary">Email Address</label>
                <input
                  id="email"
                  className="form-control form-control-lg"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary w-100 btn-lg mb-3" disabled={loading}>
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

            {/* Divider for Social Auth */}
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">OR</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Social Login Buttons */}
            <button 
                onClick={handleGoogleLogin}
                className="btn btn-outline-secondary w-100"
            >
              <i className="bi bi-google me-2"></i> Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}