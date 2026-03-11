import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Privacy } from "./useUserVariable";

/**
 * Explicitly update privacy for one user variable without changing its value.
 *
 * Usage:
 * const setPrivacy = useUserVariablePrivacy();
 * setPrivacy({ key: "profile", privacy: "PUBLIC" });
 */
export function useUserVariablePrivacy() {
  const mutation = useMutation(api.user_vars.updatePrivacy).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.user_vars.get, {
        key: args.key,
      }) as any;

      if (!existing) return;

      localStore.setQuery(api.user_vars.get, { key: args.key }, {
        ...existing,
        privacy: args.privacy,
      });
    }
  );

  return ({ key, privacy }: { key: string; privacy: Privacy }) => {
    const backendPrivacy = Array.isArray(privacy)
      ? { allowList: privacy }
      : privacy;

    return mutation({
      key,
      privacy: backendPrivacy,
    });
  };
}
