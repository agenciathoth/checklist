"use client";

import {
  getSearchParamsObject,
  mergeSearchParams,
  ParamsType,
  SearchParams,
} from "@/utils/searchParams";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type SetSearchParamsOptions = {
  noRedirect?: boolean;
  historyMethod?: "push" | "replace";
};

type SetSearchParams = (
  newParams: ParamsType,
  options?: SetSearchParamsOptions,
) => void;

export type SearchParamsContextType = {
  searchParams: SearchParams;
  setSearchParams: SetSearchParams;
  getHrefWithParams: (params: ParamsType) => string;
};

export const SearchParamsContext =
  createContext<SearchParamsContextType | null>(null);

type SearchParamsProviderProps = {
  children: ReactNode;
};

export function SearchParamsProvider({ children }: SearchParamsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  const [searchParams, setSearchParamsState] = useState<SearchParams>(() =>
    getSearchParamsObject(nextSearchParams),
  );

  useEffect(() => {
    setSearchParamsState(getSearchParamsObject(nextSearchParams));
  }, [nextSearchParams]);

  useEffect(() => {
    const onPopState = () => {
      setSearchParamsState(
        getSearchParamsObject(new URLSearchParams(window.location.search)),
      );
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setSearchParams = useCallback<SetSearchParams>(
    (newParams, options) => {
      const currentParams = mergeSearchParams(
        new URLSearchParams(window.location.search),
        newParams,
      );

      const search = currentParams.toString();
      const query = search ? `?${search}` : "";
      const nextParams = getSearchParamsObject(currentParams);

      if (options?.noRedirect) {
        const url = `${pathname}${query}`;

        if (options.historyMethod === "replace") {
          window.history.replaceState(null, "", url);
        } else {
          window.history.pushState(null, "", url);
        }

        setSearchParamsState(nextParams);
        return;
      }

      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router],
  );

  const getHrefWithParams = useCallback(
    (params: ParamsType): string => {
      const current = mergeSearchParams(
        new URLSearchParams(nextSearchParams.toString()),
        params,
      );

      const qs = current.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname, nextSearchParams],
  );

  return (
    <SearchParamsContext.Provider
      value={{
        searchParams,
        setSearchParams,
        getHrefWithParams,
      }}
    >
      {children}
    </SearchParamsContext.Provider>
  );
}

export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);

  if (!context) {
    throw new Error(
      "useSearchParamsContext must be used within SearchParamsProvider",
    );
  }

  return context;
}
