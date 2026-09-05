from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import AppException
from app.core.logger import logger

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.error(f"AppException: {exc.message} | URL: {request.url} | Error Code: {exc.error_code}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "error_code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation Error: {exc.errors()} | URL: {request.url}")
        return JSONResponse(
            status_code=422,
            content={
                "error": True,
                "error_code": "VALIDATION_ERROR",
                "message": "Invalid request payload",
                "details": exc.errors()
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled Exception: {str(exc)} | URL: {request.url}")
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later."
            }
        )
