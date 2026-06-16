@echo off
call backend\venv\Scripts\activate.bat
cd frontend\api
uvicorn index:app --host 127.0.0.1 --port 8000

