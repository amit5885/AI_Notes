# 11: Content safety

**What to build:** Block inappropriate or harmful topics using AI safety filters and a keyword blocklist.

**Blocked by:** 04 (Note generation API)

**Status:** ready-for-agent

- [ ] Define keyword blocklist (explicit, violent, harmful terms)
- [ ] Check input against blocklist before calling AI
- [ ] Configure Gemini safety settings to block harmful content
- [ ] Return friendly error: "This topic can't be generated. Try something else."
- [ ] Test with blocked terms and verify error response
