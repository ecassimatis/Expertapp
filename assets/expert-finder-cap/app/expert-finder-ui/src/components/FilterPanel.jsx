import React from 'react';
import { Panel, Token, FlexBox, Text } from '@ui5/webcomponents-react';

export default function FilterPanel({ domain, region, onClearDomain, onClearRegion }) {
  const hasFilters = domain || region;
  if (!hasFilters) return null;

  return (
    <Panel headerText="Active Filters" collapsed={false} style={{ marginTop: '0.5rem' }}>
      <FlexBox gap="0.5rem" style={{ padding: '0.5rem' }}>
        {domain && (
          <Token text={`Domain: ${domain}`} closeIcon onClose={onClearDomain} />
        )}
        {region && (
          <Token text={`Region: ${region}`} closeIcon onClose={onClearRegion} />
        )}
      </FlexBox>
    </Panel>
  );
}
