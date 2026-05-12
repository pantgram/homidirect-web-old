#!/usr/bin/env python3
from src.utils.email import celery_app

if __name__ == "__main__":
    celery_app.start()
