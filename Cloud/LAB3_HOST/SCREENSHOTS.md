# LAB-4 Screenshot Checklist

**LAB-4: MCA Cloud Computing**  
**Student:** Vishwas Vashishtha  
**Register Number:** 2547255

---

## Instructions

Take screenshots of each item listed below for your PDF report. Ensure screenshots are:
- Clear and readable
- Include browser/console window context
- Show relevant timestamps where applicable
- Saved in PNG or JPG format

---

## Part 1: EC2 Instance Launch

### 1.1 Launch Instance Configuration
**Screenshot:** EC2 Console → Launch Instance page

**What to capture:**
- Instance name: `nexacloud-web-server`
- AMI: Amazon Linux 2023 selected
- Instance type: t2.micro selected
- Key pair (if created)

**Location:** EC2 Console → Instances → Launch Instance

---

### 1.2 AMI Selection
**Screenshot:** "Application and OS Images" section

**What to capture:**
- Amazon Linux 2023 AMI highlighted
- AMI ID visible
- Architecture: x86_64

**Location:** EC2 Console → Launch Instance → Application and OS Images

---

### 1.3 Instance Type Selection
**Screenshot:** "Instance Type" section

**What to capture:**
- t2.micro selected
- Instance details visible (vCPU, Memory)
- Free tier eligible badge (if visible)

**Location:** EC2 Console → Launch Instance → Instance Type

---

### 1.4 Security Group Configuration
**Screenshot:** "Network settings" → Security Group creation

**What to capture:**
- Security group name: `nexacloud-web-sg`
- Inbound rules:
  - Type: HTTP, Port: 80, Source: 0.0.0.0/0
  - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
  - Type: SSH, Port: 22, Source: 0.0.0.0/0 (or your IP)

**Location:** EC2 Console → Launch Instance → Network settings → Edit security groups

---

### 1.5 User Data Script
**Screenshot:** "Advanced details" → User Data field

**What to capture:**
- User Data field expanded
- Script visible (at least first 10-15 lines)
- Shebang line `#!/bin/bash` visible
- Script content showing deployment steps

**Location:** EC2 Console → Launch Instance → Advanced details → User data

---

### 1.6 Launch Confirmation
**Screenshot:** Launch successful page

**What to capture:**
- "Launch Instance" button clicked
- Success message
- Instance ID displayed (if shown)

**Location:** EC2 Console → After clicking Launch Instance

---

## Part 2: Instance Running State

### 2.1 Instances List
**Screenshot:** EC2 Instances console

**What to capture:**
- Instance list showing `nexacloud-web-server`
- Instance state: "Running"
- Instance type: t2.micro
- Public IPv4 address visible

**Location:** EC2 Console → Instances

---

### 2.2 Instance Details
**Screenshot:** Instance details pane

**What to capture:**
- Instance ID
- Instance type: t2.micro
- AMI: Amazon Linux 2023
- Public IPv4 address (copy this for testing)
- Public DNS name
- State: Running
- Launch time

**Location:** EC2 Console → Instances → Select instance → Details tab

---

### 2.3 Security Group Rules
**Screenshot:** Security Group console

**What to capture:**
- Security group: `nexacloud-web-sg`
- Inbound rules showing:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
  - SSH (22) from 0.0.0.0/0

**Location:** EC2 Console → Network & Security → Security Groups → Select security group → Inbound rules

---

## Part 3: Website Verification

### 3.1 Home Page - Full View
**Screenshot:** Browser showing home page

**What to capture:**
- Full browser window
- URL bar showing: `http://<PUBLIC-IPv4>`
- Hero section visible
- Stats section visible
- Services preview visible

**Location:** Web browser → Navigate to `http://<PUBLIC-IPv4>`

---

### 3.2 Deployment Info Section
**Screenshot:** Deployment Information section

**What to capture:**
- 6 metadata cards visible:
  - Student Name: Vishwas Vashishtha
  - Register Number: 2547255
  - Deployment Timestamp: (current date/time)
  - Apache Status: Running
  - Hosting Platform: Amazon EC2
  - Deployment Method: EC2 User Data

**Location:** Web browser → Scroll to "Deployment Information" section

---

### 3.3 Deployment Log Section
**Screenshot:** Deployment Log section

**What to capture:**
- All 7 log entries visible:
  - [INIT] System initialization started
  - [PKG] Package updates completed
  - [HTTP] Apache HTTP Server installed
  - [DEPLOY] Website files deployed
  - [PERM] File permissions configured
  - [SVC] Apache service restarted
  - [DONE] Deployment completed successfully
- Success indicators (✓) visible

**Location:** Web browser → Scroll to "Deployment Log" section

---

### 3.4 Footer Information
**Screenshot:** Page footer

**What to capture:**
- Copyright notice
- Hosting information: "Hosted on Amazon EC2 — Auto-deployed via User Data"

**Location:** Web browser → Scroll to bottom of page

---

### 3.5 Browser URL
**Screenshot:** Browser address bar

**What to capture:**
- Full URL: `http://<PUBLIC-IPv4>`
- No errors in address bar
- Page title visible in tab

**Location:** Web browser → Address bar

---

## Part 4: Optional Verification (SSH)

### 4.1 SSH Connection
**Screenshot:** Terminal showing SSH connection

**What to capture:**
- SSH command: `ssh -i key.pem ec2-user@<PUBLIC-IPv4>`
- Successful connection message
- Command prompt

**Location:** Terminal/SSH client

---

### 4.2 Apache Status
**Screenshot:** Terminal showing Apache status

**What to capture:**
- Command: `sudo systemctl status httpd`
- Output showing: `active (running)`
- Loaded and enabled status

**Location:** Terminal → After SSH connection

---

### 4.3 Deployment Log File
**Screenshot:** Terminal showing deployment log

**What to capture:**
- Command: `sudo cat /var/log/ec2-deployment.log`
- Log output showing all deployment steps
- Timestamps visible

**Location:** Terminal → After SSH connection

---

### 4.4 File Listing
**Screenshot:** Terminal showing website files

**What to capture:**
- Command: `ls -la /var/www/html/`
- File listing showing:
  - index.html
  - css/ directory
  - js/ directory
  - assets/ directory
- Permissions and ownership

**Location:** Terminal → After SSH connection

---

### 4.5 Apache Version
**Screenshot:** Terminal showing Apache version

**What to capture:**
- Command: `httpd -v`
- Apache version number
- Server built information

**Location:** Terminal → After SSH connection

---

## Part 5: Additional Screenshots (Bonus)

### 5.1 CloudWatch Metrics (Optional)
**Screenshot:** CloudWatch console for EC2 instance

**What to capture:**
- CPU utilization graph
- Network in/out graphs
- Status checks

**Location:** CloudWatch Console → Metrics → EC2

---

### 5.2 System Information (Optional)
**Screenshot:** Terminal showing system info

**What to capture:**
- Command: `uname -a`
- Linux kernel version
- System architecture

**Location:** Terminal → After SSH connection

---

### 5.3 Instance Metadata (Optional)
**Screenshot:** Terminal showing instance metadata

**What to capture:**
- Commands to retrieve metadata:
  - Public IPv4
  - Public hostname
  - Instance type
  - Availability zone

**Location:** Terminal → After SSH connection

---

## Screenshot Organization

### File Naming Convention

Use descriptive filenames for easy organization:

```
Part1_LaunchInstance.png
Part1_AMISelection.png
Part1_InstanceType.png
Part1_SecurityGroup.png
Part1_UserData.png
Part1_LaunchConfirmation.png

Part2_InstancesList.png
Part2_InstanceDetails.png
Part2_SecurityGroupRules.png

Part3_HomePage.png
Part3_DeploymentInfo.png
Part3_DeploymentLog.png
Part3_Footer.png
Part3_BrowserURL.png

Part4_SSHConnection.png
Part4_ApacheStatus.png
Part4_DeploymentLog.png
Part4_FileListing.png
Part4_ApacheVersion.png
```

### PDF Report Structure

Organize screenshots in your PDF report:

1. **Title Page** - Lab details, student info
2. **Part 1: EC2 Instance Launch** - Screenshots 1.1-1.6
3. **Part 2: Instance Running State** - Screenshots 2.1-2.3
4. **Part 3: Website Verification** - Screenshots 3.1-3.5
5. **Part 4: Optional Verification** - Screenshots 4.1-4.5 (if applicable)
6. **Part 5: Additional Screenshots** - Bonus screenshots (if applicable)
7. **Conclusion** - Summary of deployment

---

## Tips for Good Screenshots

1. **Use high resolution** - 1920x1080 or higher recommended
2. **Capture full context** - Show browser/console window, not just content
3. **Avoid clutter** - Close unnecessary tabs/applications
4. **Use consistent sizing** - Same size for all screenshots
5. **Add annotations** - Highlight key areas if needed
6. **Check readability** - Ensure text is clear and not blurry
7. **Include timestamps** - Show when screenshots were taken (if relevant)

---

## Minimum Required Screenshots

For full marks, ensure you have at minimum:

- [x] Launch Instance configuration
- [x] Security Group configuration
- [x] User Data script
- [x] Instance in Running state
- [x] Home page loaded in browser
- [x] Deployment Info section
- [x] Deployment Log section
- [x] Footer with EC2 hosting info

**Total: 8 required screenshots**

---

**© 2026 NexaCloud Solutions. LAB-4: MCA Cloud Computing.**
