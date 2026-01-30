import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

type SearchResultItem<T> = {
  userId: string;
  data: T;
};

export function useSearch<T = any>(
  query: string,
  keyFilter: string,
): SearchResultItem<T>[] | undefined {

  const results = useQuery(
    api.user_vars.search,
    { query, keyFilter }
  );

  return results as SearchResultItem<T>[] | undefined;
}