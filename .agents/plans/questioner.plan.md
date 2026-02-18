# Questioner Domain Slice Plan

## Overview
Questioner is a form-based domain slice for GRC (Governance, Risk, Compliance) use cases. Primary use case: control testing.

## Domain Model Structure

### Core Entity: Questioner
Following pattern from Framework/Control/Document:

```typescript
// questioner.ts in packages/domain/src/
- QuestionerId: branded string ID with prefix "qst_"
- Questioner: Schema.Class extending Base
  - id: QuestionerId
  - name: string
  - description: string | null
  - purpose: QuestionerPurpose (Union type)
  - status: QuestionerStatus (Union type)
  - controlId: ControlId | null (for control testing)
  - frameworkId: FrameworkId | null (optional link)
```

### Supporting Types

**QuestionerPurpose**: Union of use cases
- "control_testing" (primary)
- "risk_assessment"
- "compliance_audit"
- "vendor_assessment"

**QuestionerStatus**: Workflow states
- "draft"
- "active"
- "completed"
- "archived"

### Questions/Responses Model

**Question Entity**:
```typescript
- QuestionId: branded string "qtn_"
- Question: Schema.Class extending Base
  - id: QuestionId
  - questionerId: QuestionerId
  - text: string
  - type: QuestionType
  - required: boolean
  - order: number
  - options: array<string> | null (for multiple choice)
```

**QuestionType**: Union
- "text" (short answer)
- "textarea" (long answer)
- "yes_no"
- "multiple_choice"
- "rating" (1-5 scale)
- "date"
- "file_upload"

**Response Entity**:
```typescript
- ResponseId: branded string "rsp_"
- Response: Schema.Class extending Base
  - id: ResponseId
  - questionId: QuestionId
  - questionerId: QuestionerId
  - value: string
  - fileUrl: string | null
  - completedBy: MemberId
```

## Factory Functions

Standard CRUD operations following existing pattern:
- `make(input: CreateQuestioner)` - create new
- `update(model, input: UpdateQuestioner)` - update existing
- `remove(model)` - soft delete

Additional operations:
- `addQuestion(questioner, question: CreateQuestion)`
- `submitResponse(questioner, responses: CreateResponse[])`
- `completeQuestioner(questioner)` - transition to completed

## API Layer (core package)

```
packages/core/src/questioner/
  - questioner.contract.ts (tRPC endpoints)
  - questioner.service.ts (business logic)
  - questioner.repo.ts (DB operations)
```

Endpoints:
- `create`, `update`, `delete`, `getById`, `list`
- `addQuestion`, `updateQuestion`, `deleteQuestion`
- `submitResponses`, `getResponses`

## UI Layer (web package)

```
packages/web/src/features/questioner/
  - _atom.tsx (state management)
  - create-questioner.tsx
  - list-questioners.tsx
  - questioner-form.tsx (fill form)
  - question-builder.tsx (create/edit questions)

packages/web/src/routes/org/$slug/questioner/
  - index.tsx (list view)
  - $id.tsx (detail/edit view)
  - $id/fill.tsx (response filling)
```

## Database Schema

Tables needed:
1. `questioners` - main table
2. `questions` - questions for each questioner
3. `responses` - submitted answers

Relationships:
- questioner → control (optional FK)
- questioner → framework (optional FK)
- question → questioner (required FK)
- response → question (required FK)
- response → questioner (required FK for queries)

## Integration Points

### Control Testing Flow
1. User creates Questioner with purpose="control_testing"
2. Links to specific Control via controlId
3. Builds questions to validate control effectiveness
4. Assigns to team member to fill
5. Responses collected and linked to control
6. Control status can be updated based on results

### Document Attachment
- Responses with type="file_upload" link to Document entity
- Reuse existing Document upload flow

## Implementation Phases

### Phase 1: Domain Model
- [ ] Create questioner.ts in packages/domain/src/
- [ ] Add QuestionerId, Questioner class
- [ ] Add Question, Response entities
- [ ] Export in packages/domain/index.ts
- [ ] Add unit tests

### Phase 2: Backend (core)
- [ ] DB migration for tables
- [ ] Repository implementation
- [ ] Service layer with business logic
- [ ] tRPC contract and endpoints
- [ ] Integration tests

### Phase 3: Frontend (web)
- [ ] Atom/state management
- [ ] CRUD forms for questioner
- [ ] Question builder UI component
- [ ] Response form with dynamic question types
- [ ] List/detail routes
- [ ] Integration with control pages

### Phase 4: Integration
- [ ] Link from control detail to create questioner
- [ ] Display questioners on control page
- [ ] Response summary on control
- [ ] Notification for assigned questioners

## Unresolved Questions

1. **Response validation**: Custom validation rules per question?
2. **Conditional questions**: Show Q2 based on Q1 answer?
3. **Multi-user responses**: Multiple people fill same questioner?
4. **Response versioning**: Track response history/changes?
5. **Template library**: Pre-built questioner templates for common controls?
6. **Approval workflow**: Require review before marking completed?
7. **Scoring/grading**: Auto-calculate control test pass/fail?
8. **Recurrence**: Periodic questioners for regular control testing?
9. **Delegation**: Assign specific questions to different people?
10. **Evidence attachment**: Multiple documents per response?
