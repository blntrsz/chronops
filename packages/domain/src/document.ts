import { Effect } from "effect";
import * as Schema from "effect/Schema";
import * as Base from "./base";
import { FrameworkId } from "./framework";
import { ControlId } from "./control";

export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"));
export type DocumentId = typeof DocumentId.Type;

export const documentId = Effect.fn(function* () {
  const { createId } = yield* Base.ULID;

  return DocumentId.make(`doc_${createId()}`);
});

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
  size: Schema.NullOr(Schema.Number),
  frameworkId: Schema.NullOr(FrameworkId),
  controlId: Schema.NullOr(ControlId),
}) {}

export const CreateDocument = Document.pipe(
  Schema.pick("name", "type", "url", "size", "frameworkId", "controlId"),
);
export type CreateDocument = typeof CreateDocument.Type;

export const UpdateDocument = CreateDocument.pipe(Schema.partial);
export type UpdateDocument = typeof UpdateDocument.Type;

export const make = Effect.fn(function* (
  input: CreateDocument,
  workflowId: Base.WorkflowId,
) {
  const base = yield* Base.makeBase({ workflowId });

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
  const base = yield* Base.updateBase();

  return Document.make({
    ...model,
    ...input,
    ...base,
  });
});

export const remove = Effect.fn(function* (model: Document) {
  const base = yield* Base.removeBase();

  return Document.make({
    ...model,
    ...base,
  });
});

export class DocumentNotFoundError extends Base.NotFoundError {
  static override fromId(id: DocumentId) {
    return new DocumentNotFoundError({
      message: `Document with id ${id} not found.`,
      entityType: "Document",
      entityId: id,
    });
  }
}
