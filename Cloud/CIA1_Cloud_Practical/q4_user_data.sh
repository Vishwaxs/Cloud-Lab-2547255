#!/bin/bash
###############################################################################
# Q4 - EC2 User Data (Ubuntu) : install + enable + start Apache and deploy a
#      web page showing the student's Name, Register Number and a welcome note.
#
# This exact script is passed to the instance via "User Data".  It runs once,
# as root, on first boot.  It can also be pasted directly into the EC2 console
# "User data" box when launching an Ubuntu instance manually.
###############################################################################
set -euxo pipefail
# Capture everything for troubleshooting (viewable at /var/log/user-data.log).
exec > /var/log/user-data.log 2>&1

STUDENT_NAME="Vishwas Vashishtha"
REGISTER_NUMBER="2547255"

# ----------------------------------------------------------------- install --#
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y apache2 curl

# --------------------------------------------------------- enable + start --#
systemctl enable apache2
systemctl start apache2

# ------------------------------------ instance metadata (IMDSv2, secure) ---#
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 300" || echo "")
meta() { curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
         "http://169.254.169.254/latest/meta-data/$1"; }
INSTANCE_ID=$(meta instance-id || echo "n/a")
AZ=$(meta placement/availability-zone || echo "n/a")
PUBLIC_IP=$(meta public-ipv4 || echo "n/a")

# ------------------------------------------------- deploy the web page -----#
cat > /var/www/html/index.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${STUDENT_NAME} | Cloud Computing CIA-1</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: "Segoe UI", Arial, sans-serif;
           background: linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);
           min-height:100vh; display:flex; align-items:center; justify-content:center; color:#fff; }
    .card { background:rgba(255,255,255,0.10); backdrop-filter:blur(8px);
            border:1px solid rgba(255,255,255,0.25); border-radius:18px;
            padding:48px 56px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3); max-width:640px; }
    h1 { font-size:2.1rem; margin-bottom:8px; }
    .welcome { font-size:1.15rem; opacity:0.9; margin-bottom:28px; }
    table { margin:0 auto; border-collapse:collapse; }
    td { padding:10px 18px; font-size:1.05rem; text-align:left; }
    td.k { font-weight:600; opacity:0.85; }
    .badge { display:inline-block; margin-top:26px; padding:8px 18px; border-radius:30px;
             background:#28a745; font-weight:600; letter-spacing:0.5px; }
    .meta { margin-top:22px; font-size:0.82rem; opacity:0.7; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to my Cloud Web Server</h1>
    <p class="welcome">Hosted on Amazon EC2 (Ubuntu + Apache) &mdash; Cloud Computing CIA-1</p>
    <table>
      <tr><td class="k">Student Name</td><td>${STUDENT_NAME}</td></tr>
      <tr><td class="k">Register Number</td><td>${REGISTER_NUMBER}</td></tr>
      <tr><td class="k">Course</td><td>Cloud Computing (MCA520-4)</td></tr>
    </table>
    <div class="badge">Apache is running successfully</div>
    <p class="meta">Instance ${INSTANCE_ID} &bull; AZ ${AZ} &bull; Public IP ${PUBLIC_IP}</p>
  </div>
</body>
</html>
EOF

systemctl restart apache2
echo "User-data finished OK at $(date -u)"
