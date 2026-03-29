---
applyTo: "**/middleware.ts"
---

# Middleware (Next.js)

## Runtime

- Next.js middleware runs on the **Edge Runtime** by default
- No Node.js APIs: no `fs`, no `Buffer`, no `child_process`, no Prisma
- Only import from `next/server` and edge-compatible packages
- `crypto.subtle` is available, `crypto` (Node) is not

## Matcher

- Use `config.matcher` with negative lookahead to exclude static assets:

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)'],
};
```

## Behavior

- Keep middleware lightweight — it runs on **every** matched request
- Return `NextResponse.next()`, `.redirect()`, or `.rewrite()` — never throw
- Use `Set` for O(1) path lookups, not arrays
- Auth checks belong in route handlers, not middleware (unless explicitly setting up middleware-level auth)
- Do not fetch from the database in middleware — defer to API routes or server components

## Common Patterns

- **Reserved paths**: Use a `Set` of known static paths to prevent dynamic catch-all routes from swallowing them
- **Redirects**: Prefer `next.config.js` redirects over middleware for static redirects
- **Headers**: Set security headers (CSP, HSTS) in middleware if not handled by `next.config.js`
