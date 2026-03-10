import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Privacy } from "./useUserVariable";

/**
 * Explicitly update privacy for your own variable without changing its value.
 *
 * This hook exists because privacy should not usually be re-applied on every
 * normal `setValue(...)` call. In the default system design, `useUserVariable` 
 * treats privacy as a default-on-create setting, while this hook is the
 * explicit "change privacy now" mechanism.
 *
 * -----------------------------------------------------------------------------
 * Example: whitelist privacy
 * -----------------------------------------------------------------------------
 *
 * ```ts
 * const [user, setUser] = useUserVariable({
 *   key: "user",
 *   defaultValue: { name: "Bob" },
 *   privacy: ["user_a", "user_b"],
 * });
 *
 * const setUserPrivacy = useUserVariablePrivacy({
 *   key: "user",
 * });
 *
 * // Later: reduce access to only one user
 * setUserPrivacy(["user_a"]);
 * ```
 *
 * -----------------------------------------------------------------------------
 * Important behavior
 * -----------------------------------------------------------------------------
 *
 * After calling `setUserPrivacy(...)`, later calls to:
 *
 * ```ts
 * setUser(...)
 * ```
 *
 * will NOT overwrite the stored privacy as long as:
 *
 * - `overwriteStoredConfigOnSet` is false in `userVarConfig.ts` 
 * - and `overwriteStoredConfig` is not enabled on that hook
 *
 * -----------------------------------------------------------------------------
 * Supported values
 * -----------------------------------------------------------------------------
 *
 * - `"PUBLIC"` 
 * - `"PRIVATE"` 
 * - `string[]` -> converted to whitelist `{ allowList: [...] }` on the backend
 *
 * -----------------------------------------------------------------------------
 * Requirements
 * -----------------------------------------------------------------------------
 *
 * The variable must already exist.
 * If it does not exist yet, the backend throws an error.
 */
export function useUserVariablePrivacy({ key }: { key: string }) {
    const mutation = useMutation(api.user_vars.updatePrivacy).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.user_vars.get, { key }) as any;
            if (!existing) return;

            localStore.setQuery(api.user_vars.get, { key }, {
                ...existing,
                privacy: args.privacy,
            });
        }
    );

    return (privacy: Privacy) => {
        const backendPrivacy = Array.isArray(privacy)
            ? { allowList: privacy }
            : privacy;

        return mutation({
            key,
            privacy: backendPrivacy,
        });
    };
}
