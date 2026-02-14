import { RpcContract } from "@chronops/core/contract";
import { AtomRpc } from "@effect-atom/atom-react";
import { FetchHttpClient } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Layer } from "effect";

// SSR requires absolute URL; browser fetch resolves relative URLs
const isBrowser = typeof globalThis !== "undefined" && "window" in globalThis;
const baseUrl = isBrowser ? "" : import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const RpcConfigLayer = RpcClient.layerProtocolHttp({
  url: `${baseUrl}/api/rpc`,
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class Client extends AtomRpc.Tag<Client>()("Client", {
  group: RpcContract,
  protocol: RpcConfigLayer,
}) { }
