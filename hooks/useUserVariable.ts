

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

interface VariableOptions<T> {

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
 * const [myCount, setMyCount] = useUserVariable<number>("count", 0);
 * ```
 *
 * **2. Public Profile (Searchable)**
 * By setting `isPublic`, others can read this. By setting `searchKey`, you can
 * search for users based on the value of that specific field (e.g., finding a user by their username).
 * ```ts
 * type UserData = { username: string; name: string };
 *
 * const [profile, setProfile] = useUserVariable<UserData>("profile", undefined, {
 * isPublic: true,       // Allow others to read this
 * searchKey: "username" // "Tie" the search index to the username field
 * });
 * ```
 *
 * **3. Reading another user's variable**
 * You can read another user's data if they have marked it as `isPublic`.
 * You cannot edit another user's data (the setter will be ignored).
 * ```ts
 * const [theirProfile] = useUserVariable<UserData>("profile", undefined, {
 * userId: "user_123_abc"
 * });
 * ```
 *
 * ---
 * @template T - The type of data to store (number, string, object, etc).
 * @param key - A unique name for this variable.
 * @param defaultValue - The value to use while loading or if the variable doesn't exist yet.
 * @param options - Settings for `isPublic` (visibility), `userId` (reading others), and `searchKey` (indexing).
 */
export function useUserVariable<T>({
    key,
    defaultValue,
    isPublic = false,
    userId,
    searchString,
    searchKey
}: {
    key: string;
    defaultValue?: T;
    isPublic?: boolean;
    userId?: string;
    searchString?: string;
    searchKey?: keyof T extends never ? string : keyof T;
}): [T | undefined, (newValue: T) => void] {

    // determine user, privliges, etc
    const queryArgs = userId
        ? { key, targetUserToken: userId }
        : { key };

    const data = useQuery(api.user_vars.get, queryArgs);

    const isLoading = (data === undefined);

    const value = isLoading
        ? undefined
        : (data ?? defaultValue ?? null);

    const isReadOnly = !!userId;

    // Actual mutation code
    const setMutation = useMutation(api.user_vars.set)
        .withOptimisticUpdate((localStore, args) => {
            if (!isReadOnly) {
                localStore.setQuery(api.user_vars.get, { key }, args.value);
            }
        });

    // Setter
    const setValue = (newValue: T) => {
        if (isReadOnly) {
            console.warn("Cannot set variable for another user.");
            return;
        }

        let currentSearchString = searchString;

        if (searchKey && typeof newValue === 'object' && newValue !== null) {
            const extractedValue = (newValue as any)[searchKey];
            if (typeof extractedValue === 'string') {
                currentSearchString = extractedValue;
            }
        }

        setMutation({
            key,
            value: newValue,
            isPublic: isPublic,
            searchString: currentSearchString ?? undefined,
        });
    };

    return [value, setValue] as const;
}