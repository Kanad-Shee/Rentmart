'use client';

import { usePublicEquipmentSearchSuggestionsQuery } from '@/hooks/use-equipment';
import { LoaderCircle, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type PublicEquipmentSearchProps = {
  placeholder?: string;
  variant?: 'compact' | 'expanded';
  initialValue?: string;
  autoFocus?: boolean;
  showSubmitButton?: boolean;
  className?: string;
  onNavigate?: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function buildSearchUrl(query: string, categoryId?: string) {
  const searchParams = new URLSearchParams({
    q: query.trim()
  });

  if (categoryId?.trim()) {
    searchParams.set('categoryId', categoryId.trim());
  }

  return `/search?${searchParams.toString()}`;
}

export function PublicEquipmentSearch({
  placeholder = 'Search equipment, categories, or locations...',
  variant = 'compact',
  initialValue = '',
  autoFocus = false,
  showSubmitButton,
  className = '',
  onNavigate
}: PublicEquipmentSearchProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue.trim());
  const [isOpen, setIsOpen] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    setQuery(initialValue);
    setDebouncedQuery(initialValue.trim());
  }, [initialValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const suggestionsQuery = usePublicEquipmentSearchSuggestionsQuery(
    debouncedQuery,
    isOpen
  );
  const suggestions = suggestionsQuery.data;
  const canSearch = trimmedQuery.length >= 2;
  const showPanel = isOpen && canSearch;
  const hasSuggestions = Boolean(
    suggestions &&
    (suggestions.matches.length > 0 ||
      suggestions.related.length > 0 ||
      suggestions.categorySuggestions.length > 0 ||
      suggestions.locationSuggestions.length > 0)
  );
  const panelWidthClass =
    variant === 'compact' ? 'w-[min(40rem,calc(100vw-2rem))]' : 'w-full';
  const inputSizeClass =
    variant === 'compact'
      ? 'h-10 rounded-xl text-sm'
      : 'h-14 rounded-2xl text-base';
  const containerClass =
    variant === 'compact'
      ? 'bg-background'
      : 'bg-white shadow-[0_16px_50px_rgba(0,0,0,0.08)]';
  const visibleMatches = suggestions?.matches ?? [];
  const visibleRelated = suggestions?.related ?? [];
  const visibleCategories = suggestions?.categorySuggestions ?? [];
  const visibleLocations = suggestions?.locationSuggestions ?? [];
  const shouldShowSubmitButton = showSubmitButton ?? variant === 'expanded';

  function navigateTo(url: string) {
    router.push(url);
    setIsOpen(false);
    onNavigate?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedQuery) {
      return;
    }

    navigateTo(buildSearchUrl(trimmedQuery));
  }

  const searchPrompt = useMemo(() => {
    if (trimmedQuery.length === 0) {
      return 'Search active equipment by machine name, category, or location.';
    }

    if (trimmedQuery.length === 1) {
      return 'Type at least 2 characters to see suggestions.';
    }

    return null;
  }, [trimmedQuery.length]);

  return (
    <div
      ref={rootRef}
      className={['relative', className].join(' ')}>
      <form
        onSubmit={handleSubmit}
        className={[
          'flex items-center gap-2 border-b px-3 py-2 shadow-sm',
          inputSizeClass,
          containerClass
        ].join(' ')}>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
        />
        {shouldShowSubmitButton ? (
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90">
            Search
          </button>
        ) : null}
      </form>

      {showPanel ? (
        <div
          className={[
            'absolute left-0 top-[calc(100%+0.75rem)] z-50 rounded-2xl border border-border bg-background p-4 shadow-[0_22px_60px_rgba(0,0,0,0.14)]',
            panelWidthClass
          ].join(' ')}>
          {suggestionsQuery.isPending ? (
            <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Searching active equipment...
            </div>
          ) : searchPrompt ? (
            <div className="px-2 py-3 text-sm text-muted-foreground">
              {searchPrompt}
            </div>
          ) : hasSuggestions ? (
            <div className="space-y-4">
              {visibleMatches.length > 0 ? (
                <section className="space-y-2">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#86af99]">
                    Matching Equipment
                  </p>
                  <div className="space-y-2">
                    {visibleMatches.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(`/details/${item.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.category.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {item.locationLabel}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-xs font-semibold text-primary">
                          {formatCurrency(item.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {visibleRelated.length > 0 ? (
                <section className="space-y-2">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#86af99]">
                    Related Items
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {visibleRelated.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(`/details/${item.id}`)}
                        className="rounded-xl border border-border px-3 py-3 text-left transition-colors hover:bg-muted">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.category.title}
                        </p>
                        <p className="mt-2 text-xs text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {visibleCategories.length > 0 || visibleLocations.length > 0 ? (
                <section className="space-y-3 border-t border-border pt-3">
                  {visibleCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {visibleCategories.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            navigateTo(buildSearchUrl(trimmedQuery, item.id))
                          }
                          className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                          {item.title} ({item.count})
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {visibleLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {visibleLocations.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => navigateTo(buildSearchUrl(item.label))}
                          className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                          {item.label} ({item.count})
                        </button>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          ) : (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No active equipment matched this search yet.
            </div>
          )}

          {trimmedQuery.length >= 2 ? (
            <button
              type="button"
              onClick={() => navigateTo(buildSearchUrl(trimmedQuery))}
              className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted">
              View all results for &quot;{trimmedQuery}&quot;
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

