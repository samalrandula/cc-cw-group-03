# Report Service - API Documentation

The report service is aligned with the **BFF**: the BFF validates the JWT with the identity service, sets **`userId`** on the request body, and forwards **`POST /report`** with the client’s `Authorization` header for validation only on the BFF. The report service **does not** validate JWTs; it trusts **`userId`** on inbound requests (use network boundaries so only trusted callers reach this API).

For **local or internal testing**, you may call the report service directly with a body that includes **`userId`**.

Reports are persisted in the **`reports`** table. Submitting a report **does not** change the salary submission’s **`status`** (no `FLAGGED` state; community moderation is separate from the `PENDING` / `APPROVED` / `REJECTED` / `ADMIN_REJECTED` lifecycle). The **salary submission service** remains the source of truth for **`status`**.

**Default local base URL:** `http://localhost:8087` (see `application.properties`).

---

## POST /report

Records a single user report against a salary submission. Each user may report a given submission **at most once** (duplicate reports return **400**).

**HTTP method:** `POST`

**Path:** `/report`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |

**Request body:**

```json
{
    "userId": 1,
    "submissionId": 3,
    "reason": "Incorrect salary range"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `userId` | long | Set by the BFF after token validation; required for direct calls too. |
| `submissionId` | long | Salary submission being reported. |
| `reason` | string | Optional free-text or structured reason (caller-defined). |

### Success response (200 OK)

Body contains only a **`message`** field (no report counts or flags in the JSON).

```json
{
    "message": "Report recorded successfully"
}
```

### Error responses

**400 Bad Request** — business rule violation (e.g. user already reported this submission). Body uses the same shape as success:

```json
{
    "message": "You have already reported this submission"
}
```

**400 Bad Request** — validation failure on the request body (e.g. missing `userId` / `submissionId`): Spring returns its standard validation error payload (not necessarily the `ReportResponse` shape above).

---

## POST /admin/reject-submission

Sets the salary submission’s status to **`ADMIN_REJECTED`** via the salary submission service. Intended for **trusted admin** paths only (BFF, API gateway, or internal tools); this service does not perform admin authentication itself.

**HTTP method:** `POST`

**Path:** `/admin/reject-submission`

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |

**Request body:**

```json
{
    "submissionId": 3
}
```

| Field | Type | Description |
|--------|------|-------------|
| `submissionId` | long | Salary submission to reject. |

### Success response (200 OK)

```json
{
    "message": "Submission rejected",
    "submissionId": 3
}
```

The salary row is updated through **`PUT`** on the salary submission service (`ADMIN_REJECTED`). That status is **final** for automated updates: the salary service ignores later vote-driven status changes; see the salary submission and vote service documentation.

### Error responses

**404 Not Found** — no salary submission exists for the given `submissionId`.

**400 Bad Request** — validation failure (e.g. missing `submissionId`).

---

## GET /test

Liveness check.

**HTTP method:** `GET`

**Path:** `/test`

**Headers:** None  

**Body:** None  

### Success response (200 OK)

Plain text:

```
Application is running successfully
```
