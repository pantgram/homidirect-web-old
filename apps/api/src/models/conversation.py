import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.config.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.listing import Listing
    from src.models.user import User


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    landlord_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id: Mapped[int] = mapped_column(sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    last_message_at: Mapped[sa.datetime | None] = mapped_column(sa.TIMESTAMP)
    created_at: Mapped[sa.datetime] = mapped_column(sa.TIMESTAMP, nullable=False, server_default=sa.func.now())

    listing: Mapped["Listing"] = relationship("Listing", back_populates="conversations")
    landlord_user: Mapped["User"] = relationship("User", foreign_keys=[landlord_id])
    tenant_user: Mapped["User"] = relationship("User", foreign_keys=[tenant_id])

    __table_args__ = (
        sa.UniqueConstraint("listing_id", "landlord_id", "tenant_id", name="conversations_listing_landlord_tenant_unique"),
        sa.Index("conversations_listing_id_idx", "listing_id"),
        sa.Index("conversations_landlord_id_idx", "landlord_id"),
        sa.Index("conversations_tenant_id_idx", "tenant_id"),
        sa.Index("conversations_last_message_at_idx", "last_message_at"),
    )
