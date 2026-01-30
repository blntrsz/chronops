import { Effect } from "effect";
import { ScheduleContract } from "./contract";
import { ScheduleService } from "./service";

export const ScheduleHandler = ScheduleContract.toLayer(
  Effect.gen(function* () {
    const service = yield* ScheduleService;
    return {
      // Schedule operations
      ScheduleCreate: service.insert,
      ScheduleById: ({ id }) => service.getById(id),
      ScheduleList: service.list,
      ScheduleUpdate: service.update,
      ScheduleRemove: ({ id }) => service.remove(id),

      // Schedule lifecycle
      SchedulePause: ({ id }) => service.pause(id),
      ScheduleResume: ({ id }) => service.resume(id),
      ScheduleListReadyToRun: service.listReadyToRun,

      // History operations
      ScheduleHistoryCreate: service.insertHistory,
      ScheduleHistoryById: ({ id }) => service.getHistoryById(id),
      ScheduleHistoryList: service.listHistory,
      ScheduleHistoryUpdate: service.updateHistory,
      ScheduleHistoryComplete: service.completeHistory,
      ScheduleHistoryFail: service.failHistory,
    };
  }),
);
