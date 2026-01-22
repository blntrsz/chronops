import { SqlClient } from "@effect/sql";
import { Effect, Schema } from "effect";

const _model = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
});

Effect.gen(function* () {
	const _sql = yield* SqlClient.SqlClient;
});

function _select<T extends Schema.Schema<any>>(
	table: string,
	schema: T,
	fields: (typeof schema.Type)[] | "*",
) {
	const f = fields === "*" ? "*" : fields.join(", ");
	return `SELECT ${f} FROM ${table}`;
}
