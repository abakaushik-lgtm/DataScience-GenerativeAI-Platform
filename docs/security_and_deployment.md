# Security & Deployment Guide

This document outlines the security architecture and deployment instructions for orchestrating AntiGravity in an enterprise cloud environment (AWS, GCP, Azure).

## 1. Enterprise Security Architecture

### Authentication & Authorization (RBAC)
- **JWT Authentication:** All API endpoints are secured using JSON Web Tokens (JWT). The token must be passed in the `Authorization: Bearer <token>` header.
- **Role-Based Access Control:** Users are assigned roles (`Analyst`, `Data Scientist`, `Admin`). Access to the Advanced ML Studio and PySpark engines is restricted to `Data Scientist` and above.

### Data Privacy & Local Inference
- **Ollama Local LLM Toggle:** For highly classified data (e.g., PHI, PII, financial records), the platform can be fully detached from OpenAI. By setting `LLM_PROVIDER=ollama`, the LangGraph Swarm will route all inference to a locally hosted Llama-3 or Mistral instance, ensuring zero data egress to the cloud.
- **Database Encryption:** Connection strings in the PostgreSQL database are encrypted at rest using AES-256.

## 2. Kubernetes (K8s) Orchestration

AntiGravity is containerized using optimized, multi-stage Docker builds. The `k8s/deployment.yaml` file defines the following topology:

1. **Frontend Service (`antigravity-frontend`):** Deployed as a `LoadBalancer` exposing port 80.
2. **Backend Service (`antigravity-backend`):** Deployed as a `ClusterIP` exposing port 8000 internally.
3. **Stateful Services:**
   - PostgreSQL (`postgres:15-alpine`)
   - Redis (`redis:7-alpine`)
   - Qdrant (`qdrant/qdrant:v1.7.0`)

### Deployment Commands
To spin up the cluster in a cloud environment (e.g., EKS, GKE):
```bash
# 1. Create the namespace
kubectl create namespace antigravity

# 2. Apply secrets (API keys, DB passwords)
kubectl apply -f k8s/secrets.yaml

# 3. Apply the deployments
kubectl apply -f k8s/deployment.yaml -n antigravity

# 4. Monitor the rollout
kubectl rollout status deployment/antigravity-backend -n antigravity
```

## 3. CI/CD Pipeline (GitHub Actions)

Continuous Integration and Delivery are managed via `.github/workflows/deploy.yml`. 
On every `push` or `pull_request` to the `main` branch, the pipeline will:
1. Check out the repository.
2. Run standard Python `pytest` and `eslint` for the frontend.
3. Utilize `docker buildx` to compile the multi-stage Dockerfiles.
4. Push the images to your private container registry (e.g., AWS ECR or Docker Hub).
