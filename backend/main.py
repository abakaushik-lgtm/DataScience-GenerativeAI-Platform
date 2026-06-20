from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.ingestion import router as ingestion_router
from app.api.analyst import router as analyst_router
from app.api.insights import router as insights_router
from app.api.forecasting import router as forecasting_router
from app.api.automl import router as automl_router
from app.api.reports import router as reports_router
from app.api.advanced_reports import router as advanced_reports_router
from app.api.rag import router as rag_router
from app.api.copilot import router as copilot_router
from app.api.data import router as data_router
from app.api.custom_ml import router as custom_ml_router
from app.api.advanced_ml import router as advanced_ml_router
from app.db.session import engine
from app.db.models import Base

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AntiGravity API",
    description="Backend API for the AntiGravity Data Science & Generative AI Platform",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion_router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(analyst_router, prefix="/api/analyst", tags=["analyst"])
app.include_router(insights_router, prefix="/api/insights", tags=["insights"])
app.include_router(forecasting_router, prefix="/api/forecasting", tags=["forecasting"])
app.include_router(automl_router, prefix="/api/automl", tags=["automl"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])
app.include_router(advanced_reports_router, prefix="/api/advanced-reports", tags=["advanced-reports"])
app.include_router(rag_router, prefix="/api/rag", tags=["rag"])
app.include_router(copilot_router, prefix="/api/copilot", tags=["copilot"])
app.include_router(data_router, prefix="/api/data", tags=["data"])
app.include_router(custom_ml_router, prefix="/api/custom-ml", tags=["custom-ml"])
app.include_router(advanced_ml_router, prefix="/api/advanced-ml", tags=["advanced-ml"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AntiGravity API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
