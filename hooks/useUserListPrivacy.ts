import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Privacy } from "./useUserList";

/**
 * Update privacy for an entire list.
 *
 * Privacy is list-level, not item-level.
 *
 * Usage:
 * const setListPrivacy = useUserListPrivacy();
 * setListPrivacy({ key: "posts", privacy: "PUBLIC" });
 */
export function useUserListPrivacy() {
  const mutation = useMutation(api.user_lists.updatePrivacy);

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
