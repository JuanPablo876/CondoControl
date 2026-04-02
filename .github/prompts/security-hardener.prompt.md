---
mode: "agent"
description: "Security audit — find vulnerabilities and recommend fixes"
---

# Security Hardener

## Setup

1. Read `.agent/MEMORY.md` for project-specific auth patterns and integrations
2. If a dependency graph file exists, use it to trace all auth-related files

## Audit Areas

### 1. Auth & Token Handling
Verify JWT/session implementation, token expiry, refresh flows, secret management.

### 2. API Route Protection
Ensure all sensitive routes require authentication. Check for missing auth middleware.

### 3. Input Validation
Check all form inputs and API parameters for sanitization. Look for missing Zod/validation schemas.

### 4. ORM Injection
Look for raw queries or string interpolation in database calls. Verify parameterized queries.

### 5. Environment Variables
Verify secrets are not hardcoded, `.env` is gitignored, fallback values are dev-only.

### 6. CORS & Security Headers
Check middleware for proper CORS configuration, CSP, and security headers (Helmet or equivalent).

### 7. File Uploads
Validate file type restrictions, size limits, and storage path sanitization.

### 8. Third-Party Callbacks
Verify webhook signatures, callback authentication, and IP allowlisting where applicable.

### 9. Rate Limiting
Check auth endpoints and sensitive routes for rate limiting middleware.

### 10. Data Exposure
Ensure API responses don't leak sensitive fields. Verify Prisma `select` usage limits returned data.
