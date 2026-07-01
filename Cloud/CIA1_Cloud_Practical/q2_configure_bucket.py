"""
Q2 - Versioning, Lifecycle rules and controlled ("web app") access
==================================================================

Question requirements and how each is satisfied:

1. ``userfile.xlsx`` must be reachable by the web application, while
   ``employeefile.xlsx`` must return **AccessDenied**.
       -> A tightly-scoped *bucket policy* grants anonymous ``s3:GetObject`` on
          exactly one object: ``ufolder/userfile.xlsx``.  ``employeefile.xlsx``
          has no grant, so an anonymous request to it returns 403 AccessDenied.
          The account owner / IAM role still has full access to both files.

2. Enable **Versioning** for the bucket.

3. Configure **Lifecycle Rules** that move the files to cheaper storage and
   eventually delete old data.

Best-practice note (documented for the viva):
    Modern S3 blocks public access and disables ACLs by default.  Rather than
    make the whole bucket public, we keep the ACL-blocks ON and relax only the
    *policy* blocks, then expose a single object by policy.  The most secure
    production alternative is a **pre-signed URL** or **CloudFront + OAC**;
    that is described in the README.

Config (no secrets hard-coded):
    EXAM_BUCKET  (default: 2547255-bucket)
    AWS_REGION   (default: us-east-1)
"""
from __future__ import annotations

import json
import os
import sys
import time

import boto3
from botocore import UNSIGNED
from botocore.config import Config
from botocore.exceptions import ClientError

BUCKET = os.environ.get("EXAM_BUCKET", "2547255-bucket")
REGION = os.environ.get("AWS_REGION", "us-east-1")

USER_KEY = "ufolder/userfile.xlsx"
EMP_KEY = "efolder/employeefile.xlsx"


# --------------------------------------------------------------------------- #
# 1. Versioning
# --------------------------------------------------------------------------- #
def enable_versioning(s3) -> None:
    s3.put_bucket_versioning(
        Bucket=BUCKET, VersioningConfiguration={"Status": "Enabled"}
    )
    status = s3.get_bucket_versioning(Bucket=BUCKET).get("Status")
    print(f"[+] Versioning: {status}")


# --------------------------------------------------------------------------- #
# 2. Lifecycle rules (transition to lower-cost storage, then delete old data)
# --------------------------------------------------------------------------- #
def configure_lifecycle(s3) -> None:
    rules = [
        {
            "ID": "userfile-cost-optimization",
            "Filter": {"Prefix": "ufolder/"},
            "Status": "Enabled",
            "Transitions": [
                {"Days": 30, "StorageClass": "STANDARD_IA"},
                {"Days": 90, "StorageClass": "GLACIER"},
            ],
            "NoncurrentVersionExpiration": {"NoncurrentDays": 30},
            "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 7},
        },
        {
            "ID": "employeefile-cost-optimization",
            "Filter": {"Prefix": "efolder/"},
            "Status": "Enabled",
            "Transitions": [
                {"Days": 30, "StorageClass": "STANDARD_IA"},
                {"Days": 90, "StorageClass": "GLACIER"},
            ],
            # Employee data is deleted after a year to demonstrate the
            # "or delete them after a specified period" option.
            "Expiration": {"Days": 365},
            "NoncurrentVersionExpiration": {"NoncurrentDays": 30},
        },
    ]
    s3.put_bucket_lifecycle_configuration(
        Bucket=BUCKET, LifecycleConfiguration={"Rules": rules}
    )
    applied = s3.get_bucket_lifecycle_configuration(Bucket=BUCKET)["Rules"]
    print(f"[+] Lifecycle rules applied: {[r['ID'] for r in applied]}")


# --------------------------------------------------------------------------- #
# 3. Controlled access: userfile public-readable, employeefile denied
# --------------------------------------------------------------------------- #
def relax_policy_blocks(s3) -> None:
    """Allow a public *policy* but still block public *ACLs* (least privilege)."""
    s3.put_public_access_block(
        Bucket=BUCKET,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,      # keep ACLs blocked
            "IgnorePublicAcls": True,     # keep ACLs ignored
            "BlockPublicPolicy": False,   # allow our scoped policy
            "RestrictPublicBuckets": False,
        },
    )
    print("[+] Block Public Access: ACL-blocks ON, policy-blocks relaxed")


def put_scoped_policy(s3) -> None:
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadUserFileOnly",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{BUCKET}/{USER_KEY}",
            }
        ],
    }
    s3.put_bucket_policy(Bucket=BUCKET, Policy=json.dumps(policy))
    print(f"[+] Bucket policy: anonymous read allowed ONLY on {USER_KEY}")


# --------------------------------------------------------------------------- #
# Verification: prove userfile is reachable and employeefile is denied
# --------------------------------------------------------------------------- #
def object_url(key: str) -> str:
    """Public virtual-hosted URL of an object (for the browser demo / report)."""
    return f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}"


def verify_access() -> None:
    """Prove userfile is anonymously readable and employeefile is denied.

    We use an **UNSIGNED** boto3 client - it sends no AWS signature, so it is a
    genuine anonymous request (exactly what a browser / web app hitting the
    object URL does), while still going through boto3's reliable HTTP stack.
    """
    anon = boto3.client(
        "s3", region_name=REGION, config=Config(signature_version=UNSIGNED)
    )
    print("\n[i] Verifying anonymous access with an UNSIGNED S3 client...")
    print(f"    userfile URL     : {object_url(USER_KEY)}")
    print(f"    employeefile URL : {object_url(EMP_KEY)}")

    user_ok = deny_ok = False
    for attempt in range(1, 6):  # policy can take a few seconds to propagate
        try:
            body = anon.get_object(Bucket=BUCKET, Key=USER_KEY)["Body"].read()
            user_ok, user_msg = True, f"GET 200 OK ({len(body)} bytes) - reachable"
        except ClientError as exc:
            user_ok, user_msg = False, f"{exc.response['Error']['Code']} (unexpected)"
        try:
            anon.get_object(Bucket=BUCKET, Key=EMP_KEY)
            deny_ok, emp_msg = False, "GET 200 OK (UNEXPECTED - should be denied!)"
        except ClientError as exc:
            code = exc.response["Error"]["Code"]
            deny_ok = code in ("AccessDenied", "403")
            emp_msg = f"{code} - denied as required"
        print(f"    attempt {attempt}: userfile[{user_msg}]  employeefile[{emp_msg}]")
        if user_ok and deny_ok:
            break
        time.sleep(3)

    if user_ok and deny_ok:
        print("[OK] Access behaves exactly as the question requires.")
    else:
        print("[!] Access not yet as expected - the policy may need a moment; re-run.")


def main() -> int:
    s3 = boto3.client("s3", region_name=REGION)
    print(f"=== Question 2: configuring s3://{BUCKET} ===")
    try:
        enable_versioning(s3)
        configure_lifecycle(s3)
        relax_policy_blocks(s3)
        put_scoped_policy(s3)
        verify_access()
    except ClientError as exc:
        print(f"[!] AWS error: {exc.response['Error']['Code']} - "
              f"{exc.response['Error']['Message']}")
        return 1
    print("\n[DONE] Question 2 complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
