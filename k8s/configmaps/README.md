# ConfigMaps

This directory contains ConfigMaps for externalizing application configuration.

## Files

1. `service-configmap.yaml` - Services configuration
2. `bff-configmap.yaml` - BFF service configuration
3. `frontend-configmap.yaml` - Frontend configuration

## Purpose

ConfigMaps separate configuration from code, allowing:
- Environment-specific settings without rebuilding images
- Easy configuration updates without code changes
- Centralized configuration management

## Structure

Each ConfigMap contains **environment variables** that override `application.properties`:

### Database Services (Identity, Salary, Vote, Search, Stats)
```yaml