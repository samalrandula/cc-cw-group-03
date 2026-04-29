# Zalary - Salary Insights Platform

Zalary is a community-driven salary transparency platform. Users can anonymously submit salary data, vote on submissions to surface reliable entries, and explore aggregated statistics filtered by role, location, and experience level.

---

## Architecture

The platform is built as a set of loosely coupled microservices behind a single BFF (Backend for Frontend). All client traffic enters through the BFF; internal services are not exposed directly.

```
Browser / Client
      │
      ▼
 NGINX Ingress
  /api/* → BFF (8082)
  /      → Frontend (80)
      │
      ▼
  BFF Service ──── Identity Service  (8086)  JWT issuance & validation
      │        ├── Salary Submission (8081)  submission lifecycle & status
      │        ├── Vote Service      (8083)  upvote / downvote toggle
      │        ├── Search Service    (8084)  filtered salary search
      │        ├── Stats Service     (8085)  aggregate statistics (USD-normalised)
      │        └── Report Service    (8087)  user reports & admin rejection
      │
      └── PostgreSQL (shared DB, namespace: data)
```

**Namespaces:** `app` (all services + frontend) · `data` (PostgreSQL)

---

## Services

| Service | Port | Description | README |
|---------|------|-------------|--------|
| Frontend | 80 | React 19 + Vite + Material UI client | [`frontend_service/`](frontend_service) |
| BFF | 8082 | Single entry point; JWT validation, request forwarding | [`bff_service/README.md`](bff_service/README.md) |
| Identity | 8086 | User signup, login, JWT issuance (HS512) | [`identity_service/README.md`](identity_service/README.md) |
| Salary Submission | 8081 | Create and manage salary submissions | [`salary_submission_service/README.md`](salary_submission_service/README.md) |
| Vote | 8083 | Toggle upvote / downvote on submissions | [`vote_service/README.md`](vote_service/README.md) |
| Search | 8084 | Paginated, filtered salary search with vote counts | [`search_service/README.md`](search_service/README.md) |
| Stats | 8085 | Aggregate statistics (avg, median, percentiles) | [`stats_service/README.md`](stats_service/README.md) |
| Report | 8087 | User reports and admin rejection workflow | [`report_service/README.md`](report_service/README.md) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Material UI v6, Axios |
| Backend | Spring Boot (Java), Spring Data JPA |
| Database | PostgreSQL (single shared instance) |
| Auth | JWT (HS512), BCrypt password hashing |
| Containerisation | Docker |
| Orchestration | Kubernetes (NGINX Ingress) |

---

## Database

All services share a single PostgreSQL database named `zalary`. The schema is managed via Liquibase (backend services) and an initial DDL script at [`dbscripts/create_tables.sql`](dbscripts/create_tables.sql).

Key tables: `users`, `salary_submissions`, `votes`, `reports`.

---

## Running Locally

### Prerequisites

- Java 17+, Gradle
- Node.js 18+, npm
- PostgreSQL (or Docker)

### 1. Start PostgreSQL

Create a database named `zalary` and run the DDL:

```bash
psql -U postgres -c "CREATE DATABASE zalary;"
psql -U postgres -d zalary -f dbscripts/create_tables.sql
```

### 2. Start backend services

Each service is a standard Gradle Spring Boot project. Set the required environment variables then run:

```bash
cd <service_directory>
./gradlew bootRun
```

Required environment variables for all backend services:

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | e.g. `jdbc:postgresql://localhost:5432/zalary` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | HS512 secret (identity service only) |
| `JWT_EXPIRATION` | Token TTL in ms, e.g. `3600000` (identity service only) |

BFF additionally needs service URLs (`SALARY_SUBMISSION_SERVICE_URL`, `VOTE_SERVICE_URL`, `SEARCH_SERVICE_URL`, `STATS_SERVICE_URL`, `IDENTITY_SERVICE_URL`, `REPORT_SERVICE_URL`).

Recommended start order: identity → salary-submission → vote → search → stats → report → bff

### 3. Start the frontend

```bash
cd frontend_service
npm install
npm run dev
```

The frontend dev server proxies API calls to the BFF at `http://localhost:8082`.

---

## Kubernetes Deployment

All manifests live under [`k8s/`](k8s/).

```
k8s/
├── namespaces/       # app + data namespaces
├── postgres/         # PostgreSQL StatefulSet, PVC, Service, Secret
├── secrets/          # JWT secret and DB credentials
├── configmaps/       # Service URLs and config per service
├── deployments/      # One Deployment per service
├── services/         # ClusterIP Services
└── ingress/          # NGINX Ingress (/ → frontend, /api/* → BFF)
```

Apply in order:

```bash
kubectl apply -f k8s/namespaces/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress/
```

Docker images are published to Docker Hub under `samalrandula/*` (e.g. `samalrandula/bff-service:latest`).
