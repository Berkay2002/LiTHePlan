"use server";

import "server-only";

import { createClient as createEdgeConfigClient } from "@vercel/edge-config";
import { VercelEdgeConfigInitDataProvider } from "hypertune";
import { unstable_noStore as noStore } from "next/cache";

import {
  type Context,
  createSource,
  type HypertuneRoot,
  type HypertuneSource,
} from "@/generated/hypertune";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";

let cachedSource: HypertuneSource | null = null;

function getToken(): string | null {
  return process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN ?? null;
}

function createInitDataProvider() {
  const edgeConfig = process.env.EXPERIMENTATION_CONFIG;
  const itemKey = process.env.EXPERIMENTATION_CONFIG_ITEM_KEY;

  if (!(edgeConfig && itemKey)) {
    return;
  }

  try {
    return new VercelEdgeConfigInitDataProvider({
      edgeConfigClient: createEdgeConfigClient(edgeConfig),
      itemKey,
    });
  } catch {
    return;
  }
}

function getSource(): HypertuneSource | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (!cachedSource) {
    cachedSource = createSource({
      token,
      initDataProvider: createInitDataProvider(),
    });
  }

  return cachedSource;
}

export async function resolveHypertuneContext(): Promise<Context> {
  const context: Context = {
    environment: process.env.NODE_ENV,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      context.user = {
        id: data.user.id,
        email: data.user.email ?? undefined,
        name:
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : undefined,
      };
    }
  } catch {
    // Ignore Supabase errors and fall back to anonymous context.
  }

  return context;
}

export type GetHypertuneOptions = {
  isRouteHandler?: boolean;
};

export default async function getHypertune(
  options: GetHypertuneOptions = {}
): Promise<HypertuneRoot | null> {
  noStore();

  const source = getSource();

  if (!source) {
    return null;
  }

  await source.initIfNeeded();
  source.setRemoteLoggingMode(options.isRouteHandler ? "normal" : "off");

  return source.root({
    args: {
      context: await resolveHypertuneContext(),
    },
  });
}
