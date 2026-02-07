# Chronops GRC MVP PRD

## Summary
Unified compliance workspace for frameworks, controls, evidence, assessments, and audit readiness.

## Problem
- Compliance work fragmented, slow, hard to prove
- Control ownership unclear, evidence scattered
- Audit prep high toil, low trust

## Goals
- Single source of truth for compliance program
- Clear control ownership, status, testing cadence
- Evidence traceable to controls and requirements
- Audit-ready outputs with minimal scramble

## Non-goals (MVP)
- Continuous control monitoring via integrations
- Full vendor risk management
- Deep policy authoring workflow engine
- Real-time GRC analytics warehouse

## Personas
- Compliance lead: program owner, audit prep
- Control owner: implements and tests controls
- Security lead: wants visibility, risk posture
- Auditor/reviewer: needs evidence pack

## Current Capabilities (Observed)
- Org-based access, login, org switcher
- Framework library create/edit/archive
- Control library create/edit, status, testing cadence
- Framework detail with control list
- Control detail with comments/activity
- Document upload + text extraction (backend ready)
- Recurring task runner (backend ready)
- Dashboard shell + navigation

## MVP Scope
- Org and access
  - Org setup, member invites, roles: admin, editor, viewer
- Frameworks
  - Preloaded frameworks, versioning, requirement list
- Controls
  - Control library, ownership, status, testing cadence
  - Map controls to framework requirements
- Evidence
  - Evidence library (upload/link), metadata, retention
  - Map evidence to controls and requirements
- Assessments
  - Create assessment plan, collect responses + evidence
  - Pass/fail and completion status by control
- Issues/Findings
  - Create from assessment or audit
  - Owner, due date, remediation status
- Audit readiness
  - Audit scope, request list, exportable evidence pack
- Reporting
  - Coverage, overdue testing, readiness score
- Notifications
  - Reminders for testing, evidence, due dates

## Gaps To Reach MVP
- Policies, risks, assessments, issues, audits not implemented
- Evidence library UI and workflows missing
- Requirement-level mapping missing
- Roles/permissions beyond basic org membership missing
- Notifications/reminders not surfaced
- Reporting and audit export missing
- Search only shell, no results

## User Journeys
- Setup: create org → pick frameworks → import controls
- Operate: assign control owners → collect evidence → run assessments
- Audit: compile evidence pack → respond to requests → close findings

## Success Metrics
- Time to audit-ready reduced by 50%
- 90% controls mapped to evidence
- 80% controls tested on schedule
- Assessment completion within target window

## Risks
- MVP scope creep (policies/risk/audit all at once)
- Data quality from manual entry
- Evidence trust without integrations

## Assumptions
- Start with 1-2 core frameworks
- Evidence collection mostly manual in MVP
- Focus on compliance posture, not full risk engine

## Open Questions
- Which frameworks first? default SOC 2 + ISO 27001
