# Search Service - API Documentation

The search service provides **full-text and filtered search** over salary submissions, along with filter discovery endpoints and per-record lookup. It reads from the shared database (same rows as the salary submission service) and joins vote counts inline. No JWT validation is performed; all endpoints are unauthenticated.

**Default local base URL:** `http://localhost:8084`

All paths are prefixed with `/api/v1/salaries`.

---

## POST /api/v1/salaries/search

Searches salary submissions with optional filters and pagination. Results are sorted by **salary descending**. All filter parameters are optional — omitting a field returns all values for that dimension.

**HTTP method:** `POST`

**Path:** `/api/v1/salaries/search`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |

**Request body:**

```json
{
    "countries": ["Sri Lanka", "India"],
    "companies": ["Tech Corp"],
    "roles": ["Software Engineer"],
    "experienceLevels": ["MID", "SENIOR"],
    "salaryMin": 50000,
    "salaryMax": 300000,
    "page": 0,
    "pageSize": 20
}
```

| Field | Type | Description |
|-------|------|-------------|
| `countries` | string[] | Filter by country (OR logic within the list). Omit or `null` = no filter. |
| `companies` | string[] | Filter by company. |
| `roles` | string[] | Filter by role. |
| `experienceLevels` | string[] | `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD`. |
| `salaryMin` | number | Minimum salary (inclusive). |
| `salaryMax` | number | Maximum salary (inclusive). |
| `page` | integer | 0-based page index. Default `0`. |
| `pageSize` | integer | Results per page. Default `20`, max `100`. |

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
            "upvoteCount": 4,
            "downvoteCount": 1
        }
    ],
    "totalCount": 42,
    "totalPages": 3,
    "currentPage": 0,
    "pageSize": 20
}
```

When a submission was made with `anonymize: true`, `company` is returned as `"Anonymous"`.

When no results match, `salaries` is `[]` and `totalCount` is `0`.

---

## GET /api/v1/salaries/{id}

Fetches a single salary entry with its current vote counts.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/{id}`

**Path parameters:**

- `id` (integer) — salary submission ID.

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
    "currency": "LKR",
    "experienceLevel": "MID",
    "yearsOfExperience": 3,
    "isAnonymized": false,
    "submittedAt": "2024-01-15T10:30:00",
    "upvoteCount": 4,
    "downvoteCount": 1
}
```

---

## GET /api/v1/salaries/filters/countries

Returns all distinct countries present in the dataset. Use to populate filter dropdowns.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/filters/countries`

### Success response (200 OK)

```json
{
    "countries": ["India", "Sri Lanka", "United Kingdom"]
}
```

---

## GET /api/v1/salaries/filters/companies

Returns all distinct company names present in the dataset.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/filters/companies`

### Success response (200 OK)

```json
{
    "companies": ["Google", "Tech Corp", "WSO2"]
}
```

---

## GET /api/v1/salaries/filters/roles

Returns all distinct job roles present in the dataset.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/filters/roles`

### Success response (200 OK)

```json
{
    "roles": ["Data Engineer", "DevOps Engineer", "Software Engineer"]
}
```

---

## GET /api/v1/salaries/filters/experience-levels

Returns all distinct experience levels present in the dataset.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/filters/experience-levels`

### Success response (200 OK)

```json
{
    "experienceLevels": ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"]
}
```

---

## GET /api/v1/salaries/health

Service liveness check.

**HTTP method:** `GET`

**Path:** `/api/v1/salaries/health`

### Success response (200 OK)

```json
{
    "status": "ok",
    "message": "Search service is running"
}
```
