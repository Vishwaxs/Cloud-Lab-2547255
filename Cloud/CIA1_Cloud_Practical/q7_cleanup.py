"""
Q7 (bonus) - Tear down every resource created for the CIA-1 practical
=====================================================================

The exam instructions say: "After evaluation is completed, terminate or delete
all created AWS resources."  This script does exactly that, safely:

    * Terminates the exam EC2 instance (read from q4_instance.json, or found by
      its Name tag).
    * Deletes the security group and key pair.
    * Empties the bucket (ALL object versions + delete markers) and deletes it.

It is guarded so it can never run by accident - you must pass --yes:

    python q7_cleanup.py --yes

NOTE: this only removes resources created for THIS exam.  The unrelated
'nexacloud-web-server' instance and older lab buckets are left untouched.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

HERE = Path(__file__).resolve().parent
REGION = os.environ.get("AWS_REGION", "us-east-1")
BUCKET = os.environ.get("EXAM_BUCKET", "2547255-bucket")
SG_NAME = os.environ.get("EXAM_SG_NAME", "cia1-exam-sg")
KEY_NAME = os.environ.get("EXAM_KEY_NAME", "cia1-exam-key")
INSTANCE_NAME = os.environ.get("EXAM_INSTANCE_NAME", "Vishwas-2547255-CIA1-WebServer")
STATE_FILE = HERE / "q4_instance.json"


def terminate_instance(ec2) -> None:
    instance_id = None
    if STATE_FILE.exists():
        instance_id = json.loads(STATE_FILE.read_text()).get("InstanceId")
    if not instance_id:
        found = ec2.describe_instances(Filters=[
            {"Name": "tag:Name", "Values": [INSTANCE_NAME]},
            {"Name": "instance-state-name", "Values": ["pending", "running", "stopping", "stopped"]},
        ])["Reservations"]
        if found:
            instance_id = found[0]["Instances"][0]["InstanceId"]
    if not instance_id:
        print("[=] No exam instance to terminate.")
        return
    ec2.terminate_instances(InstanceIds=[instance_id])
    print(f"[+] Terminating {instance_id} - waiting ...")
    ec2.get_waiter("instance_terminated").wait(InstanceIds=[instance_id])
    print("[+] Instance terminated.")


def delete_security_group(ec2) -> None:
    try:
        sgs = ec2.describe_security_groups(
            Filters=[{"Name": "group-name", "Values": [SG_NAME]}])["SecurityGroups"]
        for sg in sgs:
            ec2.delete_security_group(GroupId=sg["GroupId"])
            print(f"[+] Deleted security group {sg['GroupId']}")
    except ClientError as exc:
        print(f"[!] Could not delete SG: {exc.response['Error']['Message']}")


def delete_key_pair(ec2) -> None:
    try:
        ec2.delete_key_pair(KeyName=KEY_NAME)
        print(f"[+] Deleted key pair {KEY_NAME}")
    except ClientError as exc:
        print(f"[!] Could not delete key pair: {exc.response['Error']['Message']}")


def empty_and_delete_bucket(s3) -> None:
    try:
        paginator = s3.get_paginator("list_object_versions")
        for page in paginator.paginate(Bucket=BUCKET):
            to_delete = [{"Key": v["Key"], "VersionId": v["VersionId"]}
                         for v in page.get("Versions", [])]
            to_delete += [{"Key": m["Key"], "VersionId": m["VersionId"]}
                          for m in page.get("DeleteMarkers", [])]
            if to_delete:
                s3.delete_objects(Bucket=BUCKET, Delete={"Objects": to_delete})
        s3.delete_bucket(Bucket=BUCKET)
        print(f"[+] Emptied and deleted bucket {BUCKET}")
    except ClientError as exc:
        print(f"[!] Could not delete bucket: {exc.response['Error']['Message']}")


def main() -> int:
    if "--yes" not in sys.argv:
        print("Refusing to delete without confirmation. Re-run with --yes to proceed.")
        return 1
    session = boto3.session.Session(region_name=REGION)
    ec2, s3 = session.client("ec2"), session.client("s3")
    print("=== Cleanup: removing CIA-1 exam resources ===")
    terminate_instance(ec2)
    delete_security_group(ec2)
    delete_key_pair(ec2)
    empty_and_delete_bucket(s3)
    print("[DONE] Cleanup complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
