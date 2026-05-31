from pydantic import EmailStr, field_validator

from src.schemas.base import CamelModel

VALID_ROLES = {"LANDLORD", "TENANT", "BOTH"}


class UserResponse(CamelModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: str


class UserWithRoleResponse(CamelModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    created_at: str


class UpdateUserRequest(CamelModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v


class UserIdParam(CamelModel):
    id: int


class UserDetailResponse(CamelModel):
    user: UserWithRoleResponse


class FavoriteIdsResponse(CamelModel):
    favorite_ids: list[int]


class CheckFavoriteResponse(CamelModel):
    is_favorited: bool


class AddFavoriteResponse(CamelModel):
    success: bool
    added: bool
    message: str


class RemoveFavoriteResponse(CamelModel):
    removed: bool
