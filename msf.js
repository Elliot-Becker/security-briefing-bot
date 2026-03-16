const axios = require('axios');

// Metasploit modules are indexed publicly on GitHub
const MSF_INDEX_URL = 'https://raw.githubusercontent.com/rapid7/metasploit-framework/master/db/modules_metadata_base.json';

let msfCache = null;
let msfCacheTime = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

async function fetchMSFModules() {
  if (msfCache && (Date.now() - msfCacheTime) < CACHE_TTL_MS) {
    return msfCache;
  }

  try {
    const response = await axios.get(MSF_INDEX_URL, {
      timeout: 15000 // 15 second timeout — this file is large
    });

    const modules = response.data;
    const cveMap = new Map();

    // Build a CVE → module name lookup map
    for (const [moduleName, moduleData] of Object.entries(modules)) {
      const references = moduleData.references || [];
      for (const ref of references) {
        if (ref.startsWith('CVE-')) {
          const cveId = `CVE-${ref.slice(4)}`;
          if (!cveMap.has(cveId)) {
            cveMap.set(cveId, []);
          }
          cveMap.get(cveId).push({
            name: moduleName,
            type: moduleData.type || 'unknown',
            rank: moduleData.rank || 'unknown',
            description: moduleData.description?.substring(0, 100) || ''
          });
        }
      }
    }

    msfCache = cveMap;
    msfCacheTime = Date.now();
    console.log(`✅ Metasploit module index loaded — ${cveMap.size} CVEs with known exploits`);
    return cveMap;

  } catch (error) {
    logError('fetchMSFModules', error.message);
    return new Map();
  }
}

async function flagMSFModules(cves) {
  const msfMap = await fetchMSFModules();

  return cves.map(cve => ({
    ...cve,
    msfModules: msfMap.get(cve.id) || []
  }));
}

function logError(context, message) {
  const fs = require('fs');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ERROR in ${context}: ${message}\n`;
  fs.appendFileSync('./error.log', entry);
  console.error(`❌ ${entry.trim()}`);
}

module.exports = { flagMSFModules };