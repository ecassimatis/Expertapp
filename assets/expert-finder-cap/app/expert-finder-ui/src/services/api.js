/**
 * CAP backend API wrapper.
 * All calls go through the CAP backend — never direct SAP API calls.
 */

const BASE_URL = '/api';

/**
 * Search for experts by natural-language query.
 * @param {string} query - Natural-language search query
 * @param {string} [domain] - Optional domain filter
 * @param {string} [region] - Optional region filter
 * @returns {Promise<Array>} Ranked list of ExpertResult objects
 */
export async function searchExperts(query, domain = '', region = '') {
  const response = await fetch(`${BASE_URL}/searchExperts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, domain, region }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Search failed (${response.status})`);
  }
  const data = await response.json();
  return data.value || data || [];
}

/**
 * Request a 30-minute expert review call.
 * @param {string} employeeId
 * @param {string} employeeName
 * @param {string} requesterContext
 * @returns {Promise<{success: boolean, eventId: string, message: string}>}
 */
export async function requestReviewCall(employeeId, employeeName, requesterContext = '') {
  const response = await fetch(`${BASE_URL}/requestReviewCall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, employeeName, requesterContext }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Meeting request failed (${response.status})`);
  }
  return response.json();
}

/**
 * Save an expert to a named shortlist.
 */
export async function saveToShortlist(reviewName, expert) {
  const response = await fetch(`${BASE_URL}/saveToShortlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reviewName,
      employeeId: expert.employeeId,
      employeeName: expert.name,
      jobTitle: expert.jobTitle,
      region: expert.region,
      matchExplanation: expert.matchExplanation,
      rankScore: expert.rank,
    }),
  });
  if (!response.ok) throw new Error('Failed to save to shortlist');
  return response.json();
}

/**
 * Fetch all shortlists.
 */
export async function fetchShortlists() {
  const response = await fetch(`${BASE_URL}/Shortlists?$expand=entries`);
  if (!response.ok) throw new Error('Failed to fetch shortlists');
  const data = await response.json();
  return data.value || [];
}

/**
 * Delete a shortlist by ID.
 */
export async function deleteShortlist(id) {
  const response = await fetch(`${BASE_URL}/Shortlists(${id})`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete shortlist');
}
