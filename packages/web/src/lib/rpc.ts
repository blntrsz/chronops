import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { AtomRpc } from "@effect-atom/atom-react";
import { RpcContract } from "@chronops/core/contract";

export const RpcConfigLayer = RpcClient.layerProtocolHttp({
  url: "/api/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class Client extends AtomRpc.Tag<Client>()("Client", {
  group: RpcContract,
  protocol: RpcConfigLayer,
}) {}
