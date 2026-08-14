# Job API Endpoint Analysis - JobOptimizer

## 1. Job REST Controller

**Full File Path:** `C:\Projects\JobOptimizer\job-backend\guideline-service\src\main\java\ai\guideline\job\controller\JobRestController.java`

**Package:** `ai.guideline.job.controller`

**Class:** `JobRestController` (annotated with `@RestController`)

The controller is located under the Spring context root (no `@RequestMapping` at class level, so endpoints are absolute).

---

## 2. Exact PUT Endpoint for Updating a Job

**Method:** `PUT`

**URL Path:** `/client/{clientId}/job/{jobId}`

**Method Signature:**
```java
@RequestMapping(value = "/client/{clientId}/job/{jobId}", method = RequestMethod.PUT)
public Job updateJob(@PathVariable("clientId") String clientId, 
                     @PathVariable("jobId") String jobId, 
                     @RequestBody Job job) {
    job.setClientId(clientId);
    job.setId(jobId);
    return jobManager.updateJob(job);
}
```

**Request Body:** `Job` object (full `ai.guideline.model.Job` instance)

**Important Note:** The controller overrides `clientId` and `jobId` from the path variables onto the Job object before persisting. Even if the request body contains different `clientId` or `id` values, they will be replaced with the path parameter values.

---

## 3. GET Endpoint for Fetching a Single Job

**Method:** `GET`

**URL Path:** `/client/{clientId}/job/{jobId}`

**Method Signature:**
```java
@RequestMapping(value = "/client/{clientId}/job/{jobId}", method = RequestMethod.GET)
public Job getJob(@PathVariable("clientId") String clientId, 
                  @PathVariable("jobId") String jobId) {
    return jobManager.getJob(jobId(clientId, jobId));
}
```

**Response:** Single `Job` object

---

## 4. GET Endpoint for Fetching All Jobs

**Method:** `GET`

**URL Path:** `/client/{clientId}/job`

**Method Signature:**
```java
@RequestMapping(value = "/client/{clientId}/job", method = RequestMethod.GET)
public List<Job> getJobs(@PathVariable("clientId") String clientId, 
                         @RequestParam(required = false) List<String> ids) {
    if (!CollectionUtils.isEmpty(ids)) {
        return jobManager.getJobsByIds(GCollectionUtils.map(ids, id -> jobId(clientId, id)));
    }
    return jobManager.getJobs(new ClientId(clientId));
}
```

**Optional Query Param:** `ids` — comma-separated list of job IDs to filter by (e.g., `?ids=job1,job2`)

**Response:** `List<Job>`

---

## 5. Additional Job Endpoints

| Method | Path | Description | Request Body |
|--------|------|-------------|--------------|
| `POST` | `/client/{clientId}/job` | Add a single job | `Job` |
| `POST` | `/client/{clientId}/job/upload` | Import jobs from CSV file | multipart file |
| `POST` | `/client/{clientId}/job-bulk` | Add multiple jobs | `List<Job>` |
| `POST` | `/client/{clientId}/job-search` | Search jobs with query | `QueryRequest` |
| `POST` | `/client/{clientId}/job/{jobId}/status` | Update job status | `JobStatusUpdate` |
| `POST` | `/client/{clientId}/job/lock` | Lock multiple jobs | `JobLockRequest` |
| `POST` | `/client/{clientId}/job/{jobId}/lock` | Lock a single job | `JobLockPolicy` |
| `POST` | `/client/{clientId}/job/{jobId}/unlock` | Unlock a single job | none |
| `GET` | `/client/{clientId}/job/{jobId}/lock-status` | Get lock status | none |

---

## 6. Job Model Class

**File Path (Generated):** `C:\Projects\JobOptimizer\job-backend\guideline-service-sdk\target\generated-sources\openapi\src\gen\java\main\ai\guideline\model\Job.java`

This is a **generated Java class from an OpenAPI specification** (not a manually maintained file). The package is `ai.guideline.model`.

### Key Fields in the Job Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Job ID |
| `clientId` | `String` | Client identifier |
| `name` | `String` | Job name |
| `description` | `String` | Job description |
| `status` | `String` | Job status (e.g., OPEN, RUNNING, COMPLETED) |
| `jobStatusHistory` | `Map<String, JobStatus>` | History of status transitions |
| `dependencies` | `List<String>` | List of job IDs that this job depends on |
| `resources` | `List<ResourceRequirement>` | Resource requirements for the job |
| `constraints` | `List<Constraint>` | Constraints applied to the job |
| `provider` | `String` | Provider name |
| `providerId` | `String` | Provider-specific job ID |
| `jobType` | `String` | Type of job |
| `time` | `TimeSlot` | Time slot information |
| `schedule` | `Schedule` | Schedule information |
| `metadata` | `Map<String, Object>` | Custom metadata |
| `tags` | `List<String>` | Tags for categorization |

### Dependencies Structure

**Dependencies are represented as `List<String>`** — a list of job ID strings (not nested objects). Each string is the `id` of another job that the current job depends on.

**JSON representation:**
```json
{
  "id": "job-abc",
  "clientId": "client-123",
  "name": "Build Phase",
  "dependencies": ["job-xyz", "job-def"],
  "resources": [...],
  "constraints": [...],
  ...
}
```

### Job DAO (Data Access Object)

**File Path:** `C:\Projects\JobOptimizer\job-backend\guideline-service\src\main\java\ai\guideline\job\dal\models\JobDao.java`

The `JobDao` extends `EntityMongoDao<JobWrapper, JobId>` and represents the MongoDB persistence layer for Job entities.

---

## 7. Service Layer

**Service Interface:** `ai.guideline.job.service.JobService`
- File: `C:\Projects\JobOptimizer\job-backend\guideline-service\src\main\java\ai\guideline\job\service\JobService.java`

**Service Implementation:** `ai.guideline.job.service.JobServiceImpl`
- File: `C:\Projects\JobOptimizer\job-backend\guideline-service\src\main\java\ai\guideline\job\service\JobServiceImpl.java`

---

## Summary of Key Findings

1. **Dependencies are `List<String>`** — simple list of job ID strings. No nested objects.
2. The `updateJob` PUT endpoint accepts the full `Job` object in the request body, including the `dependencies` list.
3. Path variables `clientId` and `jobId` **override** any corresponding values in the request body.
4. The `Job` class is **OpenAPI-generated** from a spec, not manually maintained Java source.
5. All endpoints are scoped under `/client/{clientId}/...` pattern.
