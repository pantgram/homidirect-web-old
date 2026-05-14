import boto3
from botocore.config import Config as BotoConfig
from src.config.settings import settings

_s3_client = boto3.client(
    "s3",
    endpoint_url=settings.r2_endpoint,
    aws_access_key_id=settings.r2_access_key_id,
    aws_secret_access_key=settings.r2_secret_access_key,
    config=BotoConfig(signature_version="s3v4", region_name="auto"),
)

_BUCKET = settings.r2_bucket_name
_PUBLIC_URL = settings.r2_public_url


def upload_to_r2(key: str, body: bytes, content_type: str) -> str:
    _s3_client.put_object(
        Bucket=_BUCKET,
        Key=key,
        Body=body,
        ContentType=content_type,
    )
    return f"{_PUBLIC_URL}/{key}"


def delete_from_r2(key: str) -> None:
    _s3_client.delete_object(Bucket=_BUCKET, Key=key)


def copy_in_r2(source_key: str, dest_key: str) -> str:
    _s3_client.copy_object(
        Bucket=_BUCKET,
        CopySource={"Bucket": _BUCKET, "Key": source_key},
        Key=dest_key,
    )
    return f"{_PUBLIC_URL}/{dest_key}"


def get_key_from_url(url: str) -> str:
    prefix = f"{_PUBLIC_URL}/"
    if url.startswith(prefix):
        return url[len(prefix):]
    return url
