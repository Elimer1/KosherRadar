// NEW (Milestone 4): the main search box (restaurant name or food only, spec section 8) with autocomplete.
// Suggestions start at 2 characters, wait 300 ms after the last keystroke, and old requests are cancelled.
// Clicking a suggestion opens that restaurant; Enter or the Search button without a choice runs the search.
// חדש (אבן דרך 4): תיבת החיפוש הראשית (שם מסעדה או אוכל בלבד) עם השלמה אוטומטית. הצעות מ-2 תווים, אחרי 300
// מילישניות, ובקשות ישנות מבוטלות. לחיצה על הצעה פותחת את המסעדה; Enter בלי בחירה מריץ חיפוש.
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent, KeyboardEvent } from 'react';
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
  // The current filters. Suggestions follow the same filters as the results (for example Include Unknown).
  filters: SearchFilters;
  hechsherOptions: HechsherOption[];
}

function SearchBar({ text, onTextChange, onSearch, onPickSuggestion, filters, hechsherOptions }: SearchBarProps) {
  const { t } = useTranslation();
  // The last answer, together with the text it was for.
  const [answer, setAnswer] = useState<{ query: string; rows: RestaurantSuggestion[] }>({ query: '', rows: [] });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedText = text.trim();
  const debouncedText = useDebouncedValue(trimmedText, DEBOUNCE_MS);

  // The filters except the text; a change here asks for new suggestions too.
  const filtersWithoutText = JSON.stringify({ ...filters, q: '' });

  useEffect(() => {
    if (debouncedText.length < MIN_CHARACTERS) {
      return;
    }

    // Aborting the request when the text changes again keeps a slow, old answer from replacing a new one.
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
        // Suggestions are a convenience: when they fail the visitor can still press Search.
        if (!axios.isCancel(err)) {
          setAnswer({ query: debouncedText, rows: [] });
        }
      }
    };

    loadSuggestions();

    return () => controller.abort();
  }, [debouncedText, filtersWithoutText]);

  // Keep showing the last answer while the visitor keeps typing (or deletes) the same word, but never show
  // the answer for a different word (for example after clearing the box and typing something new).
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
      // A highlighted suggestion was chosen with the keyboard: go straight to that restaurant.
      event.preventDefault();
      onPickSuggestion(suggestions[activeIndex].id);
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative" aria-label={t('search.form')}>
      <label htmlFor="restaurant-search" className="sr-only">
        {t('search.label')}
      </label>
      <div className="flex items-stretch overflow-hidden rounded-2xl border border-soft bg-white shadow-[0_8px_24px_rgba(23,75,58,0.06)] focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/25">
        <input
          id="restaurant-search"
          type="search"
          value={text}
          maxLength={100}
          autoComplete="off"
          placeholder={t('search.placeholder')}
          dir="auto"
          className="min-h-12 min-w-0 flex-1 bg-transparent px-4 text-ink outline-none placeholder:text-muted"
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
        <button
          type="submit"
          className="m-1 inline-flex min-h-11 shrink-0 items-center rounded-xl bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
        >
          {t('search.button')}
        </button>
      </div>

      {showList && (
        <ul
          id={LIST_ID}
          role="listbox"
          className="absolute inset-x-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-soft bg-white py-1 shadow-[0_8px_24px_rgba(23,75,58,0.12)]"
        >
          {suggestions.map((suggestion, index) => {
            const names = restaurantDisplayNames(suggestion);

            return (
              <li
                key={suggestion.id}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown (not click) so the choice is registered before the input loses focus and closes the list.
                onMouseDown={(event) => {
                  event.preventDefault();
                  onPickSuggestion(suggestion.id);
                }}
                className={`min-h-11 cursor-pointer px-4 py-2.5 ${index === activeIndex ? 'bg-mist' : 'hover:bg-canvas'}`}
              >
                <p className="break-words font-medium text-ink" dir="auto">
                  {names.primary}
                </p>
                {names.secondary.length > 0 && (
                  <p className="break-words text-sm text-muted" dir="auto">
                    {names.secondary.join(' · ')}
                  </p>
                )}
                <p className="break-words text-sm text-muted" dir="auto">
                  {suggestion.city || suggestion.address}
                </p>
                <p className="text-sm text-ink">{describeKashrutShort(suggestion.kashrut, hechsherOptions)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}

export default SearchBar;
