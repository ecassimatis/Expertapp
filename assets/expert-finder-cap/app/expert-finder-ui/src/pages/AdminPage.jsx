import React, { useEffect, useState } from 'react';
import {
  Card, CardHeader, Input, Button, Table, TableColumn, TableRow, TableCell,
  MessageStrip, FlexBox, Label, Select, Option
} from '@ui5/webcomponents-react';

const BASE_URL = '/api';

export default function AdminPage() {
  const [minGrade, setMinGrade] = useState('');
  const [maxGrade, setMaxGrade] = useState('');
  const [seniorityMessage, setSeniorityMessage] = useState('');
  const [coiRules, setCoiRules] = useState([]);
  const [newRuleType, setNewRuleType] = useState('org_unit');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [coiMessage, setCoiMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const senRes = await fetch(`${BASE_URL}/SeniorityConfigs`);
      if (senRes.ok) {
        const senData = await senRes.json();
        if (senData.value?.[0]) {
          setMinGrade(senData.value[0].minGrade || '');
          setMaxGrade(senData.value[0].maxGrade || '');
        }
      }
      const coiRes = await fetch(`${BASE_URL}/CoiExclusionRules`);
      if (coiRes.ok) {
        const coiData = await coiRes.json();
        setCoiRules(coiData.value || []);
      }
    } catch (err) {
      setError('Failed to load configuration.');
    }
  };

  const saveSeniority = async () => {
    try {
      const res = await fetch(`${BASE_URL}/SeniorityConfigs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minGrade, maxGrade }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSeniorityMessage('Seniority band saved. Redeployment required to apply changes.');
    } catch {
      setError('Failed to save seniority configuration.');
    }
  };

  const addCoiRule = async () => {
    if (!newRuleValue.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/CoiExclusionRules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleType: newRuleType, value: newRuleValue.trim() }),
      });
      if (!res.ok) throw new Error('Add failed');
      setNewRuleValue('');
      loadData();
      setCoiMessage('CoI rule added. Redeployment required to apply changes.');
    } catch {
      setError('Failed to add CoI exclusion rule.');
    }
  };

  const deleteCoiRule = async (id) => {
    try {
      await fetch(`${BASE_URL}/CoiExclusionRules(${id})`, { method: 'DELETE' });
      setCoiRules((prev) => prev.filter((r) => r.ID !== id));
    } catch {
      setError('Failed to delete CoI rule.');
    }
  };

  return (
    <div>
      <h2>Expert Finder Administration</h2>
      <p style={{ color: '#6a6d70', marginBottom: '1rem' }}>
        Changes to seniority bands and CoI exclusion rules require a redeployment to take effect.
      </p>

      {error && (
        <MessageStrip design="Negative" onClose={() => setError('')} style={{ marginBottom: '1rem' }}>
          {error}
        </MessageStrip>
      )}

      {/* Seniority Band */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader titleText="Seniority Band Configuration" />
        <div style={{ padding: '1rem' }}>
          <FlexBox gap="1rem" alignItems="End">
            <div>
              <Label for="min-grade">Minimum Grade (L2 lower bound)</Label>
              <Input id="min-grade" value={minGrade} onInput={(e) => setMinGrade(e.target.value)} placeholder="e.g., M2" />
            </div>
            <div>
              <Label for="max-grade">Maximum Grade (L2 upper bound)</Label>
              <Input id="max-grade" value={maxGrade} onInput={(e) => setMaxGrade(e.target.value)} placeholder="e.g., M4" />
            </div>
            <Button design="Emphasized" onClick={saveSeniority}>Save</Button>
          </FlexBox>
          {seniorityMessage && (
            <MessageStrip design="Information" hideCloseButton style={{ marginTop: '0.5rem' }}>
              {seniorityMessage}
            </MessageStrip>
          )}
        </div>
      </Card>

      {/* CoI Exclusion Rules */}
      <Card>
        <CardHeader titleText="Conflict-of-Interest Exclusion Rules" />
        <div style={{ padding: '1rem' }}>
          <FlexBox gap="0.5rem" alignItems="End" style={{ marginBottom: '1rem' }}>
            <div>
              <Label>Rule type</Label>
              <Select onChange={(e) => setNewRuleType(e.detail.selectedOption.dataset.value)}>
                <Option data-value="org_unit" selected={newRuleType === 'org_unit'}>Org Unit</Option>
                <Option data-value="job_role" selected={newRuleType === 'job_role'}>Job Role</Option>
              </Select>
            </div>
            <div style={{ flex: 1 }}>
              <Label>Value</Label>
              <Input
                value={newRuleValue}
                onInput={(e) => setNewRuleValue(e.target.value)}
                placeholder="e.g., PROD_ROADMAP"
                style={{ width: '100%' }}
              />
            </div>
            <Button design="Emphasized" onClick={addCoiRule}>Add Rule</Button>
          </FlexBox>

          {coiMessage && (
            <MessageStrip design="Information" hideCloseButton style={{ marginBottom: '0.5rem' }}>
              {coiMessage}
            </MessageStrip>
          )}

          <Table
            columns={
              <>
                <TableColumn>Type</TableColumn>
                <TableColumn>Value</TableColumn>
                <TableColumn>Action</TableColumn>
              </>
            }
          >
            {coiRules.map((rule) => (
              <TableRow key={rule.ID}>
                <TableCell>{rule.ruleType === 'org_unit' ? 'Org Unit' : 'Job Role'}</TableCell>
                <TableCell>{rule.value}</TableCell>
                <TableCell>
                  <Button design="Negative" onClick={() => deleteCoiRule(rule.ID)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </Card>
    </div>
  );
}
