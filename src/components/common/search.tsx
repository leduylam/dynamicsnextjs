import React, { useRef, useEffect } from "react";
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

export default function Search() {
  const { displaySearch, closeSearch } = useUI();
  const [searchText, setSearchText] = React.useState("");
  const router = useRouter();
  const [debouncedSearchText, setDebouncedSearchText] =
    React.useState(searchText);
  useDebounce(
    () => {
      setDebouncedSearchText(searchText);
    },
    200,
    [searchText]
  );
  const { data, isLoading } = useSearchQuery({
    text: debouncedSearchText,
  });
  function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault();
    if (searchText) {
      closeSearch();
      clear();
      router.push("/search?text=" + searchText);
    }
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
    }
  }, [displaySearch]);

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
            {searchText && (
              <div className="bg-white flex flex-col rounded-md overflow-hidden h-full max-h-64vh lg:max-h-[550px]">
                <Scrollbar className="os-host-flexbox">
                  <div className="h-full">
                    {isLoading ? (
                      <div className="p-5 border-b border-gray-300 border-opacity-30 last:border-b-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <SearchResultLoader
                            key={idx}
                            uniqueKey={`top-search-${idx}`}
                          />
                        ))}
                      </div>
                    ) : (
                      data?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className=" p-5 border-b border-gray-150 relative last:border-b-0"
                          onClick={closeSearch}
                        >
                          <SearchProduct item={item} key={index} />
                        </div>
                      ))
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
