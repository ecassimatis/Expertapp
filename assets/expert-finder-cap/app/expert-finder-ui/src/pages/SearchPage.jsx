import React, { useState } from 'react';
import {
  BusyIndicator, MessageStrip, IllustratedMessage, Toast
} from '@ui5/webcomponents-react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ExpertCard from '../components/ExpertCard';
import { searchExperts, saveToShortlist } from '../services/api';

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeDomain, setActiveDomain] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [shortlistName, setShortlistName] = useState('');

  const handleSearch = async (query, domain, region) => {
    setLoading(true);
    setError('');
    setSearched(true);
    setActiveDomain(domain);
    setActiveRegion(region);
    try {
      const experts = await searchExperts(query, domain, region);
      setResults(experts);
    } catch (err) {
      setError(err.message || 'Expert search is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToShortlist = async (expert) => {
    const name = shortlistName || prompt('Enter a name for this review shortlist:', 'Partner Review 2025');
    if (!name) return;
    setShortlistName(name);
    try {
      await saveToShortlist(name, expert);
      setToastMessage(`${expert.name} saved to "${name}"`);
      setShowToast(true);
    } catch (err) {
      setError('Failed to save to shortlist. Please try again.');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Find SAP Internal Experts</h2>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <FilterPanel
        domain={activeDomain}
        region={activeRegion}
        onClearDomain={() => setActiveDomain('')}
        onClearRegion={() => setActiveRegion('')}
      />

      <div style={{ marginTop: '1rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <BusyIndicator active size="Large" text="Searching for experts..." />
          </div>
        )}

        {!loading && error && (
          <MessageStrip design="Negative" hideCloseButton>
            {error}
          </MessageStrip>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <IllustratedMessage
            name="NoData"
            titleText="No experts found"
            subtitleText="Try a broader query or different domain."
          />
        )}

        {!loading && results.map((expert) => (
          <ExpertCard
            key={expert.employeeId}
            expert={expert}
            onSaveToShortlist={handleSaveToShortlist}
          />
        ))}
      </div>

      <Toast
        open={showToast}
        onAfterHide={() => setShowToast(false)}
        duration={3000}
      >
        {toastMessage}
      </Toast>
    </div>
  );
}
