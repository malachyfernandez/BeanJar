import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { UserListRecord } from "./useUserList";

type PrimitiveIndexValue = string | number | boolean;

interface UseUserListGetOptions {
  key: string;
  itemId?: string;
  searchFor?: string;
  filterFor?: PrimitiveIndexValue;
  userIds?: string[];
  returnTop?: number;
  startAfter?: string;
}

/**
 * Query accessible list items by key.
 *
 * This is the multi-user read companion to `useUserList(...)`.
 *
 * Supports:
 * - exact item lookup with `itemId` 
 * - search with `searchFor` 
 * - exact filter with `filterFor` 
 * - restricting by `userIds` 
 * - forward pagination with `startAfter` 
 *
 * `startAfter` should be the `id` of the last record from the previous page.
 */
export function useUserListGet<TValue = any>({
  key,
  itemId,
  searchFor,
  filterFor,
  userIds,
  returnTop,
  startAfter,
}: UseUserListGetOptions) {
  const results = useQuery(api.user_lists_get.search, {
    key,
    itemId,
    searchFor,
    filterFor,
    userIds,
    returnTop,
    startAfter,
  });

  return results as UserListRecord<TValue>[] | undefined;
}
