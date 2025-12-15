export type EmmaFeatureFlags = {
  behaviorCoreV1: boolean;
  globalMemory: boolean;
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
    behaviorCoreV1: envBool(process.env.EMMA_BEHAVIOR_CORE_V1, true),
    globalMemory: envBool(process.env.EMMA_GLOBAL_MEMORY, true),
  };
}

