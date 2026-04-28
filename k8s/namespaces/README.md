# Namespaces

This directory contains Kubernetes namespace definitions for logical separation of resources.

## Files

- `namespaces.yaml` - Defines two namespaces for the application

## Namespaces

### 1. app
- **Purpose**: Contains all application microservices
- **Services**: Identity, Salary Submission, Vote, Search, Stats, BFF, Frontend
- **Why**: Isolates application workloads from data storage

### 2. data
- **Purpose**: Contains PostgreSQL database and related resources
- **Services**: PostgreSQL deployment, service, and persistent storage
- **Why**: Separates stateful data layer from stateless application layer

## Usage

```bash