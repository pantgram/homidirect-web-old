from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: str

    model_config = {"from_attributes": True}


class UserWithRoleResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    created_at: str

    model_config = {"from_attributes": True}


class UpdateUserRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None


class UserIdParam(BaseModel):
    id: int
