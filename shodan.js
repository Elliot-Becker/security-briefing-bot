const axios = require('axios');

const SAMPLE_IPS = [
  '8.8.8.8',
  '1.1.1.1',
  '208.67.222.222'
];

async function fetchShodanResults() {
  const results = [];

  for (const ip of SAMPLE_IPS) {
    try {
      const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}`, {
        params: {
          key: process.env.SHODAN_API_KEY
        }
      });

      const data = response.data;

      results.push({
        query: ip,
        total: 1,
        sample: [{
          ip: data.ip_str,
          port: data.ports?.[0] || 'N/A',
          org: data.org || 'Unknown',
          hostnames: data.hostnames || [],
          ports: data.ports || [],
          os: data.os || 'Unknown'
        }]
      });

    } catch (error) {
      console.error(`Error fetching Shodan results for IP "${ip}":`, error.message);
    }
  }

  return results;
}

module.exports = { fetchShodanResults };