import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ShellBar, ShellBarItem } from '@ui5/webcomponents-react';
import SearchPage from './pages/SearchPage';
import ShortlistPage from './pages/ShortlistPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const navigate = useNavigate();

  return (
    <div>
      <ShellBar
        primaryTitle="SAP Expert Finder"
        secondaryTitle="Find qualified internal experts for partner reviews"
        onLogoClick={() => navigate('/')}
      >
        <ShellBarItem icon="list" text="My Shortlists" onClick={() => navigate('/shortlists')} />
        <ShellBarItem icon="settings" text="Admin" onClick={() => navigate('/admin')} />
      </ShellBar>

      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/shortlists" element={<ShortlistPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </div>
  );
}
