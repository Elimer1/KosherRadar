// NEW (Milestone 4): the main search box (restaurant name or food only, spec section 8) with autocomplete.
// Suggestions start at 2 characters, wait 300 ms after the last keystroke, and old requests are cancelled.
// Clicking a suggestion opens that restaurant; Enter or the Search button without a choice runs the search.
// חדש (אבן דרך 4): תיבת החיפוש הראשית (שם מסעדה או אוכל בלבד) עם השלמה אוטומטית. הצעות מ-2 תווים, אחרי 300
// מילישניות, ובקשות ישנות מבוטלות. לחיצה על הצעה פותחת את המסעדה; Enter בלי בחירה מריץ חיפוש.
import axios from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { getRestaurantSuggestions } from '../api/searchApi';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { RestaurantSuggestion, SearchFilters } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { describeKashrutShort } from '../utils/kashrutText';
import { inputClassName } from './formStyles';

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
    <form onSubmit={handleSubmit} role="search" className="relative" aria-label="Search restaurants">
      <label htmlFor="restaurant-search" className="sr-only">
        Search by restaurant name or food
      </label>
      <div className="flex gap-2">
        <input
          id="restaurant-search"
          type="search"
          value={text}
          maxLength={100}
          autoComplete="off"
          placeholder="Restaurant name or food, for example pizza"
          className={`${inputClassName} mt-0`}
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
          className="rounded bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
        >
          Search
        </button>
      </div>

      {showList && (
        <ul
          id={LIST_ID}
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-1 max-h-96 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
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
              className={`cursor-pointer border-b border-gray-100 px-3 py-2 last:border-b-0 ${
                index === activeIndex ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-900">{suggestion.name}</p>
              <p className="text-sm text-gray-600">{suggestion.city || suggestion.address}</p>
              <p className="text-sm text-gray-700">{describeKashrutShort(suggestion.kashrut, hechsherOptions)}</p>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default SearchBar;
