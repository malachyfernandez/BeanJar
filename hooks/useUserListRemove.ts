import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Remove one item from a user list.
 *
 * This deletes the item row only.
 * It does not delete the list definition row.
 */
export function useUserListRemove() {
  const mutation = useMutation(api.user_lists.remove);

  return ({ key, itemId }: { key: string; itemId: string }) => {
    return mutation({ key, itemId });
  };
}
