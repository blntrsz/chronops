# Questioner Domain Slice Plan

## Overview
Form-based questioner for GRC use cases (e.g., control testing)

## Domain Model

### QuestionerId
- Branded string type
- Prefix: `qst_`
- Generated via ULID

### QuestionnaireStatus
- `draft` - Initial state
- `in_progress` - Being filled
- `submitted` - Completed
- `reviewed` - Evaluated
- `archived` - No longer active

### QuestionnaireType
- `control_test` - Test control effectiveness
- `risk_assessment` - Assess risks
- `compliance_check` - Verify compliance
- `audit_response` - Respond to audit

### Question Schema
- `id` - Unique identifier
- `text` - Question content
- `type` - `text | multiple_choice | boolean | scale`
- `required` - Boolean
- `options` - For multiple_choice (nullable)

### Answer Schema
- `questionId` - Reference to question
- `value` - Answer value (string representation)
- `answeredAt` - Timestamp
- `answeredBy` - MemberId

### Questionnaire Model
Extends Base with:
- `id` - QuestionerId
- `name` - String
- `description` - Nullable string
- `type` - QuestionnaireType
- `status` - QuestionnaireStatus
- `frameworkId` - Nullable FrameworkId (optional linkage)
- `controlId` - Nullable ControlId (for control testing)
- `questions` - Array of Question
- `answers` - Array of Answer
- `dueDate` - Nullable DateTimeUtc
- `completedAt` - Nullable DateTimeUtc

## Operations

### make
Create new Questionnaire with draft status

### update
Update existing Questionnaire (partial)

### remove
Soft delete Questionnaire

### submit
Transition to submitted status, set completedAt

### review
Transition to reviewed status

## Error Classes

### QuestionnaireNotFoundError
Extends NotFoundError with fromId method

## File Structure
- `/packages/domain/src/questioner.ts` - Main implementation
- `/packages/domain/src/index.ts` - Export module
- `/packages/domain/src/__tests__/domain.test.ts` - Add tests

## Patterns (from existing code)
- Effect.fn for operations
- Schema.Class for models
- Brand types for IDs
- Schema.Union for enums
- Schema.NullOr for nullable
- Pick/partial for Create/Update types
- Base.extend for inheritance

## Unresolved Questions

1. Should questions be embedded or separate entities?
   - Current plan: embedded array in Questionnaire

2. Should answers be validated against question types?
   - Defer to application layer validation

3. Should workflow transitions be enforced?
   - Not in domain layer (similar to Control)

4. Should questions support conditional logic (branching)?
   - Not in v1, keep simple

5. Should questionnaires be reusable templates?
   - Not in v1, each instance is unique

6. Should historical answer versions be tracked?
   - Not in v1, only current answers

7. File upload support for answers?
   - Not in v1, string values only
