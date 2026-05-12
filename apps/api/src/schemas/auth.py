from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str


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
