import json

from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def to_camel_case(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def convert_keys(obj):
    if isinstance(obj, dict):
        return {to_camel_case(k): convert_keys(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_keys(item) for item in obj]
    return obj


class CamelCaseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if response.headers.get("content-type", "").startswith("application/json"):
            body = b""
            async for chunk in response.body_iterator:
                body += chunk

            try:
                data = json.loads(body)
                converted = convert_keys(data)
                return JSONResponse(content=converted, status_code=response.status_code)
            except (json.JSONDecodeError, Exception):
                return Response(content=body, status_code=response.status_code, headers=dict(response.headers))

        return response
