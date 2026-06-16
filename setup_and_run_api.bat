@echo off
cd frontend

echo "Activating venv..."
call venv\Scripts\activate.bat

echo "Installing minimal requirements..."
pip install fastapi uvicorn python-multipart pydantic pandas sqlalchemy

cd api
echo "Starting Uvicorn..."
..\venv\Scripts\python.exe -m uvicorn index:app --host 127.0.0.1 --port 8000

