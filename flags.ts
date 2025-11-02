import { createHypertuneAdapter } from "@flags-sdk/hypertune";
import { createClient as createEdgeConfigClient } from "@vercel/edge-config";
import type { Identify } from "flags";
import { dedupe, flag as declareFlag } from "flags/next";
import { VercelEdgeConfigInitDataProvider } from "hypertune";

import {
  createSource,
  flagFallbacks,
  vercelFlagDefinitions,
  type Context,
  type FlagDefinition,
  type RootFlagValues,
} from "@/generated/hypertune";
import { resolveHypertuneContext } from "@/lib/getHypertune";

const token = process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN;

const identify: Identify<Context> = dedupe(async () => {
  return resolveHypertuneContext();
});

const initDataProvider = (() => {
  const edgeConfig = process.env.EXPERIMENTATION_CONFIG;
  const itemKey = process.env.EXPERIMENTATION_CONFIG_ITEM_KEY;

  if (!edgeConfig || !itemKey) {
    return undefined;
  }

  try {
    return new VercelEdgeConfigInitDataProvider({
      edgeConfigClient: createEdgeConfigClient(edgeConfig),
      itemKey,
    });
  } catch {
    return undefined;
  }
})();

const flagDefinitions = vercelFlagDefinitions as Record<string, FlagDefinition>;

const hypertuneAdapter = token
  ? createHypertuneAdapter<RootFlagValues, Context>({
      createSource: createSource as unknown as Parameters<typeof createHypertuneAdapter>[0]["createSource"],
      flagFallbacks: flagFallbacks as RootFlagValues,
      flagDefinitions: flagDefinitions as Record<string, FlagDefinition>,
      identify,
      createSourceOptions: initDataProvider
        ? {
            token,
            initDataProvider: initDataProvider as unknown,
          }
        : {
            token,
          },
    } as unknown as Parameters<typeof createHypertuneAdapter>[0])
  : null;

type AdapterDeclarations = typeof hypertuneAdapter extends {
  declarations: infer D;
}
  ? D & Record<string, ReturnType<typeof declareFlag>>
  : Record<string, never>;

export type FlagKey = keyof AdapterDeclarations & string;

export function createServerFlag<Key extends FlagKey>(key: Key) {
  if (!hypertuneAdapter) {
    return async () => flagFallbacks[key as keyof RootFlagValues] as AdapterDeclarations[Key];
  }

  const declaration = hypertuneAdapter.declarations[key];

  if (!declaration) {
    return async () => flagFallbacks[key as keyof RootFlagValues] as AdapterDeclarations[Key];
  }

  return declareFlag(declaration) as () => Promise<AdapterDeclarations[Key]>;
}

export const hypertuneFlagsReady = Boolean(hypertuneAdapter);
export const hypertuneFlagDefinitions = vercelFlagDefinitions;
export const hypertuneIdentify = identify;
