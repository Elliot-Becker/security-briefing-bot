require('dotenv').config();
const cron = require('node-cron');
const { fetchCVEs } = require('./cve');
const { fetchShodanResults } = require('./shodan');
const { saveToNotion } = require('./notion');

async function runBriefing() {
  console.log('🔐 Starting security briefing...');

  try {
    console.log('📡 Fetching CVEs...');
    const cves = await fetchCVEs();
    console.log(`✅ Found ${cves.length} CVEs`);

    console.log('🌐 Fetching Shodan results...');
    const shodanResults = await fetchShodanResults();
    console.log(`✅ Found results for ${shodanResults.length} queries`);

    console.log('📋 Saving to Notion...');
    await saveToNotion(cves, shodanResults);

    console.log('🎉 Briefing complete!');
  } catch (error) {
    console.error('❌ Briefing failed:', error.message);
  }
}

// Run immediately when the script starts
runBriefing();

// Then schedule it to run every day at 7:00 AM
cron.schedule('0 7 * * *', () => {
  console.log('⏰ Running scheduled briefing...');
  runBriefing();
});

console.log('🤖 Security briefing bot is running. Waiting for next scheduled run at 7:00 AM...');