# 08: Query expansion

**What to build:** AI rewrites the student's raw input into a normalized, structured topic before generating the note.

**Blocked by:** 04 (Note generation API)

**Status:** ready-for-agent

- [ ] Add query expansion step before note generation
- [ ] Prompt Gemini to rewrite raw input into a clean topic (e.g., "how plants make food" → "Photosynthesis")
- [ ] Use expanded topic for note generation and URL slug
- [ ] Store both rawQuery and expanded topic in the Note record
- [ ] Verify imprecise inputs produce correct topics
