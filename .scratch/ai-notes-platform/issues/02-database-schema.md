# 02: Database schema

**What to build:** PostgreSQL connected via Prisma with a Note model. Migrations run successfully.

**Blocked by:** 01 (Project scaffolding)

**Status:** ready-for-agent

- [ ] Define Note model in `schema.prisma` (id, topic, rawQuery, title, content JSON, diagramUrl, createdAt)
- [ ] Add index on `topic` column
- [ ] Run `prisma migrate dev` to create tables
- [ ] Verify connection with `prisma db push` or seed script
