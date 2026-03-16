require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('./config');
const { fetchCVEs } = require('./cve');
const { flagKEVMatches } = require('./kev');
const { flagMSFModules } = require('./msf');
const { fetchShodanResults } = require('./shodan');
const { saveToNotion } = require('./notion');

async function runBriefing() {
  console.log('\n🔐 Starting security briefing...');
  const startTime = Date.now();

  try {
    console.log('📡 Fetching CVEs...');
    const rawCves = await fetchCVEs();
    console.log(`✅ Found ${rawCves.length} HIGH/CRITICAL CVEs`);

    console.log('🔍 Checking CISA KEV list...');
    const kevCves = await flagKEVMatches(rawCves);
    const kevCount = kevCves.filter(c => c.isKEV).length;
    if (kevCount > 0) {
      console.log(`🚨 ${kevCount} CVE(s) are actively exploited (CISA KEV)`);
    } else {
      console.log('✅ No KEV matches today');
    }

    console.log('🔫 Checking Metasploit module availability...');
    const cves = await flagMSFModules(kevCves);
    const msfCount = cves.filter(c => c.msfModules.length > 0).length;
    if (msfCount > 0) {
      console.log(`💀 ${msfCount} CVE(s) have known Metasploit exploit modules`);
    } else {
      console.log('✅ No Metasploit modules found for today\'s CVEs');
    }

    console.log('🌐 Fetching Shodan results...');
    const shodanResults = await fetchShodanResults();
    console.log(`✅ Found results for ${shodanResults.length} hosts`);

    console.log('📋 Saving to Notion...');
    await saveToNotion(cves, shodanResults);

    if (config.SAVE_JSON_REPORT) {
      saveJSONReport(cves, shodanResults);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Briefing complete in ${duration}s`);

  } catch (error) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] FATAL ERROR in runBriefing: ${error.message}\n`;
    fs.appendFileSync('./error.log', entry);
    console.error('❌ Briefing failed:', error.message);
  }
}

function saveJSONReport(cves, shodanResults) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `briefing-${timestamp}.json`;
  const filepath = path.join(config.REPORTS_DIR, filename);

  const report = {
    generated: new Date().toISOString(),
    summary: {
      total_cves: cves.length,
      critical: cves.filter(c => c.severity === 'CRITICAL').length,
      high: cves.filter(c => c.severity === 'HIGH').length,
      kev_matches: cves.filter(c => c.isKEV).length,
      msf_modules: cves.filter(c => c.msfModules?.length > 0).length,
      shodan_hosts_checked: shodanResults.length
    },
    cves: cves,
    shodan: shodanResults
  };

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 JSON report saved: ${filename}`);
}

// Run immediately on start
runBriefing();

// Schedule daily at 7:00 AM
cron.schedule(config.CRON_SCHEDULE, () => {
  console.log('⏰ Running scheduled briefing...');
  runBriefing();
});

console.log('🤖 Bot running. Next scheduled briefing at 7:00 AM daily.');