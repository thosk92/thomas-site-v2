export type EmmaFeatureFlags = {
  globalMemory: boolean;
  outputValidation: boolean;
};

function envBool(value: string | undefined, defaultValue: boolean) {
  if (value == null) return defaultValue;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return defaultValue;
}

export function getEmmaFeatures(): EmmaFeatureFlags {
  return {
    globalMemory: envBool(process.env.EMMA_GLOBAL_MEMORY, true),
    outputValidation: envBool(process.env.EMMA_OUTPUT_VALIDATION, true),
  };
}
