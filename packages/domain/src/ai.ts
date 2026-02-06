import { Schema } from "effect";

export const Vector = Schema.Array(Schema.Number).pipe(Schema.brand("Vector"));
export type Vector = typeof Vector.Type;

export const VECTOR_DIMENSION = 1536 as const;
