# 22: Improve content safety blocklist

**What to build:** Word-boundary matching for the content safety blocklist to prevent false positives on educational topics like "pharmacology" or "hackathon".

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Update `isTopicAllowed()` to use word-boundary regex matching
- [x] Add test cases for false positives (pharmacology, hackathon, etc.)
- [x] Add test cases for true positives (drug manufacturing, etc.)
- [x] Verify all tests pass and typecheck is clean
