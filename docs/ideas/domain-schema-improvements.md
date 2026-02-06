# Domain schema improvement ideas

Scope: @chronops/domain models in packages/domain/src.

## Consistency + typing

- Normalize ID prefixes + constructors (some use id funcs, others inline). Add shared helper in base.
- Replace freeform strings with enums/brands: control.testingFrequency, schedule.cron, pdf.contentType.
- Enforce numeric constraints: pageNumber >= 1, pageCount >= 0, fileSize >= 0.
- Framework.version mixes number/string; pick one, add SemVer brand if string.

## Lifecycle + status modeling

- ScheduleRun: status + success duplicates. Prefer status=success|failed|in_progress, or drop success.
- Schedule.lastRanAt is derived from runs; consider moving to ScheduleRun only.
- Workflow status types per entity could align naming (draft/active/archived vs approved/deprecated).

## Polymorphic refs

- Comment.entityId union lacks entity type; add entityType + entityId (pair), or encode as tagged union.
- Consider generic Reference schema for other cross-entity links.

## PDF domain

- PdfPage.textContent empty string default; maybe NullOr until processed.
- Pdf.storageKey + PdfPage.storageKey: add storage provider/type if multiple backends.
- Add Pdf checksum/hash to detect duplicate uploads.

## Base + audit

- Base.hash currently ULID; rename to revisionId or add real hash if used for integrity.
- Consider createdBy/updatedBy optional for system actors or background jobs.
- Add explicit deleted flag or deletedAt index hints if soft-delete common.

## AI embeddings

- Vector lacks length constraint; add fixed-length schema for VECTOR_DIMENSION.
- Consider Vector element bounds (e.g. finite, not NaN).
