# Domains

Goal: bounded contexts that own entities + rules.

## Core domains

- Policy: internal policies, versions, review cycle, control mappings.
- Control: control library, implementation status, tests, evidence links.
- Framework: external standards, requirements, mappings to controls.
- Risk: risk register, scoring, treatments, control coverage.
- Assessment: method + template + instance for control testing.
  - Assessment Method: evaluation approach, scoring, evidence rules.
  - Assessment Template: question set, control scope, cadence.
  - Assessment Instance: execution of a template, state + timestamps.
- Issue: findings, gaps, non-conformities; severity, status, remediation tracking.
- Evidence: artifacts, metadata, storage, retention.
- Audit: audit scope, snapshots, findings, sign-off.

## Domain map (MVP)

- Policy -> Control: policy statements mapped to controls.
- Framework -> Control: requirements mapped to controls.
- Risk -> Control: risks mitigated by controls.
- Control -> Evidence: evidence proves control operation.
- Assessment -> Control/Risk: responses update status and score.
- Assessment -> Issue: findings created from responses.
- Audit -> Snapshot of Control/Risk/Evidence at time.
- Audit -> Issue: findings created from audit findings.
