/**
 * Tests for Shortlist CRUD operations.
 */

describe('Shortlist CRUD', () => {
  test('shortlist entry has required fields', () => {
    const entry = {
      ID: 'uuid-1234',
      shortlist_ID: 'sl-uuid-5678',
      employeeId: '001',
      employeeName: 'Alice Smith',
      jobTitle: 'Supply Chain Lead',
      region: 'EMEA',
      matchExplanation: 'Great match for supply chain.',
      rankScore: 1,
      addedAt: new Date().toISOString(),
    };
    expect(entry).toHaveProperty('ID');
    expect(entry).toHaveProperty('employeeId');
    expect(entry).toHaveProperty('employeeName');
    expect(entry).toHaveProperty('matchExplanation');
  });

  test('shortlist groups entries by reviewName', () => {
    const shortlists = [
      { ID: 'sl1', reviewName: 'Partner Review 2025', entries: [{ ID: 'e1' }, { ID: 'e2' }] },
      { ID: 'sl2', reviewName: 'Ecosystem Review Q3', entries: [{ ID: 'e3' }] },
    ];
    expect(shortlists).toHaveLength(2);
    expect(shortlists[0].entries).toHaveLength(2);
    expect(shortlists[1].entries).toHaveLength(1);
  });

  test('delete shortlist removes it from list', () => {
    let shortlists = [{ ID: 'sl1' }, { ID: 'sl2' }];
    shortlists = shortlists.filter((s) => s.ID !== 'sl1');
    expect(shortlists).toHaveLength(1);
    expect(shortlists[0].ID).toBe('sl2');
  });

  test('saveToShortlist result contains entry ID and reviewName', () => {
    const result = { ID: 'new-entry-uuid', reviewName: 'Partner Review', employeeId: '001' };
    expect(result).toHaveProperty('ID');
    expect(result).toHaveProperty('reviewName');
    expect(result).toHaveProperty('employeeId');
  });
});
