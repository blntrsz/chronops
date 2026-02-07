import { Effect } from "effect";
import { EvidenceContract } from "./contract";
import { EvidenceService } from "./service";

export const EvidenceHandler = EvidenceContract.toLayer(
  Effect.gen(function* () {
    const service = yield* EvidenceService;

    return {
      EvidenceById: ({ id }) => service.getById(id),
      EvidenceCreate: (payload) => service.insert(payload),
      EvidenceList: ({ page, size, controlId, pdfId }) =>
        service.list({ page, size }, { controlId, pdfId }),
      EvidenceUpdate: (payload) => service.update(payload),
      EvidenceRemove: ({ id }) => service.remove(id),
    };
  }),
);
