# Spec: AI Notes Platform

## Overview

A web platform where students enter any topic and receive AI-generated study notes with text explanations and concept diagrams.

## User Story

As a student, I want to type any topic into a search bar and instantly get a well-structured, easy-to-understand note so I can learn quickly without digging through textbooks.

---

## Pages

### 1. Homepage (`/`)

**Layout:**
- Hero section with tagline
- Search bar (prominent, centered)
- 3-5 trending/suggested topics below search
- Footer with basic info

**Behavior:**
- Student types a topic and presses Enter (or clicks Search)
- If topic is cached → redirect to `/notes/[topic]`
- If not cached → show loading state, generate, then redirect

**Loading State:**
- Fun rotating messages: "Thinking about [topic]...", "Exploring [topic]...", "Almost there..."
- Spinner animation

---

### 2. Note Page (`/notes/[topic]`)

**Layout:**
- Back button (return to homepage)
- Note title
- Six sections in order:
  1. **Title** — H1
  2. **Introduction** — 1-2 sentences
  3. **Key Concepts** — bullet list of 3-5 core ideas
  4. **How It Works** — explanation + concept diagram (AI-generated image)
  5. **Example/Analogy** — real-world comparison
  6. **Summary** — 2-3 sentence wrap-up
- Export buttons: Download PDF, Download Markdown
- Related topics (suggested next topics)

**Behavior:**
- If note exists in DB → serve it
- If not → generate via AI, store, display
- Show loading state while generating

**Export:**
- PDF: Render note as styled PDF
- Markdown: Plain markdown file

---

### 3. Rate Limit Page (`/rate-limited`)

**Trigger:** Student exceeds 20 requests/hour.

**Layout:**
- Friendly message: "You've been busy! Please wait [time] before trying again."
- Retry-after countdown

---

## Search Behavior

- **Input:** Free-form text (e.g., "how do plants make food")
- **Processing:** AI-powered query expansion rewrites into structured topic
- **Output:** Normalized topic slug for URL (e.g., `photosynthesis`)

---

## Content Safety

- **AI filters:** Gemini's built-in safety settings block explicit/harmful content
- **Keyword blocklist:** Server-side filter catches obvious bypasses
- **Response:** Friendly error: "This topic can't be generated. Try something else."

---

## Caching Strategy

- **Cached topic:** Serve instantly, no generation
- **Unique/niche topic:** Generate fresh, store if reused
- **Cache key:** Normalized topic slug (lowercase, hyphenated)

---

## Rate Limiting

- **Limit:** 20 requests per hour per IP
- **Tracking:** Server-side IP logging with timestamp
- **Response:** HTTP 429 with friendly message

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| AI (Text) | Google Gemini API (free tier) |
| AI (Images) | Gemini image generation or DALL-E |
| Hosting | Vercel (or similar) |
| PDF Generation | `@react-pdf/renderer` or `puppeteer` |

---

## Database Schema

```prisma
model Note {
  id          String   @id @default(cuid())
  topic       String   // normalized slug
  rawQuery    String   // original student input
  title       String
  content     Json     // { intro, keyConcepts, howItWorks, example, summary }
  diagramUrl  String?  // generated image URL
  createdAt   DateTime @default(now())

  @@index([topic])
}
```

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/generate` | Generate note for a topic |
| GET | `/api/notes/[topic]` | Fetch cached note |
| GET | `/api/trending` | Get trending/suggested topics |

---

## AI Prompt Structure

```
You are an educational assistant creating study notes.

Topic: {expanded_topic}

Generate a note with these sections:
1. Title (concise)
2. Introduction (1-2 sentences)
3. Key Concepts (3-5 bullet points)
4. How It Works (2-3 paragraphs explaining the process)
5. Example/Analogy (real-world comparison)
6. Summary (2-3 sentences)

Tone: Simple, clear, student-friendly.
Length: ~500-800 words total.
```

---

## Milestones

### v1 (MVP)
- [ ] Homepage with search bar
- [ ] Note generation via Gemini
- [ ] 6-part note structure
- [ ] Concept diagram generation
- [ ] PDF + Markdown export
- [ ] Caching for repeated topics
- [ ] Rate limiting (20/hr/IP)
- [ ] Content safety filters
- [ ] Responsive design

### v2 (Future)
- [ ] User accounts + history
- [ ] Model switcher (GPT, Claude, etc.)
- [ ] Bookmark/save notes
- [ ] Share notes via link
- [ ] Advanced analytics

---

## Open Questions

None. All decisions finalized in grilling session.
