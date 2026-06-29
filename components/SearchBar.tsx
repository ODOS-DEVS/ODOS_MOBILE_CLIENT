import SearchField from "@/components/search/SearchField";
import { normalizeSearchText, queryMatchesSearchableText } from "@/utils/searchMatching";
import React, { useCallback, useMemo, useState } from "react";
import { type ViewStyle } from "react-native";

interface SearchBarProps {
  data?: any[];
  onResults?: (results: any[]) => void;
  onStartSearch?: () => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  searchKeys?: string[];
  containerStyle?: ViewStyle;
  embedded?: boolean;
  size?: "default" | "large";
}

export const SearchBar = ({
  data = [],
  onResults,
  onStartSearch,
  onQueryChange,
  placeholder = "Search products, stores & more",
  searchKeys = ["title", "category", "subtitle", "name", "label", "store"],
  containerStyle,
  embedded = false,
  size = "default",
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const normalizedQuery = useMemo(() => normalizeSearchText(query), [query]);

  const performSearch = useCallback(
    (value: string) => {
      if (!onResults) return;
      if (value.length === 0) {
        onResults([]);
        return;
      }

      const filtered = data.filter((item) => {
        const searchableText = searchKeys
          .map((key) => item?.[key])
          .filter((value) => typeof value === "string" || typeof value === "number")
          .map((value) => String(value))
          .join(" ");
        return queryMatchesSearchableText(value, searchableText);
      });
      onResults(filtered);
    },
    [data, onResults, searchKeys],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const normalized = normalizeSearchText(value);
    onQueryChange?.(normalized);
    if (normalized.length > 0) {
      onStartSearch?.();
    }
    performSearch(normalized);
  };

  return (
    <SearchField
      value={query}
      onChangeText={handleQueryChange}
      placeholder={placeholder}
      containerStyle={containerStyle}
      embedded={embedded}
      size={size}
      onSubmit={() => {
        if (normalizedQuery.length > 0) {
          onStartSearch?.();
          performSearch(normalizedQuery);
        }
      }}
    />
  );
};
