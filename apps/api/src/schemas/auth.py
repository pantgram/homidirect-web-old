from pydantic import EmailStr, field_validator

from src.schemas.base import CamelModel

VALID_ROLES = {"LANDLORD", "TENANT", "BOTH"}


def _validate_password(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not any(c.isupper() for c in v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain at least one digit")
    return v


class RegisterRequest(CamelModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Role must be one of: {', '.join(sorted(VALID_ROLES))}")
        return v


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(CamelModel):
    refresh_token: str


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class ExchangeCodeRequest(CamelModel):
    code: str


class AuthTokens(CamelModel):
    access_token: str
    refresh_token: str


class LoginResponse(CamelModel):
    token: AuthTokens


class RegisterResponse(CamelModel):
    user: "UserBrief"
    token: AuthTokens


class RefreshResponse(CamelModel):
    tokens: AuthTokens


class UserBrief(CamelModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    created_at: str


class ExchangeCodeResponse(CamelModel):
    token: AuthTokens
