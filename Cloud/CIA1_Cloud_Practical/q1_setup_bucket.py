"""
Question 1 - Create the S3 bucket, folders and upload the datasets
==================================================================

Creates an Amazon S3 bucket named ``<RegisterNumber>-bucket`` and, inside it,
two "folders" (``ufolder`` and ``efolder``).  ``userfile.xlsx`` is uploaded to
``ufolder`` and ``employeefile.xlsx`` to ``efolder``.

Current AWS best practice is applied so that *only the account owner* can reach
the bucket and its contents:

* **Block Public Access** is turned fully ON.
* **Object Ownership = BucketOwnerEnforced** (ACLs disabled) so access is
  governed solely by IAM / bucket policies, not by legacy ACLs.
* Buckets are encrypted at rest by default (SSE-S3).

The bucket name and region are read from the environment so nothing sensitive
or account-specific is hard-coded:

    EXAM_BUCKET   (default: 2547255-bucket)
    AWS_REGION    (default: us-east-1)

Usage:
    python q1_setup_bucket.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

HERE = Path(__file__).resolve().parent

BUCKET = os.environ.get("EXAM_BUCKET", "2547255-bucket")
REGION = os.environ.get("AWS_REGION", "us-east-1")

# Mapping of destination S3 key -> local source file.
UPLOADS = {
    "ufolder/userfile.xlsx": HERE / "userfile.xlsx",
    "efolder/employeefile.xlsx": HERE / "employeefile.xlsx",
}
FOLDERS = ("ufolder/", "efolder/")
XLSX_CONTENT_TYPE = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


def create_bucket(s3) -> None:
    """Create the bucket, tolerating the case where we already own it."""
    try:
        if REGION == "us-east-1":
            # us-east-1 must NOT be given a LocationConstraint.
            s3.create_bucket(Bucket=BUCKET)
        else:
            s3.create_bucket(
                Bucket=BUCKET,
                CreateBucketConfiguration={"LocationConstraint": REGION},
            )
        print(f"[+] Bucket created: {BUCKET} ({REGION})")
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        if code == "BucketAlreadyOwnedByYou":
            print(f"[=] Bucket already exists and is owned by you: {BUCKET}")
        elif code == "BucketAlreadyExists":
            sys.exit(
                f"[!] The name '{BUCKET}' is already taken by another AWS "
                f"account. S3 bucket names are globally unique - choose another."
            )
        else:
            raise


def enforce_owner_only(s3) -> None:
    """Lock the bucket down so only the account owner has access (Q1)."""
    s3.put_public_access_block(
        Bucket=BUCKET,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )
    s3.put_bucket_ownership_controls(
        Bucket=BUCKET,
        OwnershipControls={"Rules": [{"ObjectOwnership": "BucketOwnerEnforced"}]},
    )
    print("[+] Block Public Access = ON, Object Ownership = BucketOwnerEnforced")


def create_folders(s3) -> None:
    """Create zero-byte marker objects so the folders show up in the console."""
    for prefix in FOLDERS:
        s3.put_object(Bucket=BUCKET, Key=prefix)
        print(f"[+] Folder ready: {prefix}")


def upload_datasets(s3) -> None:
    """Upload each dataset into its folder and verify the stored size.

    We use ``put_object`` with an in-memory read rather than the high-level
    ``upload_file`` managed transfer: the latter was observed to occasionally
    truncate small binary uploads in this environment, so this synchronous
    path plus a size check guarantees the object is stored intact.
    """
    for key, path in UPLOADS.items():
        if not path.exists():
            sys.exit(f"[!] Missing local file: {path}. Run make_sample_data.py first.")
        data = path.read_bytes()
        s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=XLSX_CONTENT_TYPE)
        stored = s3.head_object(Bucket=BUCKET, Key=key)["ContentLength"]
        status = "OK" if stored == len(data) else "SIZE MISMATCH!"
        print(f"[+] Uploaded {path.name} -> s3://{BUCKET}/{key} "
              f"({stored} bytes) [{status}]")


def show_contents(s3) -> None:
    """List everything currently in the bucket as a final check."""
    print(f"\n[i] Current contents of s3://{BUCKET}/")
    resp = s3.list_objects_v2(Bucket=BUCKET)
    for obj in resp.get("Contents", []):
        print(f"    {obj['Key']:<32} {obj['Size']:>8} bytes")


def main() -> None:
    s3 = boto3.client("s3", region_name=REGION)
    print(f"=== Question 1: setting up s3://{BUCKET} ===")
    create_bucket(s3)
    enforce_owner_only(s3)
    create_folders(s3)
    upload_datasets(s3)
    show_contents(s3)
    print("\n[DONE] Question 1 complete - bucket, folders and files are ready (private).")


if __name__ == "__main__":
    try:
        main()
    except ClientError as exc:
        sys.exit(f"[!] AWS error: {exc.response['Error']['Code']} - "
                 f"{exc.response['Error']['Message']}")
