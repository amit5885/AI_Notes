# 05: Note display page

**What to build:** `/notes/[topic]` page that fetches a note and renders all six sections.

**Blocked by:** 04 (Note generation API)

**Status:** done

- [x] Create `src/app/notes/[topic]/page.tsx`
- [x] Fetch note from API or database on load
- [x] Render six sections: Title (H1), Introduction, Key Concepts (bullets), How It Works, Example/Analogy, Summary
- [x] Add back button to return to homepage
- [x] Show loading state while fetching
- [x] Handle not-found case (topic doesn't exist yet)
