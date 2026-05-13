import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("homidirect")


class AppError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message


class ValidationError(AppError):
    def __init__(self, message: str = "Validation Error"):
        super().__init__(400, message)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(401, message)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(403, message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Not Found"):
        super().__init__(404, message)


class ConflictError(AppError):
    def __init__(self, message: str = "Conflict"):
        super().__init__(409, message)


class InternalServerError(AppError):
    def __init__(self, message: str = "Internal Server Error"):
        super().__init__(500, message)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": type(exc).__name__, "message": exc.message},
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = [{"path": ".".join(str(p) for p in err["loc"]), "message": err["msg"]} for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Invalid request data",
            "details": details,
        },
    )


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "message": "An unexpected error occurred"},
    )
