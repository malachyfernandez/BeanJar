import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type ObjectKeys<T> = T extends object ? Extract<keyof T, string> : never;

export type PropertySortKey = "PROPERTY_TIME_CREATED" | "PROPERTY_LAST_MODIFIED";

export type SearchMode = "RELEVANCE" | "SORTED";

interface UseUserVariableGetOptions<TValue> {
    key: string;
    /**
     * Full text search string.
     * If provided, results are sorted by relevance.
     * Searches across PUBLIC variables and variables shared with the current user.
     */
    searchFor?: string;
    /**
     * Exact match filter (e.g. "Green").
     * Requires the variable to have a `filterKey` configured.
     * Filters across PUBLIC variables and variables shared with the current user.
     */
    filterFor?: string;
    /**
     * Array of user IDs to limit results to (e.g. friends list).
     * Only returns variables from these users that are accessible to the current user.
     */
    userIds?: string[];
    /**
     * Max number of items to return. Default 10.
     */
    returnTop?: number;
    /**
     * Sort key:
     * - "PROPERTY_TIME_CREATED" | "PROPERTY_LAST_MODIFIED" for metadata
     * - or a value field name (e.g. "color") to sort by that field in the stored value.
     */
    sortKey?: PropertySortKey | ObjectKeys<TValue>;

    /**
     * If true, includes the viewer's own PRIVATE variable for this key (if any).
     * Server still enforces privacy; this does not expose others' private docs.
     */
    showAll?: boolean;

    /**
     * Search mode:
     * - "RELEVANCE" (default): uses full-text search ranking.
     * - "SORTED": scans a larger candidate set in sort order and filters in-memory.
     */
    searchMode?: SearchMode;
}

/**
 * Hook to search and retrieve public/shared variables from other users.
 * 
 * This hook respects privacy settings:
 * - PUBLIC variables: accessible to everyone
 * - PRIVATE variables: only accessible to the owner
 * - WHITELIST variables: accessible to users in the allowList
 * 
 * @example
 * ```ts
 * // Search for public user profiles by name
 * const profiles = useUserVariableGet<UserData>("profile", {
 *   searchFor: "john",
 *   returnTop: 10
 * });
 * 
 * // Get profiles from specific users (friends list)
 * const friendProfiles = useUserVariableGet<UserData>("profile", {
 *   userIds: ["user_123", "user_456"],
 *   returnTop: 50
 * });
 * 
 * // Filter by specific criteria
 * const greenProfiles = useUserVariableGet<UserData>("profile", {
 *   filterFor: "Green",
 *   returnTop: 20
 * });
 * ```
 */
export function useUserVariableGet<TValue = any>({
    key,
    searchFor,
    filterFor,
    userIds,
    returnTop,
    sortKey,
    showAll,
    searchMode,
}: UseUserVariableGetOptions<TValue>) {

    // If userIds is passed but is empty or undefined (e.g. still loading friends),
    // we might want to pause the query or pass undefined to let the backend handle it.
    // Here we pass it through.

    const results = useQuery(api.user_vars_get.search, {
        key,
        searchFor,
        filterFor,
        userIds,
        returnTop,
        sortKey,
        showAll,
        searchMode,
    });

    return results as ({ value: TValue } & { userToken: string; lastModified: number; createdAt: number })[] | undefined;
}