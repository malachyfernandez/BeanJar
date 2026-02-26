import { devWarningsConfig } from "./devWarningsConfig";

export type DevWarningKey =
    | "sorted_search_mode"
    | "in_memory_value_sort"
    | "in_memory_userIds_filter_in_search";

export function devWarn(key: DevWarningKey, message: string) {
    if (!devWarningsConfig.enabled) return;

    const configPath = "utils/devWarningsConfig.ts";

    if (key === "sorted_search_mode" && !devWarningsConfig.warnOnSortedSearchMode) return;
    if (key === "in_memory_value_sort" && !devWarningsConfig.warnOnInMemoryValueSort) return;
    if (key === "in_memory_userIds_filter_in_search" && !devWarningsConfig.warnOnInMemoryUserIdsFilterInSearch) return;

    console.warn(`[BeanJar Dev Warning:${key}] ${message} (disable/edit: ${configPath})`);
}
