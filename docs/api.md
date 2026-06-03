# Veda AI - API Reference

The Veda AI application exposes several RESTful endpoints and Server-Sent Events (SSE) for real-time updates.

## Base URL
`/api`

---

## 1. Assignments

### Create Assignment
Create a new assignment metadata record. File uploads must be done prior.

**POST** `/assignments`

**Body**:
```json
{
  "title": "Science Term 1",
  "dueDate": "2026-06-15T00:00:00.000Z",
  "fileUrl": "/uploads/123-science.pdf",
  "fileName": "science.pdf",
  "fileType": "pdf",
  "fileSize": 1048576,
  "questionTypes": [
    {
      "type": "Multiple Choice",
      "count": 10,
      "marksPerQuestion": 1
    }
  ],
  "additionalInstructions": "Focus on chapter 3",
  "schoolName": "Delhi Public School",
  "className": "10th Grade",
  "subject": "Science",
  "timeAllowed": "2 Hours",
  "headerLayout": "layout-1"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b392d700153c3d5a",
    "status": "draft",
    // ... assignment details
  }
}
```

### List Assignments
Fetch paginated assignments or search by title.

**GET** `/assignments?page=1&limit=20&q=science`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 5,
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

### Delete Assignment
**DELETE** `/assignments/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## 2. File Uploads

### Upload Study Material
Streams file to the configured Storage Provider (local by default).

**POST** `/upload`

**Headers**: `Content-Type: multipart/form-data`
**Body**: Form Data containing `file` (max 10MB, pdf or txt).

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "fileUrl": "/uploads/unique-name.pdf",
    "fileName": "science.pdf",
    "fileType": "pdf",
    "fileSize": 1048576
  }
}
```

---

## 3. Question Paper Generation

### Trigger Generation
Enqueues a BullMQ job to process the document and generate questions via Groq AI.

**POST** `/generate`

**Body**:
```json
{
  "assignmentId": "60d5ecb8b392d700153c3d5a"
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "jobId": "job-1234",
    "assignmentId": "60d5ecb8b392d700153c3d5a",
    "message": "Generation job queued successfully"
  },
  "message": "Generation started"
}
```

### Stream Progress (SSE)
Subscribes to Redis PubSub for real-time progress updates on a specific assignment's generation.

**GET** `/generate/status?assignmentId=60d5ecb8b392d700153c3d5a`

**Response**: Server-Sent Events stream
```text
data: {"type":"generation-started","progress":10,"message":"Fetching assignment details..."}

data: {"type":"generation-progress","progress":45,"message":"Generating questions with AI..."}

data: {"type":"generation-completed","progress":100,"message":"Paper generated successfully","paperId":"60d5ecc0b392d700153c3d5c"}
```

---

## 4. Papers

### Get Generated Paper
Fetch the finalized question paper after generation completes.

**GET** `/papers/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "60d5ecc0b392d700153c3d5c",
    "assignmentId": "60d5ecb8b392d700153c3d5a",
    "metadata": {
      "schoolName": "Delhi Public School",
      "subject": "Science"
      // ...
    },
    "sections": [
      {
        "title": "Section A",
        "questions": [
          {
            "number": 1,
            "text": "What is photosynthesis?",
            "marks": 2,
            // ...
          }
        ]
      }
    ],
    "totalMarks": 50,
    "totalQuestions": 10
  }
}
```
