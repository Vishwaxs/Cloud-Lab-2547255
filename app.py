import streamlit as st
import boto3
import pandas as pd
from botocore.exceptions import ClientError

# -------------------------
# PAGE CONFIG
# -------------------------

st.set_page_config(
    page_title="Amazon S3 Management Portal",
    page_icon="☁️",
    layout="wide"
)

st.title("☁️ Amazon S3 Management Portal")
st.markdown("Cloud Computing Lab 1 - MCA520-4")

# -------------------------
# SIDEBAR
# -------------------------

st.sidebar.header("AWS Credentials")

access_key = st.sidebar.text_input(
    "Access Key ID",
    type="password"
)

secret_key = st.sidebar.text_input(
    "Secret Access Key",
    type="password"
)

session_token = st.sidebar.text_area(
    "Session Token"
)

region = st.sidebar.selectbox(
    "Region",
    [
        "ap-south-1",
        "us-east-1",
        "us-west-2"
    ]
)

# -------------------------
# AWS CLIENT
# -------------------------

s3 = None

if access_key and secret_key and session_token:

    try:

        s3 = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            aws_session_token=session_token,
            region_name=region
        )

        st.sidebar.success("AWS Connected")

    except Exception as e:
        st.sidebar.error(str(e))

# -------------------------
# STOP IF NOT CONNECTED
# -------------------------

if not s3:
    st.info("Enter AWS Academy credentials to continue.")
    st.stop()

# -------------------------
# TABS
# -------------------------

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "Dashboard",
    "Create Bucket",
    "Upload Files",
    "Object Manager",
    "Security"
])

# =================================================
# DASHBOARD
# =================================================

with tab1:

    st.subheader("Dashboard")

    try:

        buckets = s3.list_buckets()["Buckets"]

        col1, col2 = st.columns(2)

        with col1:
            st.metric(
                "Total Buckets",
                len(buckets)
            )

        with col2:
            st.metric(
                "Region",
                region
            )

        bucket_names = [b["Name"] for b in buckets]

        if bucket_names:
            st.write("### Available Buckets")
            st.dataframe(
                pd.DataFrame(
                    bucket_names,
                    columns=["Bucket Name"]
                )
            )

    except Exception as e:
        st.error(e)

# =================================================
# CREATE BUCKET
# =================================================

with tab2:

    st.subheader("Create Bucket")

    bucket_name = st.text_input(
        "Bucket Name"
    )

    if st.button("Create Bucket"):

        try:

            if region == "us-east-1":

                s3.create_bucket(
                    Bucket=bucket_name
                )

            else:

                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={
                        "LocationConstraint": region
                    }
                )

            st.success(
                f"Bucket {bucket_name} created."
            )

        except Exception as e:
            st.error(e)

# =================================================
# UPLOAD
# =================================================

with tab3:

    st.subheader("Upload Files")

    buckets = s3.list_buckets()["Buckets"]

    bucket_list = [
        b["Name"]
        for b in buckets
    ]

    selected_bucket = st.selectbox(
        "Select Bucket",
        bucket_list
    )

    uploaded_files = st.file_uploader(
        "Choose Files",
        accept_multiple_files=True
    )

    if st.button("Upload"):

        try:

            for file in uploaded_files:

                s3.upload_fileobj(
                    file,
                    selected_bucket,
                    file.name
                )

            st.success(
                "Files uploaded successfully."
            )

        except Exception as e:
            st.error(e)

# =================================================
# OBJECT MANAGER
# =================================================

with tab4:

    st.subheader("Object Manager")

    buckets = s3.list_buckets()["Buckets"]

    bucket_list = [
        b["Name"]
        for b in buckets
    ]

    selected_bucket = st.selectbox(
        "Bucket",
        bucket_list,
        key="obj_bucket"
    )

    try:

        response = s3.list_objects_v2(
            Bucket=selected_bucket
        )

        if "Contents" in response:

            objects = response["Contents"]

            object_names = [
                obj["Key"]
                for obj in objects
            ]

            selected_object = st.selectbox(
                "Select Object",
                object_names
            )

            col1, col2 = st.columns(2)

            with col1:

                if st.button("Delete Object"):

                    s3.delete_object(
                        Bucket=selected_bucket,
                        Key=selected_object
                    )

                    st.success(
                        "Object deleted."
                    )

            with col2:

                if st.button("Download Object"):

                    obj = s3.get_object(
                        Bucket=selected_bucket,
                        Key=selected_object
                    )

                    st.download_button(
                        "Download",
                        obj["Body"].read(),
                        file_name=selected_object
                    )

        else:

            st.info(
                "Bucket is empty."
            )

    except Exception as e:
        st.error(e)

# =================================================
# SECURITY
# =================================================

with tab5:

    st.subheader("Security & Cost Optimization")

    buckets = s3.list_buckets()["Buckets"]

    bucket_list = [
        b["Name"]
        for b in buckets
    ]

    selected_bucket = st.selectbox(
        "Bucket",
        bucket_list,
        key="sec_bucket"
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button("Enable Versioning"):

            try:

                s3.put_bucket_versioning(
                    Bucket=selected_bucket,
                    VersioningConfiguration={
                        "Status": "Enabled"
                    }
                )

                st.success(
                    "Versioning Enabled"
                )

            except Exception as e:
                st.error(e)

    with col2:

        if st.button("Enable Encryption"):

            try:

                s3.put_bucket_encryption(
                    Bucket=selected_bucket,
                    ServerSideEncryptionConfiguration={
                        "Rules": [
                            {
                                "ApplyServerSideEncryptionByDefault": {
                                    "SSEAlgorithm": "AES256"
                                }
                            }
                        ]
                    }
                )

                st.success(
                    "Encryption Enabled"
                )

            except Exception as e:
                st.error(e)

    st.divider()

    if st.button("Apply Lifecycle Rule"):

        try:

            s3.put_bucket_lifecycle_configuration(
                Bucket=selected_bucket,
                LifecycleConfiguration={
                    "Rules": [
                        {
                            "ID": "MoveToGlacier",
                            "Status": "Enabled",
                            "Filter": {
                                "Prefix": ""
                            },
                            "Transitions": [
                                {
                                    "Days": 30,
                                    "StorageClass": "GLACIER"
                                }
                            ]
                        }
                    ]
                }
            )

            st.success(
                "Lifecycle Rule Applied"
            )

        except Exception as e:
            st.error(e)