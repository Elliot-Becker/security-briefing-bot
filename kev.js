const axios = require('axios');

let kevCache = null;
let kevCacheTime = null;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

async function fetchKEVList() {
  // Return cached list if still fresh
  if (kevCache && (Date.now() - kevCacheTime) < CACHE_TTL_MS) {
    return kevCache;
  }

  try {
    const response = await axios.get(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
    );

    const vulnerabilities = response.data.vulnerabilities || [];

    // Build a Set of CVE IDs for O(1) lookup
    kevCache = new Set(vulnerabilities.map(v => v.cveID));
    kevCacheTime = Date.now();

    console.log(`✅ CISA KEV list loaded — ${kevCache.size} known exploited CVEs`);
    return kevCache;

  } catch (error) {
    logError('fetchKEVList', error.message);
    return new Set(); // Return empty set so bot continues if CISA is down
  }
}

async function flagKEVMatches(cves) {
  const kevList = await fetchKEVList();

  return cves.map(cve => ({
    ...cve,
    isKEV: kevList.has(cve.id)
  }));
}

function logError(context, message) {
  const fs = require('fs');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ERROR in ${context}: ${message}\n`;
  fs.appendFileSync('./error.log', entry);
  console.error(`❌ ${entry.trim()}`);
}

module.exports = { flagKEVMatches };