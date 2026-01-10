# Domain Package - Agent Instructions

This is the `@chronops/domain` package containing domain models, schemas, and types using Effect-TS.

## Build & Development Commands

```bash
# Install dependencies (from monorepo root or this package)
bun install

# Type checking
bun run tsc --noEmit

# Run a file directly
bun <file.ts>

# Run tests (when tests exist)
bun test                      # Run all tests
bun test <file.test.ts>       # Run single test file
bun test --watch              # Watch mode
```

## Project Structure

```
packages/domain/
  index.ts           # Main exports (re-exports src modules as namespaces)
  src/
    index.ts         # Internal re-exports
    base.ts          # Base schemas, Context tags (ULID, BaseSchema)
    framework.ts     # Framework domain model example
```

## Code Style Guidelines

### TypeScript Configuration

- Target: ESNext
- Module: Preserve (bundler mode)
- Strict mode enabled with additional checks:
  - `noUncheckedIndexedAccess`: true
  - `noFallthroughCasesInSwitch`: true  
  - `noImplicitOverride`: true
- Use `.ts` extensions in imports (`allowImportingTsExtensions`)
- `verbatimModuleSyntax`: use explicit `type` imports

### Import Style

1. External packages first, then internal modules
2. Use `import { X } from "effect"` for main Effect imports
3. Use `import * as X from "effect/X"` for submodule imports (e.g., Schema)
4. Relative imports for internal modules with `.ts` extension in root index

```typescript
// Good
import { Effect, Option } from "effect";
import * as Schema from "effect/Schema";
import { ULID } from "./base";

// Bad - don't mix styles inconsistently
import Schema from "effect/Schema";
import { Schema } from "effect";  // Use one or the other
```

### Naming Conventions

- **Files**: lowercase, kebab-case if multi-word (`framework.ts`, `base.ts`)
- **Classes/Types**: PascalCase (`Framework`, `CreateFramework`)
- **Branded types**: PascalCase with `Id` suffix (`FrameworkId`)
- **Functions**: camelCase (`makeFrameworkId`, `make`)
- **Constants**: PascalCase for Schema definitions, camelCase for values
- **Context Tags**: PascalCase, extending `Context.Tag`

### Effect-TS Patterns

#### Schema Definitions

Use `Schema.Class` for domain models with methods:

```typescript
export class Framework extends Schema.Class<Framework>("Framework")({
  id: FrameworkId,
  name: Schema.String,
}) {
  update(input: UpdateFramework) {
    return new Framework({ ...this, ...input });
  }
}
```

#### Branded Types

Use `Schema.brand` for type-safe IDs:

```typescript
export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;
```

#### Derived Schemas

Use `Schema.pick` and `Schema.partial` for create/update schemas:

```typescript
export const CreateFramework = Framework.pipe(Schema.pick("name"));
export type CreateFramework = typeof CreateFramework.Type;

export const UpdateFramework = CreateFramework.pipe(Schema.partial);
export type UpdateFramework = typeof UpdateFramework.Type;
```

#### Effect Functions

Use `Effect.fn` with generator syntax for effectful operations:

```typescript
export const make = Effect.fn(function* (input: CreateFramework) {
  return Framework.make({
    id: yield* makeFrameworkId(),
    ...input,
  });
});
```

#### Context Tags

Use `Context.Tag` for dependency injection:

```typescript
export class ULID extends Context.Tag("ULID")<
  ULID,
  { createId: () => string }
>() {}

export const ULIDLayer = ULID.of({ createId: ulid });
```

### Export Style

- Use namespace re-exports in index files for clean API
- Export both the schema and its type

```typescript
// index.ts
export * as Framework from "./src/framework.ts";
export * as Base from "./src/base.ts";

// Usage in other packages
import { Framework } from "@chronops/domain";
Framework.FrameworkId  // Access type
Framework.make         // Access function
```

### Type Exports

Always export both schema and type for branded/class types:

```typescript
export const FrameworkId = Schema.String.pipe(Schema.brand("FrameworkId"));
export type FrameworkId = typeof FrameworkId.Type;
```

### Error Handling

- Use Effect's error channel for typed errors
- Prefer `Option` for nullable returns over null/undefined
- Use `Schema.NullOr` for optional fields in schemas

### Base Schema Pattern

Domain models should extend or include BaseSchema fields:

```typescript
export class BaseSchema extends Schema.Class<BaseSchema>("BaseSchema")({
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.NullOr(Schema.Date),
  createdBy: Schema.String,
  updatedBy: Schema.String,
  deletedBy: Schema.NullOr(Schema.String),
  organizationId: Schema.String,
}) {}
```

## Adding New Domain Models

1. Create `src/<model>.ts` with:
   - Branded ID type (`ModelId`)
   - ID factory function (`makeModelId`)
   - Main Schema.Class (`Model`)
   - Create/Update derived schemas
   - Factory function (`make`)

2. Export in `index.ts`:
   ```typescript
   export * as Model from "./src/model.ts";
   ```

3. Follow existing patterns in `framework.ts`

## Dependencies

- `effect`: Core Effect-TS library
- `typescript`: ^5

## Runtime

Use Bun exclusively - no Node.js or ts-node.
