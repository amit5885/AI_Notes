# 14: Rate limit page

**What to build:** `/rate-limited` page shown when a student exceeds the request limit.

**Blocked by:** 10 (Rate limiting)

**Status:** ready-for-agent

- [ ] Create `src/app/rate-limited/page.tsx`
- [ ] Display friendly message: "You've been busy! Please wait [time] before trying again."
- [ ] Show countdown timer with retry-after seconds
- [ ] Auto-redirect or enable retry button when countdown reaches zero
- [ ] Style to match site design
