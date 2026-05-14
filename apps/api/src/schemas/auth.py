from pydantic import BaseModel, EmailStr, field_validator

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


class RegisterRequest(BaseModel):
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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class ExchangeCodeRequest(BaseModel):
    code: str


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str


class LoginResponse(BaseModel):
    token: AuthTokens


class RegisterResponse(BaseModel):
    user: "UserBrief"
    token: AuthTokens


class RefreshResponse(BaseModel):
    tokens: AuthTokens


class UserBrief(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    created_at: str

    model_config = {"from_attributes": True}
