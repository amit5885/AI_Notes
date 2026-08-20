# 07: Caching layer

**What to build:** Check the database for an existing note before generating. Serve cached notes instantly.

**Blocked by:** 02 (Database schema)

**Status:** done

- [x] Normalize topic to slug (lowercase, hyphenated) for cache key
- [x] In `/api/generate`, check DB for existing note by slug before calling AI
- [x] If cached, return existing note immediately
- [x] If not cached, generate fresh and store
- [x] Add GET `/api/notes/[topic]` endpoint for direct cache lookup
