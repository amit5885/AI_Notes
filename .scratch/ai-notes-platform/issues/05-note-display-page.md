# 05: Note display page

**What to build:** `/notes/[topic]` page that fetches a note and renders all six sections.

**Blocked by:** 04 (Note generation API)

**Status:** ready-for-agent

- [ ] Create `src/app/notes/[topic]/page.tsx`
- [ ] Fetch note from API or database on load
- [ ] Render six sections: Title (H1), Introduction, Key Concepts (bullets), How It Works, Example/Analogy, Summary
- [ ] Add back button to return to homepage
- [ ] Show loading state while fetching
- [ ] Handle not-found case (topic doesn't exist yet)
