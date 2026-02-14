import { Effect, Layer } from "effect";
import { IssueContract } from "./contract";
import { IssueService } from "./service";

export const IssueHandler = IssueContract.toLayer(
  Effect.gen(function* () {
    const service = yield* IssueService;

    return {
      IssueById: ({ id }) => service.getById(id),
      IssueCreate: (payload) => service.insert(payload),
      IssueList: ({
        page,
        size,
        controlId,
        assessmentInstanceId,
        evidenceId,
        status,
        type,
        severity,
      }) =>
        service.list(
          { page, size },
          { controlId, assessmentInstanceId, evidenceId, status, type, severity },
        ),
      IssueUpdate: (payload) => service.update(payload),
      IssueRemove: ({ id }) => service.remove(id),
    };
  }),
).pipe(Layer.provide(IssueService.Default));
