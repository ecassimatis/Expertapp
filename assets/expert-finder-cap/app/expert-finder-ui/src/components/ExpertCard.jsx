import React, { useState } from 'react';
import {
  Card, CardHeader, Button, Icon, Badge, MessageStrip,
  Text, Link, FlexBox
} from '@ui5/webcomponents-react';
import MeetingRequestModal from './MeetingRequestModal';

export default function ExpertCard({ expert, onSaveToShortlist, readOnly = false }) {
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const confidenceNoteType = expert.confidenceNote ? 'Warning' : undefined;

  return (
    <Card style={{ marginBottom: '1rem' }}>
      <CardHeader
        titleText={`#${expert.rank} — ${expert.name}`}
        subtitleText={`${expert.jobTitle} · ${expert.region}`}
        action={
          !readOnly && (
            <FlexBox gap="0.5rem">
              <Button
                design="Emphasized"
                icon="phone"
                onClick={() => setShowModal(true)}
              >
                Request 30-min review
              </Button>
              <Button
                design="Default"
                icon="bookmark"
                onClick={() => onSaveToShortlist && onSaveToShortlist(expert)}
              >
                Save to shortlist
              </Button>
            </FlexBox>
          )
        }
      />

      <div style={{ padding: '1rem' }}>
        {/* Status badges */}
        <FlexBox gap="0.5rem" style={{ marginBottom: '0.5rem' }}>
          {expert.seniorityConfirmed && (
            <Badge colorScheme="8" icon="employee">Seniority confirmed</Badge>
          )}
          {expert.coiClear && (
            <Badge colorScheme="8" icon="accept">CoI clear</Badge>
          )}
        </FlexBox>

        {/* Match explanation */}
        <div style={{ marginBottom: '0.5rem' }}>
          <Text style={{ fontStyle: 'italic' }}>
            {expanded
              ? expert.matchExplanation
              : expert.matchExplanation?.substring(0, 200) + (expert.matchExplanation?.length > 200 ? '...' : '')}
          </Text>
          {expert.matchExplanation?.length > 200 && (
            <Link onClick={() => setExpanded(!expanded)} style={{ marginLeft: '0.25rem' }}>
              {expanded ? 'Show less' : 'Read more'}
            </Link>
          )}
        </div>

        {/* Confidence note */}
        {expert.confidenceNote && (
          <MessageStrip design="Warning" hideCloseButton style={{ marginBottom: '0.5rem' }}>
            {expert.confidenceNote}
          </MessageStrip>
        )}

        {/* External signals */}
        {expert.externalSignals?.length > 0 && (
          <div>
            <Text style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>External signals:</Text>
            <FlexBox wrap="Wrap" gap="0.5rem">
              {expert.externalSignals.map((signal, idx) => (
                <Badge
                  key={idx}
                  colorScheme={signal.source === 'sap_community' ? '6' : '2'}
                >
                  <Link href={signal.url} target="_blank">
                    {signal.source === 'sap_community' ? 'SAP Community' : 'LinkedIn'}: {signal.title}
                  </Link>
                </Badge>
              ))}
            </FlexBox>
          </div>
        )}
      </div>

      {/* GDPR disclaimer */}
      <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.75rem', color: '#6a6d70' }}>
        Employee data is retrieved live from SAP SuccessFactors and is not stored. External links are sourced from public profiles.
      </div>

      {showModal && (
        <MeetingRequestModal
          expert={expert}
          onClose={() => setShowModal(false)}
        />
      )}
    </Card>
  );
}
