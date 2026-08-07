from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 5000
    database_url: str
    jwt_secret: str
    node_env: str = "development"
    frontend_url: str = "http://localhost:8080"

    r2_account_id: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket_name: str
    r2_public_url: str

    smtp_host: str = "smtp.zoho.eu"
    smtp_port: int = 465
    smtp_user: str = ""
    smtp_pass: str = ""
    email_from: str = "HomiDirect <donotreply@homidirect.com>"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_callback_url: str = "http://localhost:5000/api/v1/auth/google/callback"

    geoapify_api_key: str = ""
    geoapify_request_timeout: float = 5.0

    max_file_size: int = 5 * 1024 * 1024
    max_document_size: int = 10 * 1024 * 1024
    max_images_per_listing: int = 10
    max_images_per_session: int = 10
    allowed_mime_types: list[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    allowed_document_mime_types: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
    ]
    pending_image_expiry_hours: int = 2

    @computed_field
    @property
    def r2_endpoint(self) -> str:
        return f"https://{self.r2_account_id}.r2.cloudflarestorage.com"

    @computed_field
    @property
    def async_database_url(self) -> str:
        url = self.database_url
        import urllib.parse
        parsed = urllib.parse.urlparse(url)
        query = urllib.parse.parse_qs(parsed.query)
        unsupported = {"sslmode", "channel_binding", "ssl", "sslrootcert", "sslcert", "sslkey"}
        filtered = {k: v for k, v in query.items() if k not in unsupported}
        new_query = urllib.parse.urlencode(filtered, doseq=True)
        url = urllib.parse.urlunparse(parsed._replace(query=new_query))
        return url

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
