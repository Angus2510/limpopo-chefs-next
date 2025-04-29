"use client";

import { useState, useEffect, useRef } from "react";
import { UserNav } from "@/components/layout/user-nav";
import { SheetMenu } from "@/components/layout/sheet-menu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  globalSearch,
  type SearchResult,
} from "@/lib/actions/search/globalSearch";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedSearch.length > 1) {
        setLoading(true);
        try {
          const searchResults = await globalSearch(debouncedSearch);
          if (Array.isArray(searchResults)) {
            setResults(searchResults);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    handleSearch();
  }, [debouncedSearch]);

  const handleSelect = (result: SearchResult) => {
    setShowResults(false);
    setQuery("");
    router.push(result.url);
  };

  return (
    <header className="sticky z-10 top-0  w-full bg-background/95 shadow">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or ID..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-64 lg:w-96"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {showResults && query.length > 1 && (
              <div className="absolute mt-2 w-full bg-background border rounded-md shadow-lg">
                {loading ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-auto">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                        onClick={() => handleSelect(result)}
                      >
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.type} • {result.subtitle}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
