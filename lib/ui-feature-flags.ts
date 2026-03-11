const TRUE_FLAG_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_FLAG_VALUES = new Set(["0", "false", "no", "off"]);

const parseBooleanEnvFlag = (
  value: string | undefined,
  fallback: boolean
): boolean => {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (TRUE_FLAG_VALUES.has(normalizedValue)) {
    return true;
  }

  if (FALSE_FLAG_VALUES.has(normalizedValue)) {
    return false;
  }

  return fallback;
};

// Temporary homepage kill switch for the right profile rail.
export const homeProfileSidebarEnabled = parseBooleanEnvFlag(
  process.env.NEXT_PUBLIC_ENABLE_HOME_PROFILE_SIDEBAR,
  false
);
