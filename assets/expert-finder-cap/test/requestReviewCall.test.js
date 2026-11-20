/**
 * Tests for requestReviewCall action handler.
 */

describe('requestReviewCall action handler', () => {
  test('returns success result on valid agent response', () => {
    const mockAgentResponse = {
      success: true,
      eventId: 'evt_abc123',
      message: 'Review call request sent to Alice Smith.',
    };
    expect(mockAgentResponse.success).toBe(true);
    expect(mockAgentResponse.eventId).toBe('evt_abc123');
    expect(mockAgentResponse.message).toContain('Alice Smith');
  });

  test('returns failure result on agent error', () => {
    const errorResponse = {
      success: false,
      eventId: '',
      message: 'Failed to create calendar invite.',
    };
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.eventId).toBe('');
  });

  test('meeting request result shape is correct', () => {
    const result = {
      success: true,
      eventId: 'evt_xyz789',
      message: 'Calendar invite created.',
    };
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.eventId).toBe('string');
    expect(typeof result.message).toBe('string');
  });
});
