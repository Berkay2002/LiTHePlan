import { type CookieMethodsServer, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicEnv } from "./config";

type SetAllCookies = NonNullable<CookieMethodsServer["setAll"]>;
type CookiesToSet = Parameters<SetAllCookies>[0];
type ResponseHeaders = Record<string, string>;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const { key, url } = getSupabasePublicEnv();

  const cookies: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: CookiesToSet, headers?: ResponseHeaders) {
      for (const { name, value } of cookiesToSet) {
        request.cookies.set(name, value);
      }
      supabaseResponse = NextResponse.next({
        request,
      });
      for (const { name, value, options } of cookiesToSet) {
        supabaseResponse.cookies.set(name, value, options);
      }

      let hasCacheControlHeader = false;
      for (const [headerName, headerValue] of Object.entries(headers ?? {})) {
        if (headerName.toLowerCase() === "cache-control") {
          hasCacheControlHeader = true;
        }
        supabaseResponse.headers.set(headerName, headerValue);
      }
      if (!hasCacheControlHeader) {
        supabaseResponse.headers.set("Cache-Control", "private, no-store");
      }
    },
  };

  const supabase = createServerClient(url, key, {
    cookies,
  });

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
