"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./config";

export function createClient() {
  const { key, url } = getSupabasePublicEnv();

  return createBrowserClient(url, key);
}
