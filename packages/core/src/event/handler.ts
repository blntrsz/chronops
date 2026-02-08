import { Effect } from "effect";
import { EventContract } from "./contract";
import { EventService } from "./service";

export const EventHandler = EventContract.toLayer(
  Effect.gen(function* () {
    const service = yield* EventService;

    return {
      EventList: ({ page, size, name, actorId, entityType, entityId }) =>
        service.list({ page, size }, { name, actorId, entityType, entityId }),
    };
  }),
);
