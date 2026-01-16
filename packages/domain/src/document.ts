import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { FrameworkId } from "./framework";
import { ControlId } from "./control";

export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"));
export type DocumentId = typeof DocumentId.Type;

/**
 * Generate a new DocumentId
 * @since 1.0.0
 */
export const documentId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return DocumentId.make(`doc_${createId()}`);
});

/**
 * Workflow statuses
 * @since 1.0.0
 */
export const DocumentType = Schema.Union(
  Schema.Literal("draft"),
  Schema.Literal("uploaded"),
  Schema.Literal("approved"),
  Schema.Literal("archived"),
);
export type DocumentType = typeof DocumentType.Type;

/**
 * Document model
 * @since 1.0.0
 * @category models
 */
export class Document extends Base.Base.extend<Document>("Document")({
  id: DocumentId,
  name: Schema.String,
  type: DocumentType,
  url: Schema.String,
  size: Schema.NullOr(Schema.Number),
  frameworkId: Schema.NullOr(FrameworkId),
  controlId: Schema.NullOr(ControlId),
}) {}

export const CreateDocument = Document.pipe(
  Schema.pick("name", "url", "size", "frameworkId", "controlId"),
);
export type CreateDocument = typeof CreateDocument.Type;

export const UpdateDocument = CreateDocument.pipe(Schema.partial);
export type UpdateDocument = typeof UpdateDocument.Type;

/**
 * Create a new Document
 * @since 1.0.0
 */
export const make = Effect.fn(function* (input: CreateDocument) {
  const base = yield* Base.makeBase();

  return Document.make({
    id: yield* documentId(),
    ...input,
    ...base,
    type: "draft",
  });
});

/**
 * Update an existing Document
 * @since 1.0.0
 */
export const update = Effect.fn(function* (
  model: Document,
  input: UpdateDocument,
) {
  const base = yield* Base.updateBase();

  return Document.make({
    ...model,
    ...input,
    ...base,
  });
});

/**
 * Remove an existing Document
 * @since 1.0.0
 */
export const remove = Effect.fn(function* (model: Document) {
  const base = yield* Base.removeBase();

  return Document.make({
    ...model,
    ...base,
  });
});


/**
 * Document not found error
 * @since 1.0.0
 * @category errors
 */
export class DocumentNotFoundError extends Base.NotFoundError {
  static override fromId(id: DocumentId) {
    return new DocumentNotFoundError({
      message: `Document with id ${id} not found.`,
      entityType: "Document",
      entityId: id,
    });
  }
}
