"""
╔══════════════════════════════════════════════════════════════════════╗
║          Amazon S3 Management Portal  —  LAB 1                      ║
║          MCA Cloud Computing  |  CHRIST University                  ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import streamlit as st
import boto3
import pandas as pd
import json
from botocore.exceptions import ClientError
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────
#  PAGE CONFIGURATION  (MUST be the very first Streamlit call)
# ─────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="S3 Management Portal",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────────────────────────────────
#  CUSTOM CSS  —  AWS Orange Theme
# ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* ── Fonts ── */
    html, body, [class*="css"] {
        font-family: 'Segoe UI', 'Amazon Ember', Arial, sans-serif;
    }

    /* ── Main banner ── */
    .main-header {
        background: linear-gradient(135deg, #232F3E 0%, #FF9900 100%);
        padding: 22px 32px;
        border-radius: 14px;
        color: white;
        text-align: center;
        margin-bottom: 26px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }
    .main-header h1 { margin: 0; font-size: 2rem; letter-spacing: -0.5px; }
    .main-header p  { margin: 6px 0 0; opacity: 0.85; font-size: 0.92rem; }

    /* ── Sidebar credential guide ── */
    .cred-guide {
        background: #1a1a2e;
        border: 1px solid #FF9900;
        border-radius: 8px;
        padding: 12px 14px;
        color: #f0f0f0;
        font-size: 0.85rem;
        line-height: 1.7;
        margin-bottom: 10px;
    }

    /* ── Status badges ── */
    .badge-green  { background:#d4edda; color:#155724; padding:4px 12px;
                    border-radius:20px; font-size:0.82rem; font-weight:700; }
    .badge-red    { background:#f8d7da; color:#721c24; padding:4px 12px;
                    border-radius:20px; font-size:0.82rem; font-weight:700; }
    .badge-orange { background:#fff3cd; color:#856404; padding:4px 12px;
                    border-radius:20px; font-size:0.82rem; font-weight:700; }

    /* ── Buttons ── */
    div[data-testid="stButton"] > button {
        border-radius: 7px;
        font-weight: 600;
        transition: all 0.18s ease;
    }
    div[data-testid="stButton"] > button:first-child {
        background-color: #FF9900 !important;
        color: #232F3E !important;
        border: none !important;
    }
    div[data-testid="stButton"] > button:hover {
        background-color: #e68900 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255,153,0,0.4);
    }

    /* ── Tab bar ── */
    .stTabs [data-baseweb="tab-list"] {
        background: #f5f7fa;
        border-radius: 10px;
        padding: 4px 6px;
        gap: 4px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 7px;
        font-weight: 600;
        font-size: 0.85rem;
        color: #232F3E;
    }
    .stTabs [aria-selected="true"] {
        background: #FF9900 !important;
        color: white !important;
    }

    /* ── Alert boxes ── */
    .stAlert { border-radius: 9px; }

    /* ── Section divider ── */
    hr { border-color: #FF9900 !important; opacity: 0.3; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────
#  SESSION STATE  (persists across reruns within a session)
# ─────────────────────────────────────────────────────────────────────
_DEFAULTS = {
    'connected':    False,
    'aws_creds':    {},
    'region':       'us-east-1',
    'bucket_name':  '',
    'op_log':       [],          # operation history
}
for _k, _v in _DEFAULTS.items():
    if _k not in st.session_state:
        st.session_state[_k] = _v


# ─────────────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────────────
def get_s3():
    """Return a boto3 S3 client using stored session credentials."""
    return boto3.client('s3',
                        region_name=st.session_state.region,
                        **st.session_state.aws_creds)


def log(msg: str):
    """Append a timestamped entry to the operation log."""
    ts = datetime.now().strftime("%H:%M:%S")
    st.session_state.op_log.insert(0, f"[{ts}]  {msg}")
    st.session_state.op_log = st.session_state.op_log[:30]


def fmt_size(b: int) -> str:
    """Human-readable file size."""
    if b < 1024:
        return f"{b} B"
    if b < 1024 ** 2:
        return f"{b/1024:.1f} KB"
    return f"{b/1024**2:.2f} MB"


# ─────────────────────────────────────────────────────────────────────
#  MAIN HEADER
# ─────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="main-header">
    <h1>☁️ Amazon S3 Management Portal</h1>
    <p>Cloud Storage Operations Dashboard &nbsp;│&nbsp;
       AWS Academy Lab 1 &nbsp;│&nbsp; MCA Cloud Computing</p>
</div>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────
#  SIDEBAR  —  CREDENTIALS & ACTIVE BUCKET
# ─────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🔐 AWS Credentials")

    st.markdown("""
    <div class="cred-guide">
    <b>How to get credentials:</b><br>
    1. Open <b>AWS Academy Learner Lab</b><br>
    2. Click <b>Start Lab</b> → wait for 🟢 green dot<br>
    3. Click <b>AWS Details</b> (top of lab page)<br>
    4. Click <b>Show</b> beside <em>AWS CLI</em><br>
    5. Copy all three values into the fields below
    </div>
    """, unsafe_allow_html=True)

    access_key    = st.text_input("🔑 Access Key ID",      type="password",
                                   placeholder="ASIA…")
    secret_key    = st.text_input("🗝️ Secret Access Key",  type="password",
                                   placeholder="wJal…")
    session_token = st.text_input("🎫 Session Token",       type="password",
                                   placeholder="IQoJb3Jp…  (very long)")

    REGIONS = {
        "us-east-1":      "US East – N. Virginia  (default)",
        "us-east-2":      "US East – Ohio",
        "us-west-1":      "US West – N. California",
        "us-west-2":      "US West – Oregon",
        "ap-south-1":     "Asia Pacific – Mumbai",
        "ap-southeast-1": "Asia Pacific – Singapore",
        "eu-west-1":      "Europe – Ireland",
        "eu-central-1":   "Europe – Frankfurt",
    }
    region_code = st.selectbox(
        "🌍 AWS Region",
        options=list(REGIONS.keys()),
        format_func=lambda k: f"{k}  ({REGIONS[k]})"
    )
    st.session_state.region = region_code

    if st.button("🔗 Connect to AWS", use_container_width=True):
        if not (access_key and secret_key and session_token):
            st.warning("⚠️ Fill all three credential fields.")
        else:
            with st.spinner("Testing connection…"):
                try:
                    tmp = boto3.client('s3',
                                       aws_access_key_id=access_key,
                                       aws_secret_access_key=secret_key,
                                       aws_session_token=session_token,
                                       region_name=region_code)
                    n = len(tmp.list_buckets().get('Buckets', []))
                    st.session_state.connected  = True
                    st.session_state.aws_creds  = {
                        'aws_access_key_id':     access_key,
                        'aws_secret_access_key': secret_key,
                        'aws_session_token':     session_token,
                    }
                    st.success(f"✅ Connected!  ({n} existing buckets)")
                    log("AWS credentials verified — connected.")
                except ClientError as e:
                    code = e.response['Error']['Code']
                    ERRS = {
                        'InvalidClientTokenId': '❌ Wrong Access Key ID. Re-copy from AWS Academy.',
                        'AuthFailure':          '❌ Wrong credentials. Re-copy from AWS Academy.',
                        'ExpiredTokenException':'❌ Credentials expired. Restart the lab and copy fresh keys.',
                        'TokenRefreshRequired': '❌ Token expired. Refresh in AWS Academy.',
                    }
                    st.error(ERRS.get(code,
                             f"❌ {code}: {e.response['Error']['Message']}"))
                except Exception as e:
                    st.error(f"❌ {str(e)[:200]}")

    # Connection indicator
    if st.session_state.connected:
        st.markdown('<span class="badge-green">🟢 AWS CONNECTED</span>',
                    unsafe_allow_html=True)
    else:
        st.markdown('<span class="badge-red">🔴 NOT CONNECTED</span>',
                    unsafe_allow_html=True)

    st.divider()

    # Active bucket selector
    st.markdown("## 🪣 Active Bucket")
    bkt = st.text_input("Bucket name", value=st.session_state.bucket_name,
                         placeholder="your-bucket-name")
    if bkt:
        st.session_state.bucket_name = bkt

    if st.session_state.bucket_name:
        st.markdown(
            f'<span class="badge-orange">🎯 {st.session_state.bucket_name}</span>',
            unsafe_allow_html=True
        )

    st.divider()
    st.caption("⚠️ Credentials expire every ~4 hours in AWS Academy."
               " Reconnect if you see auth errors mid-lab.")


# ─────────────────────────────────────────────────────────────────────
#  GUARD  —  block all tabs until connected
# ─────────────────────────────────────────────────────────────────────
if not st.session_state.connected:
    st.info("👈  **Step 1:** Enter your AWS Academy credentials in the sidebar "
            "and click **Connect to AWS** to unlock all features.")

    st.markdown("""
### 📋 Quick Credential Walkthrough

| # | Where to click | What you get |
|---|----------------|-------------|
| 1 | Log in at **awsacademy.instructure.com** | Access your course |
| 2 | Open your **Learner Lab** | The lab console |
| 3 | **Start Lab** → wait for 🟢 green dot | Lab is ready |
| 4 | **AWS Details** button (top-right of lab page) | Credentials panel opens |
| 5 | Click **Show** next to *AWS CLI* | Reveals all 3 values |
| 6 | Copy `aws_access_key_id` → paste in **Access Key ID** field | — |
| 7 | Copy `aws_secret_access_key` → paste in **Secret Access Key** | — |
| 8 | Copy entire `aws_session_token` (it is very long) → paste in **Session Token** | — |
| 9 | Choose **Region** (usually `us-east-1`) | Match your lab region |
| 10 | Click **Connect to AWS** | Ready! |

> **Why all three?** Regular AWS uses two keys; Academy uses temporary keys
> that also need a *session token* for time-limited security.
    """)
    st.stop()


# ─────────────────────────────────────────────────────────────────────
#  TABS
# ─────────────────────────────────────────────────────────────────────
T1, T2, T3, T4, T5, T6, T7 = st.tabs([
    "🪣 Create Bucket",
    "📤 Upload Files",
    "🔒 Access Control",
    "⚙️ Bucket Settings",
    "📋 File Manager",
    "📊 Dashboard",
    "📚 Self Learning",
])


# ════════════════════════════════════════════════════════════════════
#  TAB 1 — CREATE BUCKET
# ════════════════════════════════════════════════════════════════════
with T1:
    st.header("🪣 Create S3 Bucket")
    left, right = st.columns([3, 2])

    with left:
        new_bkt = st.text_input(
            "Bucket Name",
            placeholder="vishwas-cloud-lab1-2026",
            help="Must be globally unique across ALL AWS accounts worldwide",
        )
        st.info("""
**Naming rules:**
- 3–63 characters, **lowercase only**
- Letters, numbers, hyphens — no underscores, no spaces
- Must start and end with a letter or number
- Adding your name + year (e.g. `vishwas-lab1-2026`) keeps it unique
        """)

        block_public = st.checkbox(
            "🔒 Block all public access (recommended for lab security)",
            value=True
        )

        if st.button("🚀 Create Bucket", use_container_width=True):
            if not new_bkt:
                st.warning("⚠️ Enter a bucket name.")
            else:
                with st.spinner(f"Creating `{new_bkt}`…"):
                    try:
                        s3 = get_s3()
                        if st.session_state.region == "us-east-1":
                            s3.create_bucket(Bucket=new_bkt)
                        else:
                            s3.create_bucket(
                                Bucket=new_bkt,
                                CreateBucketConfiguration={
                                    "LocationConstraint": st.session_state.region
                                }
                            )
                        if block_public:
                            s3.put_public_access_block(
                                Bucket=new_bkt,
                                PublicAccessBlockConfiguration={
                                    "BlockPublicAcls":       True,
                                    "IgnorePublicAcls":      True,
                                    "BlockPublicPolicy":     True,
                                    "RestrictPublicBuckets": True,
                                }
                            )
                        st.session_state.bucket_name = new_bkt
                        log(f"Created bucket: {new_bkt}  (region: {st.session_state.region})")
                        st.success(
                            f"✅ Bucket **{new_bkt}** created in "
                            f"`{st.session_state.region}`!"
                        )
                        st.balloons()

                    except ClientError as ce:
                        code = ce.response['Error']['Code']
                        msgs = {
                            "BucketAlreadyOwnedByYou": "⚠️ You already own this bucket.",
                            "BucketAlreadyExists":
                                "❌ Name is taken globally. Add your name + a number to make it unique.",
                            "InvalidBucketName":
                                "❌ Invalid name — use only lowercase letters, numbers, hyphens.",
                        }
                        st.error(msgs.get(code,
                                 f"❌ {code}: {ce.response['Error']['Message']}"))

    with right:
        st.subheader("📋 Your Existing Buckets")
        try:
            resp    = get_s3().list_buckets()
            buckets = resp.get("Buckets", [])
            if buckets:
                for b in buckets:
                    c_date = b["CreationDate"].strftime("%d %b %Y")
                    if st.button(
                        f"🪣  {b['Name']}   _(created {c_date})_",
                        key=f"sel_{b['Name']}",
                        use_container_width=True
                    ):
                        st.session_state.bucket_name = b["Name"]
                        st.rerun()
            else:
                st.info("No buckets yet — create one on the left.")
        except Exception as e:
            st.error(str(e))


# ════════════════════════════════════════════════════════════════════
#  TAB 2 — UPLOAD FILES
# ════════════════════════════════════════════════════════════════════
with T2:
    st.header("📤 Upload Files to S3")

    if not st.session_state.bucket_name:
        st.warning("⚠️ Create a bucket first (Tab 1), then set it as Active Bucket in the sidebar.")
    else:
        st.success(f"📦 Destination: **s3://{st.session_state.bucket_name}/**")

        uploaded_files = st.file_uploader(
            "Choose one or more files",
            accept_multiple_files=True,
            help="All file types accepted — images, PDFs, CSVs, ZIPs…"
        )

        col_a, col_b = st.columns(2)
        with col_a:
            prefix = st.text_input(
                "Folder Prefix (optional)",
                placeholder="images/  or  data/2024/",
                help="Creates a virtual folder inside the bucket"
            )
        with col_b:
            CLASSES = [
                ("STANDARD",            "Standard  — Frequent access (default)"),
                ("STANDARD_IA",         "Standard-IA  — Infrequent access, ~40% cheaper"),
                ("INTELLIGENT_TIERING", "Intelligent-Tiering  — Auto cost-optimize"),
                ("REDUCED_REDUNDANCY",  "Reduced Redundancy  — Legacy, less recommended"),
            ]
            sc_sel = st.selectbox(
                "Storage Class",
                options=CLASSES,
                format_func=lambda x: x[1]
            )
            sc_value = sc_sel[0]

        if uploaded_files:
            total_b = sum(f.size for f in uploaded_files)
            st.write(f"**{len(uploaded_files)} file(s) selected  |  Total: {fmt_size(total_b)}**")

            preview = pd.DataFrame([
                {"Filename": f.name, "Size": fmt_size(f.size), "MIME Type": f.type or "—"}
                for f in uploaded_files
            ])
            st.dataframe(preview, use_container_width=True, hide_index=True)

            if st.button(f"☁️ Upload {len(uploaded_files)} File(s)", use_container_width=True):
                s3 = get_s3()
                bar = st.progress(0, text="Starting upload…")
                results = []

                for i, f in enumerate(uploaded_files):
                    key = f"{prefix}{f.name}" if prefix else f.name
                    try:
                        s3.upload_fileobj(
                            f,
                            st.session_state.bucket_name,
                            key,
                            ExtraArgs={"StorageClass": sc_value}
                        )
                        results.append((f.name, "✅ Success", f"s3://{st.session_state.bucket_name}/{key}"))
                        log(f"Uploaded {key}  →  {st.session_state.bucket_name}")
                    except Exception as exc:
                        results.append((f.name, f"❌ {str(exc)[:70]}", "—"))

                    bar.progress((i + 1) / len(uploaded_files),
                                 text=f"Uploading {i+1}/{len(uploaded_files)}: {f.name}")

                bar.empty()
                res_df = pd.DataFrame(results, columns=["File", "Status", "S3 Path"])
                st.dataframe(res_df, use_container_width=True, hide_index=True)

                ok = sum(1 for r in results if "✅" in r[1])
                if ok == len(results):
                    st.success(f"🎉 All {ok} files uploaded!")
                    st.balloons()
                else:
                    st.warning(f"⚠️ {ok}/{len(results)} uploaded. Check errors above.")


# ════════════════════════════════════════════════════════════════════
#  TAB 3 — ACCESS CONTROL
# ════════════════════════════════════════════════════════════════════
with T3:
    st.header("🔒 Access Control Management")

    if not st.session_state.bucket_name:
        st.warning("⚠️ Set an Active Bucket in the sidebar.")
    else:
        bucket = st.session_state.bucket_name

        st.warning(
            "⚠️ **AWS Update (April 2023):** New buckets have ACLs **disabled by default**. "
            "Use **Method 2 — Bucket Policy** for all new buckets."
        )

        method = st.radio(
            "Choose method:",
            ["Method 1: Object ACL  (legacy — may fail on new buckets)",
             "Method 2: Bucket Policy  ✅ recommended"],
            horizontal=True
        )
        st.divider()

        # ── Method 1: ACL ──────────────────────────────────────
        if "Method 1" in method:
            st.subheader("Object-Level ACL")
            c1, c2 = st.columns(2)
            with c1:
                obj_key = st.text_input("Object Key (filename in bucket)",
                                         placeholder="report.pdf")
            with c2:
                acl = st.selectbox("Access Level",
                                   ["private", "public-read", "authenticated-read"])

            ACL_DESC = {
                "private":            "🔒 Only the bucket owner can access",
                "public-read":        "🌐 Anyone on the internet can READ (download)",
                "authenticated-read": "👥 Any AWS-authenticated user can read",
            }
            st.info(ACL_DESC[acl])

            if st.button("Apply ACL Permission"):
                try:
                    get_s3().put_object_acl(
                        Bucket=bucket, Key=obj_key, ACL=acl
                    )
                    log(f"ACL → {acl} on {obj_key}")
                    st.success(f"✅ Permission set to **{acl}** for `{obj_key}`")
                except ClientError as ce:
                    if ce.response['Error']['Code'] == 'AccessControlListNotSupported':
                        st.error(
                            "❌ This bucket has ACLs disabled (AWS default since 2023). "
                            "Switch to Method 2 below."
                        )
                    else:
                        st.error(f"❌ {ce.response['Error']['Message']}")

        # ── Method 2: Bucket Policy ────────────────────────────
        else:
            st.subheader("Bucket Policy (Recommended)")

            tpl = st.selectbox("Policy Template", [
                "Public Read — anyone can download all objects",
                "HTTPS Only — deny unencrypted HTTP access",
                "IP Restriction — allow only a specific IP address",
            ])

            if tpl.startswith("Public Read"):
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket}/*"
                    }]
                }
            elif tpl.startswith("HTTPS"):
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Sid": "DenyHTTP",
                        "Effect": "Deny",
                        "Principal": "*",
                        "Action": "s3:*",
                        "Resource": [f"arn:aws:s3:::{bucket}",
                                     f"arn:aws:s3:::{bucket}/*"],
                        "Condition": {"Bool": {"aws:SecureTransport": "false"}}
                    }]
                }
            else:
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Sid": "AllowMyIP",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket}/*",
                        "Condition": {
                            "IpAddress": {"aws:SourceIp": "YOUR.PUBLIC.IP/32"}
                        }
                    }]
                }
                st.info("✏️ Replace `YOUR.PUBLIC.IP` with your actual IP address "
                        "from https://whatismyip.com")

            st.json(policy)

            if st.button("Apply Bucket Policy", use_container_width=True):
                try:
                    s3 = get_s3()
                    if "Public Read" in tpl:
                        s3.put_public_access_block(
                            Bucket=bucket,
                            PublicAccessBlockConfiguration={
                                "BlockPublicAcls":       False,
                                "IgnorePublicAcls":      False,
                                "BlockPublicPolicy":     False,
                                "RestrictPublicBuckets": False,
                            }
                        )
                    s3.put_bucket_policy(Bucket=bucket,
                                         Policy=json.dumps(policy))
                    log(f"Bucket policy applied: {tpl}")
                    st.success(f"✅ Policy applied: **{tpl}**")
                except ClientError as ce:
                    st.error(f"❌ {ce.response['Error']['Code']}: "
                             f"{ce.response['Error']['Message']}")


# ════════════════════════════════════════════════════════════════════
#  TAB 4 — BUCKET SETTINGS
# ════════════════════════════════════════════════════════════════════
with T4:
    st.header("⚙️ Advanced Bucket Settings")

    if not st.session_state.bucket_name:
        st.warning("⚠️ Set an Active Bucket in the sidebar.")
    else:
        bucket = st.session_state.bucket_name
        col_L, col_R = st.columns(2)

        # ── LEFT COLUMN ──────────────────────────────────────────
        with col_L:
            # Versioning
            st.subheader("📌 Versioning")
            st.caption("Keeps every version of every file. Protects against accidental overwrites and deletions.")
            v_opt = st.radio("Status", ["Enable", "Suspend"],
                              horizontal=True, key="vr")
            if st.button("Apply Versioning", use_container_width=True):
                try:
                    get_s3().put_bucket_versioning(
                        Bucket=bucket,
                        VersioningConfiguration={
                            "Status": "Enabled" if v_opt == "Enable" else "Suspended"
                        }
                    )
                    log(f"Versioning {v_opt}d on {bucket}")
                    st.success(f"✅ Versioning **{v_opt}d**!")
                except Exception as e:
                    st.error(f"❌ {e}")

            st.divider()

            # Encryption
            st.subheader("🔐 Server-Side Encryption")
            st.caption("Encrypts all objects at rest — free, automatic, zero performance impact.")
            enc = st.selectbox("Algorithm", [
                ("AES256", "AES-256  (SSE-S3)  —  AWS managed, free, recommended"),
                ("aws:kms", "aws:kms  (SSE-KMS)  —  Customer-managed key (advanced)"),
            ], format_func=lambda x: x[1])
            if st.button("Enable Encryption", use_container_width=True):
                try:
                    get_s3().put_bucket_encryption(
                        Bucket=bucket,
                        ServerSideEncryptionConfiguration={
                            "Rules": [{
                                "ApplyServerSideEncryptionByDefault": {
                                    "SSEAlgorithm": enc[0]
                                },
                                "BucketKeyEnabled": True
                            }]
                        }
                    )
                    log(f"Encryption ({enc[0]}) enabled on {bucket}")
                    st.success(f"✅ **{enc[0]}** encryption enabled!")
                except Exception as e:
                    st.error(f"❌ {e}")

        # ── RIGHT COLUMN ─────────────────────────────────────────
        with col_R:
            # Lifecycle
            st.subheader("♻️ Lifecycle Policy")
            st.caption("Automatically move objects to cheaper storage or expire them — saves money on long-term data.")
            g_days = st.slider("📦 Move to Glacier after (days)", 30, 365, 30, 5)
            d_days = st.slider("🗑️ Delete objects after (days)", 60, 730, 365, 10)

            if d_days <= g_days:
                st.error("Expiry days must be greater than Glacier transition days.")
            else:
                st.info(f"Objects: STANDARD → Glacier on day **{g_days}** → deleted on day **{d_days}**")
                if st.button("Apply Lifecycle Policy", use_container_width=True):
                    try:
                        get_s3().put_bucket_lifecycle_configuration(
                            Bucket=bucket,
                            LifecycleConfiguration={
                                "Rules": [{
                                    "ID":     "AutoTierAndExpire",
                                    "Status": "Enabled",
                                    "Filter": {"Prefix": ""},
                                    "Transitions": [{
                                        "Days":         g_days,
                                        "StorageClass": "GLACIER"
                                    }],
                                    "Expiration": {"Days": d_days}
                                }]
                            }
                        )
                        log(f"Lifecycle: Glacier@{g_days}d, Delete@{d_days}d  on {bucket}")
                        st.success(
                            f"✅ Lifecycle applied — Glacier at **{g_days}d**, "
                            f"delete at **{d_days}d**"
                        )
                    except Exception as e:
                        st.error(f"❌ {e}")

            st.divider()

            # CORS
            st.subheader("🌐 CORS Configuration")
            st.caption("Allows web apps on other domains to access this bucket via browser JavaScript.")
            if st.button("Enable CORS (Web Access)", use_container_width=True):
                try:
                    get_s3().put_bucket_cors(
                        Bucket=bucket,
                        CORSConfiguration={
                            "CORSRules": [{
                                "AllowedHeaders": ["*"],
                                "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                                "AllowedOrigins": ["*"],
                                "ExposeHeaders":  ["ETag"],
                                "MaxAgeSeconds":  3000
                            }]
                        }
                    )
                    log(f"CORS enabled on {bucket}")
                    st.success("✅ CORS enabled!")
                except Exception as e:
                    st.error(f"❌ {e}")

        # Operation log
        st.divider()
        st.subheader("📜 Session Operation Log")
        if st.session_state.op_log:
            for entry in st.session_state.op_log:
                st.code(entry, language=None)
        else:
            st.caption("No operations logged yet this session.")


# ════════════════════════════════════════════════════════════════════
#  TAB 5 — FILE MANAGER
# ════════════════════════════════════════════════════════════════════
with T5:
    st.header("📋 File Manager")

    if not st.session_state.bucket_name:
        st.warning("⚠️ Set an Active Bucket in the sidebar.")
    else:
        bucket = st.session_state.bucket_name

        _, ref_col = st.columns([6, 1])
        with ref_col:
            if st.button("🔄 Refresh"):
                st.rerun()

        try:
            resp  = get_s3().list_objects_v2(Bucket=bucket)
            files = resp.get("Contents", [])

            if not files:
                st.info("🪣 Bucket is empty. Upload files in **Tab 2 — Upload Files**.")
            else:
                total = sum(f["Size"] for f in files)

                m1, m2, m3 = st.columns(3)
                m1.metric("📄 Total Objects",  len(files))
                m2.metric("💾 Total Storage",  fmt_size(total))
                m3.metric("📅 Latest Upload",
                          max(f["LastModified"] for f in files).strftime("%d %b, %H:%M"))

                df = pd.DataFrame([{
                    "📄 Key":            obj["Key"],
                    "📦 Size":           fmt_size(obj["Size"]),
                    "📅 Last Modified":  obj["LastModified"].strftime("%Y-%m-%d  %H:%M UTC"),
                    "💾 Storage Class": obj.get("StorageClass", "STANDARD"),
                } for obj in files])
                st.dataframe(df, use_container_width=True, hide_index=True)

                st.subheader("File Operations")
                sel = st.selectbox("Select file", [f["Key"] for f in files])
                c1, c2, c3 = st.columns(3)

                with c1:
                    if st.button("⬇️ Generate Download URL", use_container_width=True):
                        try:
                            url = get_s3().generate_presigned_url(
                                "get_object",
                                Params={"Bucket": bucket, "Key": sel},
                                ExpiresIn=3600
                            )
                            log(f"Presigned URL for {sel}")
                            st.success("✅ Link valid for 1 hour:")
                            st.code(url, language=None)
                        except Exception as e:
                            st.error(f"❌ {e}")

                with c2:
                    if st.button("📋 Copy S3 URI", use_container_width=True):
                        st.code(f"s3://{bucket}/{sel}", language=None)

                with c3:
                    if st.button("🗑️ Delete Object", use_container_width=True):
                        try:
                            get_s3().delete_object(Bucket=bucket, Key=sel)
                            log(f"Deleted {sel} from {bucket}")
                            st.success(f"✅ `{sel}` deleted.")
                            st.rerun()
                        except Exception as e:
                            st.error(f"❌ {e}")

        except ClientError as ce:
            st.error(f"❌ {ce.response['Error']['Code']}: {ce.response['Error']['Message']}")


# ════════════════════════════════════════════════════════════════════
#  TAB 6 — DASHBOARD
# ════════════════════════════════════════════════════════════════════
with T6:
    st.header("📊 Bucket Information Dashboard")

    if not st.session_state.bucket_name:
        st.warning("⚠️ Set an Active Bucket in the sidebar.")
    else:
        bucket = st.session_state.bucket_name
        s3     = get_s3()

        # ── Configuration Status ──────────────────────────────────
        st.subheader("🔧 Configuration Status")
        c1, c2, c3, c4 = st.columns(4)

        with c1:
            try:
                v = s3.get_bucket_versioning(Bucket=bucket)
                val = v.get("Status", "❌ Disabled")
                st.metric("📌 Versioning", val)
            except:
                st.metric("📌 Versioning", "—")

        with c2:
            try:
                e = s3.get_bucket_encryption(Bucket=bucket)
                algo = (e["ServerSideEncryptionConfiguration"]
                        ["Rules"][0]
                        ["ApplyServerSideEncryptionByDefault"]
                        ["SSEAlgorithm"])
                st.metric("🔐 Encryption", algo)
            except:
                st.metric("🔐 Encryption", "❌ Off")

        with c3:
            try:
                lc = s3.get_bucket_lifecycle_configuration(Bucket=bucket)
                st.metric("♻️ Lifecycle Rules", len(lc.get("Rules", [])))
            except:
                st.metric("♻️ Lifecycle Rules", "0")

        with c4:
            try:
                loc = s3.get_bucket_location(Bucket=bucket)
                st.metric("🌍 Region", loc["LocationConstraint"] or "us-east-1")
            except:
                st.metric("🌍 Region", st.session_state.region)

        st.divider()

        # ── Object Analytics ──────────────────────────────────────
        try:
            resp  = s3.list_objects_v2(Bucket=bucket)
            files = resp.get("Contents", [])

            if not files:
                st.info("Upload files to see analytics.")
            else:
                total_sz = sum(f["Size"] for f in files)

                st.subheader("📊 Object Statistics")
                s1, s2, s3m = st.columns(3)
                s1.metric("Total Objects", len(files))
                s2.metric("Total Storage",  fmt_size(total_sz))
                s3m.metric("Avg Object Size", fmt_size(total_sz // len(files)))

                ch1, ch2 = st.columns(2)

                with ch1:
                    st.subheader("📄 File Type Distribution")
                    exts = {}
                    for f in files:
                        ext = (f["Key"].rsplit(".", 1)[-1].upper()
                               if "." in f["Key"] else "OTHER")
                        exts[ext] = exts.get(ext, 0) + 1
                    ext_df = pd.DataFrame(
                        list(exts.items()), columns=["Extension", "Count"]
                    )
                    st.bar_chart(ext_df.set_index("Extension"))

                with ch2:
                    st.subheader("💾 Storage Class Breakdown")
                    cls_map = {}
                    for f in files:
                        c = f.get("StorageClass", "STANDARD")
                        cls_map[c] = cls_map.get(c, 0) + 1
                    cls_df = pd.DataFrame(
                        list(cls_map.items()), columns=["Storage Class", "Count"]
                    )
                    st.bar_chart(cls_df.set_index("Storage Class"))

                st.subheader("📅 Upload Timeline (Object Size Over Time)")
                tl = pd.DataFrame([
                    {"Date": f["LastModified"].strftime("%Y-%m-%d"), "Size (B)": f["Size"]}
                    for f in sorted(files, key=lambda x: x["LastModified"])
                ])
                st.line_chart(tl.set_index("Date"))

        except Exception as exc:
            st.error(f"❌ {exc}")


# ════════════════════════════════════════════════════════════════════
#  TAB 7 — SELF LEARNING
# ════════════════════════════════════════════════════════════════════
with T7:
    st.header("📚 Self-Learning Concepts")
    st.caption(
        "These topics go beyond the basic lab requirements. "
        "Add them to your report with the code snippets to score extra marks."
    )

    # ── 1. CRR ───────────────────────────────────────────────────
    with st.expander("🔄  1. Cross-Region Replication (CRR)", expanded=True):
        st.markdown("""
**What it does:** Automatically copies every object from a *source* bucket in one
AWS region to a *destination* bucket in a different region — without any manual action.

| Benefit | Real-world use |
|---------|---------------|
| 🛡️ Disaster Recovery | If `ap-south-1` (Mumbai) has an outage, data is intact in `us-east-1` |
| ⚡ Low-latency access | Serve users from the region closest to them |
| 📋 Compliance | GDPR / HIPAA regulations may require geographic data separation |

**Pre-requisites:**
- Versioning must be **Enabled** on **both** source and destination buckets
- An IAM role with replication permissions must exist

```python
s3.put_bucket_replication(
    Bucket="source-bucket-mumbai",
    ReplicationConfiguration={
        "Role": "arn:aws:iam::ACCOUNT_ID:role/S3ReplicationRole",
        "Rules": [{
            "Status": "Enabled",
            "Destination": {
                "Bucket":       "arn:aws:s3:::destination-bucket-virginia",
                "StorageClass": "STANDARD_IA"   # cheaper in destination
            }
        }]
    }
)
```
        """)

    # ── 2. Intelligent-Tiering ────────────────────────────────────
    with st.expander("🧠  2. S3 Intelligent-Tiering"):
        st.markdown("""
**What it does:** A storage class that **automatically moves objects between access
tiers** based on actual usage — no manual lifecycle rules needed.

| Tier | Activated after | Approx. savings |
|------|----------------|----------------|
| Frequent Access | Default (active) | Baseline cost |
| Infrequent Access | Not accessed for **30 days** | ~40% |
| Archive Instant | Not accessed for **90 days** | ~68% |
| Deep Archive | Not accessed for **180 days** | ~95% |

> No retrieval fees when an object moves back to Frequent Access tier.

**Best for:** Server logs, ML datasets, backups with unknown access patterns.

```python
s3.upload_file(
    "large_dataset.csv", "my-bucket", "large_dataset.csv",
    ExtraArgs={"StorageClass": "INTELLIGENT_TIERING"}
)
```
        """)

    # ── 3. Event-Driven Architecture ─────────────────────────────
    with st.expander("⚡  3. Event-Driven Architecture  (S3 + Lambda)"):
        st.markdown("""
**What it does:** S3 fires an **event notification** whenever an object is created,
deleted, or modified.  That event can automatically trigger an AWS Lambda function.

**Common pipelines:**
```
📷 Image uploaded   → S3 event → Lambda → Resize + watermark → save back to S3
📊 CSV uploaded     → S3 event → Lambda → Parse & insert into RDS / DynamoDB
🗑️ File deleted    → S3 event → Lambda → Alert via SNS email notification
🔒 Ransomware check → S3 event → Lambda → Scan file with Amazon Macie
```

```python
s3.put_bucket_notification_configuration(
    Bucket="my-bucket",
    NotificationConfiguration={
        "LambdaFunctionConfigurations": [{
            "LambdaFunctionArn": "arn:aws:lambda:us-east-1:123:function:ProcessUpload",
            "Events": ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
        }]
    }
)
```

> **Why it matters:** This is the foundation of **serverless data pipelines** —
> no always-on EC2, pay only when files arrive.
        """)

    # ── 4. Object Lock (WORM) ─────────────────────────────────────
    with st.expander("🔒  4. S3 Object Lock  (WORM Storage)"):
        st.markdown("""
**What it does:** Prevents objects from being **deleted or overwritten** for a
defined retention period — even by the root account.

**WORM = Write Once, Read Many**

| Mode | Who can override | Use case |
|------|-----------------|---------|
| Governance | Privileged IAM users only | Testing retention policies |
| Compliance | **Nobody** — not even AWS root | Finance, healthcare, legal records |

> AWS Academy lab accounts usually cannot enable Object Lock (it must be set
> at bucket creation time and requires special permissions).
> Knowing this concept earns **theory marks** and makes your report stand out.
        """)

    # ── 5. Static Website Hosting ────────────────────────────────
    with st.expander("🌐  5. S3 Static Website Hosting"):
        st.markdown("""
**What it does:** Serves HTML/CSS/JS directly from S3 — no web server, no EC2 instance.

**Cost:** Near-zero (storage + data transfer only — no compute).

```python
s3.put_bucket_website(
    Bucket="my-website-bucket",
    WebsiteConfiguration={
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key":    "404.html"}
    }
)
# Access at: http://my-website-bucket.s3-website-ap-south-1.amazonaws.com
```

**Production pattern:** Combine with **Amazon CloudFront** CDN for:
- HTTPS support
- Custom domain name
- Global edge caching (sub-50ms load times worldwide)

> This architecture powers real companies — Airbnb, Netflix static assets, etc.
        """)