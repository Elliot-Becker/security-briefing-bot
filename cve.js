const axios = require('axios');
const config = require('./config');

async function fetchCVEs() {
  const results = [];

  for (const keyword of config.CVE_KEYWORDS) {
    try {
      const response = await axios.get('https://services.nvd.nist.gov/rest/json/cves/2.0', {
        headers: {
          'apiKey': process.env.NVD_API_KEY
        },
        params: {
          keywordSearch: keyword,
          pubStartDate: getLastWeekDate(),
          pubEndDate: getTodayDate(),
          resultsPerPage: config.CVE_RESULTS_PER_KEYWORD
        }
      });

      const cves = response.data.vulnerabilities || [];

      for (const item of cves) {
        const cve = item.cve;

        const severity = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ||
                         cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ||
                         cve.metrics?.cvssMetricV2?.[0]?.baseSeverity ||
                         'UNKNOWN';

        // Only include HIGH and CRITICAL CVEs
        if (!config.MIN_SEVERITY.includes(severity)) continue;

        const score = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
                      cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
                      cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
                      'N/A';

        results.push({
          id: cve.id,
          keyword: keyword,
          description: cve.descriptions[0]?.value || 'No description available',
          severity: severity,
          score: score,
          published: cve.published
        });
      }

    } catch (error) {
      logError(`fetchCVEs [${keyword}]`, error.message);
    }
  }

  return results;
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0] + 'T23:59:59.999Z';
}

function getLastWeekDate() {
  const d = new Date();
  d.setDate(d.getDate() - config.CVE_LOOKBACK_DAYS);
  return d.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

function logError(context, message) {
  const fs = require('fs');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ERROR in ${context}: ${message}\n`;
  fs.appendFileSync('./error.log', entry);
  console.error(`❌ ${entry.trim()}`);
}

module.exports = { fetchCVEs };