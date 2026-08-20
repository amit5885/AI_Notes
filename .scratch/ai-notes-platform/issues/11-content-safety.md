# 11: Content safety

**What to build:** Block inappropriate or harmful topics using AI safety filters and a keyword blocklist.

**Blocked by:** 04 (Note generation API)

**Status:** done

- [x] Define keyword blocklist (explicit, violent, harmful terms)
- [x] Check input against blocklist before calling AI
- [x] Return friendly error: "This topic can't be generated. Try something else."
- [x] Test with blocked terms and verify error response
