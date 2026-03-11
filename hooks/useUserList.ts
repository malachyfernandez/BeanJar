import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { devWarn } from "../utils/devWarnings";
import { userVarConfig } from "../utils/userVarConfig";

type ObjectKeys<T> = T extends object ? Extract<keyof T, string> : never;
type PrimitiveIndexValue = string | number | boolean;

export type Privacy = "PUBLIC" | "PRIVATE" | string[];

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

export type UserListRecord<T> = {
  id?: string;
  _id?: string;
  definitionId?: string;

  key?: string;
  itemId?: string;
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

export type UserListResult<T> = UserListRecord<T> & {
  confirmedValue?: T;
  state: SyncState;
};

export type UserListOpStatusInfo<T> = {
  key: string;
  itemId: string;
  status: "pending" | "confirmed" | "timed_out";
  optimisticValue: T;
  lastConfirmedValue: T | undefined;
  msSinceSet: number;
};

/**
 * Persistent user-scoped state for one list item.
 *
 * Uniqueness is:
 * - userToken + key + itemId
 *
 * This is the multi-item companion to `useUserVariable(...)`.
 *
 * Important:
 * - the item's value lives on the list item row
 * - the list-wide config lives on a separate definition row
 * - privacy is list-level, not item-level
 *
 * `filterKey`, `searchKeys`, and `sortKey` may reference:
 * - fields inside the item value
 * - PROPERTY_* metadata references
 *
 * Supported list-specific property reference:
 * - PROPERTY_ITEMID
 *
 * Example:
 * const [post, setPost] = useUserList({
 *   key: "posts",
 *   itemId: "post_123",
 *   defaultValue: { title: "", body: "" },
 *   privacy: "PUBLIC",
 *   searchKeys: ["title", "body", "PROPERTY_ITEMID"],
 *   sortKey: "PROPERTY_LAST_MODIFIED",
 * });
 */
export function useUserList<T>({
  key,
  itemId,
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
  itemId: string;
  defaultValue?: T;
  privacy?: Privacy;
  filterKey?: ObjectKeys<T> | string;
  searchKeys?: (ObjectKeys<T> | string)[];
  sortKey?: ObjectKeys<T> | string;
  timeoutMs?: number;
  optimisticTimeoutBehavior?: OptimisticTimeoutBehavior;
  overwriteStoredConfig?: boolean;
  onOpStatusChange?: (info: UserListOpStatusInfo<T>) => void;
}): [UserListResult<T>, (newValue: T) => void] {
  const record = useQuery(api.user_lists.get, { key, itemId });

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
      `Rolled back list key="${key}" itemId="${itemId}" to last confirmed value after timeout.` 
    );
  }, [
    itemId,
    key,
    opState.lastOpStatus,
    opState.lastOpTimedOutAt,
    shouldAutoResetOnTimeout,
  ]);

  const setMutation = useMutation(api.user_lists.set).withOptimisticUpdate(
    (localStore, args) => {
      const existing = localStore.getQuery(api.user_lists.get, {
        key,
        itemId,
      }) as any;

      const now = Date.now();

      localStore.setQuery(api.user_lists.get, { key, itemId }, {
        ...(existing ?? {}),
        key,
        itemId,
        value: args.value,
        lastModified: now,
        createdAt: existing?.createdAt ?? now,
        privacy: existing?.privacy ?? args.privacy,
        filterKey: existing?.filterKey ?? args.filterKey,
        searchKeys: existing?.searchKeys ?? args.searchKeys,
        sortKey: existing?.sortKey ?? args.sortKey,
        id: existing?.id,
        _id: existing?._id,
        definitionId: existing?.definitionId,
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
      itemId,
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
        `Setter for list key="${key}" itemId="${itemId}" has not been confirmed after ${msSinceSet}ms (timeoutMs=${timeoutMs}). ResetBehavior=${optimisticTimeoutBehavior}.` 
      );

      pending.hasTimedOut = true;

      setOpState({
        lastOpStatus: "timed_out",
        lastOpStartedAt: startedAt,
        lastOpTimedOutAt: Date.now(),
      });

      onOpStatusChange?.({
        key,
        itemId,
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
      itemId,
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
          itemId,
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
    } as UserListResult<T>,
    setValue,
  ];
}
