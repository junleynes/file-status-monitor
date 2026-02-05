# File Status Monitor - Deployment Guide

## Prerequisites
- Node.js and npm installed
- Git installed
- Systemd-based Linux distribution (Ubuntu, Debian, CentOS, etc.)
- Sudo privileges

## Installation Steps

### 1. Clone the Repository
\`\`\`bash
cd /var/www
sudo git clone https://github.com/junleynes/file-status-monitor.git
\`\`\`

### 2. Install Dependencies and Build
\`\`\`bash
cd /var/www/file-status-monitor
sudo npm install
sudo npm run build
\`\`\`

### 3. Create Systemd Service File
Create the service file at \`/etc/systemd/system/file-status-monitor.service\`:

\`\`\`ini
[Unit]
Description=File Status Monitor Node App
After=network.target

[Service]
Environment="DATABASE_PATH=/var/data/file-status-monitor/database.sqlite"
Type=simple
WorkingDirectory=/var/www/file-status-monitor
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=www-data
Environment=NODE_ENV=production
# Optional: add PATH if npm is not in default PATH
# Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
\`\`\`

### 4. Create Data Directory
\`\`\`bash
sudo mkdir -p /var/data/file-status-monitor
sudo chown -R www-data:www-data /var/data/file-status-monitor
\`\`\`

### 5. Enable and Start the Service
\`\`\`bash
sudo systemctl enable file-status-monitor
sudo systemctl start file-status-monitor
\`\`\`

## Service Management Commands

### Check Service Status
\`\`\`bash
sudo systemctl status file-status-monitor
\`\`\`

### Stop the Service
\`\`\`bash
sudo systemctl stop file-status-monitor
\`\`\`

### Restart the Service
\`\`\`bash
sudo systemctl restart file-status-monitor
\`\`\`

### View Service Logs
\`\`\`bash
sudo journalctl -u file-status-monitor -f
\`\`\`

## File Locations
- **Application:** \`/var/www/file-status-monitor\`
- **Service Config:** \`/etc/systemd/system/file-status-monitor.service\`
- **Database:** \`/var/data/file-status-monitor/database.sqlite\`

## Notes
- The service runs as the \`www-data\` user
- Automatic restart on failure (5-second delay)
- Database path is configurable via the \`DATABASE_PATH\` environment variable
- Make sure Node.js and npm are in the PATH or adjust the \`Environment=PATH\` setting in the service file
EOF
