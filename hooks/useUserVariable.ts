

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { devWarn } from "../utils/devWarnings";
import { userVarConfig } from "../utils/userVarConfig";

type ObjectKeys<T> = T extends object ? Extract<keyof T, string> : never;
type PrimitiveIndexValue = string | number | boolean;

// Frontend privacy input shape:
// - "PUBLIC"
// - "PRIVATE"
// - array of user IDs, which is converted to { allowList: [...] } on the backend
export type Privacy = "PUBLIC" | "PRIVATE" | string[];

// Stored/backend privacy output shape
export type StoredPrivacy =
    | "PUBLIC"
    | "PRIVATE"
    | { allowList: string[] };

export type OptimisticTimeoutBehavior = "reset" | "keep";

type SyncState = {
    isSyncing: boolean;
    lastOpStatus?: "idle" | "pending" | "confirmed" | "timed_out";
    lastOpStartedAt?: number;
    lastOpTimedOutAt?: number;
};

export type UserVariableRecord<T> = {
    id?: string;
    _id?: string;
    key?: string;
    userToken?: string;

    value: T;
    privacy?: StoredPrivacy;

    filterKey?: string;
    filterValue?: PrimitiveIndexValue;

    searchKeys?: string[];
    searchValue?: string;

    sortKey?: string;
    sortValue?: PrimitiveIndexValue;

    createdAt?: number;
    lastModified?: number;
};

export type UserVariableResult<T> = UserVariableRecord<T> & {
    confirmedValue?: T;
    state: SyncState;
};

export type UserVarOpStatusInfo<T> = {
    key: string;
    status: "pending" | "confirmed" | "timed_out";
    optimisticValue: T;
    lastConfirmedValue: T | undefined;
    msSinceSet: number;
};

/**
 * Persistent user-scoped state that feels like `useState`, but is backed by the server.
 *
 * This hook gives each authenticated user exactly one variable per `key`.
 * The variable is stored in Convex and automatically re-used across page loads,
 * sessions, and devices.
 *
 * -----------------------------------------------------------------------------
 * Core mental model
 * -----------------------------------------------------------------------------
 *
 * Think of this hook as:
 *
 * - "my persistent state for this key"
 *
 * not:
 *
 * - "a generic document query"
 *
 * Each user has at most one record for a given `key`.
 *
 * Example:
 *
 * ```ts
 * const [profile, setProfile] = useUserVariable({
 *   key: "profile",
 *   defaultValue: {
 *     username: "malachy",
 *     name: "Malachy",
 *   },
 *   privacy: "PUBLIC",
 *   searchKeys: ["username", "name"],
 *   filterKey: "name",
 *   sortKey: "username",
 * });
 * ```
 *
 * On first creation, the hook creates the record with the provided config.
 * On later renders and later value writes, the existing stored config is
 * preserved by default unless `overwriteStoredConfig` is enabled.
 *
 * -----------------------------------------------------------------------------
 * Returned value
 * -----------------------------------------------------------------------------
 *
 * The first tuple item is not just the raw `value`.
 * It is a rich object containing:
 *
 * - `value` - the current UI value
 * - `confirmedValue` - the last server-confirmed value
 * - `id` / `_id` 
 * - `key` 
 * - `userToken` 
 * - `privacy` 
 * - `filterKey` 
 * - `filterValue` 
 * - `searchKeys` 
 * - `searchValue` 
 * - `sortKey` 
 * - `sortValue` 
 * - `createdAt` 
 * - `lastModified` 
 * - `state` 
 *
 * This means it behaves like state, but still exposes the full backing record.
 *
 * -----------------------------------------------------------------------------
 * Config behavior: defaults-on-create vs overwrite-on-set
 * -----------------------------------------------------------------------------
 *
 * By default, the options:
 *
 * - `privacy` 
 * - `filterKey` 
 * - `searchKeys` 
 * - `sortKey` 
 *
 * are treated as "defaults used when the record is first created".
 *
 * That means:
 *
 * 1. If the variable does not exist yet, those options are used to create it.
 * 2. If the variable already exists, normal `setValue(...)` calls keep the stored
 *    config instead of overwriting it.
 *
 * This is important for cases like privacy:
 *
 * ```ts
 * const [user, setUser] = useUserVariable({
 *   key: "user",
 *   defaultValue: { name: "Bob" },
 *   privacy: ["user_a", "user_b"],
 * });
 * ```
 *
 * If you later update privacy explicitly with `useUserVariablePrivacy(...)`,
 * future `setUser(...)` calls should not silently reset privacy back to the
 * original array.
 *
 * Global default:
 *
 * - `utils/userVarConfig.ts` -> `overwriteStoredConfigOnSet` 
 *
 * Per-hook override:
 *
 * - `overwriteStoredConfig` 
 *
 * -----------------------------------------------------------------------------
 * Derived server fields
 * -----------------------------------------------------------------------------
 *
 * The backend computes these fields automatically:
 *
 * - `filterValue` 
 * - `searchValue` 
 * - `sortValue` 
 *
 * from the stored `value` and the config:
 *
 * - `filterKey` 
 * - `searchKeys` 
 * - `sortKey` 
 *
 * The client does NOT send `filterValue`, `searchValue`, or `sortValue`.
 *
 * -----------------------------------------------------------------------------
 * Property references
 * -----------------------------------------------------------------------------
 *
 * `filterKey`, `searchKeys`, and `sortKey` may refer either to:
 *
 * 1. a field inside `value` 
 * 2. or a top-level record property using `PROPERTY_*` 
 *
 * Examples:
 *
 * ```ts
 * filterKey: "color"                  // reads value.color
 * searchKeys: ["username", "name"]    // reads value.username and value.name
 * sortKey: "score"                    // reads value.score
 * sortKey: "PROPERTY_LAST_MODIFIED"   // reads record.lastModified
 * sortKey: "PROPERTY_CREATED_AT"      // reads record.createdAt
 * ```
 *
 * Supported record-property references include:
 *
 * - `PROPERTY_ID` 
 * - `PROPERTY__ID` 
 * - `PROPERTY_CREATED_AT` 
 * - `PROPERTY_TIME_CREATED` (legacy-friendly alias)
 * - `PROPERTY_FILTER_KEY` 
 * - `PROPERTY_FILTER_VALUE` 
 * - `PROPERTY_KEY` 
 * - `PROPERTY_LAST_MODIFIED` 
 * - `PROPERTY_PRIVACY` 
 * - `PROPERTY_SEARCH_KEYS` 
 * - `PROPERTY_SEARCH_VALUE` 
 * - `PROPERTY_SORT_KEY` 
 * - `PROPERTY_SORT_VALUE` 
 * - `PROPERTY_USER_TOKEN` 
 * - `PROPERTY_VALUE` 
 *
 * Anti-recursion rule:
 *
 * If a config points to its own derived field, it is ignored.
 *
 * Examples:
 *
 * ```ts
 * filterKey: "PROPERTY_FILTER_KEY"    // ignored
 * sortKey: "PROPERTY_SORT_VALUE"      // ignored
 * searchKeys: ["PROPERTY_SEARCH_VALUE"] // ignored
 * ```
 *
 * -----------------------------------------------------------------------------
 * Setter semantics
 * -----------------------------------------------------------------------------
 *
 * The setter REPLACES the stored value.
 * It does not merge objects.
 *
 * Example:
 *
 * ```ts
 * const [user, setUser] = useUserVariable({
 *   key: "user",
 *   defaultValue: { name: "Bob", username: "bob123" },
 * });
 *
 * setUser({ name: "Alice" });
 * ```
 *
 * After the write, the value is:
 *
 * ```ts
 * { name: "Alice" }
 * ```
 *
 * `username` is gone unless you include it in the next value.
 *
 * -----------------------------------------------------------------------------
 * Optimistic writes and timeouts
 * -----------------------------------------------------------------------------
 *
 * Writes are optimistic.
 *
 * That means when you call `setValue(newValue)`, the UI updates immediately
 * before the server confirms the mutation.
 *
 * The hook tracks the most recent operation with:
 *
 * - `state.lastOpStatus` 
 * - `state.lastOpStartedAt` 
 * - `state.lastOpTimedOutAt` 
 *
 * Possible statuses:
 *
 * - `"idle"` - no recent operation
 * - `"pending"` - the optimistic write has been sent and is waiting
 * - `"confirmed"` - the server confirmed the latest pending write
 * - `"timed_out"` - the write was not confirmed before `timeoutMs` 
 *
 * `onOpStatusChange` is called whenever the latest operation changes status:
 *
 * - pending
 * - confirmed
 * - timed_out
 *
 * Example:
 *
 * ```ts
 * const [profile, setProfile] = useUserVariable({
 *   key: "profile",
 *   defaultValue: { name: "Malachy" },
 *   onOpStatusChange(info) {
 *     console.log(info.status, info.optimisticValue, info.msSinceSet);
 *   },
 * });
 * ```
 *
 * `info` contains:
 *
 * - `key` 
 * - `status` 
 * - `optimisticValue` 
 * - `lastConfirmedValue` 
 * - `msSinceSet` 
 *
 * -----------------------------------------------------------------------------
 * Timeout behavior
 * -----------------------------------------------------------------------------
 *
 * `timeoutMs` controls how long to wait before a pending write is considered
 * timed out.
 *
 * Default:
 *
 * - `utils/userVarConfig.ts` -> `defaultTimeoutMs` 
 *
 * Per-hook override:
 *
 * - `timeoutMs` 
 *
 * `optimisticTimeoutBehavior` controls what happens if confirmation does not
 * arrive in time.
 *
 * - `"reset"` (default):
 *   - mark operation as timed out
 *   - UI value rolls back to the last confirmed value
 *   - if no confirmed value exists yet, it falls back to `defaultValue` 
 *
 * - `"keep"`:
 *   - mark operation as timed out
 *   - UI keeps showing the optimistic value
 *   - useful if you want to preserve local feel even through temporary failures
 *
 * Examples:
 *
 * ```ts
 * const [settings, setSettings] = useUserVariable({
 *   key: "settings",
 *   defaultValue: { darkMode: false },
 *   timeoutMs: 8000,
 *   optimisticTimeoutBehavior: "reset",
 * });
 * ```
 *
 * ```ts
 * const [draft, setDraft] = useUserVariable({
 *   key: "draft",
 *   defaultValue: { text: "" },
 *   timeoutMs: 10000,
 *   optimisticTimeoutBehavior: "keep",
 * });
 * ```
 *
 * Dev warnings for timeout behavior can be adjusted in:
 *
 * - `utils/userVarConfig.ts` 
 *
 * Relevant config flags:
 *
 * - `devWarningsEnabled` 
 * - `warnOnUserVarOpTimeout` 
 * - `logOnUserVarRollback` 
 * - `defaultTimeoutMs` 
 * - `overwriteStoredConfigOnSet` 
 *
 * -----------------------------------------------------------------------------
 * Auto-create behavior
 * -----------------------------------------------------------------------------
 *
 * If the variable does not exist yet and `defaultValue` is provided, the hook
 * automatically creates it once.
 *
 * Example:
 *
 * ```ts
 * const [count, setCount] = useUserVariable<number>({
 *   key: "count",
 *   defaultValue: 0,
 * });
 * ```
 *
 * First load for that user:
 *
 * - no record exists
 * - hook auto-creates `{ value: 0 }` 
 *
 * Later loads:
 *
 * - existing record is returned
 * - no duplicate creation occurs
 *
 * -----------------------------------------------------------------------------
 * Usage examples
 * -----------------------------------------------------------------------------
 *
 * 1. Minimal counter
 *
 * ```ts
 * const [count, setCount] = useUserVariable<number>({
 *   key: "count",
 *   defaultValue: 0,
 * });
 *
 * count.value;
 * count.confirmedValue;
 * count.state.lastOpStatus;
 *
 * setCount(count.value + 1);
 * ```
 *
 * 2. Public profile searchable by username and name
 *
 * ```ts
 * type Profile = {
 *   username: string;
 *   name: string;
 * };
 *
 * const [profile, setProfile] = useUserVariable<Profile>({
 *   key: "profile",
 *   defaultValue: {
 *     username: "malachy",
 *     name: "Malachy",
 *   },
 *   privacy: "PUBLIC",
 *   searchKeys: ["username", "name"],
 *   sortKey: "username",
 * });
 * ```
 *
 * 3. Public bean filterable by color and sorted by rating
 *
 * ```ts
 * type Bean = {
 *   name: string;
 *   color: string;
 *   rating: number;
 * };
 *
 * const [bean, setBean] = useUserVariable<Bean>({
 *   key: "favoriteBean",
 *   defaultValue: {
 *     name: "Lima",
 *     color: "Green",
 *     rating: 10,
 *   },
 *   privacy: "PUBLIC",
 *   filterKey: "color",
 *   searchKeys: ["name", "color"],
 *   sortKey: "rating",
 * });
 * ```
 *
 * 4. Sort by metadata instead of value fields
 *
 * ```ts
 * const [post, setPost] = useUserVariable({
 *   key: "latestPost",
 *   defaultValue: { title: "Hello" },
 *   privacy: "PUBLIC",
 *   sortKey: "PROPERTY_LAST_MODIFIED",
 * });
 * ```
 *
 * 5. Whitelist privacy
 *
 * ```ts
 * const [notes, setNotes] = useUserVariable({
 *   key: "notes",
 *   defaultValue: { text: "Secret" },
 *   privacy: ["user_a", "user_b"],
 * });
 * ```
 *
 * 6. Preserve stored privacy after explicit privacy changes
 *
 * ```ts
 * const [user, setUser] = useUserVariable({
 *   key: "user",
 *   defaultValue: { name: "Bob" },
 *   privacy: ["user_a", "user_b"],
 * });
 *
 * // Later, somewhere else:
 * // setUserPrivacy(["user_a"]);
 *
 * // Future setUser(...) calls do not overwrite stored privacy by default.
 * setUser({ name: "Alice" });
 * ```
 *
 * 7. Force config overwrite on every write
 *
 * ```ts
 * const [profile, setProfile] = useUserVariable({
 *   key: "profile",
 *   defaultValue: { name: "Bob" },
 *   privacy: "PUBLIC",
 *   overwriteStoredConfig: true,
 * });
 * ```
 */
export function useUserVariable<T>({
    key,
    defaultValue,
    privacy = "PRIVATE",
    filterKey,
    searchKeys,
    sortKey,
    timeoutMs = userVarConfig.defaultTimeoutMs,
    optimisticTimeoutBehavior = "reset",
    overwriteStoredConfig = userVarConfig.overwriteStoredConfigOnSet,
    onOpStatusChange,
}: {
    key: string;
    defaultValue?: T;
    privacy?: Privacy;
    filterKey?: ObjectKeys<T> | string;
    searchKeys?: (ObjectKeys<T> | string)[];
    sortKey?: ObjectKeys<T> | string;
    timeoutMs?: number;
    optimisticTimeoutBehavior?: OptimisticTimeoutBehavior;
    overwriteStoredConfig?: boolean;
    onOpStatusChange?: (info: UserVarOpStatusInfo<T>) => void;
}): [UserVariableResult<T>, (newValue: T) => void] {
    const record = useQuery(api.user_vars.get, { key });

    const isSyncing = record === undefined;

    const [confirmedValue, setConfirmedValue] = useState<T | undefined>(undefined);
    const confirmedValueRef = useRef<T | undefined>(undefined);

    const [opState, setOpState] = useState<{
        lastOpStatus: SyncState["lastOpStatus"];
        lastOpStartedAt?: number;
        lastOpTimedOutAt?: number;
    }>({ lastOpStatus: "idle" });

    const pendingOpRef = useRef<{
        id: number;
        startedAt: number;
        optimisticValue: T;
        timeoutHandle: ReturnType<typeof setTimeout> | null;
        hasTimedOut: boolean;
    } | null>(null);

    const opIdRef = useRef(0);
    const didAutoCreateRef = useRef(false);

    const baseValue: T = isSyncing
        ? (defaultValue as T)
        : ((record?.value ?? defaultValue) as T);

    useEffect(() => {
        if (record === undefined || record === null) return;
        if (pendingOpRef.current) return;

        const next = record.value as T;
        confirmedValueRef.current = next;
        setConfirmedValue(next);
    }, [record]);

    const shouldAutoResetOnTimeout = optimisticTimeoutBehavior === "reset";

    const value: T =
        shouldAutoResetOnTimeout && opState.lastOpStatus === "timed_out"
            ? ((confirmedValue ?? defaultValue) as T)
            : baseValue;

    useEffect(() => {
        if (!shouldAutoResetOnTimeout) return;
        if (opState.lastOpStatus !== "timed_out") return;
        if (!opState.lastOpTimedOutAt) return;

        devWarn(
            "uservar_rollback",
            `Rolled back key="${key}" to last confirmed value after timeout.` 
        );
    }, [
        key,
        opState.lastOpStatus,
        opState.lastOpTimedOutAt,
        shouldAutoResetOnTimeout,
    ]);

    const setMutation = useMutation(api.user_vars.set).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.user_vars.get, {
                key,
            }) as any;

            const now = Date.now();

            localStore.setQuery(api.user_vars.get, { key }, {
                ...(existing ?? {}),
                key,
                value: args.value,
                lastModified: now,
                createdAt: existing?.createdAt ?? now,
                privacy: existing?.privacy ?? args.privacy,
                filterKey: existing?.filterKey ?? args.filterKey,
                searchKeys: existing?.searchKeys ?? args.searchKeys,
                sortKey: existing?.sortKey ?? args.sortKey,
                id: existing?.id,
                _id: existing?._id,
                userToken: existing?.userToken,
                filterValue: existing?.filterValue,
                searchValue: existing?.searchValue,
                sortValue: existing?.sortValue,
            });
        }
    );

    const setValue = (newValue: T) => {
        const startedAt = Date.now();
        const opId = (opIdRef.current += 1);

        const existingPending = pendingOpRef.current;
        if (existingPending?.timeoutHandle) {
            clearTimeout(existingPending.timeoutHandle);
        }

        setOpState({
            lastOpStatus: "pending",
            lastOpStartedAt: startedAt,
            lastOpTimedOutAt: undefined,
        });

        onOpStatusChange?.({
            key,
            status: "pending",
            optimisticValue: newValue,
            lastConfirmedValue: confirmedValueRef.current,
            msSinceSet: 0,
        });

        const backendPrivacy = Array.isArray(privacy)
            ? { allowList: privacy }
            : privacy;

        const timeoutHandle = setTimeout(() => {
            const pending = pendingOpRef.current;
            if (!pending || pending.id !== opId) return;

            const msSinceSet = Date.now() - startedAt;

            devWarn(
                "uservar_op_timeout",
                `Setter for key="${key}" has not been confirmed after ${msSinceSet}ms (timeoutMs=${timeoutMs}). ResetBehavior=${optimisticTimeoutBehavior}.` 
            );

            pending.hasTimedOut = true;

            setOpState({
                lastOpStatus: "timed_out",
                lastOpStartedAt: startedAt,
                lastOpTimedOutAt: Date.now(),
            });

            onOpStatusChange?.({
                key,
                status: "timed_out",
                optimisticValue: newValue,
                lastConfirmedValue: confirmedValueRef.current,
                msSinceSet,
            });
        }, timeoutMs);

        pendingOpRef.current = {
            id: opId,
            startedAt,
            optimisticValue: newValue,
            timeoutHandle,
            hasTimedOut: false,
        };

        const mutationPromise = setMutation({
            key,
            value: newValue,
            privacy: backendPrivacy,
            filterKey,
            searchKeys,
            sortKey,
            overwriteStoredConfig,
        });

        Promise.resolve(mutationPromise)
            .then(() => {
                const pending = pendingOpRef.current;
                if (!pending || pending.id !== opId) return;

                if (pending.timeoutHandle) {
                    clearTimeout(pending.timeoutHandle);
                }

                if (pending.hasTimedOut) {
                    pendingOpRef.current = null;
                    return;
                }

                pendingOpRef.current = null;
                confirmedValueRef.current = newValue;
                setConfirmedValue(newValue);

                setOpState({
                    lastOpStatus: "confirmed",
                    lastOpStartedAt: startedAt,
                    lastOpTimedOutAt: undefined,
                });

                onOpStatusChange?.({
                    key,
                    status: "confirmed",
                    optimisticValue: newValue,
                    lastConfirmedValue: newValue,
                    msSinceSet: Date.now() - startedAt,
                });
            })
            .catch(() => {
                const pending = pendingOpRef.current;
                if (!pending || pending.id !== opId) return;

                if (pending.timeoutHandle) {
                    clearTimeout(pending.timeoutHandle);
                }

                pendingOpRef.current = null;
            });
    };

    useEffect(() => {
        if (didAutoCreateRef.current) return;
        if (record !== null) return;
        if (defaultValue === undefined) return;

        didAutoCreateRef.current = true;
        setValue(defaultValue as T);
    }, [record, defaultValue]);

    useEffect(() => {
        return () => {
            const pending = pendingOpRef.current;
            if (pending?.timeoutHandle) {
                clearTimeout(pending.timeoutHandle);
            }
            pendingOpRef.current = null;
        };
    }, []);

    return [
        {
            ...(record ?? {}),
            value,
            confirmedValue,
            state: {
                isSyncing,
                lastOpStatus: opState.lastOpStatus,
                lastOpStartedAt: opState.lastOpStartedAt,
                lastOpTimedOutAt: opState.lastOpTimedOutAt,
            },
        } as UserVariableResult<T>,
        setValue,
    ];
}