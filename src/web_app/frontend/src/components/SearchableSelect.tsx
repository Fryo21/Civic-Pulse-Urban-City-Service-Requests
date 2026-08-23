import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** A searchable dropdown: typing filters the option list by prefix match
 * (e.g. typing "D" narrows a month list down to "December"). */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Type to search...",
}: SearchableSelectProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const search = draft.trim().toLowerCase();

    if (!search) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().startsWith(search)
    );
  }, [options, draft]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setDraft("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openDropdown() {
    setIsOpen(true);
    setDraft("");
    setHighlightedIndex(0);
  }

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value);
    setIsOpen(false);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        openDropdown();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) =>
        Math.min(index + 1, filteredOptions.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];

      if (option) {
        selectOption(option);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setDraft("");
    }
  }

  return (
    <div
      className="searchable-select"
      ref={containerRef}
    >
      <input
        type="text"
        value={isOpen ? draft : selectedLabel}
        placeholder={placeholder}
        onFocus={openDropdown}
        onChange={(event) => {
          setDraft(event.target.value);
          setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (
        <ul className="searchable-select-options">
          {filteredOptions.length === 0 && (
            <li className="searchable-select-empty">No matches</li>
          )}

          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              className={index === highlightedIndex ? "is-highlighted" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                selectOption(option);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
