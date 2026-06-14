<div align="center">
  <img src="./frontend/public/globe.svg" alt="AntiGravity Logo" width="120" height="120">
  <h1>AntiGravity</h1>
  <p><b>The Autonomous AI-Powered Data Science & Analytics Operating System</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![LangGraph](https://img.shields.io/badge/LangGraph-🦜🕸️-green)](https://python.langchain.com/docs/langgraph)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

  <i>Empowering organizations to converse with their data, automate machine learning, and extract deep business insights using natural language.</i>
</div>

---

## 🚀 Introduction

**AntiGravity** is an enterprise-grade AI Data Science platform that bridges the gap between complex data infrastructure and non-technical business users. 

In modern enterprises, extracting actionable insights requires a synchronized pipeline of Data Engineers, Analysts, and ML Scientists. AntiGravity abstracts this complexity entirely. By combining a Multi-Agent Swarm (LangGraph) with a massive-scale Data Engine (Pandas, Polars, PySpark), AntiGravity allows users to simply upload datasets or connect to databases and **ask questions in plain English.**

### Problems Solved
- **The SQL Bottleneck:** Non-technical executives no longer need to wait for analysts to write SQL queries.
- **Black-Box ML:** Moving beyond standard AutoML by offering Explainable AI (SHAP) and Causal Inference (DoWhy).
- **Data Silos:** A unified platform for Analytics, Reporting, BI Dashboarding, and RAG Knowledge Retrieval.

---

## ✨ Key Features

### 🧠 AI Data Analyst
Transform natural language into highly optimized SQL queries and instant statistical insights. The system automatically detects outliers, calculates correlations, and writes executive summaries.

### 🤖 Generative AI Copilot
A multi-agent swarm architecture powers a conversational analytics interface. The Copilot orchestrates data storytelling, handles complex multistep reasoning, and self-corrects against LLM hallucinations.

### 📈 Forecasting Engine
Predict the future of your business metrics. Built-in time-series forecasting automatically handles seasonality, trend analysis, and demand prediction using state-of-the-art statistical models.

### ⚙️ AutoML Platform
Low-code/No-code Machine Learning. Upload a dataset, select your target variable, and the platform automatically trains, tunes, and evaluates Classification, Regression, and Clustering models.

### 📚 RAG Knowledge System
An enterprise vector-search engine. Upload your internal PDFs, manuals, and reports to the Qdrant database, enabling the AI to retrieve semantic context and chat with your corporate knowledge.

### 📊 Visualization Studio
Interactive, dynamic dashboarding powered by Apache ECharts. The AI Copilot writes custom JSON chart configurations on the fly to visually represent your query results.

### 🛡️ MLOps & Advanced ML
A dedicated studio for Data Scientists featuring:
- **Causal Inference (DoWhy):** Determine true causality, not just correlation.
- **Explainable AI (SHAP):** Localized feature importance plots.
- **A/B Testing Simulator:** Automated p-value and uplift calculators.
- **Anomaly Detection:** Isolation Forests to detect fraud and multidimensional outliers.

---

## 🏗️ Architecture

AntiGravity is built on a highly scalable, decoupled microservices architecture designed for Kubernetes deployment.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Presentation Layer]
        UI[Next.js App UI]
        TW[Tailwind CSS]
        EC[Apache ECharts]
        UI --> TW
        UI --> EC
    end

    %% API Gateway / Routing
    Gateway[FastAPI Gateway/Routers]
    Frontend -->|REST HTTP/JSON| Gateway

    %% Core Services
    subgraph Backend Services [FastAPI Backend]
        DataService[Multi-Engine Data Layer]
        AutoMLService[PyCaret AutoML & Forecasting]
        AdvMLService[Advanced ML Studio]
        ReportService[GenAI Report Generator]
        
        %% LangGraph Agent Swarm
        subgraph Agent Swarm [LangGraph AI Orchestrator]
            Supervisor[Supervisor Agent]
            SQLEng[SQL Data Engineer Agent]
            MLEng[ML Expert Agent]
            RAG[RAG Vector Search Agent]
            Grader[Hallucination Grader]
            Supervisor --> SQLEng
            Supervisor --> MLEng
            Supervisor --> RAG
            RAG --> Grader
        end
    end

    Gateway --> DataService
    Gateway --> AutoMLService
    Gateway --> AdvMLService
    Gateway --> ReportService
    Gateway --> Supervisor

    %% Data Engines
    subgraph Data Processing Engines
        Pandas[(Pandas)]
        Polars[(Polars)]
        PySpark[(PySpark Cluster)]
        DataService --> Pandas
        DataService --> Polars
        DataService --> PySpark
    end

    %% Persistence Layer
    subgraph Persistence [Data & State Storage]
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
        Qdrant[(Qdrant Vector DB)]
    end

    Gateway --> Postgres
    Gateway --> Redis
    RAG --> Qdrant

    classDef primary fill:#4f46e5,stroke:#fff,stroke-width:2px,color:#fff;
    classDef secondary fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef storage fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Gateway,Supervisor primary;
    class Postgres,Redis,Qdrant storage;
    class Pandas,Polars,PySpark secondary;
```

---

## 💻 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend Framework** | Next.js, React, TypeScript | SEO-friendly, dynamic UI rendering |
| **Styling** | Tailwind CSS | Glassmorphic, responsive utility styling |
| **Data Visualization** | Apache ECharts | High-performance, interactive charting |
| **Backend API** | FastAPI, Python | Asynchronous, high-throughput microservices |
| **AI Orchestration** | LangGraph, LangChain | Multi-agent stateful workflows & reasoning |
| **Data Engines** | Pandas, Polars, PySpark | Adaptive dataset manipulation & SQL execution |
| **Machine Learning** | PyTorch, XGBoost, SciPy, SHAP | Custom model training, XAI, and statistical testing |
| **Vector Database** | Qdrant | Massive-scale semantic embedding storage |
| **Relational Database**| PostgreSQL | User state, connection profiles, and report storage |
| **Caching Layer** | Redis | Ephemeral session state and high-speed API caching |
| **Infrastructure** | Docker, Kubernetes | Microservices containerization and orchestration |

---

## 📸 Interface Screenshots

### The Core AI Analytics Dashboard
*The natural language SQL chat and ECharts visualizations.*
![Dashboard Interface](./docs/assets/wireframe_dashboard.png)

### The Advanced ML Studio
*The A/B Testing Simulator and SHAP explainability charts.*
![Advanced ML Studio](./docs/assets/wireframe_advanced_ml.png)

---

## 🛠️ Installation & Setup

Follow these steps to deploy the entire stack locally via Docker Compose.

### 1. Clone the Repository
```bash
git clone https://github.com/abakaushik-lgtm/DataScience-GenerativeAI-Platform.git
cd DataScience-GenerativeAI-Platform
```

### 2. Configure Environment Variables
Copy the example environment file and fill in your API keys.
```bash
cp .env.example .env
```

### 3. Deploy the Data Cluster
Start the underlying persistence layer (PostgreSQL, Redis, Qdrant).
```bash
docker-compose up -d postgres redis qdrant
```

### 4. Run the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to access the AntiGravity platform.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# AI Providers
OPENAI_API_KEY=sk-your-openai-api-key
LLM_PROVIDER=openai # Set to 'ollama' for 100% private local inference

# Databases
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/antigravity
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333

# Security
SECRET_KEY=your-secure-jwt-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 📂 Project Structure

```text
AntiGravity/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI REST Routers (data, copilot, automl, etc.)
│   │   ├── core/         # Config, Security, and Exceptions
│   │   ├── db/           # SQLAlchemy Models and Session
│   │   ├── services/     # Core Business Logic (LangGraph, Data Engines, ML)
│   │   └── cache/        # Redis Implementation
│   ├── main.py           # Application Entrypoint
│   ├── Dockerfile        # Backend Multi-Stage Build
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router (Pages & Layouts)
│   │   ├── components/   # React UI Components (CopilotWidget, Charts)
│   │   ├── hooks/        # Custom React Hooks
│   │   └── utils/        # API Client utilities
│   ├── tailwind.config.ts# UI Design Tokens
│   └── Dockerfile        # Frontend Multi-Stage Build
├── k8s/                  # Kubernetes Deployment Manifests
├── docs/                 # Enterprise Technical Documentation
├── docker-compose.yml    # Local Cluster Orchestration
└── .github/workflows/    # CI/CD Pipelines
```

---

## 🔌 API Overview

AntiGravity provides a fully documented OpenAPI specification accessible at `http://localhost:8000/docs`. Key endpoints include:

- **`POST /api/copilot/ask`** - Routes natural language to the LangGraph Supervisor Agent.
- **`POST /api/data/ingest`** - Dynamically loads CSVs into Pandas/Polars/PySpark.
- **`POST /api/custom-ml/train`** - Trains raw XGBoost, LightGBM, and PyTorch models.
- **`POST /api/advanced-ml/shap`** - Generates SHAP feature importance matrices.
- **`POST /api/advanced-ml/causal`** - Executes DoWhy causal inference regression.
- **`GET /api/advanced-reports/export/pdf`** - Compiles analytics into an executive PDF report.

---

## 🔒 Security Architecture

AntiGravity is engineered for strict enterprise compliance:

- **Authentication:** Stateless JSON Web Tokens (JWT) manage session lifetimes.
- **Authorization:** Role-Based Access Control (RBAC) restricts destructive actions and PySpark engine access to `Admin` and `Data Scientist` roles.
- **Data Privacy (Zero Egress):** Setting `LLM_PROVIDER=ollama` reroutes all Generative AI inference to a local, air-gapped machine running Llama-3, guaranteeing highly sensitive IP never reaches external APIs.
- **Encryption:** Database connection strings are AES-256 encrypted at rest.

---

## 🗺️ Roadmap

### MVP ✅
- Natural Language to SQL generation
- Basic Apache ECharts visualizations
- Foundational PyCaret AutoML

### V1 ✅
- Stateful LangGraph Agent architecture
- Qdrant Vector DB integration (RAG)
- Multi-Engine Data Layer (Pandas/Polars/PySpark)
- Local LLM Support (Ollama)

### V2 ✅
- Explainable AI (SHAP)
- Causal Inference (DoWhy)
- Kubernetes & Docker CI/CD Automation
- Complete Tailwind CSS refactor

### Enterprise Edition ⏳
- Active Directory / SSO Integration
- Multi-tenant data segregation
- Real-time Kafka data streaming ingestion
- Edge ML inference deployment

---

## ⚡ Performance Goals

- **Scalability:** Horizontal scaling of FastAPI workers via Kubernetes HPA.
- **Data Capacity:** Supports 100GB+ datasets utilizing the distributed PySpark engine.
- **Response Times:** Sub-200ms latency for cached queries (Redis) and sub-5s latency for complex LangGraph SQL synthesis.

---

## 🤝 Contributing

We welcome contributions from the open-source community! 
Please review our `CONTRIBUTING.md` file for guidelines on setting up the local dev environment, writing `pytest` coverage, and adhering to our `flake8` linting standards before submitting a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.

---

## 🔮 Future Vision

The ultimate goal of **AntiGravity** is to become the autonomous analytics operating system for modern enterprises. By abstracting the heavy lifting of data engineering, statistical validation, and machine learning into an intuitive, conversational interface, we envision a future where organizations can make mathematically proven, data-driven decisions at the speed of thought—with minimal human intervention.
