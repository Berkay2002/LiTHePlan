import { createFlagsDiscoveryEndpoint, getProviderData } from "flags/next";

import { hypertuneFlagDefinitions } from "../../../../flags";

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(hypertuneFlagDefinitions as Record<string, never>);
});
