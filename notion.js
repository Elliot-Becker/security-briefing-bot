const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function saveToNotion(cves, shodanResults) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const blocks = [];

  // ── Header ──
  blocks.push({
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [{ type: 'text', text: { content: `🔐 Security Briefing — ${today}` } }]
    }
  });

  // ── CVE Section ──
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: '🚨 Latest CVEs' } }]
    }
  });

  if (cves.length === 0) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'No new CVEs found for today.' } }]
      }
    });
  } else {
    for (const cve of cves) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: `${cve.id} — ${cve.severity} (${cve.score})\nKeyword: ${cve.keyword}\n${cve.description}` } }],
          icon: { type: 'emoji', emoji: severityEmoji(cve.severity) }
        }
      });
    }
  }

  // ── Shodan Section ──
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: '🌐 Shodan Recon Summary' } }]
    }
  });

  for (const result of shodanResults) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: `Query: "${result.query}" — ${result.total.toLocaleString()} results found` } }]
      }
    });

    for (const host of result.sample) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: `${host.ip} | Port: ${host.port} | Org: ${host.org}` } }]
        }
      });
    }
  }

  // ── Divider ──
  blocks.push({ object: 'block', type: 'divider', divider: {} });

  await notion.blocks.children.append({
    block_id: process.env.NOTION_PAGE_ID,
    children: blocks
  });

  console.log('✅ Briefing saved to Notion successfully.');
}

function severityEmoji(severity) {
  const map = {
    'CRITICAL': '🔴',
    'HIGH': '🟠',
    'MEDIUM': '🟡',
    'LOW': '🟢',
    'UNKNOWN': '⚪'
  };
  return map[severity] || '⚪';
}

module.exports = { saveToNotion };