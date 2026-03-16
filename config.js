module.exports = {
  // CVE Settings
  CVE_KEYWORDS: ['cisco', 'apache', 'windows', 'fortinet', 'vmware'],
  CVE_LOOKBACK_DAYS: 7,
  CVE_RESULTS_PER_KEYWORD: 3,
  MIN_SEVERITY: ['HIGH', 'CRITICAL'], // Only alert on these severities

  // Shodan Settings
  SHODAN_IPS: [
    '8.8.8.8',
    '1.1.1.1',
    '9.9.9.9'
  ],

  // Scheduling
  CRON_SCHEDULE: '0 7 * * *', // Every day at 7:00 AM

  // Output
  SAVE_JSON_REPORT: true,
  REPORTS_DIR: './reports'
};