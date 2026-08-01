import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column
from src.config.database import Base


class GeocodingCache(Base):
    __tablename__ = "geocoding_cache"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    query_hash: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True)
    query_text: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    country_code: Mapped[str | None] = mapped_column(sa.String(2))
    lang: Mapped[str | None] = mapped_column(sa.String(2))
    results: Mapped[dict] = mapped_column(sa.JSON, nullable=False)
    created_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now())
    expires_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP(timezone=True), nullable=False)

    __table_args__ = (
        sa.Index("geocoding_cache_hash_idx", "query_hash"),
        sa.Index("geocoding_cache_expires_idx", "expires_at"),
    )
