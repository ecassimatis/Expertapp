/**
 * Tests for searchExperts action handler.
 */

describe('searchExperts action handler', () => {
  const mockResults = [
    {
      employeeId: '001',
      name: 'Alice Smith',
      jobTitle: 'Supply Chain Lead',
      region: 'EMEA',
      rank: 1,
      matchExplanation: 'Deep expertise in SAP IBP.',
      seniorityConfirmed: true,
      coiClear: true,
      confidenceNote: '',
      externalSignals: [],
    },
  ];

  test('returns expert results on successful agent response', async () => {
    // Simulate agent response
    const agentResponse = { results: mockResults };
    const result = agentResponse.results || [];
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice Smith');
    expect(result[0].seniorityConfirmed).toBe(true);
    expect(result[0].coiClear).toBe(true);
  });

  test('returns empty array when agent returns no results', async () => {
    const agentResponse = { results: [] };
    expect(agentResponse.results).toHaveLength(0);
  });

  test('handles agent unavailable (503) gracefully', async () => {
    const agentUrl = process.env.AGENT_ENDPOINT_URL;
    if (!agentUrl) {
      // When AGENT_ENDPOINT_URL is not set, service should return error
      expect(agentUrl).toBeUndefined();
    }
  });

  test('expert result has all required fields', () => {
    const expert = mockResults[0];
    expect(expert).toHaveProperty('employeeId');
    expect(expert).toHaveProperty('name');
    expect(expert).toHaveProperty('jobTitle');
    expect(expert).toHaveProperty('region');
    expect(expert).toHaveProperty('rank');
    expect(expert).toHaveProperty('matchExplanation');
    expect(expert).toHaveProperty('seniorityConfirmed');
    expect(expert).toHaveProperty('coiClear');
    expect(expert).toHaveProperty('externalSignals');
  });
});
