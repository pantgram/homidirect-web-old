from src.schemas.base import CamelModel


class Pagination(CamelModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next_page: bool
    has_previous_page: bool


class PaginatedResponse(CamelModel):
    data: list
    pagination: Pagination

    model_config = {
        "alias_generator": lambda name: (
            name[0] + "".join(part.capitalize() for part in name.split("_")[1:])
            if "_" in name else name
        ),
        "populate_by_name": True,
        "from_attributes": True,
    }


class ApiResponse(CamelModel):
    data: dict | None = None
    message: str | None = None


class MessageResponse(CamelModel):
    message: str


class HealthResponse(CamelModel):
    status: str
    timestamp: str
