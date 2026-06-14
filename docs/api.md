# API Specifications

The AntiGravity backend is built on **FastAPI**, providing automatic, interactive OpenAPI documentation. 
*(You can view the interactive Swagger UI by navigating to `http://localhost:8000/docs` when the server is running).*

Below is a core summary of the critical microservices.

## 1. LangGraph Agent Swarm (`/api/copilot`)
- `POST /api/copilot/ask`
  - **Payload:** `{ "question": "Analyze my sales data", "context": "..." }`
  - **Description:** Entry point for the Supervisor Agent. Routes the prompt to SQL, ML, or RAG sub-agents and returns the self-corrected, hallucination-free response.

## 2. Multi-Engine Data Layer (`/api/data`)
- `POST /api/data/ingest`
  - **Payload:** `Multipart/form-data` (CSV File) + `engine="pandas"|"polars"|"pyspark"`
  - **Description:** Dynamically loads the dataset into memory/cluster using the requested data processing engine.

## 3. Advanced Custom ML Studio (`/api/custom-ml`)
- `POST /api/custom-ml/train`
  - **Payload:** `{ "model_type": "xgboost", "params": {"max_depth": 3, "learning_rate": 0.01} }`
  - **Description:** Instantiates and trains raw XGBoost, LightGBM, Scikit-Learn, or PyTorch Deep Neural Networks directly bypassing the AutoML engine.

## 4. Explainable AI & Causal Inference (`/api/advanced-ml`)
- `POST /api/advanced-ml/shap`
  - **Payload:** `{ "model_type": "random_forest", "X": [...] }`
  - **Description:** Uses the SHAP library to return feature importance matrices for a trained model.
- `POST /api/advanced-ml/causal`
  - **Payload:** `{ "data": [...], "treatment": "marketing_spend", "outcome": "sales" }`
  - **Description:** Uses Microsoft DoWhy to execute backdoor linear regression and determine true causal effects.
- `POST /api/advanced-ml/ab-test`
  - **Payload:** `{ "control_conversions": 100, "control_size": 1000, ... }`
  - **Description:** Uses `scipy.stats` to calculate p-values, z-stats, and uplift.

## 5. Generative AI Reporting (`/api/advanced-reports`)
- `GET /api/advanced-reports/export/{format}`
  - **Path Parameters:** `format` (e.g., `pdf`, `docx`, `pptx`)
  - **Description:** Compiles the dashboard's current charts and insights into an executive-ready multi-page report and exports it to the requested binary format.
