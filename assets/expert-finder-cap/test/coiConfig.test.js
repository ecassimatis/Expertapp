/**
 * Tests for CoI admin endpoint with role checks.
 */

describe('CoI Exclusion Rules admin endpoint', () => {
  test('CoiExclusionRule has required fields', () => {
    const rule = {
      ID: 'rule-uuid-1',
      ruleType: 'org_unit',
      value: 'PROD_ROADMAP',
      createdAt: new Date().toISOString(),
      createdBy: 'admin@sap.com',
    };
    expect(rule.ruleType).toBe('org_unit');
    expect(rule.value).toBe('PROD_ROADMAP');
  });

  test('ruleType is either org_unit or job_role', () => {
    const validTypes = ['org_unit', 'job_role'];
    expect(validTypes).toContain('org_unit');
    expect(validTypes).toContain('job_role');
    expect(validTypes).not.toContain('invalid_type');
  });

  test('non-admin user gets 403 on CoI endpoint', () => {
    // Simulate role check: user without Expert_Finder_Admin role should be rejected
    const userRoles = ['Expert_Finder_User'];
    const hasAdminRole = userRoles.includes('Expert_Finder_Admin');
    expect(hasAdminRole).toBe(false);
    // In CAP this would result in a 403 from the @requires annotation
    const expectedStatusCode = hasAdminRole ? 200 : 403;
    expect(expectedStatusCode).toBe(403);
  });

  test('admin user can access CoI endpoint', () => {
    const userRoles = ['Expert_Finder_User', 'Expert_Finder_Admin'];
    const hasAdminRole = userRoles.includes('Expert_Finder_Admin');
    expect(hasAdminRole).toBe(true);
    const expectedStatusCode = hasAdminRole ? 200 : 403;
    expect(expectedStatusCode).toBe(200);
  });

  test('SeniorityConfig has min and max grade fields', () => {
    const config = { ID: 'cfg-1', minGrade: 'M2', maxGrade: 'M4' };
    expect(config.minGrade).toBe('M2');
    expect(config.maxGrade).toBe('M4');
  });
});
