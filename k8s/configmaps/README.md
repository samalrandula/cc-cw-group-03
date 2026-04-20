# ConfigMaps

This directory contains ConfigMaps for externalizing application configuration.

## Files

1. `identity-configmap.yaml` - Identity service configuration
2. `salary-configmap.yaml` - Salary submission service configuration
3. `vote-configmap.yaml` - Vote service configuration
4. `search-configmap.yaml` - Search service configuration
5. `stats-configmap.yaml` - Stats service configuration
6. `bff-configmap.yaml` - BFF service configuration
7. `frontend-configmap.yaml` - Frontend configuration

## Purpose

ConfigMaps separate configuration from code, allowing:
- Environment-specific settings without rebuilding images
- Easy configuration updates without code changes
- Centralized configuration management

## Structure

Each ConfigMap contains **environment variables** that override `application.properties`:

### Database Services (Identity, Salary, Vote, Search, Stats)
```yaml