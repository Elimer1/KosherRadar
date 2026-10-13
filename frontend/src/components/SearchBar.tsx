// The main search box (restaurant name or food only) with autocomplete.
// Suggestions start at 2 characters, wait 300 ms after the last keystroke, and old requests are cancelled.
// Clicking a suggestion opens that restaurant; Enter or the Search button without a choice runs the search.
import axios from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getRestaurantSuggestions } from '../api/searchApi';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { RestaurantSuggestion, SearchFilters } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { describeKashrutShort } from '../utils/kashrutText';
import { restaurantDisplayNames } from '../utils/restaurantName';

const MIN_CHARACTERS = 2;
const DEBOUNCE_MS = 300;
const LIST_ID = 'restaurant-suggestions';

interface SearchBarProps {
  text: string;
  onTextChange: (text: string) => void;
  onSearch: (text: string) => void;
  onPickSuggestion: (restaurantId: string) => void;
  filters: SearchFilters;
  hechsherOptions: HechsherOption[];
  children?: ReactNode;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="8.5" r="5.2" />
      <path d="M12.4 12.4 17 17" />
    </svg>
  );
}

function SearchBar({
  text,
  onTextChange,
  onSearch,
  onPickSuggestion,
  filters,
  hechsherOptions,
  children,
}: SearchBarProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<{ query: string; rows: RestaurantSuggestion[] }>({ query: '', rows: [] });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedText = text.trim();
  const debouncedText = useDebouncedValue(trimmedText, DEBOUNCE_MS);
  const filtersWithoutText = JSON.stringify({ ...filters, q: '' });

  useEffect(() => {
    if (debouncedText.length < MIN_CHARACTERS) {
      return;
    }

    const controller = new AbortController();

    const loadSuggestions = async () => {
      try {
        const rows = await getRestaurantSuggestions(
          { ...(JSON.parse(filtersWithoutText) as SearchFilters), q: debouncedText },
          controller.signal
        );
        setAnswer({ query: debouncedText, rows });
        setActiveIndex(-1);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setAnswer({ query: debouncedText, rows: [] });
        }
      }
    };

    loadSuggestions();

    return () => controller.abort();
  }, [debouncedText, filtersWithoutText]);

  const normalizedText = trimmedText.toLowerCase();
  const normalizedQuery = answer.query.toLowerCase();
  const answerIsRelated = normalizedText.startsWith(normalizedQuery) || normalizedQuery.startsWith(normalizedText);
  const suggestions = answerIsRelated ? answer.rows : [];
  const showList = open && trimmedText.length >= MIN_CHARACTERS && suggestions.length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setOpen(false);
    onSearch(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (!showList) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      onPickSuggestion(suggestions[activeIndex].id);
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="v2-composer" aria-label={t('search.form')}>
      <div className="v2-composer-name">
        <label htmlFor="restaurant-search" className="sr-only">
          {t('search.label')}
        </label>
        <input
          id="restaurant-search"
          type="search"
          value={text}
          maxLength={100}
          autoComplete="off"
          placeholder={t('search.placeholder')}
          className="v2-composer-input"
          role="combobox"
          aria-expanded={showList}
          aria-controls={LIST_ID}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          onChange={(event) => {
            onTextChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
        />
        {showList && (
          <ul id={LIST_ID} role="listbox" className="v2-suggest">
            {suggestions.map((suggestion, index) => {
              const names = restaurantDisplayNames(suggestion);

              return (
                <li
                  key={suggestion.id}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onPickSuggestion(suggestion.id);
                  }}
                  className={`min-h-12 cursor-pointer px-3.5 py-2 text-start ${index === activeIndex ? 'bg-mist' : 'hover:bg-canvas'}`}
                >
                  <p className="break-words text-[15px] font-semibold text-ink">
                    <bdi>{names.primary}</bdi>
                  </p>
                  {names.secondary.length > 0 && (
                    <p className="break-words text-sm text-muted">
                      {names.secondary.map((name, nameIndex) => (
                        <span key={`${name}-${nameIndex}`}>
                          {nameIndex > 0 && <span aria-hidden="true"> · </span>}
                          <bdi>{name}</bdi>
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="break-words text-sm text-muted">
                    <bdi>{suggestion.city || suggestion.address}</bdi>
                  </p>
                  <p className="text-sm text-ink">{describeKashrutShort(suggestion.kashrut, hechsherOptions)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {children}
      <button type="submit" className="v2-composer-submit">
        <SearchIcon />
        {t('search.button')}
      </button>
    </form>
  );
}

export default SearchBar;
