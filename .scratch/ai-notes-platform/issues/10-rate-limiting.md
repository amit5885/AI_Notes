# 10: Rate limiting

**What to build:** Track requests per IP and enforce a 20 requests/hour limit.

**Blocked by:** 02 (Database schema)

**Status:** ready-for-agent

- [ ] Create RateLimit model or in-memory tracking (IP + timestamps)
- [ ] Middleware or check in `/api/generate` to count requests per IP
- [ ] Return HTTP 429 with error message when limit exceeded
- [ ] Include retry-after header with seconds remaining
- [ ] Test: 21st request within an hour gets blocked
