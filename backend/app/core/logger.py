import logging
import sys
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

# Ensure logs directory exists
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Format for the logs
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logging():
    # Create logger
    logger = logging.getLogger("dealflow")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate logs if setup is called multiple times
    if logger.handlers:
        return logger

    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    logger.addHandler(console_handler)

    # 2. File Handler (Rotating every midnight, keeping 7 days of logs)
    # backupCount=7 ensures we keep last 7 days.
    file_handler = TimedRotatingFileHandler(
        filename=LOGS_DIR / "dealflow.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    logger.addHandler(file_handler)

    return logger

logger = setup_logging()
