# Secrets

This directory contains Kubernetes Secrets for storing sensitive configuration.

## Files

1. `jwt-secret.yaml` - JWT signing secret for identity service

## Purpose

Secrets store sensitive data in base64 encoding (NOT encryption):
- Database passwords (in `../postgres/postgres-secret.yaml`)
- JWT signing keys
- API keys
- Certificates

## Security Notes

**⚠️ IMPORTANT**:
- Base64 is **NOT encryption** - it's just encoding
- Anyone with cluster access can decode Secrets
- Never commit real secrets to Git
- Use placeholders in Git, replace in production

## JWT Secret

**File**: `jwt-secret.yaml`

```yaml