# 07: Caching layer

**What to build:** Check the database for an existing note before generating. Serve cached notes instantly.

**Blocked by:** 02 (Database schema)

**Status:** ready-for-agent

- [ ] Normalize topic to slug (lowercase, hyphenated) for cache key
- [ ] In `/api/generate`, check DB for existing note by slug before calling AI
- [ ] If cached, return existing note immediately
- [ ] If not cached, generate fresh and store
- [ ] Add GET `/api/notes/[topic]` endpoint for direct cache lookup
