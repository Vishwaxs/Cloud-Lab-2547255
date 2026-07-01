"""
Q5 - List all running EC2 instances
===================================

Retrieves every EC2 instance in the ``running`` state and displays, for each:

    * Instance ID
    * Instance Name (from the ``Name`` tag)
    * Instance Type
    * Instance State
    * Public IPv4 Address
    * Availability Zone

The instance is filtered server-side (``instance-state-name = running``) and
results are paginated, so the program is correct even with many instances.

Usage:
    python q5_list_ec2.py
"""
from __future__ import annotations

import os
import sys

import boto3
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError

REGION = os.environ.get("AWS_REGION", "us-east-1")


def name_tag(instance: dict) -> str:
    """Return the value of the Name tag, or '-' if it has none."""
    for tag in instance.get("Tags", []):
        if tag["Key"] == "Name":
            return tag["Value"]
    return "-"


def collect_running(ec2) -> list[dict]:
    """Return a list of dicts describing every running instance."""
    rows: list[dict] = []
    paginator = ec2.get_paginator("describe_instances")
    pages = paginator.paginate(
        Filters=[{"Name": "instance-state-name", "Values": ["running"]}]
    )
    for page in pages:
        for reservation in page["Reservations"]:
            for inst in reservation["Instances"]:
                rows.append({
                    "Instance ID": inst["InstanceId"],
                    "Instance Name": name_tag(inst),
                    "Instance Type": inst["InstanceType"],
                    "Instance State": inst["State"]["Name"],
                    "Public IPv4": inst.get("PublicIpAddress", "-"),
                    "Availability Zone": inst["Placement"]["AvailabilityZone"],
                })
    return rows


def print_table(rows: list[dict]) -> None:
    if not rows:
        print("No running EC2 instances found.")
        return
    headers = ["Instance ID", "Instance Name", "Instance Type",
               "Instance State", "Public IPv4", "Availability Zone"]
    widths = {h: max(len(h), *(len(str(r[h])) for r in rows)) for h in headers}
    line = "  ".join(h.ljust(widths[h]) for h in headers)
    print(line)
    print("-" * len(line))
    for r in rows:
        print("  ".join(str(r[h]).ljust(widths[h]) for h in headers))


def main() -> int:
    ec2 = boto3.client("ec2", region_name=REGION)
    print(f"=== Question 5: running EC2 instances in {REGION} ===\n")
    try:
        rows = collect_running(ec2)
    except NoCredentialsError:
        print("[!] No AWS credentials found. Configure your AWS Academy session.")
        return 1
    except (ClientError, BotoCoreError) as exc:
        print(f"[!] AWS error: {exc}")
        return 1

    print_table(rows)
    print(f"\nTotal running instances: {len(rows)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
