import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ULID } from "./base";
import { FrameworkId } from "./framework";
import { ControlId } from "./control";

export const DocumentId = Schema.String.pipe(Schema.brand("DocumentId"));
export type DocumentId = typeof DocumentId.Type;

export const DocumentType = Schema.Union(
  Schema.Literal("requirement"),
  Schema.Literal("evidence"),
  Schema.Literal("clause"),
);
export type DocumentType = typeof DocumentType.Type;

export const makeDocumentId = Effect.fn(function* () {
  const { createId } = yield* ULID;

  return DocumentId.make(`doc_${createId()}`);
});

export class Document extends Schema.Class<Document>("Document")({
  id: DocumentId,
  name: Schema.String,
  type: DocumentType,
  url: Schema.String,
  size: Schema.optional(Schema.Number),
  frameworkId: Schema.optional(FrameworkId),
  controlId: Schema.optional(ControlId),
  organizationId: Schema.String,
  createdAt: Schema.Date,
  createdBy: Schema.String,
}) {
  update(input: UpdateDocument) {
    return new Document({
      ...this,
      ...input,
    });
  }
}

export const CreateDocument = Document.pipe(Schema.pick("name", "type", "url", "size", "frameworkId", "controlId", "organizationId", "createdBy"));
export type CreateDocument = typeof CreateDocument.Type;

export const UpdateDocument = CreateDocument.pipe(Schema.partial);
export type UpdateDocument = typeof UpdateDocument.Type;

export const make = Effect.fn(function* (input: CreateDocument) {
  return Document.make({
    id: yield* makeDocumentId(),
    createdAt: new Date(),
    ...input,
  });
});
