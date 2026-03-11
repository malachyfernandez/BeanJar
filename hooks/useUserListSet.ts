import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Privacy } from "./useUserList";

type ObjectKeys<T> = T extends object ? Extract<keyof T, string> : never;

/**
 * Upsert a list item without instantiating a per-item hook.
 *
 * If the item does not exist, this creates it.
 * If the item already exists, this replaces its value.
 */
export function useUserListSet<T = any>() {
  const mutation = useMutation(api.user_lists.set);

  return ({
    key,
    itemId,
    value,
    privacy,
    filterKey,
    searchKeys,
    sortKey,
    overwriteStoredConfig,
  }: {
    key: string;
    itemId: string;
    value: T;
    privacy?: Privacy;
    filterKey?: ObjectKeys<T> | string;
    searchKeys?: (ObjectKeys<T> | string)[];
    sortKey?: ObjectKeys<T> | string;
    overwriteStoredConfig?: boolean;
  }) => {
    const backendPrivacy = Array.isArray(privacy)
      ? { allowList: privacy }
      : privacy;

    return mutation({
      key,
      itemId,
      value,
      privacy: backendPrivacy,
      filterKey,
      searchKeys,
      sortKey,
      overwriteStoredConfig,
    });
  };
}
