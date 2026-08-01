import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from src.models.enums import document_type_enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.listing import Listing
    from src.models.user import User


class VerificationDocument(Base):
    __tablename__ = "verification_documents"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    document_type: Mapped[str] = mapped_column(document_type_enum, nullable=False)
    url: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    uploaded_by: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[sa.DateTime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())

    listing: Mapped["Listing"] = relationship("Listing", back_populates="verification_documents")
    uploader: Mapped["User"] = relationship("User")

    __table_args__ = (
        sa.Index("verification_docs_listing_id_idx", "listing_id"),
    )
