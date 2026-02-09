import { Effect } from "effect";
import { AuditContract } from "./contract";
import { AuditService } from "./service";

export const AuditHandler = AuditContract.toLayer(
  Effect.gen(function* () {
    const service = yield* AuditService;

    return {
      AuditById: ({ id }) => service.getById(id),
      AuditCreate: (payload) => service.insert(payload),
      AuditList: ({ page, size, assessmentMethodId, status }) =>
        service.list({ page, size }, { assessmentMethodId, status }),
      AuditUpdate: (payload) => service.update(payload),
      AuditRemove: ({ id }) => service.remove(id),
      AuditRunById: ({ id }) => service.getRunById(id),
      AuditRunCreate: (payload) => service.insertRun(payload),
      AuditRunList: ({ page, size, auditId, assessmentMethodId, status }) =>
        service.listRuns({ page, size }, { auditId, assessmentMethodId, status }),
      AuditRunStart: ({ id }) => service.startRun(id),
      AuditRunComplete: ({ id }) => service.completeRun(id),
      AuditRunFail: ({ id }) => service.failRun(id),
    };
  }),
);
