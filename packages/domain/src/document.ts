import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { FrameworkId } from "./framework";
import { ControlId } from "./control";

// --- Id ---

export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"));
export type DocumentId = typeof DocumentId.Type;

export const documentId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return DocumentId.make(`doc_${createId()}`);
});

// --- Model ---

export const DocumentType = Schema.Union(
  Schema.Literal("requirement"),
  Schema.Literal("evidence"),
  Schema.Literal("clause"),
);
export type DocumentType = typeof DocumentType.Type;

export class Document extends Base.Base.extend<Document>("Document")({
  id: DocumentId,
  name: Schema.String,
  type: DocumentType,
  url: Schema.String,
  size: Schema.optional(Schema.Number),
  frameworkId: Schema.optional(FrameworkId),
  controlId: Schema.optional(ControlId),
}) {}

// --- Input Schemas ---

export const CreateDocument = Document.pipe(
  Schema.pick("name", "type", "url", "size", "frameworkId", "controlId"),
);
export type CreateDocument = typeof CreateDocument.Type;

export const UpdateDocument = CreateDocument.pipe(Schema.partial);
export type UpdateDocument = typeof UpdateDocument.Type;

// --- Operations ---

export const make = Effect.fn(function* (input: CreateDocument) {
  const base = yield* Base.make();

  return Document.make({
    id: yield* documentId(),
    ...input,
    ...base,
  });
});

export const update = Effect.fn(function* (
  model: Document,
  input: UpdateDocument,
) {
  const base = yield* Base.update();

  return Document.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Document) {
  const base = yield* Base.remove();

  return Document.make({
    ...model,
    ...base,
  });
});

// --- Errors ---

export class DocumentNotFoundError extends Schema.TaggedError<DocumentNotFoundError>(
  "DocumentNotFoundError",
)("DocumentNotFoundError", {
  message: Schema.String,
}) {
  static fromId(id: DocumentId) {
    return new DocumentNotFoundError({
      message: `Document with id ${id} not found`,
    });
  }
}
