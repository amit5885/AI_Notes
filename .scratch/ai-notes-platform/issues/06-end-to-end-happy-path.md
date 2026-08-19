# 06: End-to-end happy path

**What to build:** The complete flow: type a topic on homepage → see the generated note on the note page.

**Blocked by:** 03 (Homepage UI), 05 (Note display page)

**Status:** ready-for-agent

- [ ] Connect homepage search to POST `/api/generate`
- [ ] Redirect to `/notes/[topic]` after generation
- [ ] Verify note loads and displays correctly
- [ ] Test with 3+ different topics end-to-end
- [ ] Ensure back button returns to homepage
