# Salary Insights Platform

## API Documentation

This project consists of multiple microservices that work together to collect, validate, vote on, search, and analyze salary submissions.

Services:

* Identity Service
* Salary Submission Service
* Vote Service
* Search Service
* Stats Service

---
# Identity Service

Base URL: `http://localhost:8081`

The Identity Service handles **user registration, authentication, and token validation** using JWT tokens.

---

## User Signup

**POST /signup**

Authentication: Not Required

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response (201 Created)

```json
{
  "message": "User registered successfully",
  "userId": 123
}
```

### Errors

| Status          | Description              |
| --------------- | ------------------------ |
| 409 Conflict    | Email already registered |
| 400 Bad Request | Validation failed        |

---

## User Login

**POST /login**

Authentication: Not Required

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response (200 OK)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "userId": 123
}
```

### Errors

| Status           | Description         |
| ---------------- | ------------------- |
| 401 Unauthorized | Invalid credentials |

---

## Validate Token

**GET /validate-token**

Authentication: **Required (Bearer Token)**

### Headers

```
Authorization: Bearer <token>
```

### Response (200 OK)

```json
{
  "valid": true,
  "userId": 123
}
```

### Errors

| Status           | Description              |
| ---------------- | ------------------------ |
| 401 Unauthorized | Invalid or expired token |

---

# Salary Submission Service

Base URL: `http://localhost:8082`

## Submit Salary

**POST /submit**

Authentication: Not required

### Request

```json
{
  "company": "Tech Corp",
  "country": "Sri Lanka",
  "role": "Software Engineer",
  "salary": 120000.00,
  "yearsOfExperience": 3,
  "experienceLevel": "Mid",
  "currency": "LKR",
  "anonymize": false
}
```

### Response

```json
{
  "message": "Salary submitted successfully",
  "submissionId": 456,
  "status": "PENDING"
}
```

### Notes

* Status is always stored as **PENDING**
* No user identity should be stored

---

# Vote Service

Base URL: `http://localhost:8083`

## Vote

**POST /vote**

### Request

```json
{
  "submissionId": 456,
  "voteType": "UPVOTE",
  "userId": 123
}
```

### Validation

| Field        | Rule              |
| ------------ |-------------------|
| submissionId | required          |
| voteType     | UPVOTE / DOWNVOTE |
| userId       | required          |

### Response

```json
{
  "message": "Vote recorded successfully",
  "voteId": 789,
  "submissionId": 456,
  "voteType": "upvote"
}

---

## Report Submission

**POST /report**

### Request

```json
{
  "submissionId": 456,
  "reason": "fake",
  "comment": "This salary seems unrealistic",
  "userId": 123
}
```

### Response

```json
{
  "message": "Report recorded successfully",
  "reportId": 321,
  "submissionId": 456
}
```

# Search Service

Base URL: `http://localhost:8084`

## Search Salaries

**GET /api/search**

### Query Parameters

| Parameter       | Description                |
| --------------- | -------------------------- |
| country         | filter by country          |
| company         | filter by company          |
| role            | filter by role             |
| experienceLevel | filter by experience level |

### Example

`GET /api/search?country=Sri Lanka&role=Software Engineer`

### Response

```json
{
  "results": [
    {
      "id": 456,
      "company": "Tech Corp",
      "role": "Software Engineer",
      "salary": 120000,
      "currency": "LKR",
      "experienceLevel": "Mid",
      "location": "Colombo",
      "yearsOfExperience": 3,
      "status": "APPROVED",
      "anonymize": false
    }
  ],
  "count": 1
}
```

Rules:

* Only return **APPROVED submissions**
* If anonymize=true → replace company with **Confidential**

---

# Stats Service

Base URL: `http://localhost:8085`

## Get Statistics

**GET /stats**

### Query Parameters

| Parameter       | Description                |
| --------------- | -------------------------- |
| location        | filter by location         |
| role            | filter by role             |
| experienceLevel | filter by experience level |

### Response

```json
{
  "averageSalary": 145000,
  "medianSalary": 135000,
  "percentile25": 110000,
  "percentile75": 175000,
  "minSalary": 80000,
  "maxSalary": 250000,
  "totalCount": 47,
  "currency": "LKR"
}
```

### Calculations

| Metric       | SQL                   |
| ------------ | --------------------- |
| Average      | AVG(salary)           |
| Median       | PERCENTILE_CONT(0.5)  |
| Percentile25 | PERCENTILE_CONT(0.25) |
| Percentile75 | PERCENTILE_CONT(0.75) |
| Min          | MIN(salary)           |
| Max          | MAX(salary)           |
| Count        | COUNT(*)              |

Rules:

* Only use submissions with status **APPROVED**
* Apply filters dynamically


