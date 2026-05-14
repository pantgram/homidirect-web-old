from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    pagination: Pagination


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next_page: bool
    has_previous_page: bool


class ApiResponse(BaseModel, Generic[T]):
    data: T
    message: str | None = None


class MessageResponse(BaseModel):
    message: str
