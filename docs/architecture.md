# System Architecture

The AntiGravity Platform is an enterprise-grade AI analytics suite built on a scalable microservices architecture. 

## High-Level Architecture Diagram

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
        AdvMLService[Advanced ML Studio - PyTorch/XGBoost/SHAP]
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
        DuckDB[(DuckDB SQL Engine)]
        DataService --> Pandas
        DataService --> Polars
        DataService --> PySpark
        SQLEng --> DuckDB
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
    class Pandas,Polars,PySpark,DuckDB secondary;
```

## Component Breakdown

1. **Frontend (Next.js):** A highly responsive, glassmorphic UI styled with Tailwind CSS. It communicates statelessly with the FastAPI backend.
2. **LangGraph Swarm:** The brain of the platform. A Supervisor node routes natural language prompts to specialized sub-agents. It includes self-correction loops to eliminate LLM hallucinations.
3. **Data Engines:** Abstracted processors (Pandas, Polars, PySpark) that dynamically scale based on dataset size and distribution needs.
4. **Data Persistence:** 
   - **PostgreSQL:** Primary relational database for user state, saved reports, and connection profiles.
   - **Redis:** High-performance caching layer to instantly return previously computed ML inferences or agent responses.
   - **Qdrant:** Enterprise vector database storing embeddings for the Retrieval-Augmented Generation (RAG) knowledge base.
