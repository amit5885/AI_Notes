# 10: Rate limiting

**What to build:** Track requests per IP and enforce a 20 requests/hour limit.

**Blocked by:** 02 (Database schema)

**Status:** done

- [x] Create in-memory tracking (IP + timestamps)
- [x] Check in `/api/generate` to count requests per IP
- [x] Return HTTP 429 with error message when limit exceeded
- [x] Include retry-after header with seconds remaining
- [x] Test: 21st request within an hour gets blocked
