"""
Q3 - Boto3 S3 operations
========================

A small, production-style Boto3 program that:

    1. Uploads ``userfile.xlsx`` into the ``ufolder`` prefix of the bucket.
    2. Lists every object currently stored in the bucket.
    3. Prints a success message once both operations complete.

Design notes
------------
* No credentials or account IDs are hard-coded - Boto3's default credential
  chain (env vars / shared config / instance role) is used, and the bucket
  name/region come from environment variables with sensible defaults.
* Every AWS call is wrapped with specific exception handling so failures are
  reported clearly instead of dumping a raw traceback.

Usage:
    python q3_s3_operations.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError

# ------------------------------------------------------------------ config -- #
BUCKET = os.environ.get("EXAM_BUCKET", "2547255-bucket")
REGION = os.environ.get("AWS_REGION", "us-east-1")

HERE = Path(__file__).resolve().parent
LOCAL_FILE = HERE / "userfile.xlsx"      # file to upload
DEST_KEY = "ufolder/userfile.xlsx"       # destination key (inside ufolder)


def upload_userfile(s3) -> None:
    """Upload userfile.xlsx into ufolder/."""
    if not LOCAL_FILE.exists():
        raise FileNotFoundError(
            f"{LOCAL_FILE.name} not found - run make_sample_data.py first."
        )
    print(f"Uploading {LOCAL_FILE.name} -> s3://{BUCKET}/{DEST_KEY} ...")
    s3.upload_file(str(LOCAL_FILE), BUCKET, DEST_KEY)
    print("  upload finished.")


def list_bucket_objects(s3) -> int:
    """Print every object in the bucket; return the object count."""
    print(f"\nObjects currently in s3://{BUCKET}/:")
    paginator = s3.get_paginator("list_objects_v2")
    count = 0
    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            print(f"  {obj['Key']:<32} {obj['Size']:>10} bytes")
            count += 1
    if count == 0:
        print("  (bucket is empty)")
    return count


def main() -> int:
    # region_name keeps the client pinned even if the env var is absent.
    s3 = boto3.client("s3", region_name=REGION)
    print(f"=== Question 3: Boto3 S3 operations on '{BUCKET}' ===")
    try:
        upload_userfile(s3)
        total = list_bucket_objects(s3)
    except FileNotFoundError as exc:
        print(f"[!] {exc}")
        return 1
    except NoCredentialsError:
        print("[!] No AWS credentials found. Configure your AWS Academy session.")
        return 1
    except ClientError as exc:
        err = exc.response["Error"]
        print(f"[!] AWS ClientError: {err['Code']} - {err['Message']}")
        return 1
    except BotoCoreError as exc:
        print(f"[!] Boto3 error: {exc}")
        return 1

    print(f"\n[SUCCESS] All S3 operations completed - {total} object(s) in the bucket.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
