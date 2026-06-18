#!/bin/bash
#
# EC2 User Data Script - Automated Web Server Deployment
# LAB-4: MCA Cloud Computing
# Student: Vishwas Vashishtha
# Register Number: 2547255
#
# This script automates the deployment of the NexaCloud Solutions website
# on Amazon EC2 using Apache HTTP Server.
#

set -e  # Exit on any error

# ========================================
# DEPLOYMENT LOGGING
# ========================================
LOG_FILE="/var/log/ec2-deployment.log"
DEPLOYMENT_DIR="/var/www/html"

echo "========================================" | tee -a $LOG_FILE
echo "EC2 User Data Deployment Started" | tee -a $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE
echo "Student: Vishwas Vashishtha (2547255)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# ========================================
# STEP 1: UPDATE PACKAGES
# ========================================
echo "[INIT] Updating system packages..." | tee -a $LOG_FILE
dnf update -y >> $LOG_FILE 2>&1
echo "[SUCCESS] Package updates completed" | tee -a $LOG_FILE

# ========================================
# STEP 2: INSTALL APACHE HTTP SERVER
# ========================================
echo "[HTTP] Installing Apache HTTP Server..." | tee -a $LOG_FILE
dnf install -y httpd >> $LOG_FILE 2>&1
echo "[SUCCESS] Apache HTTP Server installed" | tee -a $LOG_FILE

# ========================================
# STEP 3: ENABLE APACHE SERVICE
# ========================================
echo "[SVC] Enabling Apache service..." | tee -a $LOG_FILE
systemctl enable httpd >> $LOG_FILE 2>&1
echo "[SUCCESS] Apache service enabled" | tee -a $LOG_FILE

# ========================================
# STEP 4: START APACHE SERVICE
# ========================================
echo "[SVC] Starting Apache service..." | tee -a $LOG_FILE
systemctl start httpd >> $LOG_FILE 2>&1
echo "[SUCCESS] Apache service started" | tee -a $LOG_FILE

# ========================================
# STEP 5: DEPLOY WEBSITE FILES
# ========================================
echo "[DEPLOY] Deploying website files to $DEPLOYMENT_DIR..." | tee -a $LOG_FILE

# Remove default Apache content
rm -rf $DEPLOYMENT_DIR/*

# Create website directory structure
mkdir -p $DEPLOYMENT_DIR/css
mkdir -p $DEPLOYMENT_DIR/js
mkdir -p $DEPLOYMENT_DIR/assets

# Note: In a real deployment, you would either:
# 1. Clone from GitHub: git clone <repo-url> /tmp/website && cp -r /tmp/website/* $DEPLOYMENT_DIR/
# 2. Download from S3: aws s3 sync s3://<bucket> $DEPLOYMENT_DIR/
# 3. Embed files in the script (for this lab, we create placeholder files)

# For this lab demonstration, we create the website files directly
# In production, replace this section with your preferred deployment method

cat > $DEPLOYMENT_DIR/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NexaCloud Solutions — Enterprise Cloud Infrastructure</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0e1a; color: #f1f5f9; line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .container { max-width: 800px; text-align: center; }
    h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 800; margin-bottom: 20px; }
    .gradient { background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .badge { display: inline-block; padding: 8px 20px; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); border-radius: 50px; font-size: 14px; font-weight: 600; color: #a78bfa; margin-bottom: 30px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 40px 0; }
    .info-card { background: #1a2035; border: 1px solid #1e2d50; border-radius: 12px; padding: 24px; }
    .info-card h3 { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }
    .info-card p { font-size: 18px; font-weight: 700; }
    .log { background: #0a0e1a; border: 1px solid #1e2d50; border-radius: 12px; padding: 24px; text-align: left; font-family: 'Courier New', monospace; font-size: 13px; margin-top: 30px; }
    .log h3 { margin-bottom: 16px; font-size: 16px; }
    .log-entry { padding: 8px 0; border-bottom: 1px solid #1e2d50; display: flex; gap: 12px; }
    .log-time { color: #3b82f6; font-weight: 600; min-width: 80px; }
    .log-success { color: #10b981; }
    .footer { margin-top: 40px; font-size: 13px; color: #64748b; }
    .footer strong { color: #6ee7b7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">☁️ AWS Certified Cloud Partner</div>
    <h1>Enterprise Cloud Infrastructure<br><span class="gradient">for the Modern Era</span></h1>
    
    <div class="info-grid">
      <div class="info-card">
        <h3>👤 Student Name</h3>
        <p>Vishwas Vashishtha</p>
      </div>
      <div class="info-card">
        <h3>🆔 Register Number</h3>
        <p>2547255</p>
      </div>
      <div class="info-card">
        <h3>📅 Deployment Time</h3>
        <p id="timestamp">Loading...</p>
      </div>
      <div class="info-card">
        <h3>🟢 Apache Status</h3>
        <p>Running</p>
      </div>
      <div class="info-card">
        <h3>☁️ Hosting Platform</h3>
        <p>Amazon EC2</p>
      </div>
      <div class="info-card">
        <h3>🚀 Deployment Method</h3>
        <p>EC2 User Data</p>
      </div>
    </div>

    <div class="log">
      <h3>📋 Deployment Log</h3>
      <div class="log-entry"><span class="log-time">[INIT]</span> <span class="log-success">✓</span> System initialization started</div>
      <div class="log-entry"><span class="log-time">[PKG]</span> <span class="log-success">✓</span> Package updates completed</div>
      <div class="log-entry"><span class="log-time">[HTTP]</span> <span class="log-success">✓</span> Apache HTTP Server installed</div>
      <div class="log-entry"><span class="log-time">[DEPLOY]</span> <span class="log-success">✓</span> Website files deployed to /var/www/html</div>
      <div class="log-entry"><span class="log-time">[PERM]</span> <span class="log-success">✓</span> File permissions configured</div>
      <div class="log-entry"><span class="log-time">[SVC]</span> <span class="log-success">✓</span> Apache service restarted</div>
      <div class="log-entry"><span class="log-time">[DONE]</span> <span class="log-success">✓</span> Deployment completed successfully</div>
    </div>

    <div class="footer">
      <p>© 2026 NexaCloud Solutions Pvt. Ltd. | Hosted on <strong>Amazon EC2</strong> — Auto-deployed via User Data</p>
    </div>
  </div>

  <script>
    document.getElementById('timestamp').textContent = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'long',
      timeZone: 'Asia/Kolkata'
    });
  </script>
</body>
</html>
EOF

echo "[SUCCESS] Website files deployed" | tee -a $LOG_FILE

# ========================================
# STEP 6: SET PROPER PERMISSIONS
# ========================================
echo "[PERM] Setting file permissions..." | tee -a $LOG_FILE
chown -R apache:apache $DEPLOYMENT_DIR
chmod -R 755 $DEPLOYMENT_DIR
echo "[SUCCESS] File permissions configured" | tee -a $LOG_FILE

# ========================================
# STEP 7: RESTART APACHE
# ========================================
echo "[SVC] Restarting Apache service..." | tee -a $LOG_FILE
systemctl restart httpd >> $LOG_FILE 2>&1
echo "[SUCCESS] Apache service restarted" | tee -a $LOG_FILE

# ========================================
# STEP 8: PRINT DEPLOYMENT SUMMARY
# ========================================
echo "========================================" | tee -a $LOG_FILE
echo "DEPLOYMENT SUMMARY" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE
echo "Apache Status:" | tee -a $LOG_FILE
systemctl status httpd | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "Apache Version:" | tee -a $LOG_FILE
httpd -v | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "System Information:" | tee -a $LOG_FILE
uname -a | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "Linux Distribution:" | tee -a $LOG_FILE
cat /etc/os-release | grep -E "^NAME=|^VERSION=" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "Instance Metadata (Public IPv4):" | tee -a $LOG_FILE
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" 2>/dev/null)
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Metadata not available" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "Instance Metadata (Public Hostname):" | tee -a $LOG_FILE
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-hostname 2>/dev/null || echo "Metadata not available" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE
echo "DEPLOYMENT COMPLETED SUCCESSFULLY" | tee -a $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE

# Make log file readable
chmod 644 $LOG_FILE

echo "Deployment log saved to: $LOG_FILE"
