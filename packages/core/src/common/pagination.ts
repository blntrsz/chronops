import { Schema } from "effect";

export function Paginated<TSchema extends Schema.Schema<any>>(schema: TSchema) {
  return Schema.Struct({
    data: Schema.Array(schema),
    total: Schema.Number,
    page: Schema.Number,
    size: Schema.Number,
  });
}
