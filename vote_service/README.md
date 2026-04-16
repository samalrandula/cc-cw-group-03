# Vote Service - API Documentation

The vote service is aligned with the **BFF**: the BFF validates the JWT with the identity service, sets **`userId`** on the request body, and forwards **`POST /vote`** without an `Authorization` header. The vote service **does not** validate JWTs; it trusts **`userId`** on inbound requests (use network boundaries so only trusted callers reach this API).

For **local or internal testing**, you may call the vote service directly with a body that includes **`userId`**.

---

## POST /vote

Manages votes for salary submissions. Acts as a toggle:

- If you already voted **UPVOTE** and vote again with **UPVOTE**, it removes the vote (**no vote**).
- If you already voted **UPVOTE** and vote again with **DOWNVOTE**, it switches to **DOWNVOTE**.
- Same idea applies when starting from **DOWNVOTE**.

**HTTP method:** `POST`

**Path:** `/vote`

**Headers:** None required (no bearer token on this service when used behind the BFF).

**Request body:**

```json
{
    "userId": 1,
    "submissionId": 3,
    "voteType": "DOWNVOTE"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `userId` | long | Set by the BFF after token validation; required for direct calls too. |
| `submissionId` | long | Salary submission being voted on. |
| `voteType` | string | `UPVOTE` or `DOWNVOTE`. |

### Success responses (200 OK)

All success bodies include **`userVoteStatus`**: the caller’s state **after** the operation — `UPVOTE`, `DOWNVOTE`, or **`NONE`** (no vote on that submission).

Vote recorded:

```json
{
    "message": "Vote recorded successfully",
    "upvoteCount": 3,
    "downvoteCount": 2,
    "submissionStatus": "PENDING",
    "userVoteStatus": "UPVOTE"
}
```

Vote removed (toggle off):

```json
{
    "message": "Vote removed successfully",
    "upvoteCount": 2,
    "downvoteCount": 2,
    "submissionStatus": "PENDING",
    "userVoteStatus": "NONE"
}
```

Vote changed:

```json
{
    "message": "Vote changed successfully",
    "upvoteCount": 2,
    "downvoteCount": 3,
    "submissionStatus": "REJECTED",
    "userVoteStatus": "DOWNVOTE"
}
```

### Error responses

**400 Bad Request** — invalid input (e.g. validation failure):

```json
{
    "message": "<details>",
    "upvoteCount": 0,
    "downvoteCount": 0,
    "submissionStatus": "ERROR",
    "userVoteStatus": "NONE"
}
```

---

## GET /vote/submission/{salarySubmissionId}

Returns aggregate vote counts for a salary submission.

**Path parameters:**

- `salarySubmissionId` (integer) — ID of the salary submission.

**Headers:** None

**Body:** None

### Success response (200 OK)

```json
{
    "message": "Vote count retrieved",
    "upvoteCount": 2,
    "downvoteCount": 3
}
```

---

## GET /vote/submission/{salarySubmissionId}/user/{userId}

Returns the **current vote** for a given user on a given salary submission. Use this when you need the UI state without submitting a vote.

**Path parameters:**

- `salarySubmissionId` (integer) — ID of the salary submission.
- `userId` (long) — ID of the user. Same trust model as **`POST /vote`**: set by the BFF after token validation when calling through the BFF; for direct service calls, supply the user id explicitly.

**Headers:** None

**Body:** None

### Success response (200 OK)

**`userVoteStatus`** is `UPVOTE`, `DOWNVOTE`, or **`NONE`** if that user has no vote on that submission.

```json
{
    "message": "User vote status retrieved",
    "userVoteStatus": "UPVOTE"
}
```
