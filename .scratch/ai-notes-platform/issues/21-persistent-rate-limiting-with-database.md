# 21: Persistent rate limiting with database

**What to build:** Rate limiting that persists across server restarts by storing request timestamps in the database instead of in-memory.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Add `RateLimit` model to Prisma schema (ip, timestamp)
- [x] Create database migration
- [x] Update rate limiter to use database queries
- [x] Add cleanup job for old rate limit entries
- [x] Add tests for persistent rate limiting
- [x] Verify all tests pass and typecheck is clean
