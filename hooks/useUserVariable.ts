

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef } from "react";

// Frontend privacy shape: PUBLIC, PRIVATE, or whitelist of userIds
type Privacy = "PUBLIC" | "PRIVATE" | string[];

type SyncState = {
    isSyncing: boolean;
};

type ObjectKeys<T> = T extends object ? Extract<keyof T, string> : never;

// Rich bean value exposed to the UI
export type UserVariableResult<T> = {
    value: T;
    lastModified?: number;
    timeCreated?: number;
    userId?: string;
    state: SyncState;
};


/**
 * **User Variable Hook**
 *
 * This acts just like `useState`, but it saves the data to the database so it persists
 * across reloads and devices.
 *
 * ---
 * ### Examples
 *
 * **1. Simple: Reading & Writing your own data**
 * ```ts
 * const [myCount, setMyCount] = useUserVariable<number>({
 *   key: "count",
 *   defaultValue: 0,
 * });
 *
 * myCount.value
 * myCount.lastModified
 * myCount.timeCreated
 * myCount.userId
 * myCount.state.isSyncing
 *
 * setMyCount(123);
 * ```
 *
 * **2. Public profile + searchable fields**
 * ```ts
 * type UserData = { username: string; name: string };
 *
 * const [profile, setProfile] = useUserVariable<UserData>({
 *   key: "profile",
 *   privacy: "PUBLIC",
 *   searchKeys: ["username", "name"],
 * });
 *
 * setProfile({ username: "malachy", name: "Malachy" });
 * ```
 *
 * **3. Filterable variables**
 * ```ts
 * type Bean = { name: string; description: string; color: string };
 *
 * const [bean, setBean] = useUserVariable<Bean>({
 *   key: "beans",
 *   privacy: "PUBLIC",
 *   filterKey: "color",
 *   searchKeys: ["name", "description"],
 * });
 * ```
 *
 * Notes:
 * - For performance warnings (searchMode=SORTED, in-memory filtering, etc.) edit `utils/devWarningsConfig.ts`.
 *
 * ---
 * @template T - The type of data to store (number, string, object, etc).
 * @param key - A unique name for this variable.
 * @param defaultValue - The value to use while loading or if the variable doesn't exist yet.
 * @param options - Settings for privacy, searching, filtering, and other server-backed behavior.
 */
export function useUserVariable<T>({
    key,
    defaultValue,
    privacy = "PRIVATE",
    filterKey,
    searchKeys,
    filterString,
    searchString,
}: {
    key: string;
    defaultValue?: T;
    privacy?: Privacy;
    filterKey?: ObjectKeys<T>;
    searchKeys?: ObjectKeys<T>[];
    filterString?: string;
    searchString?: string;
    sortKey?: "PROPERTY_LAST_MODIFIED" | "PROPERTY_TIME_CREATED";
}): [UserVariableResult<T>, (newValue: T) => void] {
    const record = useQuery(api.user_vars.get, { key });

    const isSyncing = record === undefined;

    const value: T = isSyncing
        ? (defaultValue as T)
        : ((record?.value ?? defaultValue) as T);

    const lastModified = record?.lastModified as number | undefined;
    const timeCreated = (record as any)?.createdAt as number | undefined;
    const userId = (record as any)?.userToken as string | undefined;

    const didAutoCreateRef = useRef(false);

    const setMutation = useMutation(api.user_vars.set)
        .withOptimisticUpdate((localStore, args) => {
            const existing = localStore.getQuery(api.user_vars.get, { key }) as any;
            const now = Date.now();
            localStore.setQuery(api.user_vars.get, { key }, {
                ...(existing ?? {}),
                key,
                value: args.value,
                lastModified: now,
                createdAt: existing?.createdAt ?? now,
                privacy: args.privacy,
                filterKey: args.filterKey,
                searchKeys: args.searchKeys,
            });
        });

    const setValue = (newValue: T) => {
        // Map frontend privacy to backend format
        const backendPrivacy = Array.isArray(privacy)
            ? { allowList: privacy }
            : privacy;

        const effectiveFilterKey = filterKey ?? ((record as any)?.filterKey as string | undefined);
        const effectiveSearchKeys = searchKeys ?? ((record as any)?.searchKeys as string[] | undefined);

        setMutation({
            key,
            value: newValue,
            privacy: backendPrivacy,
            filterKey: effectiveFilterKey,
            searchKeys: effectiveSearchKeys,
            filterString,
            searchString,
        });
    };

    useEffect(() => {
        if (didAutoCreateRef.current) return;
        if (record !== null) return;
        if (defaultValue === undefined) return;
        didAutoCreateRef.current = true;
        setValue(defaultValue as T);
    }, [record, defaultValue]);

    return [
        {
            value,
            lastModified,
            timeCreated,
            userId,
            state: { isSyncing },
        },
        setValue,
    ];
}