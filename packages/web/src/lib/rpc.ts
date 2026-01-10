import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { AtomRpc } from "@effect-atom/atom-react";
import { RpcContract } from "@chronops/core/contract";

// SSR requires absolute URL; browser fetch resolves relative URLs
const baseUrl =
  typeof window === "undefined"
    ? process.env.API_BASE_URL || "http://localhost:3000"
    : "";

export const RpcConfigLayer = RpcClient.layerProtocolHttp({
  url: `${baseUrl}/api/rpc`,
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class Client extends AtomRpc.Tag<Client>()("Client", {
  group: RpcContract,
  protocol: RpcConfigLayer,
}) {}
