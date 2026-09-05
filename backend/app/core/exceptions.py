from typing import Any, Dict, Optional
from fastapi import status

class AppException(Exception):
    """Base exception class for custom application errors."""
    def __init__(
        self, 
        message: str, 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details
        super().__init__(self.message)

class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_404_NOT_FOUND, 
            error_code="NOT_FOUND", 
            details=details
        )

class BadRequestError(AppException):
    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_400_BAD_REQUEST, 
            error_code="BAD_REQUEST", 
            details=details
        )

class ForbiddenError(AppException):
    def __init__(self, message: str = "Not enough permissions", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_403_FORBIDDEN, 
            error_code="FORBIDDEN", 
            details=details
        )

class UnauthorizedError(AppException):
    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message, 
            status_code=status.HTTP_401_UNAUTHORIZED, 
            error_code="UNAUTHORIZED", 
            details=details
        )
