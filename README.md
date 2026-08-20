# AI Notes Platform

An AI-powered study notes platform where students enter any topic and receive structured study notes with text explanations and concept diagrams, powered by Google Gemini.

## Features

- **Query Expansion** — AI rewrites imprecise input into structured prompts before generation
- **Structured Notes** — Title, Introduction, Key Concepts, How It Works, Example/Analogy, Summary (~500-800 words)
- **Concept Diagrams** — Visual explanations (flowcharts, process diagrams) generated alongside text via Gemini's image generation
- **Caching** — Notes cached by normalized topic slug; repeat requests served instantly
- **Rate Limiting** — 20 requests per hour per IP, enforced via PostgreSQL
- **Content Safety** — Topic blocklist with word-boundary regex + Gemini safety settings (`BLOCK_MEDIUM_AND_ABOVE`)
- **Export** — Download notes as PDF (`@react-pdf/renderer`) or Markdown
- **Related Topics** — AI-suggested follow-up topics displayed after note generation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Prisma 6.8 |
| AI | Google Gemini API (`gemini-3.6-flash`, `gemini-3.1-flash-image`) |
| PDF | `@react-pdf/renderer` |
| Testing | Vitest + React Testing Library |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL="postgresql://user:password@localhost:5432/ai_notes?schema=public"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

Or use migrations for production:

```bash
npm run db:migrate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts       # POST — generate study notes
│   │   ├── notes/[topic]/route.ts  # GET — fetch cached note by slug
│   │   └── trending/route.ts       # GET — trending/cached topics
│   ├── notes/[topic]/page.tsx      # Note display page
│   ├── rate-limited/               # Rate limit exceeded page
│   ├── page.tsx                    # Home page with search
│   └── layout.tsx
├── components/
│   ├── SearchBar.tsx               # Topic input + submit
│   ├── ExportButtons.tsx           # PDF + Markdown download
│   ├── LoadingSpinner.tsx          # Generation loading state
│   ├── RelatedTopics.tsx           # AI-suggested follow-ups
│   └── TrendingTopics.tsx          # Popular cached topics
├── lib/
│   ├── note-service.ts             # Deep module: generation pipeline
│   ├── llm-response.ts             # JSON parser for LLM text output
│   ├── gemini.ts                   # Gemini client + safety settings
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rate-limiter.ts             # DatabaseRateLimiter (20 req/hr/IP)
│   ├── content-safety.ts           # Topic blocklist
│   ├── slug.ts                     # normalizeSlug()
│   └── export-utils.ts             # PDF/Markdown export
├── types/
│   └── note.ts                     # NoteContent, NoteData, NoteExport
└── __tests__/                      # Shared test utilities
```

## API Endpoints

### `POST /api/generate`

Generate study notes for a topic.

**Request body:**
```json
{ "topic": "photosynthesis" }
```

**Response (200):**
```json
{
  "id": "...",
  "title": "Photosynthesis",
  "content": {
    "intro": "...",
    "keyConcepts": ["..."],
    "howItWorks": "...",
    "example": "...",
    "summary": "...",
    "relatedTopics": ["..."]
  },
  "diagramUrl": "data:image/png;base64,...",
  "createdAt": "..."
}
```

**Rate limited (429):** Redirects to `/rate-limited`.

### `GET /api/notes/[topic]`

Fetch a cached note by normalized topic slug.

### `GET /api/trending`

Returns recently generated notes for display on the homepage.

## Database Schema

**Note** — stores generated content, keyed by normalized topic slug.
**RateLimit** — tracks IP-based request timestamps for rate limiting.

## Testing

Tests use Vitest with jsdom for browser API simulation. Run:

```bash
npm run test        # single run
npm run test:watch  # watch mode
```

The test suite covers:
- Route handlers (generate, notes, trending)
- NoteService pipeline (expansion, caching, generation, persistence, diagram)
- LLM response parsing (`parseJsonFromLLmText`)
- Rate limiter (threshold, windowing, edge cases)
- Content safety (blocklist matching)
- Slug normalization
- UI components (SearchBar, ExportButtons, RelatedTopics, etc.)

## License

Private project — not licensed for distribution.
