import { Effect, Layer } from "effect";
import { FrameworkContract } from "./contract";
import { FrameworkService } from "./service";

export const FrameworkHandler = FrameworkContract.toLayer(
  Effect.gen(function* () {
    const service = yield* FrameworkService;

    return {
      FrameworkById: ({ id }) => service.getById(id),
      FrameworkCreate: (payload) => service.insert(payload),
      FrameworkList: (payload) => service.list(payload),
      FrameworkUpdate: (payload) => service.update(payload),
      FrameworkRemove: ({ id }) => service.remove(id),
      FrameworkSummaryList: () => service.summaryList(),
      AuditFrameworkLink: (payload) => service.linkAudit(payload),
      AuditFrameworkUnlink: (payload) => service.unlinkAudit(payload),
      AuditFrameworkList: (payload) => service.listAuditLinks(payload),
    };
  }),
).pipe(Layer.provide(FrameworkService.Default));
