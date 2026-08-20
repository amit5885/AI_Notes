# 09: Concept diagram generation

**What to build:** AI generates a concept diagram (flowchart, visual model) for the "How It Works" section of each note.

**Blocked by:** 04 (Note generation API)

**Status:** done

- [x] Call Gemini image generation after text generation
- [x] Prompt for educational diagrams (flowcharts, process diagrams, not illustrations)
- [x] Store image URL in Note.diagramUrl
- [x] Display diagram in "How It Works" section of note page
- [x] Handle image generation failures gracefully (note still works without diagram)
