FROM python:3.11-slim-bullseye

WORKDIR /app

# Install system dependencies required for ML libraries and DuckDB
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements or just install directly
# Since there isn't a requirements.txt yet, we'll install them here
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    pydantic \
    pandas \
    sqlalchemy \
    duckdb \
    scikit-learn \
    qdrant-client \
    psycopg2-binary \
    redis \
    langchain \
    langchain-openai \
    faiss-cpu

COPY . .

EXPOSE 8000

CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8000"]
