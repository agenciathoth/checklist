import { ReadonlyURLSearchParams } from "next/navigation";

export type ParamsType = Record<string, string | null | undefined>;

export type SearchParams = Record<string, string>;

export function getSearchParamsObject(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
): SearchParams {
  const result: SearchParams = {};

  searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export function mergeSearchParams(
  current: URLSearchParams,
  newParams: ParamsType,
): URLSearchParams {
  const merged = new URLSearchParams(current.toString());

  Object.entries(newParams).forEach(([key, value]) => {
    if (value) {
      merged.set(key, value);
    } else {
      merged.delete(key);
    }
  });

  return merged;
}
