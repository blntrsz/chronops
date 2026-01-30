# Primitives

Goal: reusable building blocks across domains. Keep small, stable.

## Required

- Workflow method: process rules, SLA, escalation, allowed transitions.
- Workflow template: ordered steps, owners, outputs; uses method.
- Workflow instance: execution of a template, state + timestamps.
- Schedule: cadence, triggers, time windows, run policy.
- Questioner: questions + response schema; scoring + evidence requests.
- Attachment: file/link evidence, type, source, retention.
- Comment: threaded note + mentions.
- Tag: label for search and filter.
- Approval: decision + signer + timestamp.
- Mapping: typed relation between entities, direction, strength.
- Notification: alerts, reminders, messages; delivery channel + status.

 ## Primitive reuse

- Workflow template uses Workflow method.
- Workflow instance uses Approval, Comment, Attachment.
- Questioner uses Attachment, Comment, Approval.
- Schedule triggers Workflow instance or Questioner.
- Schedule generates Notification on triggers.
- Approval generates Notification on decision.
- Workflow instance generates Notification on SLA breach.
