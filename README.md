# File Status Monitor - Deployment Guide

## Prerequisites

- Node.js and npm installed
- Git installed
- systemd-based Linux distribution (Ubuntu, Debian, CentOS, etc.)
- Sudo privileges

---

## Installation Steps

### 1. Clone the Repository

```bash
cd /var/www
sudo git clone https://github.com/junleynes/file-status-monitor.git
```

### 2. Install Dependencies and Build
```bash
cd /var/www/file-status-monitor
sudo npm install
sudo npm run build
```

### 3. Create systemd Service File
Create the service file at:
```bash
sudo nano /etc/systemd/system/file-status-monitor.service
```
```bash
[Unit]
Description=File Status Monitor Node App
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/file-status-monitor
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
User=www-data

Environment=NODE_ENV=production
Environment="DATABASE_PATH=/var/data/file-status-monitor/database.sqlite"

# Optional: add PATH if npm is not in default PATH
# Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
```

### 4. Create Data Directory
```bash
sudo mkdir -p /var/data/file-status-monitor
sudo chown -R www-data:www-data /var/data/file-status-monitor
```

### 4. Enable and Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable file-status-monitor
sudo systemctl start file-status-monitor
```

### 5. Configure Firewall (UFW)
Allow port 3007 through the firewall:
```bash
sudo ufw allow 3007/tcp
sudo ufw reload
sudo ufw status
```
### 6. Configure Apache to Listen on Port 3007 (Optional)
```bash
sudo nano /etc/apache2/ports.conf
```
Add:
```bash
Listen 3007
```

Save and exit, then restart Apache:
```bash
sudo systemctl restart apache2
```

### 7. Accessing the Application
Access the application using:
```bash
http://<SERVER_IP>:3007
```

### 8. Service Management Commands
Check Service Status
```bash
sudo systemctl status file-status-monitor
```

Stop the Service
```bash
sudo systemctl restart file-status-monitor
```

View Service Logs
```bash
sudo journalctl -u file-status-monitor -f
```




