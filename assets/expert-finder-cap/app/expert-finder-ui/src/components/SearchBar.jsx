import React, { useState } from 'react';
import { Input, Button, Select, Option, FlexBox, Label } from '@ui5/webcomponents-react';

const DOMAINS = ['', 'Supply Chain', 'BTP', 'Integration', 'Travel & Expense', 'S/4HANA', 'HCM', 'Finance', 'Sustainability'];
const REGIONS = ['', 'EMEA', 'Americas', 'APJ'];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query, domain, region);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FlexBox gap="0.5rem" wrap="Wrap" alignItems="End">
        <div style={{ flex: '1 1 300px' }}>
          <Label for="search-input">Find an expert</Label>
          <Input
            id="search-input"
            value={query}
            onInput={(e) => setQuery(e.target.value)}
            placeholder='e.g., "supply chain expert familiar with SAP IBP"'
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ minWidth: '160px' }}>
          <Label for="domain-select">Domain</Label>
          <Select
            id="domain-select"
            onChange={(e) => setDomain(e.detail.selectedOption.dataset.value || '')}
            style={{ width: '100%' }}
          >
            {DOMAINS.map((d) => (
              <Option key={d} data-value={d} selected={d === domain}>
                {d || 'All domains'}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ minWidth: '140px' }}>
          <Label for="region-select">Region (optional)</Label>
          <Select
            id="region-select"
            onChange={(e) => setRegion(e.detail.selectedOption.dataset.value || '')}
            style={{ width: '100%' }}
          >
            {REGIONS.map((r) => (
              <Option key={r} data-value={r} selected={r === region}>
                {r || 'Worldwide'}
              </Option>
            ))}
          </Select>
        </div>

        <Button type="Submit" design="Emphasized" disabled={!query.trim() || loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </FlexBox>
    </form>
  );
}
