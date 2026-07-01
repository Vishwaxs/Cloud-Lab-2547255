"""
Q6 - AWS resource inventory report
==================================

Generates a plain-text inventory report describing:

    * The S3 bucket  : bucket name, folder names, object names and sizes.
    * Running EC2    : instance id, name, type, state, public IPv4, AZ.

The report is written to ``aws_resource_report.txt`` and then uploaded back
into the same S3 bucket; the upload is verified with a ``head_object`` call.

Config (no secrets hard-coded):
    EXAM_BUCKET  (default: 2547255-bucket)
    AWS_REGION   (default: us-east-1)

Usage:
    python q6_inventory_report.py
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError

HERE = Path(__file__).resolve().parent
BUCKET = os.environ.get("EXAM_BUCKET", "2547255-bucket")
REGION = os.environ.get("AWS_REGION", "us-east-1")

REPORT_NAME = "aws_resource_report.txt"
REPORT_PATH = HERE / REPORT_NAME
REPORT_KEY = REPORT_NAME               # uploaded to the bucket root

SEP = "=" * 70


# --------------------------------------------------------------- gather ----- #
def gather_s3(s3) -> dict:
    """Collect folders, objects and sizes for the bucket."""
    folders = [
        cp["Prefix"]
        for cp in s3.list_objects_v2(Bucket=BUCKET, Delimiter="/").get("CommonPrefixes", [])
    ]
    objects, total = [], 0
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            objects.append({
                "Key": obj["Key"],
                "Size": obj["Size"],
                "StorageClass": obj.get("StorageClass", "STANDARD"),
                "LastModified": obj["LastModified"].strftime("%Y-%m-%d %H:%M:%S UTC"),
            })
            total += obj["Size"]
    return {"folders": folders, "objects": objects, "total_size": total}


def gather_ec2(ec2) -> list[dict]:
    rows = []
    paginator = ec2.get_paginator("describe_instances")
    for page in paginator.paginate(
        Filters=[{"Name": "instance-state-name", "Values": ["running"]}]
    ):
        for res in page["Reservations"]:
            for inst in res["Instances"]:
                name = next((t["Value"] for t in inst.get("Tags", [])
                             if t["Key"] == "Name"), "-")
                rows.append({
                    "InstanceId": inst["InstanceId"],
                    "Name": name,
                    "Type": inst["InstanceType"],
                    "State": inst["State"]["Name"],
                    "PublicIPv4": inst.get("PublicIpAddress", "-"),
                    "PrivateIPv4": inst.get("PrivateIpAddress", "-"),
                    "AvailabilityZone": inst["Placement"]["AvailabilityZone"],
                })
    return rows


# --------------------------------------------------------------- render ----- #
def build_report(account: str, s3_data: dict, ec2_rows: list[dict]) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines = [
        SEP,
        "               AWS RESOURCE INVENTORY REPORT",
        SEP,
        f"Generated : {now}",
        f"Account   : {account}",
        f"Region    : {REGION}",
        "",
        SEP,
        "[ 1. S3 BUCKET INVENTORY ]",
        SEP,
        f"Bucket Name : {BUCKET}",
        f"Folders     : {', '.join(s3_data['folders']) or '(none)'}",
        "",
        "Objects:",
        f"  {'Object Key':<34}{'Size(bytes)':>12}  {'StorageClass':<14}{'LastModified'}",
        f"  {'-'*34}{'-'*12}  {'-'*14}{'-'*23}",
    ]
    for o in s3_data["objects"]:
        lines.append(
            f"  {o['Key']:<34}{o['Size']:>12}  {o['StorageClass']:<14}{o['LastModified']}"
        )
    lines += [
        "",
        f"Total objects : {len(s3_data['objects'])}",
        f"Total size    : {s3_data['total_size']} bytes",
        "",
        SEP,
        "[ 2. RUNNING EC2 INSTANCES ]",
        SEP,
    ]
    if not ec2_rows:
        lines.append("  (no running instances)")
    for i, r in enumerate(ec2_rows, 1):
        lines += [
            f"  Instance #{i}",
            f"    Instance ID       : {r['InstanceId']}",
            f"    Instance Name     : {r['Name']}",
            f"    Instance Type     : {r['Type']}",
            f"    Instance State    : {r['State']}",
            f"    Public IPv4       : {r['PublicIPv4']}",
            f"    Private IPv4      : {r['PrivateIPv4']}",
            f"    Availability Zone : {r['AvailabilityZone']}",
            "",
        ]
    lines += [f"Total running instances : {len(ec2_rows)}", "", SEP,
              "               END OF REPORT", SEP, ""]
    return "\n".join(lines)


# --------------------------------------------------------------- upload ----- #
def upload_and_verify(s3, local_path: Path) -> None:
    s3.upload_file(
        str(local_path), BUCKET, REPORT_KEY,
        ExtraArgs={"ContentType": "text/plain"},
    )
    print(f"[+] Uploaded report -> s3://{BUCKET}/{REPORT_KEY}")
    head = s3.head_object(Bucket=BUCKET, Key=REPORT_KEY)  # raises if missing
    local_size = local_path.stat().st_size
    remote_size = head["ContentLength"]
    match = "OK" if local_size == remote_size else "SIZE MISMATCH"
    print(f"[+] Verified upload: local={local_size}B remote={remote_size}B -> {match}")


def main() -> int:
    session = boto3.session.Session(region_name=REGION)
    s3, ec2 = session.client("s3"), session.client("ec2")
    print(f"=== Question 6: inventory report for '{BUCKET}' ===")
    try:
        account = session.client("sts").get_caller_identity()["Account"]
        s3_data = gather_s3(s3)
        ec2_rows = gather_ec2(ec2)
        report = build_report(account, s3_data, ec2_rows)
        REPORT_PATH.write_text(report, encoding="utf-8")
        print(f"[+] Report written locally -> {REPORT_PATH.name}")
        upload_and_verify(s3, REPORT_PATH)
    except NoCredentialsError:
        print("[!] No AWS credentials found. Configure your AWS Academy session.")
        return 1
    except (ClientError, BotoCoreError) as exc:
        print(f"[!] AWS error: {exc}")
        return 1

    print("\n----- report preview -----")
    print(report)
    print("[DONE] Question 6 complete - report generated, uploaded and verified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
