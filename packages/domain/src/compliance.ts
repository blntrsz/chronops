import { Effect } from "effect";
import * as Schema from "effect/Schema";
import { ULID } from "./base";

export const ComplianceId = Schema.String.pipe(Schema.brand("ComplianceId"));
export type ComplianceId = typeof ComplianceId.Type;

export const makeComplianceId = Effect.fn(function* () {
  const { createId } = yield* ULID;

  return ComplianceId.make(`cmp_${createId()}`);
});

export class Compliance extends Schema.Class<Compliance>("Compliance")({
  id: ComplianceId,
  name: Schema.String,
}) {
  update(input: UpdateCompliance) {
    return new Compliance({
      ...this,
      ...input,
    });
  }
}

export const CreateCompliance = Compliance.pipe(Schema.pick("name"));
export type CreateCompliance = typeof CreateCompliance.Type;

export const UpdateCompliance = CreateCompliance.pipe(Schema.partial);
export type UpdateCompliance = typeof UpdateCompliance.Type;

export const make = Effect.fn(function* (input: CreateCompliance) {
  return Compliance.make({
    id: yield* makeComplianceId(),
    ...input,
  });
});
