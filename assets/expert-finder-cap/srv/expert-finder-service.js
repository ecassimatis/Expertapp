const cds = require('@sap/cds');
const LOG = cds.log('expert-finder-service');

const AGENT_TIMEOUT_MS = 10000;

module.exports = class ExpertFinderService extends cds.ApplicationService {
  async init() {
    const { Shortlists, ShortlistEntries, CoiExclusionRules, SeniorityConfigs } = this.entities;

    // -------------------------------------------------------------------------
    // Expert Search — delegates to AI agent via A2A
    // -------------------------------------------------------------------------
    this.on('searchExperts', async (req) => {
      const { query, domain, region } = req.data;
      LOG.info(`[SEARCH]: query="${query}", domain="${domain}", region="${region}"`);

      const agentUrl = process.env.AGENT_ENDPOINT_URL;
      if (!agentUrl) {
        LOG.error('AGENT_ENDPOINT_URL not configured');
        return req.error(503, 'Expert search temporarily unavailable.');
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

        const response = await fetch(`${agentUrl}/invoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Search for experts: ${query}${domain ? ` domain: ${domain}` : ''}${region ? ` region: ${region}` : ''}` }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          LOG.error(`Agent returned ${response.status}`);
          return req.error(503, 'Expert search temporarily unavailable.');
        }

        const data = await response.json();
        return data.results || [];
      } catch (err) {
        if (err.name === 'AbortError') {
          LOG.error('Agent call timed out after 10s');
        } else {
          LOG.error('Agent call failed:', err.message);
        }
        return req.error(503, 'Expert search temporarily unavailable.');
      }
    });

    // -------------------------------------------------------------------------
    // Meeting Request — delegates to AI agent via A2A
    // -------------------------------------------------------------------------
    this.on('requestReviewCall', async (req) => {
      const { employeeId, employeeName, requesterContext } = req.data;

      const agentUrl = process.env.AGENT_ENDPOINT_URL;
      if (!agentUrl) {
        return req.error(503, 'Meeting request service temporarily unavailable.');
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

        const response = await fetch(`${agentUrl}/invoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Request a 30-minute review call with employee ID ${employeeId} (${employeeName}). Context: ${requesterContext || 'No additional context provided.'}`,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          return req.error(503, 'Meeting request service temporarily unavailable.');
        }

        const data = await response.json();
        return {
          success: data.success || false,
          eventId: data.eventId || '',
          message: data.message || '',
        };
      } catch (err) {
        return req.error(503, 'Meeting request service temporarily unavailable.');
      }
    });

    // -------------------------------------------------------------------------
    // Save to Shortlist
    // -------------------------------------------------------------------------
    this.on('saveToShortlist', async (req) => {
      const { reviewName, employeeId, employeeName, jobTitle, region, matchExplanation, rankScore } = req.data;
      const { Shortlists, ShortlistEntries } = this.entities;

      // Find or create shortlist for reviewName
      let shortlist = await SELECT.one.from(Shortlists).where({ reviewName });
      if (!shortlist) {
        const [newShortlist] = await INSERT.into(Shortlists).entries({
          ID: cds.utils.uuid(),
          reviewName,
          createdAt: new Date().toISOString(),
        });
        shortlist = { ID: newShortlist };
      }

      const entryId = cds.utils.uuid();
      await INSERT.into(ShortlistEntries).entries({
        ID: entryId,
        shortlist_ID: shortlist.ID,
        employeeId,
        employeeName,
        jobTitle,
        region,
        matchExplanation,
        rankScore,
        addedAt: new Date().toISOString(),
      });

      return { ID: entryId, reviewName, employeeId };
    });

    await super.init();
  }
};
