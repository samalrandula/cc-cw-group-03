# Identity Service - API Documentation

The identity service handles **user registration, authentication, and JWT token validation**. It is the authority for all identity operations in the platform. The BFF calls `GET /validate-token` on every authenticated request to extract `userId` before forwarding to downstream services.

**Default local base URL:** `http://localhost:8086`

---

## POST /signup

Registers a new user account.

**HTTP method:** `POST`

**Path:** `/signup`

**Headers:** None required

**Request body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

| Field | Type | Validation |
|-------|------|------------|
| `email` | string | valid email, required |
| `password` | string | 8–128 characters, required |

### Success response (201 Created)

```json
{
    "message": "User registered successfully",
    "userId": 1
}
```

### Error responses

**409 Conflict** — email already in use:

```json
{
    "message": "Email already registered"
}
```

**400 Bad Request** — validation failure: Spring's standard validation error payload.

---

## POST /login

Authenticates a user and returns a signed JWT.

**HTTP method:** `POST`

**Path:** `/login`

**Headers:** None required

**Request body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

| Field | Type | Validation |
|-------|------|------------|
| `email` | string | valid email, required |
| `password` | string | required |

### Success response (200 OK)

```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "userId": 1
}
```

The `token` is an **HS512** JWT containing `userId` and `email` claims. Pass it as `Authorization: Bearer <token>` on subsequent requests to the BFF.

### Error responses

**401 Unauthorized** — unknown email or wrong password:

```json
{
    "message": "Invalid credentials"
}
```

---

## GET /validate-token

Validates a JWT and returns the `userId` encoded in it. Called by the BFF on every authenticated request; not typically called directly by end-user clients.

**HTTP method:** `GET`

**Path:** `/validate-token`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <jwt>` |

**Body:** None

### Success response (200 OK)

```json
{
    "valid": true,
    "userId": 1
}
```

### Error responses

**401 Unauthorized** — header missing or does not start with `"Bearer "`: empty body (no JSON).

**401 Unauthorized** — token is invalid or expired:

```json
{
    "message": "Invalid or expired token"
}
```
