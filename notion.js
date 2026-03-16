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

  // ── Summary Stats ──
  const critical = cves.filter(c => c.severity === 'CRITICAL').length;
  const high = cves.filter(c => c.severity === 'HIGH').length;
  const kev = cves.filter(c => c.isKEV).length;
  const msf = cves.filter(c => c.msfModules?.length > 0).length;

  blocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: [{
        type: 'text',
        text: {
          content: `📊 Summary: ${cves.length} CVEs found — ${critical} CRITICAL | ${high} HIGH | ${kev} actively exploited (CISA KEV) | ${msf} with Metasploit modules`
        }
      }],
      icon: { type: 'emoji', emoji: '📋' }
    }
  });

  // ── Divider ──
  blocks.push({ object: 'block', type: 'divider', divider: {} });

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
        rich_text: [{ type: 'text', text: { content: 'No HIGH or CRITICAL CVEs found this week.' } }]
      }
    });
  } else {
    for (const cve of cves) {
      const kevBadge = cve.isKEV ? ' 🚨 ACTIVELY EXPLOITED (CISA KEV)' : '';
      const msfBadge = cve.msfModules?.length > 0 ? ` 💀 ${cve.msfModules.length} METASPLOIT MODULE(S)` : '';
      const msfDetails = cve.msfModules?.length > 0
        ? '\n\n💀 Metasploit: ' + cve.msfModules.map(m => m.name).join(', ')
        : '';
      const content = `${cve.id} — ${cve.severity} (${cve.score})${kevBadge}${msfBadge}\nKeyword: ${cve.keyword} | Published: ${new Date(cve.published).toLocaleDateString()}\n\n${cve.description}${msfDetails}`;

      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content } }],
          icon: { type: 'emoji', emoji: cve.isKEV ? '🚨' : severityEmoji(cve.severity) }
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

  // ── Footer Divider ──
  blocks.push({ object: 'block', type: 'divider', divider: {} });

  // Notion API max 100 blocks per request — chunk if needed
  const chunkSize = 95;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    await notion.blocks.children.append({
      block_id: process.env.NOTION_PAGE_ID,
      children: chunk
    });
  }

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