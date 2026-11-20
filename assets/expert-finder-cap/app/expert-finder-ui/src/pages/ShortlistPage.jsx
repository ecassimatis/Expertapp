import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Button, BusyIndicator, MessageStrip } from '@ui5/webcomponents-react';
import ExpertCard from '../components/ExpertCard';
import { fetchShortlists, deleteShortlist } from '../services/api';

export default function ShortlistPage() {
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShortlists();
  }, []);

  const loadShortlists = async () => {
    setLoading(true);
    try {
      const data = await fetchShortlists();
      setShortlists(data);
    } catch (err) {
      setError('Failed to load shortlists.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete shortlist "${name}"?`)) return;
    try {
      await deleteShortlist(id);
      setShortlists((prev) => prev.filter((s) => s.ID !== id));
    } catch {
      setError('Failed to delete shortlist.');
    }
  };

  if (loading) return <BusyIndicator active size="Large" />;

  return (
    <div>
      <h2>My Expert Shortlists</h2>

      {error && (
        <MessageStrip design="Negative" hideCloseButton style={{ marginBottom: '1rem' }}>
          {error}
        </MessageStrip>
      )}

      {shortlists.length === 0 && (
        <p>No shortlists saved yet. Search for experts and save them to a shortlist.</p>
      )}

      {shortlists.map((shortlist) => (
        <Card key={shortlist.ID} style={{ marginBottom: '1.5rem' }}>
          <CardHeader
            titleText={shortlist.reviewName}
            subtitleText={`${shortlist.entries?.length || 0} expert(s)`}
            action={
              <Button design="Negative" icon="delete" onClick={() => handleDelete(shortlist.ID, shortlist.reviewName)}>
                Delete shortlist
              </Button>
            }
          />
          <div style={{ padding: '0.5rem 1rem' }}>
            {shortlist.entries?.map((entry) => (
              <ExpertCard
                key={entry.ID}
                expert={{
                  employeeId: entry.employeeId,
                  name: entry.employeeName,
                  jobTitle: entry.jobTitle,
                  region: entry.region,
                  rank: entry.rankScore,
                  matchExplanation: entry.matchExplanation,
                  seniorityConfirmed: true,
                  coiClear: true,
                  externalSignals: [],
                  confidenceNote: '',
                }}
                readOnly
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
