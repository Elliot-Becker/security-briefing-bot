# 🔐 Security Briefing Bot

An autonomous security intelligence agent that runs daily, aggregating real-time CVE vulnerability data and Shodan recon results — automatically saving formatted reports to Notion.

Built with Node.js as a practical tool for staying ahead of emerging threats across enterprise technology stacks.

---

## 🚀 What It Does

Every morning at 7:00 AM, this bot automatically:

1. **Fetches HIGH & CRITICAL CVEs** from the U.S. National Vulnerability Database (NVD) for key enterprise technologies
2. **Queries Shodan** for internet-facing host exposure data on target IPs
3. **Saves a formatted briefing** to a Notion page with severity-coded callouts
4. **Exports a timestamped JSON report** locally for archiving and analysis
5. **Logs all errors** to a persistent error log for observability

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| axios | HTTP requests to NVD, Shodan, and CISA APIs |
| node-cron | Daily scheduling |
| @notionhq/client | Notion API integration |
| dotenv | Secure environment variable management |
| PM2 | Production process manager — auto-restart and boot persistence |
| AWS EC2 | 24/7 cloud deployment (t3.micro, us-east-1) |
| NVD API | CVE vulnerability data (U.S. Government) |
| Shodan API | Internet-facing host recon data |
| CISA KEV API | Known Exploited Vulnerabilities feed |

---

## 📁 Project Structure
```
security-briefing-bot/
├── index.js          # Entry point, orchestrator, scheduler
├── cve.js            # NVD API integration + severity filtering
├── shodan.js         # Shodan host lookup integration
├── notion.js         # Notion API — formats and saves briefings
├── config.js         # Centralized configuration
├── reports/          # Auto-generated JSON reports (gitignored)
├── error.log         # Runtime error log (gitignored)
├── .env              # API keys (gitignored — never committed)
└── package.json      # Dependencies
```

---

## ⚙️ Configuration

All settings are centralized in `config.js`:
```javascript
CVE_KEYWORDS: ['cisco', 'apache', 'windows', 'fortinet', 'vmware']
MIN_SEVERITY: ['HIGH', 'CRITICAL']
CVE_LOOKBACK_DAYS: 7
CRON_SCHEDULE: '0 7 * * *'  // Every day at 7:00 AM
```

Customize keywords, severity thresholds, Shodan targets, and schedule without touching core logic.

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js v22 or higher
- Free API keys from NVD, Shodan, and Notion

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/security-briefing-bot.git
cd security-briefing-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in your API keys in `.env`:
```
NVD_API_KEY=your-nvd-key
SHODAN_API_KEY=your-shodan-key
NOTION_API_KEY=your-notion-secret
NOTION_PAGE_ID=your-notion-page-id
```

### 4. Set up Notion
- Create a Notion integration at [notion.so/my-integrations](https://notion.so/my-integrations)
- Create a "Security Briefings" page and connect your integration to it
- Copy the Page ID from the page URL into your `.env`

### 5. Run the bot
```bash
node index.js
```

The bot runs immediately on start, then schedules itself for 7:00 AM daily.

---

## 📊 Sample Output

Each daily briefing in Notion includes:

**CVE Section:**
- 🔴 CRITICAL CVEs with CVSS score and full description
- 🟠 HIGH CVEs with affected keyword and published date

**Shodan Section:**
- Internet-facing hosts with open ports and owning organization

**JSON Report:**
```json
{
  "generated": "2026-03-16T07:00:00.000Z",
  "summary": {
    "total_cves": 8,
    "critical": 2,
    "high": 6,
    "shodan_hosts_checked": 3
  }
}
```

---

## 🔒 Security Notes

- All API keys stored in `.env` — never committed to version control
- `.gitignore` excludes `.env`, `error.log`, and all generated reports
- Shodan queries limited to public IPs for legitimate recon research
- NVD API used in compliance with NIST terms of service

---

## ☁️ Deployment

This bot runs 24/7 on **AWS EC2** (t3.micro, us-east-1) managed by **PM2**.

- Auto-restarts on crash via PM2
- Survives server reboots via PM2 systemd integration  
- Static Elastic IP for consistent SSH access
- SSH access restricted to known IP addresses only
- Zero-spend budget alert configured for cost monitoring

---

## 🗺️ Roadmap

- [x] Core CVE + Shodan briefing engine
- [x] Notion API integration with severity-coded callouts
- [x] CISA KEV cross-referencing
- [x] CVE deduplication across keyword searches
- [x] JSON report archiving
- [x] Error logging
- [x] AWS EC2 deployment with PM2
- [x] Static Elastic IP assignment
- [ ] Add email/Slack delivery for briefings
- [ ] Integrate CISA KEV email alerts for active exploits
- [ ] Add Metasploit module availability check per CVE
- [ ] Deploy CloudWatch monitoring and alerting
- [ ] Add CVE trend analysis across weekly reports

---

## 👤 Author

**Elliot Becker**  
Cybersecurity Student @ Austin Peay State University  
Incoming Security Intern @ World Wide Technology  
[GitHub](https://github.com/Elliot-Becker) • [LinkedIn](https://linkedin.com/in/elliotbecker)

---

*Built as part of an ongoing security automation portfolio. Feedback and contributions welcome.*