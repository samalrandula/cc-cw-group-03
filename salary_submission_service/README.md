# Salary Submission Service - API Documentation

The salary submission service is the **source of truth for salary entries and their lifecycle status**. It stores submissions, serves individual records by ID, and accepts status updates from the vote and report services. It does not validate JWTs; it is intended to be reached via the BFF or by trusted internal services only.

For **local or internal testing**, you may call the service directly.

**Default local base URL:** `http://localhost:8081`

---

## POST /submit

Creates a new salary submission. The salary is automatically rounded to the nearest 1 000 (e.g. 123 456 → 123 000) and `submittedAt` is set to the server's current time regardless of any value in the request.

**HTTP method:** `POST`

**Path:** `/submit`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |

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

Initial `status` is always **`PENDING`**.

### Error responses

**400 Bad Request** — validation failure:

```json
{
    "status": 400,
    "error": "Validation failed",
    "details": ["salary: must be greater than 0"]
}
```

---

## GET /api/submissions/{id}

Fetches a single salary submission by its ID.

**HTTP method:** `GET`

**Path:** `/api/submissions/{id}`

**Path parameters:**

- `id` (integer) — submission ID returned by `POST /submit`.

**Headers:** None

**Body:** None

### Success response (200 OK)

```json
{
    "id": 5,
    "company": "Tech Corp",
    "country": "Sri Lanka",
    "role": "Software Engineer",
    "salary": 120000,
    "submittedAt": "2024-01-15T10:30:00",
    "yearsOfExperience": 3,
    "experienceLevel": "MID",
    "currency": "LKR",
    "anonymize": false,
    "status": "PENDING"
}
```

**`status`** possible values: `PENDING`, `APPROVED`, `REJECTED`, `ADMIN_REJECTED`.

### Error responses

**404 Not Found:**

```json
{
    "error": "Salary submission not found with id: 5"
}
```

---

## PUT /api/submissions/{id}/status

Updates the status of a salary submission. Called internally by the vote service (to set `APPROVED` / `REJECTED`) and the report service (to set `ADMIN_REJECTED`).

**Important:** Once a submission is `ADMIN_REJECTED`, this endpoint silently ignores any further status change — the `ADMIN_REJECTED` state is final for automated updates.

**HTTP method:** `PUT`

**Path:** `/api/submissions/{id}/status`

**Path parameters:**

- `id` (integer) — submission ID.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `PENDING`, `APPROVED`, `REJECTED`, or `ADMIN_REJECTED` (case-insensitive) |

**Body:** None

### Success response (200 OK)

```json
{
    "message": "Status updated successfully",
    "submissionId": 5,
    "status": "APPROVED"
}
```

### Error responses

**400 Bad Request** — unrecognised status value:

```json
{
    "error": "<details>"
}
```

**404 Not Found** — submission does not exist:

```json
{
    "error": "<details>"
}
```
