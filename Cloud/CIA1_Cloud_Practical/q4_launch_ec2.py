"""
Q4 - Launch an Ubuntu EC2 instance running Apache (via User Data)
=================================================================

Automates the whole of Question 4 so there is no manual console work:

    1. Resolves the latest Ubuntu 24.04 LTS AMI (SSM public parameter, with a
       describe_images fallback).
    2. Creates (or reuses) a Security Group that allows inbound SSH (22) and
       HTTP (80).
    3. Creates (or reuses) an EC2 key pair and saves the private key locally
       (``cia1-exam-key.pem``) so SSH can be verified.
    4. Launches a t3.micro instance, passing ``q4_user_data.sh`` as User Data
       so Apache is installed, enabled and started automatically and a page
       with the student's Name + Register Number is served.
    5. Waits until the instance is running and prints its public IP / DNS.

Nothing sensitive is hard-coded; names default sensibly and can be overridden
through environment variables.
"""
from __future__ import annotations

import json
import os
import stat
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

HERE = Path(__file__).resolve().parent
REGION = os.environ.get("AWS_REGION", "us-east-1")

SG_NAME = os.environ.get("EXAM_SG_NAME", "cia1-exam-sg")
KEY_NAME = os.environ.get("EXAM_KEY_NAME", "cia1-exam-key")
KEY_FILE = HERE / f"{KEY_NAME}.pem"
INSTANCE_TYPE = os.environ.get("EXAM_INSTANCE_TYPE", "t3.micro")
INSTANCE_NAME = os.environ.get("EXAM_INSTANCE_NAME", "Vishwas-2547255-CIA1-WebServer")
USER_DATA_FILE = HERE / "q4_user_data.sh"
STATE_FILE = HERE / "q4_instance.json"     # small record for later reference

SSM_UBUNTU_2404 = (
    "/aws/service/canonical/ubuntu/server/24.04/stable/current/"
    "amd64/hvm/ebs-gp3/ami-id"
)


def resolve_ami(session) -> str:
    """Latest Ubuntu 24.04 LTS AMI - SSM first, describe_images as fallback."""
    try:
        val = session.client("ssm").get_parameter(Name=SSM_UBUNTU_2404)
        ami = val["Parameter"]["Value"]
        print(f"[+] Ubuntu 24.04 AMI (via SSM): {ami}")
        return ami
    except ClientError:
        ec2 = session.client("ec2")
        imgs = ec2.describe_images(
            Owners=["099720109477"],  # Canonical
            Filters=[
                {"Name": "name",
                 "Values": ["ubuntu/images/hvm-ssd*/ubuntu-*-24.04-amd64-server-*"]},
                {"Name": "state", "Values": ["available"]},
            ],
        )["Images"]
        imgs.sort(key=lambda i: i["CreationDate"], reverse=True)
        ami = imgs[0]["ImageId"]
        print(f"[+] Ubuntu 24.04 AMI (via describe_images): {ami}")
        return ami


def default_vpc_id(ec2) -> str:
    vpcs = ec2.describe_vpcs(Filters=[{"Name": "isDefault", "Values": ["true"]}])["Vpcs"]
    if not vpcs:
        sys.exit("[!] No default VPC found in this region.")
    return vpcs[0]["VpcId"]


def ensure_security_group(ec2) -> str:
    """Create the SG if missing and make sure 22 + 80 are open."""
    vpc_id = default_vpc_id(ec2)
    existing = ec2.describe_security_groups(
        Filters=[{"Name": "group-name", "Values": [SG_NAME]},
                 {"Name": "vpc-id", "Values": [vpc_id]}]
    )["SecurityGroups"]
    if existing:
        sg_id = existing[0]["GroupId"]
        print(f"[=] Reusing security group {SG_NAME} ({sg_id})")
    else:
        sg_id = ec2.create_security_group(
            GroupName=SG_NAME,
            Description="CIA-1 exam: allow SSH and HTTP",
            VpcId=vpc_id,
        )["GroupId"]
        print(f"[+] Created security group {SG_NAME} ({sg_id})")

    for port, label in ((22, "SSH"), (80, "HTTP")):
        try:
            ec2.authorize_security_group_ingress(
                GroupId=sg_id,
                IpPermissions=[{
                    "IpProtocol": "tcp", "FromPort": port, "ToPort": port,
                    "IpRanges": [{"CidrIp": "0.0.0.0/0", "Description": f"{label} access"}],
                }],
            )
            print(f"[+] Opened port {port} ({label})")
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "InvalidPermission.Duplicate":
                print(f"[=] Port {port} ({label}) already open")
            else:
                raise
    return sg_id


def ensure_key_pair(ec2) -> str:
    """Ensure a usable key pair exists and the .pem is on disk."""
    exists = ec2.describe_key_pairs(
        Filters=[{"Name": "key-name", "Values": [KEY_NAME]}]
    )["KeyPairs"]
    if exists and KEY_FILE.exists():
        print(f"[=] Reusing key pair {KEY_NAME} (pem present locally)")
        return KEY_NAME
    if exists and not KEY_FILE.exists():
        # We cannot re-download private material, so recreate the key.
        print(f"[i] Key {KEY_NAME} exists in AWS but no local .pem - recreating")
        ec2.delete_key_pair(KeyName=KEY_NAME)
    kp = ec2.create_key_pair(KeyName=KEY_NAME)
    KEY_FILE.write_text(kp["KeyMaterial"])
    try:
        KEY_FILE.chmod(stat.S_IRUSR | stat.S_IWUSR)  # 0600
    except OSError:
        pass
    print(f"[+] Created key pair {KEY_NAME}; private key -> {KEY_FILE.name}")
    return KEY_NAME


def launch(session, ami, sg_id, key_name) -> dict:
    ec2 = session.client("ec2")
    user_data = USER_DATA_FILE.read_text()
    print(f"[i] Launching {INSTANCE_TYPE} from {ami} ...")
    resp = ec2.run_instances(
        ImageId=ami,
        InstanceType=INSTANCE_TYPE,
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
        MinCount=1, MaxCount=1,
        UserData=user_data,
        TagSpecifications=[{
            "ResourceType": "instance",
            "Tags": [
                {"Key": "Name", "Value": INSTANCE_NAME},
                {"Key": "Project", "Value": "CloudComputing-CIA1"},
                {"Key": "RegisterNumber", "Value": "2547255"},
            ],
        }],
    )
    instance_id = resp["Instances"][0]["InstanceId"]
    print(f"[+] Instance launched: {instance_id} - waiting until running ...")

    ec2.get_waiter("instance_running").wait(InstanceIds=[instance_id])
    desc = ec2.describe_instances(InstanceIds=[instance_id])["Reservations"][0]["Instances"][0]
    info = {
        "InstanceId": instance_id,
        "PublicIpAddress": desc.get("PublicIpAddress"),
        "PublicDnsName": desc.get("PublicDnsName"),
        "AvailabilityZone": desc["Placement"]["AvailabilityZone"],
        "InstanceType": desc["InstanceType"],
        "KeyName": key_name,
        "SecurityGroupId": sg_id,
    }
    return info


def main() -> int:
    session = boto3.session.Session(region_name=REGION)
    ec2 = session.client("ec2")
    print(f"=== Question 4: launch Ubuntu + Apache EC2 in {REGION} ===")
    try:
        ami = resolve_ami(session)
        sg_id = ensure_security_group(ec2)
        key_name = ensure_key_pair(ec2)
        info = launch(session, ami, sg_id, key_name)
    except ClientError as exc:
        print(f"[!] AWS error: {exc.response['Error']['Code']} - "
              f"{exc.response['Error']['Message']}")
        return 1

    STATE_FILE.write_text(json.dumps(info, indent=2))
    print("\n[+] Instance is running:")
    for k, v in info.items():
        print(f"    {k:<18}: {v}")
    print(f"\n    Web page  : http://{info['PublicIpAddress']}/")
    print(f"    SSH       : ssh -i {KEY_FILE.name} ubuntu@{info['PublicIpAddress']}")
    print("\n[DONE] Question 4 launch complete. Apache boots via user-data "
          "(allow ~60-90s for the page).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
