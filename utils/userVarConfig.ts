/**
 * Central configuration for the user variable system.
 *
 * This file controls:
 * - default optimistic-write timeout behavior
 * - whether stored config should be overwritten on normal value sets
 * - dev warning toggles
 *
 * Notes:
 * - `overwriteStoredConfigOnSet` is the important behavior switch for defaults.
 *   When false (recommended), options like `privacy`, `filterKey`, `searchKeys`,
 *   and `sortKey` act like "defaults on first create" and are preserved on later
 *   value writes unless you explicitly change them with a dedicated hook/mutation.
 * - `defaultSortKey` is used when a variable is created without an explicit
 *   `sortKey`.
 */

export const userVarConfig = {
    // === Dev Warnings ===

    // Master switch to enable/disable all dev warnings.
    devWarningsEnabled: true,

    // Warn when a setter call is not confirmed by the server within the timeout.
    warnOnUserVarOpTimeout: true,

    // Log when an optimistic value is rolled back to the last confirmed value.
    logOnUserVarRollback: true,

    // === Default Behaviors ===

    // Default timeout (ms) before an optimistic write is considered timed out.
    defaultTimeoutMs: 5000,

    // When false (recommended), normal value writes preserve the already-stored
    // config for privacy/filter/search/sort.
    //
    // Example:
    // - First render creates the variable with privacy PUBLIC
    // - Later renders still pass privacy PUBLIC
    // - If the user later changed privacy through useUserVariablePrivacy,
    //   a normal setValue(...) call will NOT overwrite that change.
    //
    // Set this to true only if you explicitly want useUserVariable(...) to keep
    // re-applying the latest passed config on every write.
    overwriteStoredConfigOnSet: false,

    // Used when a new variable is created without a sortKey.
    defaultSortKey: "PROPERTY_LAST_MODIFIED",
} as const;
