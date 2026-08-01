import pathlib

import filetype

from src.utils.errors import ValidationError

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_DOCUMENT_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"}

EXTENSION_MIME_OVERRIDES: dict[str, str] = {
    ".webp": "image/webp",
}


def validate_file(
    file_bytes: bytes,
    filename: str,
    declared_content_type: str | None,
    max_size: int,
    allowed_mime_types: list[str],
    allowed_extensions: set[str],
) -> str:
    if not file_bytes:
        raise ValidationError("Empty file")

    if len(file_bytes) > max_size:
        raise ValidationError(f"File too large (max {max_size // (1024 * 1024)}MB)")

    if not filename:
        raise ValidationError("Filename is required")

    ext = pathlib.Path(filename).suffix.lower()
    if ext not in allowed_extensions:
        raise ValidationError(f"File extension '{ext}' is not allowed")

    detected_type = EXTENSION_MIME_OVERRIDES.get(ext)
    if not detected_type:
        kind = filetype.guess(file_bytes)
        detected_type = kind.mime if kind else None

    if not detected_type:
        raise ValidationError("File type could not be determined")

    if detected_type not in allowed_mime_types:
        raise ValidationError(f"File type '{detected_type}' is not allowed")

    if declared_content_type and declared_content_type not in allowed_mime_types:
        raise ValidationError(f"File type '{declared_content_type}' is not allowed")

    return detected_type


def validate_image(file_bytes: bytes, filename: str, declared_content_type: str | None, max_size: int) -> str:
    from src.config.settings import settings

    return validate_file(
        file_bytes=file_bytes,
        filename=filename,
        declared_content_type=declared_content_type,
        max_size=max_size,
        allowed_mime_types=settings.allowed_mime_types,
        allowed_extensions=ALLOWED_IMAGE_EXTENSIONS,
    )


def validate_document(file_bytes: bytes, filename: str, declared_content_type: str | None, max_size: int) -> str:
    from src.config.settings import settings

    return validate_file(
        file_bytes=file_bytes,
        filename=filename,
        declared_content_type=declared_content_type,
        max_size=max_size,
        allowed_mime_types=settings.allowed_document_mime_types,
        allowed_extensions=ALLOWED_DOCUMENT_EXTENSIONS,
    )
