# BFF Service - API Documentation

The BFF (Backend for Frontend) is the **single entry point** for all client requests. It validates JWTs with the identity service, injects `userId` into downstream calls, and proxies requests to the appropriate microservice. Clients never call internal services directly.

**Default local base URL:** `http://localhost:8082`

---

## Authentication

Endpoints marked **Auth required** expect:

```
Authorization: Bearer <jwt>
```

The BFF validates the token by calling `GET /validate-token` on the identity service. If the token is missing, malformed, or invalid the BFF returns **401**:

```json
{ "error": "Unauthorized" }
```

After successful validation the BFF sets `userId` on the downstream request body — clients do **not** send `userId` themselves.

---

## POST /signup

Registers a new user. Proxied to the identity service.

**Auth required:** No

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

| Status | Description |
|--------|-------------|
| 409 Conflict | Email already registered |
| 400 Bad Request | Validation failure |

---

## POST /login

Authenticates a user and returns a JWT. Proxied to the identity service.

**Auth required:** No

**Request body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

### Success response (200 OK)

```json
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "userId": 1
}
```

### Error responses

| Status | Description |
|--------|-------------|
| 401 Unauthorized | Invalid credentials |
| 400 Bad Request | Validation failure |

---

## POST /submit

Submits a salary entry. Proxied to the salary submission service.

**Auth required:** No

**Request body:**

```json
{
    "company": "Tech Corp",
    "country": "Sri Lanka",
    "role": "Software Engineer",
    "salary": 120000,
    "yearsOfExperience": 3,
    "experienceLevel": "MID",
    "currency": "LKR",
    "anonymize": false
}
```

| Field | Type | Validation |
|-------|------|------------|
| `company` | string | required |
| `country` | string | required |
| `role` | string | required |
| `salary` | number | required, > 0 |
| `yearsOfExperience` | integer | required, ≥ 0 |
| `experienceLevel` | string | required — `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD` |
| `currency` | string | optional |
| `anonymize` | boolean | optional, defaults to `false` |

### Success response (201 Created)

```json
{
    "id": 5,
    "message": "Submission successful"
}
```

### Error responses

| Status | Description |
|--------|-------------|
| 400 Bad Request | Validation failure |

---

## POST /vote

Casts or toggles a vote on a salary submission. Proxied to the vote service. The BFF injects `userId` from the validated token.

**Auth required:** Yes

**Request body:**

```json
{
    "salarySubmissionId": 5,
    "voteType": "UPVOTE"
}
```

| Field | Type | Validation |
|-------|------|------------|
| `salarySubmissionId` | long | required |
| `voteType` | string | `UPVOTE` or `DOWNVOTE` |

### Success responses (200 OK)

See the [vote service documentation](../vote_service/README.md) for the full set of success and error response shapes.

### Error responses

| Status | Description |
|--------|-------------|
| 401 Unauthorized | Missing or invalid token |
| 400 Bad Request | Validation failure |

---

## GET /submission/{salarySubmissionId}

Returns the current vote status for the authenticated user on a given submission. Proxied to the vote service.

**Auth required:** Yes

**Path parameters:**

- `salarySubmissionId` (integer) — ID of the salary submission.

**Headers:** `Authorization: Bearer <jwt>`

**Body:** None

### Success response (200 OK)

```json
{
    "message": "User vote status retrieved",
    "userVoteStatus": "UPVOTE"
}
```

`userVoteStatus` is `UPVOTE`, `DOWNVOTE`, or `NONE`.

### Error responses

| Status | Description |
|--------|-------------|
| 401 Unauthorized | Missing or invalid token |

---

## POST /report

Records a report against a salary submission. Proxied to the report service. The BFF injects `userId` from the validated token.

**Auth required:** Yes

**Request body:**

```json
{
    "submissionId": 5,
    "reason": "Salary seems unrealistic"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `submissionId` | long | required |
| `reason` | string | optional |

### Success response (200 OK)

```json
{
    "message": "Report recorded successfully"
}
```

### Error responses

| Status | Description |
|--------|-------------|
| 401 Unauthorized | Missing or invalid token |
| 400 Bad Request | Validation failure or duplicate report |

---

## GET /search

Searches salary submissions with optional filters and pagination. The BFF converts the query parameters to a POST body and forwards to the search service.

**Auth required:** No

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `countries` | string (repeatable) | Filter by one or more countries |
| `companies` | string (repeatable) | Filter by one or more companies |
| `roles` | string (repeatable) | Filter by one or more roles |
| `experienceLevels` | string (repeatable) | `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD` |
| `salaryMin` | number | Minimum salary (inclusive) |
| `salaryMax` | number | Maximum salary (inclusive) |
| `page` | integer | Page index, 0-based (default `0`) |
| `pageSize` | integer | Results per page, max 100 (default `20`) |

### Success response (200 OK)

```json
{
    "salaries": [
        {
            "id": 5,
            "company": "Tech Corp",
            "country": "Sri Lanka",
            "role": "Software Engineer",
            "salary": 120000,
            "currency": "LKR",
            "experienceLevel": "MID",
            "yearsOfExperience": 3,
            "isAnonymized": false,
            "submittedAt": "2024-01-15T10:30:00",
            "upvoteCount": 3,
            "downvoteCount": 1
        }
    ],
    "totalCount": 42,
    "totalPages": 3,
    "currentPage": 0,
    "pageSize": 20
}
```

When `anonymize` was `true` on submission, `company` is returned as `"Anonymous"`.

---

## GET /stats

Returns aggregate salary statistics with optional filters. Proxied to the stats service.

**Auth required:** No

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `location` | string | Filter by country/location |
| `role` | string | Filter by role |
| `experienceLevel` | string | `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD` |

### Success response (200 OK)

```json
{
    "averageSalary": 145000.0,
    "medianSalary": 135000.0,
    "minSalary": 80000.0,
    "maxSalary": 250000.0,
    "count": 47,
    "percentiles": {
        "10": 90000.0,
        "25": 110000.0,
        "50": 135000.0,
        "75": 175000.0,
        "90": 210000.0
    },
    "experienceBreakdown": {
        "JUNIOR": { "average": 95000.0, "count": 12 },
        "MID": { "average": 140000.0, "count": 20 },
        "SENIOR": { "average": 200000.0, "count": 15 }
    }
}
```

Only **`APPROVED`** submissions are included in calculations. All salaries are normalised to **USD** before aggregation.

When no matching submissions exist, `count` is `0`.
