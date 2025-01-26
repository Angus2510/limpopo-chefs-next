'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SearchParamsProviderProps {
  children: React.ReactNode;
  searchSchema: any;
  initialState: any;
}

export const SearchParamsContext = React.createContext<{
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
} | null>(null);

export const SearchParamsProvider: React.FC<SearchParamsProviderProps> = ({ children, searchSchema, initialState }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsedParams = React.useMemo(() => {
    return searchSchema.parse(Object.fromEntries(searchParams));
  }, [searchParams, searchSchema]);

  const initialParams = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(initialState).forEach(key => {
      if (!params.has(key)) {
        params.set(key, initialState[key]);
      }
    });
    return params;
  }, [initialState, searchParams]);

  const setSearchParams = React.useCallback((params: URLSearchParams) => {
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  return (
    <SearchParamsContext.Provider value={{ searchParams: initialParams, setSearchParams }}>
      {children}
    </SearchParamsContext.Provider>
  );
};
