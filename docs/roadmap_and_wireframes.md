# Roadmap & Wireframes

## Minimum Viable Product (MVP) Journey
The MVP was strictly focused on rapidly validating the core value proposition of an "AI Data Analyst":
1. **Natural Language to SQL:** Built a basic zero-shot LLM prompt to convert text to SQL against a DuckDB backend.
2. **Dynamic Charting:** Allowed the LLM to write basic Apache ECharts configurations.
3. **Basic Analytics:** Implemented standard Pandas outlier detection and correlation matrices.
4. **AutoML (PyCaret):** Allowed non-technical users to automatically select the best classical ML model for classification.

## Production Roadmap Journey
Moving from MVP to Enterprise Production required massive architectural shifts:
1. **LangGraph Swarm:** Replaced the fragile, single-shot LLM chain with a stateful, self-correcting multi-agent swarm architecture.
2. **Qdrant Vector DB:** Integrated an enterprise vector database to support advanced RAG over massive internal document stores.
3. **Local LLM Support (Ollama):** Added offline, private inference to satisfy enterprise data-privacy constraints.
4. **Multi-Engine Data Layer:** Shifted from purely Pandas to abstractly supporting Polars (fast local) and PySpark (distributed big data).
5. **Explainable AI & Causality:** Integrated SHAP and Microsoft DoWhy so data scientists could interpret model decisions and prove causality, rather than relying on black-box AutoML.
6. **Kubernetes Deployment:** Refactored the frontend into Tailwind CSS, containerized the stack with Docker, and mapped out K8s deployments.

---

## Stakeholder UI Wireframes

Below are the high-fidelity UI wireframes showcasing the platform's glassmorphic design system and core capabilities, perfect for stakeholder alignment.

### 1. The Core AI Analytics Dashboard
*Showcasing the Natural Language SQL Chat interface seamlessly integrated with interactive Apache ECharts forecasting.*

![Dashboard Wireframe](file:///C:/Users/garvi/.gemini/antigravity-ide/brain/cf51ffc1-b89e-4727-ab1e-94087606e024/wireframe_dashboard_1781410158464.png)

### 2. The Advanced ML Studio
*Showcasing the dedicated Data Scientist interface for SHAP Feature Importance and statistical A/B Testing.*

![Advanced ML Studio Wireframe](file:///C:/Users/garvi/.gemini/antigravity-ide/brain/cf51ffc1-b89e-4727-ab1e-94087606e024/wireframe_advanced_ml_1781410170350.png)
