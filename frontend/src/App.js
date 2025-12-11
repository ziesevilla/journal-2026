import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './services/supabaseClient';

// Import Pages
import Auth from './pages/Auth';
import CalendarView from './pages/CalendarViews';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an existing session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Set up a listener for auth changes (Sign In, Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Show a simple loading spinner while checking auth status
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ROUTE: Home (/) 
           - If user is NOT logged in: Show Auth (Login) page
           - If user IS logged in: Redirect to /dashboard
        */}
        <Route 
          path="/" 
          element={!session ? <Auth /> : <Navigate to="/dashboard" />} 
        />

        {/* ROUTE: Dashboard (/dashboard)
           - If user IS logged in: Show CalendarView
           - If user is NOT logged in: Redirect back to /
        */}
        <Route 
          path="/dashboard" 
          element={session ? <CalendarView session={session} /> : <Navigate to="/" />} 
        />

        {/* Catch-all: Redirect unknown URLs to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;