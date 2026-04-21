# PostgreSQL Database Resources

This directory contains all Kubernetes resources for deploying PostgreSQL database with persistent storage.

## Files

1. `postgres-secret.yaml` - Database credentials
2. `postgres-init-configmap.yaml` - Database initialization script
3. `postgres-pvc.yaml` - Persistent Volume Claim for data storage
4. `postgres-deployment.yaml` - PostgreSQL deployment configuration
5. `postgres-service.yaml` - Service to expose PostgreSQL within cluster

## Architecture