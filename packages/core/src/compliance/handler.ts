import { Effect } from "effect";
import { ComplianceContract } from "./contract";
import { ComplianceService } from "./service";

export const ComplianceHandler = ComplianceContract.toLayer(
  Effect.gen(function* () {
    const service = yield* ComplianceService;

    return {
      ComplianceById: service.getById,
      ComplianceCreate: service.insert,
      ComplianceList: service.list,
      ComplianceUpdate: service.update,
      ComplianceDestroy: service.destroy,
    };
  }),
);
