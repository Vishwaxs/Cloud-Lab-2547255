# EC2 User Data Deployment Guide

**LAB-4: MCA Cloud Computing**  
**Student:** Vishwas Vashishtha  
**Register Number:** 2547255

---

## Objective

Automate the deployment of a static website on Amazon EC2 using User Data scripts, eliminating manual SSH access and configuration steps.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Cloud                                │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   EC2 Instance│      │ Security Group│                   │
│  │  (t2.micro)   │◄─────│  HTTP (80)    │                   │
│  │  Amazon Linux │      │  HTTPS (443)  │                   │
│  │      2023     │      │  SSH (22)     │                   │
│  │              │      └──────────────┘                    │
│  │  ┌────────┐  │                                        │
│  │  │ Apache │  │                                        │
│  │  │ HTTPD  │  │                                        │
│  │  └───┬────┘  │                                        │
│  │      │       │                                        │
│  │  ┌───▼────┐  │                                        │
│  │  │ /var/   │  │                                        │
│  │  │ www/    │  │                                        │
│  │  │ html/   │  │                                        │
│  │  │ index   │  │                                        │
│  │  └─────────┘  │                                        │
│  └──────────────┘                                        │
│           │                                                │
│           ▼                                                │
│  ┌──────────────┐                                         │
│  │   Internet   │                                         │
│  │   Browser    │                                         │
│  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────┘

User Data Script (executed at first boot):
1. Update packages
2. Install Apache
3. Enable & Start Apache
4. Deploy website files
5. Set permissions
6. Restart Apache
7. Log deployment details
```

---

## Prerequisites

- **AWS Academy account** with active lab session
- **Basic understanding** of EC2 instances
- **user-data.sh script** (provided in this repository)
- **Security Group** with HTTP (80), HTTPS (443), SSH (22) open

---

## Deployment Steps

### Step 1: Launch EC2 Instance

1. Navigate to **EC2 Console** → **Instances** → **Launch Instance**
2. **Name:** `nexacloud-web-server`
3. **AMI:** Amazon Linux 2023 (HVM)
4. **Instance Type:** t2.micro
5. **Key Pair:** Create or select (optional, for SSH access)

### Step 2: Configure Network

1. **Network:** Default VPC
2. **Subnet:** Default subnet (any availability zone)
3. **Auto-assign Public IP:** Enable
4. **Firewall (Security Group):** Create new security group
   - **HTTP (80):** Allow from 0.0.0.0/0
   - **HTTPS (443):** Allow from 0.0.0.0/0
   - **SSH (22):** Allow from 0.0.0.0/0 (or your IP for security)

### Step 3: Configure User Data

1. Scroll to **Advanced Details** section
2. Expand **User Data** field
3. Copy the entire contents of `user-data.sh` from this repository
4. Paste into the User Data field
5. Ensure the script starts with `#!/bin/bash`

### Step 4: Launch Instance

1. Review instance configuration
2. Click **Launch Instance**
3. Wait for instance to enter **Running** state (~2-3 minutes)
4. Note the **Public IPv4 address**

### Step 5: Verify Deployment

1. Open browser and navigate to: `http://<PUBLIC-IPv4>`
2. Verify the website loads correctly
3. Check the deployment information section displays:
   - Student Name: Vishwas Vashishtha
   - Register Number: 2547255
   - Deployment Timestamp: Current date/time
   - Apache Status: Running
   - Hosting Platform: Amazon EC2
   - Deployment Method: EC2 User Data

### Step 6: Verify Apache Status (Optional SSH)

If you need to verify the deployment manually:

```bash
# SSH into the instance
ssh -i your-key.pem ec2-user@<PUBLIC-IPv4>

# Check Apache status
sudo systemctl status httpd

# View deployment log
sudo cat /var/log/ec2-deployment.log

# Check website files
ls -la /var/www/html/
```

---

## Expected Output

### Website Display

The website should display:
- **Hero Section:** "Enterprise Cloud Infrastructure for the Modern Era"
- **Deployment Info Section:** 6 cards showing system metadata
- **Deployment Log:** 7-step deployment log with success indicators
- **Footer:** "Hosted on Amazon EC2 — Auto-deployed via User Data"

### Deployment Log

The `/var/log/ec2-deployment.log` file should show:

```
========================================
EC2 User Data Deployment Started
Timestamp: [current date/time]
Student: Vishwas Vashishtha (2547255)
========================================
[INIT] Updating system packages...
[SUCCESS] Package updates completed
[HTTP] Installing Apache HTTP Server...
[SUCCESS] Apache HTTP Server installed
[SVC] Enabling Apache service...
[SUCCESS] Apache service enabled
[SVC] Starting Apache service...
[SUCCESS] Apache service started
[DEPLOY] Deploying website files to /var/www/html...
[SUCCESS] Website files deployed
[PERM] Setting file permissions...
[SUCCESS] File permissions configured
[SVC] Restarting Apache service...
[SUCCESS] Apache service restarted
========================================
DEPLOYMENT SUMMARY
========================================
Apache Status: active (running)
Apache Version: Apache/2.4.x
System Information: Linux kernel details
Linux Distribution: Amazon Linux 2023
Instance Metadata (Public IPv4): [IP address]
Instance Metadata (Public Hostname): [hostname]
========================================
DEPLOYMENT COMPLETED SUCCESSFULLY
========================================
```

---

## Screenshot Checklist

For your PDF report, take screenshots of:

### EC2 Launch Screenshots
- [ ] **Launch Instance** page with configuration
- [ ] **AMI Selection** showing Amazon Linux 2023
- [ ] **Instance Type** showing t2.micro
- [ ] **Security Group** configuration (HTTP 80, HTTPS 443, SSH 22)
- [ ] **User Data** field with the script pasted
- [ ] **Launch confirmation** page

### Instance Running Screenshots
- [ ] **Instances list** showing instance in "Running" state
- [ ] **Instance details** showing Public IPv4 address
- [ ] **Security Group** rules in the console

### Website Screenshots
- [ ] **Home page** loaded in browser (full page)
- [ ] **Deployment Info section** with all 6 metadata cards
- [ ] **Deployment Log** section showing 7 steps
- [ ] **Footer** showing EC2 hosting information
- [ ] **Browser URL** showing the public IP address

### Verification Screenshots (Optional)
- [ ] **SSH terminal** showing Apache status command
- [ ] **Deployment log** file content
- [ ] **File listing** of /var/www/html/

---

## Troubleshooting

### Issue: Website not accessible

**Possible Causes:**
1. Security Group not allowing HTTP (80)
2. Instance not in Running state
3. Apache not started

**Solutions:**
- Verify Security Group allows HTTP from 0.0.0.0/0
- Check instance state in EC2 console
- SSH into instance and run: `sudo systemctl status httpd`

### Issue: 403 Forbidden

**Possible Causes:**
1. File permissions incorrect
2. Apache configuration issue

**Solutions:**
```bash
sudo chown -R apache:apache /var/www/html
sudo chmod -R 755 /var/www/html
sudo systemctl restart httpd
```

### Issue: User Data script not executed

**Possible Causes:**
1. Script not starting with `#!/bin/bash`
2. Script has Windows line endings (CRLF)

**Solutions:**
- Ensure script starts with shebang line
- Convert line endings to Unix format (LF)
- Check cloud-init logs: `/var/log/cloud-init-output.log`

### Issue: Apache fails to start

**Possible Causes:**
1. Port 80 already in use
2. Configuration syntax error

**Solutions:**
```bash
sudo systemctl restart httpd
sudo httpd -t  # Test configuration
sudo journalctl -u httpd  # View logs
```

---

## Self-Learning Concepts

### Infrastructure as Code (IaC)

**Definition:** Managing infrastructure through machine-readable definition files rather than manual configuration.

**Why it matters:** 
- Reproducible deployments
- Version control for infrastructure
- Reduced human error
- Faster provisioning

**Real-world use case:** Terraform configurations that define entire AWS environments including VPCs, EC2, RDS, and networking.

### EC2 User Data

**Definition:** A script that runs automatically when an EC2 instance launches for the first time.

**Why it matters:**
- Zero-touch provisioning
- Automated configuration
- Consistent deployments across instances

**Limitations:**
- Only runs on first boot (unless configured otherwise)
- Limited to 16 KB
- Not suitable for complex multi-step deployments

### Launch Templates

**Definition:** Pre-defined configuration for launching EC2 instances, including AMI, instance type, security groups, and User Data.

**Why it matters:**
- Consistent instance configuration
- Used with Auto Scaling Groups
- Version control for instance configurations

**Real-world use case:** Auto Scaling Groups that automatically scale web servers based on traffic, all using the same launch template.

### Auto Scaling Groups

**Definition:** A collection of EC2 instances that automatically scale in or out based on defined conditions.

**Why it matters:**
- Handles traffic spikes automatically
- Cost optimization (scale down when idle)
- High availability across multiple AZs

**Real-world use case:** E-commerce website that scales from 2 to 20 servers during Black Friday sales.

### Application Load Balancer

**Definition:** A load balancer that distributes incoming application traffic across multiple targets in multiple Availability Zones.

**Why it matters:**
- High availability
- SSL termination
- Path-based routing
- Health checks

**Real-world use case:** Distributing traffic across 10 web servers, routing /api to backend servers and /static to S3.

### CloudWatch Monitoring

**Definition:** AWS service for monitoring resources and applications in the AWS Cloud.

**Why it matters:**
- Real-time metrics
- Alarms and notifications
- Log aggregation
- Performance insights

**Real-world use case:** Setting up CPU utilization alarms that trigger Auto Scaling or send alerts to operations teams.

### Systemd Services

**Definition:** System and service manager for Linux, responsible for starting services at boot and managing them during runtime.

**Why it matters:**
- Automatic service startup
- Dependency management
- Service health monitoring
- Log management

**Real-world use case:** Apache, Nginx, Docker, and custom application services all managed through systemd for reliable startup and monitoring.

---

## Conclusion

This lab demonstrates the power of EC2 User Data for automated web server deployment. By embedding the deployment script in the instance configuration, we eliminate manual SSH access and ensure consistent, repeatable deployments. This approach is foundational to modern DevOps practices and Infrastructure as Code methodologies.

The deployment pipeline demonstrated here can be extended with:
- Launch Templates for versioned instance configurations
- Auto Scaling Groups for automatic scaling
- Application Load Balancers for high availability
- CloudWatch for monitoring and alerting

This represents a production-ready approach to deploying web applications on AWS.

---

**© 2026 NexaCloud Solutions. LAB-4: MCA Cloud Computing.**
