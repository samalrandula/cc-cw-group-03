# Vote Service - API Documentation

## PUT /api/vote

Manages votes for salary submissions. Acts as a toggle:
- If you already voted UPVOTE and vote again with UPVOTE, it removes the UPVOTE
- If you already voted UPVOTE and vote again with DOWNVOTE, it switches to DOWNVOTE
- Same logic applies for DOWNVOTE

**HTTP Method:** PUT

**Required Headers:**
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "salarySubmissionId": 3,
    "voteType": "DOWNVOTE"
}
```

**Valid voteType values:** `UPVOTE`, `DOWNVOTE`

### Success Responses (200 OK)

Vote recorded:
```json
{
    "message": "Vote recorded successfully",
    "upvoteCount": 3,
    "downvoteCount": 2,
    "submissionStatus": "PENDING"
}
```

Vote removed:
```json
{
    "message": "Vote removed successfully",
    "upvoteCount": 2,
    "downvoteCount": 2,
    "submissionStatus": "PENDING"
}
```

Vote changed:
```json
{
    "message": "Vote changed successfully",
    "upvoteCount": 2,
    "downvoteCount": 3,
    "submissionStatus": "REJECTED"
}
```

### Error Responses

**401 Unauthorized** - Missing/invalid token:
```json
{
    "message": "Unauthorized: Missing or invalid token",
    "upvoteCount": 0,
    "downvoteCount": 0,
    "submissionStatus": "ERROR"
}
```

**401 Unauthorized** - Expired token:
```json
{
    "message": "Unauthorized: Invalid or expired token",
    "upvoteCount": 0,
    "downvoteCount": 0,
    "submissionStatus": "ERROR"
}
```

---

## GET /api/vote/submission/{salarySubmissionId}

Retrieves vote counts for a specific salary submission.

**Path Parameters:**
- `salarySubmissionId` (integer) - The ID of the salary submission

**Required Headers:** None

**Request Body:** None

### Success Response (200 OK)

```json
{
    "message": "Vote count retrieved",
    "upvoteCount": 2,
    "downvoteCount": 3
}
```
