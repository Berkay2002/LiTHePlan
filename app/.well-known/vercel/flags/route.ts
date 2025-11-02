import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";

import { hypertuneFlagDefinitions } from "../../../../flags";

export const GET = createFlagsDiscoveryEndpoint(() =>
  getProviderData(hypertuneFlagDefinitions as Record<string, never>)
);
