# Stats Service - API Documentation

The stats service computes **aggregate salary statistics** over approved submissions. It supports optional filters by location, role, and experience level. All salaries are converted to **USD** using live FX rates (cached from `open.er-api.com`, refreshed daily) before aggregation, so all numeric values in responses are in USD.

No JWT validation is performed; the endpoint is unauthenticated and intended to be called through the BFF.

**Default local base URL:** `http://localhost:8085`

---

## GET /api/stats

Returns salary statistics for all approved submissions, optionally filtered.

**HTTP method:** `GET`

**Path:** `/api/stats`

**Headers:** None

**Body:** None

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `location` | string | Filter by country/location (URL-encoded). Omit for all locations. |
| `role` | string | Filter by job role. Omit for all roles. |
| `experienceLevel` | string | `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD`. Omit for all levels. |

All parameters are optional and can be combined freely.

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
        "INTERN": { "average": 60000.0, "count": 5 },
        "JUNIOR": { "average": 95000.0, "count": 12 },
        "MID": { "average": 140000.0, "count": 20 },
        "SENIOR": { "average": 200000.0, "count": 8 },
        "LEAD": { "average": 240000.0, "count": 2 }
    }
}
```

| Field | Description |
|-------|-------------|
| `averageSalary` | Mean salary (USD) across matched submissions |
| `medianSalary` | 50th percentile salary (USD) |
| `minSalary` | Lowest salary (USD) |
| `maxSalary` | Highest salary (USD) |
| `count` | Number of matched approved submissions |
| `percentiles` | 10th, 25th, 50th, 75th, and 90th percentile values |
| `experienceBreakdown` | Per-level average salary and count |

Only **`APPROVED`** submissions are included. When no submissions match the filters, `count` is `0` and other fields may be absent or `null`.
