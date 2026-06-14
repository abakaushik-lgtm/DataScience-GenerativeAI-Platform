# Dockerfile for FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# Copy the generated requirements.txt
COPY requirements.txt /app/requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc g++ && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application files
COPY ./app /app/app
COPY main.py /app/

# Expose port and run server
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
