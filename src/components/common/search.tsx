import React, { useRef, useEffect, useCallback, useState } from "react";
import cn from "classnames";
import SearchResultLoader from "@components/ui/loaders/search-result-loader";
import { useUI } from "@contexts/ui.context";
import SearchBox from "@components/common/search-box";
import { useSearchQuery } from "@framework/product/use-search";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import Scrollbar from "@components/common/scrollbar";
import SearchProduct from "@components/common/search-product";
import { useRouter } from "next/router";
import { useDebounce } from "react-use";

const RECENT_SEARCH_KEY = "recent_searches";
const MAX_RECENT_SEARCHES = 5;

export default function Search() {
  const { displaySearch, closeSearch } = useUI();
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  useDebounce(
    () => {
      setDebouncedSearchText(searchText);
    },
    350,
    [searchText]
  );
  const trimmedSearchText = searchText.trim();
  const debouncedTrimmedText = debouncedSearchText.trim();
  const shouldShowProductSuggestions = debouncedTrimmedText.length >= 2;
  const highlightMatch = useCallback(
    (text: string) => {
      if (!text) {
        return null;
      }
      const keyword = trimmedSearchText;
      if (!keyword) {
        return <span>{text}</span>;
      }
      const normalizedKeyword = keyword.toLowerCase();
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "ig");
      return text.split(regex).map((segment, index) => {
        if (!segment) {
          return null;
        }
        const isMatch = segment.toLowerCase() === normalizedKeyword;
        return (
          <span
            key={`${segment}-${index}`}
            className={isMatch ? "font-bold text-gray-900" : undefined}
          >
            {segment}
          </span>
        );
      });
    },
    [trimmedSearchText]
  );

  const filteredRecentSearches = React.useMemo(() => {
    if (!trimmedSearchText) {
      return recentSearches;
    }
    const normalizedKeyword = trimmedSearchText.toLowerCase();
    return recentSearches.filter((term) =>
      term.toLowerCase().includes(normalizedKeyword)
    );
  }, [recentSearches, trimmedSearchText]);
  const hasStoredRecentSearches = recentSearches.length > 0;
  const hasFilteredRecentSearches = filteredRecentSearches.length > 0;
  const shouldShowRecentBlock =
    !hasStoredRecentSearches || hasFilteredRecentSearches;

  const { data, isLoading } = useSearchQuery({
    text: shouldShowProductSuggestions ? debouncedTrimmedText : "",
  });
  const loadRecentSearches = useCallback(() => {
    if (typeof window === "undefined") {
      return [] as string[];
    }
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCH_KEY);
      if (!stored) {
        return [] as string[];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [] as string[];
      }
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0);
    } catch {
      return [] as string[];
    }
  }, []);

  const syncRecentSearches = useCallback(() => {
    setRecentSearches(loadRecentSearches());
  }, [loadRecentSearches]);

  const persistRecentSearch = useCallback(
    (keyword: string) => {
      const normalizedKeyword = keyword.trim();
      if (!normalizedKeyword) {
        return;
      }
      const current = loadRecentSearches();
      const deduped = current.filter(
        (item) => item.toLowerCase() !== normalizedKeyword.toLowerCase()
      );
      deduped.unshift(normalizedKeyword);
      const next = deduped.slice(0, MAX_RECENT_SEARCHES);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          RECENT_SEARCH_KEY,
          JSON.stringify(next)
        );
      }
      setRecentSearches(next);
    },
    [loadRecentSearches]
  );

  const clearRecentSearchHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RECENT_SEARCH_KEY);
    }
    setRecentSearches([]);
  }, []);

  const executeSearch = useCallback(
    (keyword: string) => {
      const normalizedKeyword = keyword.trim();
      if (!normalizedKeyword) {
        return;
      }
      persistRecentSearch(normalizedKeyword);
      closeSearch();
      setSearchText("");
      setDebouncedSearchText("");
      router.push(`/search?text=${encodeURIComponent(normalizedKeyword)}`);
    },
    [closeSearch, persistRecentSearch, router]
  );

  const handleRecentSelect = useCallback(
    (term: string) => {
      setSearchText(term);
      setDebouncedSearchText(term);
      executeSearch(term);
    },
    [executeSearch]
  );

  function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault();
    executeSearch(searchText);
  }
  function handleAutoSearch(e: React.FormEvent<HTMLInputElement>) {
    setSearchText(e.currentTarget.value);
  }
  function clear() {
    setSearchText("");
  }

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (displaySearch && inputRef.current) {
      inputRef.current.focus();
      syncRecentSearches();
    }
  }, [displaySearch, syncRecentSearches]);

  useEffect(() => {
    if (ref.current) {
      if (displaySearch) {
        disableBodyScroll(ref.current);
      } else {
        enableBodyScroll(ref.current);
      }
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [displaySearch]);
  return (
    <div ref={ref}>
      <div
        className={cn("overlay", {
          open: displaySearch,
        })}
        role="button"
        onClick={closeSearch}
      />
      <div
        className={cn(
          "drawer-search relative hidden top-0 z-30 opacity-0 invisible transition duration-300 ease-in-out left-1/2 px-4 w-full md:w-[730px] lg:w-[930px]",
          {
            open: displaySearch,
          }
        )}
      >
        <div className="w-full flex flex-col justify-center">
          <div className="flex-shrink-0 mt-3.5 lg:mt-4 w-full">
            <div className="flex flex-col mx-auto mb-1.5 w-full ">
              <SearchBox
                onSubmit={handleSearch}
                onChange={handleAutoSearch}
                name="search"
                value={searchText}
                onClear={clear}
                ref={inputRef}
              />
            </div>
            {displaySearch && (
              <div className="bg-white flex flex-col rounded-md overflow-hidden h-full max-h-64vh lg:max-h-[550px]">
                <Scrollbar className="os-host-flexbox">
                  <div className="h-full flex flex-col">
                    {shouldShowRecentBlock && (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                          <span className="text-sm font-semibold uppercase tracking-wide text-heading">
                            Tìm kiếm gần đây
                          </span>
                          {hasStoredRecentSearches && (
                            <button
                              type="button"
                              className="text-xs font-medium text-body hover:text-heading"
                              onClick={clearRecentSearchHistory}
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                        <div className="py-2">
                          {hasStoredRecentSearches ? (
                            filteredRecentSearches.map((term) => (
                              <button
                                type="button"
                                key={term}
                                className="w-full text-left px-5 py-2.5 text-sm text-heading hover:bg-gray-100 transition-colors"
                                onClick={() => handleRecentSelect(term)}
                              >
                                <span className="text-heading">
                                  {highlightMatch(term)}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="px-5 py-6 text-sm text-body text-center">
                              Chưa có tìm kiếm gần đây.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {shouldShowProductSuggestions && (
                      <div
                        className={cn(
                          "flex flex-col",
                          shouldShowRecentBlock ? "border-t border-gray-200" : ""
                        )}
                      >
                        <div className="px-5 py-4">
                          <span className="text-sm font-semibold uppercase tracking-wide text-heading">
                            Gợi ý sản phẩm
                          </span>
                        </div>
                    {isLoading ? (
                          <div className="p-5 border-t border-gray-300 border-opacity-30">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <SearchResultLoader
                            key={idx}
                            uniqueKey={`top-search-${idx}`}
                          />
                        ))}
                      </div>
                    ) : (
                      data?.products?.map((item: any, index: number) => (
                        <div
                          key={index}
                              className="p-5 border-t border-gray-150 last:border-b-0"
                          onClick={closeSearch}
                        >
                              <SearchProduct
                                item={{
                                  ...item,
                                  highlightKeyword: trimmedSearchText,
                                }}
                                key={index}
                              />
                        </div>
                      ))
                        )}
                      </div>
                    )}
                  </div>
                </Scrollbar>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
