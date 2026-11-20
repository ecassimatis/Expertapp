import React, { useState } from 'react';
import {
  Dialog, Button, TextArea, MessageStrip, Text
} from '@ui5/webcomponents-react';
import { requestReviewCall } from '../services/api';

export default function MeetingRequestModal({ expert, onClose }) {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await requestReviewCall(expert.employeeId, expert.name, context);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send meeting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      headerText="Request Expert Review Call"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
          <Button
            design="Emphasized"
            onClick={handleConfirm}
            disabled={loading || success}
          >
            {loading ? 'Sending...' : 'Confirm & Send'}
          </Button>
          <Button design="Default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      }
      onAfterClose={onClose}
    >
      <div style={{ padding: '1rem', minWidth: '400px' }}>
        <Text>
          Request a 30-minute expert review call with <strong>{expert.name}</strong> ({expert.jobTitle}).
        </Text>

        <div style={{ margin: '1rem 0' }}>
          <Text style={{ marginBottom: '0.5rem' }}>
            Optional context (max 500 characters):
          </Text>
          <TextArea
            value={context}
            onInput={(e) => setContext(e.target.value.substring(0, 500))}
            placeholder="e.g., Reviewing a logistics startup for potential SAP partnership..."
            rows={4}
            style={{ width: '100%' }}
          />
          <Text style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
            {context.length}/500 characters
          </Text>
        </div>

        {error && (
          <MessageStrip design="Negative" hideCloseButton>
            {error}
          </MessageStrip>
        )}

        {success && (
          <MessageStrip design="Positive" hideCloseButton>
            Review call request sent to {expert.name}. The calendar invite has been created.
          </MessageStrip>
        )}
      </div>
    </Dialog>
  );
}
