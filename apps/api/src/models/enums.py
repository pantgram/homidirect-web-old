import sqlalchemy as sa

user_role_enum = sa.Enum("LANDLORD", "TENANT", "BOTH", "ADMIN", name="user_role", create_type=False)
user_status_enum = sa.Enum("ACTIVE", "BANNED", "SUSPENDED", name="user_status", create_type=False)
auth_provider_enum = sa.Enum("EMAIL", "GOOGLE", name="auth_provider", create_type=False)
property_type_enum = sa.Enum("apartment", "house", "studio", "room", name="property_type", create_type=False)
floors_enum = sa.Enum(
    "basement", "semi-basement", "ground", "1st", "2nd", "3rd", "4th", "5th", "6th+",
    name="floors", create_type=False,
)
verification_status_enum = sa.Enum("PENDING", "APPROVED", "REJECTED", name="verification_status", create_type=False)
listing_status_enum = sa.Enum("Renovated", "Luxurious", "Under construction", "Neoclassical", name="listing_status", create_type=False)
zone_type_enum = sa.Enum("Residential", "Agricultural", "Commercial", "Industrial", "Regeneration", name="zone_type", create_type=False)
booking_status_enum = sa.Enum("PENDING", "CONFIRMED", "DECLINED", "CANCELLED", name="booking_status", create_type=False)
featured_purchase_status_enum = sa.Enum("PENDING", "COMPLETED", "FAILED", "REFUNDED", name="featured_purchase_status", create_type=False)
document_type_enum = sa.Enum("UTILITY_BILL", "TITLE_DEED", "LEASE_AGREEMENT", "PROPERTY_TAX", "OTHER", name="document_type", create_type=False)
