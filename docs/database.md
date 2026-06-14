# Database Schema

AntiGravity utilizes two primary data stores: **PostgreSQL** for relational application state, and **Qdrant** for unstructured vector embeddings.

## 1. PostgreSQL Schema (Relational Data)

The relational schema is managed by `SQLAlchemy` ORM and migrated via `Alembic`.

```mermaid
erDiagram
    USERS ||--o{ SAVED_REPORTS : generates
    USERS ||--o{ DATA_CONNECTIONS : owns

    USERS {
        Integer id PK
        String email "UNIQUE, INDEX"
        String hashed_password
        DateTime created_at
    }

    SAVED_REPORTS {
        Integer id PK
        Integer user_id FK
        String title "INDEX"
        String report_type "e.g., Executive Summary"
        JSON content_json "Stores raw Markdown/Data"
        DateTime created_at
    }

    DATA_CONNECTIONS {
        Integer id PK
        Integer user_id FK
        String connection_name
        String engine_type "postgres, snowflake, duckdb"
        String connection_string "ENCRYPTED"
    }
```

## 2. Qdrant Vector Schema (Unstructured Data)

Qdrant manages the high-dimensional vector space used by the LangGraph RAG Agent to answer queries based on uploaded internal documents.

**Collection Name:** `knowledge_base`
- **Vector Size:** `1536` dimensions (Optimized for `text-embedding-ada-002` or `text-embedding-3-small`).
- **Distance Metric:** Cosine Similarity.

### Payload Metadata (Filtering Attributes)
Each vector in Qdrant contains the following JSON payload to allow the LangGraph agent to apply strict pre-filtering:
```json
{
  "source_document": "Q3_Financial_Report.pdf",
  "page_number": 12,
  "chunk_index": 45,
  "author": "Finance Dept",
  "upload_date": "2026-10-15T00:00:00Z"
}
```
