// src/pages/Auth.js
import { useState } from 'react';
import supabase from '../services/supabaseClient'; // Adjusted import path

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // This sends a "Magic Link" to your email to log in
    const { error } = await supabase.auth.signInWithOtp({ email });
    
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card p-4 shadow-sm">
        <h3 className="text-center mb-4">Life Calendar Login</h3>
        <p className="text-muted text-center">Sign in via Magic Link</p>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span>Loading...</span> : <span>Send Magic Link</span>}
          </button>
        </form>
      </div>
    </div>
  );
}