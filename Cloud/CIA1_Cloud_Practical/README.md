# Cloud Computing (MCA520-4) — CIA-1 Practical

**Student:** Vishwas Vashishtha  **Register Number:** 2547255
**Course:** Cloud Computing (MCA520-4) · CHRIST (Deemed to be University)
**AWS Account:** 555693168652 · **Region:** us-east-1

A company maintains separate datasets for **users** and **employees** in Amazon
S3. This practical builds a small, secure "document portal": controlled S3
storage, automated file operations with **Boto3**, and a simple web interface
hosted on **EC2**.

---

## Resources created (exam record)

| Resource | Identifier / Name | Notes |
|----------|-------------------|-------|
| S3 bucket | `2547255-bucket` | Private; versioning + lifecycle enabled |
| S3 folders | `ufolder/`, `efolder/` | Hold `userfile.xlsx` / `employeefile.xlsx` |
| EC2 instance | `i-0afda0693088157aa` (`Vishwas-2547255-CIA1-WebServer`) | Ubuntu 24.04, t3.micro, Apache |
| Public IP | `100.54.125.60` | Web page: `http://100.54.125.60/` |
| Security group | `cia1-exam-sg` (`sg-04b3fb2a5ecad995f`) | Inbound SSH 22 + HTTP 80 |
| Key pair | `cia1-exam-key` | Private key `cia1-exam-key.pem` (git-ignored) |
| Report object | `s3://2547255-bucket/aws_resource_report.txt` | Uploaded in Q6 |

> The AMI, IPs and instance IDs above are from the actual run; if you re-run the
> scripts you will get fresh IDs. All scripts read the bucket/region from
> environment variables and never hard-code credentials.

---

## Files in this folder

| File | Purpose |
|------|---------|
| `make_sample_data.py` | Generates `userfile.xlsx` and `employeefile.xlsx` |
| `q1_setup_bucket.py` | **Q1** — create bucket + folders, upload files (private) |
| `q2_configure_bucket.py` | **Q2** — versioning, lifecycle, scoped access policy |
| `q3_s3_operations.py` | **Q3** — upload userfile, list bucket, success message |
| `q4_user_data.sh` | **Q4** — Apache bootstrap (pasted as EC2 *User Data*) |
| `q4_launch_ec2.py` | **Q4** — launch instance, SG, key pair (automation) |
| `q5_list_ec2.py` | **Q5** — list all running EC2 instances |
| `q6_inventory_report.py` | **Q6** — build + upload `aws_resource_report.txt` |
| `q7_cleanup.py` | Bonus — safely tear down all exam resources |
| `aws_resource_report.txt` | Generated inventory report (Q6 output) |

---

## Prerequisites & setup

```bash
# 1. Python 3 + libraries
pip install boto3 openpyxl

# 2. AWS Academy credentials (from the lab's "AWS Details" panel).
#    Set them as environment variables (do NOT paste keys into code):
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_DEFAULT_REGION=us-east-1

# 3. Generate the sample spreadsheets
python make_sample_data.py

# 4. Run each question in order
python q1_setup_bucket.py
python q2_configure_bucket.py
python q3_s3_operations.py
python q4_launch_ec2.py
python q5_list_ec2.py
python q6_inventory_report.py
```

The bucket name defaults to `2547255-bucket`; override with `EXAM_BUCKET=<name>`.

---

# Question 1 — Create the S3 bucket, folders and upload datasets

### Objective
Create `2547255-bucket` containing folders `ufolder` and `efolder`, upload
`userfile.xlsx` and `employeefile.xlsx` into them, and ensure the bucket and its
contents are accessible **only to the AWS account owner**.

### Steps Performed
1. Create the bucket (`create_bucket`) — no `LocationConstraint` because the
   region is `us-east-1`.
2. Set **Object Ownership = BucketOwnerEnforced** (ACLs disabled — current AWS
   default and best practice).
3. Turn **Block Public Access** fully **ON** (all four switches) → owner-only.
4. Create folder markers `ufolder/` and `efolder/` (zero-byte keys).
5. Upload `userfile.xlsx → ufolder/` and `employeefile.xlsx → efolder/`.
6. List the bucket to confirm.

### Expected Output
```
[+] Bucket created: 2547255-bucket (us-east-1)
[+] Block Public Access = ON, Object Ownership = BucketOwnerEnforced
[+] Folder ready: ufolder/
[+] Folder ready: efolder/
[+] Uploaded userfile.xlsx -> s3://2547255-bucket/ufolder/userfile.xlsx
[+] Uploaded employeefile.xlsx -> s3://2547255-bucket/efolder/employeefile.xlsx
```

### Screenshot Checklist
- [ ] S3 console showing bucket `2547255-bucket`.
- [ ] Bucket root showing `ufolder/` and `efolder/`.
- [ ] Each folder containing its `.xlsx` file.
- [ ] **Permissions** tab: *Block all public access = On*.
- [ ] Terminal output of `q1_setup_bucket.py`.

### Common Errors
| Error | Meaning |
|-------|---------|
| `BucketAlreadyExists` | Name taken by another account — S3 names are global. |
| `BucketAlreadyOwnedByYou` | You already created it (script treats this as OK). |
| `IllegalLocationConstraintException` | Sending `LocationConstraint` in us-east-1. |
| `ExpiredToken` | AWS Academy session expired — refresh credentials. |

### Troubleshooting
- Names must be lowercase, 3–63 chars, globally unique.
- If credentials expired, copy fresh keys from the lab and re-export them.

### Viva Questions
1. **Does S3 really have folders?** No — keys are flat; a `/` in the key name
   and a zero-byte "folder marker" make the console *display* a folder.
2. **What is BucketOwnerEnforced?** Object Ownership setting that disables ACLs
   so access is controlled only by IAM/bucket policies — the recommended default.
3. **What does Block Public Access do?** Overrides any ACL/policy that would make
   the bucket public; the top-level guard for accidental exposure.
4. **Why is the bucket private by default?** Since 2023 AWS enables BPA and
   disables ACLs on all new buckets.

---

# Question 2 — Versioning, Lifecycle & controlled ("web app") access

### Objective
Make `userfile.xlsx` reachable by a web application while `employeefile.xlsx`
returns **AccessDenied**; enable **Versioning**; configure **Lifecycle Rules**.

### Steps Performed
1. **Versioning** → `put_bucket_versioning(Status=Enabled)`.
2. **Lifecycle** → two rules:
   - `ufolder/` : transition to *Standard-IA* @30d, *Glacier* @90d.
   - `efolder/` : same transitions **plus** expire (delete) @365d.
   - Both expire non-current versions after 30 days.
3. **Access** → keep BPA's *ACL* blocks ON, relax only the *policy* blocks, then
   attach a bucket policy granting anonymous `s3:GetObject` on **only**
   `ufolder/userfile.xlsx`.

### Best-practice note (important for the viva)
Modern S3 blocks public access and disables ACLs by default, which *conflicts*
with the classic "make the file public" instruction. Instead of exposing the
whole bucket we expose **one object** by a tightly-scoped policy, keeping the ACL
blocks on. The most secure production alternatives are **pre-signed URLs** (time
limited, generated by the app) or **CloudFront + Origin Access Control**. The
scoped-policy approach was chosen because it satisfies the examiner's visible
requirement (open userfile URL → works; employeefile URL → AccessDenied) with the
least exposure.

### Expected Output
```
[+] Versioning: Enabled
[+] Lifecycle rules applied: ['userfile-cost-optimization', 'employeefile-cost-optimization']
[+] Bucket policy: anonymous read allowed ONLY on ufolder/userfile.xlsx
    GET .../ufolder/userfile.xlsx      -> HTTP 200 (OK - reachable by web app)
    GET .../efolder/employeefile.xlsx  -> HTTP 403 (AccessDenied as required)
```

### Screenshot Checklist
- [ ] **Properties → Bucket Versioning = Enabled**.
- [ ] **Management → Lifecycle rules** (both rules listed).
- [ ] **Permissions → Bucket policy** (the scoped `PublicReadUserFileOnly`).
- [ ] Browser: `userfile.xlsx` URL downloads the file (HTTP 200).
- [ ] Browser: `employeefile.xlsx` URL shows the **AccessDenied** XML (HTTP 403).

### Common Errors
| Error | Meaning |
|-------|---------|
| `AccessDenied` on `put_bucket_policy` | BPA policy-blocks still ON — relax them first. |
| Public policy has no effect | `RestrictPublicBuckets` still true. |
| Lifecycle `MalformedXML` | Missing `Filter` on a v2 rule. |

### Troubleshooting
- Public policy can take a few seconds to propagate — the script retries.
- Employee file *should* stay denied; that is the correct, expected behaviour.

### Viva Questions
1. **What is versioning?** Keeps every version of an object so overwrites/deletes
   are recoverable (delete just adds a *delete marker*).
2. **Why lifecycle rules?** Automatically move cold data to cheaper storage
   (Standard-IA, Glacier) and delete stale data → cost optimisation.
3. **How is one object made public without the whole bucket?** A bucket policy
   `Allow s3:GetObject Principal:* Resource: .../userfile.xlsx` — single ARN.
4. **Why does employeefile return AccessDenied?** No policy grants anonymous
   access to it, and BPA/default-deny apply → 403 for anonymous requests.
5. **Safer alternative to public objects?** Pre-signed URLs or CloudFront+OAC.

---

# Question 3 — Boto3 S3 operations

### Objective
A Boto3 program that uploads `userfile.xlsx` into `ufolder`, lists all objects in
the bucket, and prints a success message.

### Steps Performed
1. Build an S3 client from the default credential chain (no keys in code).
2. `upload_file(userfile.xlsx → ufolder/userfile.xlsx)`.
3. Paginated `list_objects_v2` over the bucket.
4. Print a success line with the object count. All calls wrapped in specific
   exception handlers (`NoCredentialsError`, `ClientError`, `BotoCoreError`).

### Expected Output
```
Uploading userfile.xlsx -> s3://2547255-bucket/ufolder/userfile.xlsx ...
  upload finished.
Objects currently in s3://2547255-bucket/:
  ufolder/userfile.xlsx                  5184 bytes
  ...
[SUCCESS] All S3 operations completed - 4 object(s) in the bucket.
```

### Screenshot Checklist
- [ ] Terminal output showing the upload + object listing + `[SUCCESS]`.
- [ ] S3 console `ufolder/` showing the object timestamp updated.

### Common Errors
| Error | Meaning |
|-------|---------|
| `NoCredentialsError` | Env vars not set / session expired. |
| `FileNotFoundError` | Run `make_sample_data.py` first. |
| `NoSuchBucket` | Run Q1 first / wrong `EXAM_BUCKET`. |

### Troubleshooting
- `python -c "import boto3;print(boto3.__version__)"` to confirm the library.
- Ensure the working directory contains `userfile.xlsx`.

### Viva Questions
1. **client vs resource in Boto3?** `client` = thin, 1:1 API calls; `resource` =
   higher-level object-oriented wrapper.
2. **Why paginate?** `list_objects_v2` returns at most 1000 keys per call; the
   paginator loops through all pages automatically.
3. **Where does Boto3 find credentials?** Env vars → shared config/creds file →
   IAM role — the "default credential chain".
4. **upload_file vs put_object?** `upload_file` handles large files with
   automatic multipart; `put_object` is a single call for in-memory bytes.

---

# Question 4 — Launch Ubuntu EC2 with Apache (User Data)

### Objective
Launch an Ubuntu EC2 instance; configure a security group for **SSH (22)** and
**HTTP (80)**; use **User Data** to install/enable/start Apache and host a page
showing the student's **Name + Register Number + welcome message**; verify SSH
and the web page.

### Steps Performed
1. Resolve the latest **Ubuntu 24.04 LTS** AMI via the Canonical SSM public
   parameter (`ami-0a02a779008fa3b99`).
2. Create security group `cia1-exam-sg` and open ports 22 + 80.
3. Create key pair `cia1-exam-key`, save `cia1-exam-key.pem` locally (0600).
4. `run_instances` (t3.micro) with `q4_user_data.sh` as User Data — it runs at
   first boot: `apt-get install apache2`, `systemctl enable/start apache2`, and
   writes `/var/www/html/index.html` (Name, Reg No, welcome + IMDSv2 metadata).
5. Wait for `running`; print public IP/DNS.
6. **Verify:** `curl http://<public-ip>/` → HTTP 200 with the name/reg;
   `ssh -i cia1-exam-key.pem ubuntu@<public-ip>` → shell + `apache2 active`.

### Expected Output
```
[+] Ubuntu 24.04 AMI (via SSM): ami-0a02a779008fa3b99
[+] Created security group cia1-exam-sg (sg-...)
[+] Opened port 22 (SSH) / port 80 (HTTP)
[+] Instance launched: i-0afda0693088157aa
    Web page  : http://100.54.125.60/
    SSH       : ssh -i cia1-exam-key.pem ubuntu@100.54.125.60
```
Web page verification returns **HTTP 200** and contains `Vishwas Vashishtha`,
`2547255` and "Apache is running successfully". SSH returns
`Ubuntu 24.04.4 LTS` and `apache: active`.

### Screenshot Checklist
- [ ] EC2 console — instance `running`, type `t3.micro`, Ubuntu.
- [ ] Security group inbound rules: SSH 22 + HTTP 80.
- [ ] Browser at `http://<public-ip>/` showing Name + Register Number.
- [ ] Terminal SSH session (`ssh -i cia1-exam-key.pem ubuntu@<ip>`).
- [ ] `systemctl status apache2` showing **active (running)**.

### Common Errors
| Error | Meaning |
|-------|---------|
| SSH `Permission denied (publickey)` | Wrong key / user is `ubuntu`, not `ec2-user`. |
| SSH `UNPROTECTED PRIVATE KEY FILE` | `.pem` too open — `chmod 400` (Linux) / `icacls` (Windows). |
| Web page not loading | HTTP 80 not open, or user-data still running (~1–2 min). |
| `connection timed out` | Security group / no public IP / instance not running. |

### Troubleshooting
- User-data log on the instance: `sudo cat /var/log/user-data.log`.
- `sudo systemctl status apache2`; restart with `sudo systemctl restart apache2`.
- Windows SSH key perms:
  `icacls cia1-exam-key.pem /inheritance:r /grant:r "%USERNAME%:R"`.

### Viva Questions
1. **What is User Data?** A script the instance runs **once at first boot** (as
   root) via cloud-init — used for bootstrap automation.
2. **Default SSH user for Ubuntu AMIs?** `ubuntu` (Amazon Linux uses `ec2-user`).
3. **Why open only 22 and 80?** Least privilege — only the ports the service
   needs (SSH management + HTTP web).
4. **What is a security group?** A stateful virtual firewall at the instance
   (ENI) level; return traffic is automatically allowed.
5. **What is IMDSv2?** Token-based Instance Metadata Service (v2) — more secure
   than v1; the page fetches its own instance-id/AZ through it.
6. **AMI vs instance?** AMI = template image; instance = a running VM from it.

---

# Question 5 — List all running EC2 instances

### Objective
A Boto3 program that retrieves every **running** EC2 instance and displays
Instance ID, Name, Type, State, Public IPv4 and Availability Zone.

### Steps Performed
1. `describe_instances` filtered server-side by
   `instance-state-name = running` (paginated).
2. Extract the `Name` tag (default `-`) and required fields.
3. Print an aligned table + a total count.

### Expected Output
```
Instance ID          Instance Name                   Instance Type  State    Public IPv4     AZ
i-05aaf1765971be1b3  nexacloud-web-server            t3.micro       running  54.196.220.168  us-east-1b
i-0afda0693088157aa  Vishwas-2547255-CIA1-WebServer  t3.micro       running  100.54.125.60   us-east-1d
Total running instances: 2
```

### Screenshot Checklist
- [ ] Terminal table listing the running instance(s).
- [ ] EC2 console side-by-side showing the same instance IDs/IPs.

### Common Errors
| Error | Meaning |
|-------|---------|
| Empty list | No instances running, or wrong region. |
| `UnauthorizedOperation` | IAM role lacks `ec2:DescribeInstances`. |
| Public IPv4 shows `-` | Instance has no public IP (private subnet / stopped). |

### Troubleshooting
- Confirm region: `echo $AWS_DEFAULT_REGION` (must be `us-east-1`).
- A stopped instance is excluded on purpose (filter is `running`).

### Viva Questions
1. **Why filter by state server-side?** Efficiency — AWS returns only matching
   instances instead of filtering client-side.
2. **How is the instance Name obtained?** From the `Name` **tag**, not a native
   attribute — instances have no built-in name.
3. **Reservation vs instance?** A reservation is one `run_instances` call and can
   contain multiple instances; you iterate `Reservations → Instances`.

---

# Question 6 — AWS resource inventory report

### Objective
Generate a report of the bucket (name, folders, objects, sizes) and running EC2
details, save it as `aws_resource_report.txt`, upload it to the same bucket and
verify the upload.

### Steps Performed
1. S3: `list_objects_v2` (+`Delimiter='/'` for folders) → keys, sizes, storage
   class; sum total size.
2. EC2: running-instance details (as Q5, plus private IP).
3. Render a formatted text report (account, region, timestamp).
4. Write `aws_resource_report.txt`, upload to the bucket, then `head_object` to
   verify local size == remote size.

### Expected Output
```
[+] Report written locally -> aws_resource_report.txt
[+] Uploaded report -> s3://2547255-bucket/aws_resource_report.txt
[+] Verified upload: local=2068B remote=2068B -> OK
```
(See `aws_resource_report.txt` for the full report body.)

### Screenshot Checklist
- [ ] Terminal output ending in `... -> OK` (verified upload).
- [ ] `aws_resource_report.txt` open in an editor.
- [ ] S3 console showing `aws_resource_report.txt` in the bucket.

### Common Errors
| Error | Meaning |
|-------|---------|
| `NoSuchBucket` | Run Q1 first / wrong `EXAM_BUCKET`. |
| `head_object` 404 after upload | Upload failed — check IAM `s3:PutObject`. |
| Size mismatch | Partial upload — re-run. |

### Troubleshooting
- Re-run any time; the report reflects the current live state.
- Verify manually: `aws s3 ls s3://2547255-bucket/` (or the S3 console).

### Viva Questions
1. **How do you verify an upload in code?** `head_object` (or `list_objects_v2`)
   and compare `ContentLength` / ETag with the local file.
2. **What is ETag?** An object's entity tag — the MD5 for single-part uploads;
   useful for integrity checks.
3. **How are folders derived?** `list_objects_v2(Delimiter='/')` returns
   `CommonPrefixes` — the "folders".

---

## Cleanup (after evaluation)

The exam says to terminate/delete all created resources afterwards:

```bash
python q7_cleanup.py --yes   # terminates the EC2 instance, deletes SG,
                             # key pair, and empties + deletes the bucket
```
This removes only the CIA-1 resources; unrelated instances/buckets are untouched.

## AWS best practices applied (self-learning)
- **Least privilege** SG (only 22 + 80) and a **single-object** public policy.
- **Block Public Access** left as ON as possible; ACLs disabled
  (BucketOwnerEnforced).
- **Versioning + Lifecycle** for recoverability and cost control.
- **IMDSv2** (token-based metadata) used inside the web page bootstrap.
- **No hard-coded credentials** — Boto3 default credential chain + env vars.
- **Idempotent** scripts (safe to re-run) with specific exception handling.
