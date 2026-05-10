"use client";

import { useCombobox } from "downshift";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { CountryMap } from "./CountryMap";
import { countries as ALL_COUNTRIES, getCountry } from "./countries";
import type { Country, CountryCode, CountryMapSelectProps } from "./types";

function defaultLabel(country: Country): string {
  return country.name;
}

function filterCountries(items: readonly Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.includes(q),
  );
}

function resolveItems(
  whitelist?: readonly CountryCode[],
  blacklist?: readonly CountryCode[],
): Country[] {
  let items: readonly Country[] = ALL_COUNTRIES;
  if (whitelist && whitelist.length > 0) {
    const allow = new Set(whitelist);
    items = ALL_COUNTRIES.filter((c) => allow.has(c.code));
  }
  if (blacklist && blacklist.length > 0) {
    const deny = new Set(blacklist);
    items = items.filter((c) => !deny.has(c.code));
  }
  return [...items];
}

// Compose multiple React refs into one callback ref.
function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/**
 * Accessible combobox for picking a country from its map.
 *
 * Renders an input that doubles as a typeahead filter, a button that
 * toggles the menu, and a listbox of options each showing the country's
 * map shape next to its name.
 *
 * Keyboard: ArrowUp/ArrowDown moves highlight, Home/End jump to ends,
 * Enter selects, Esc closes, typing filters.
 */
export const CountryMapSelect = forwardRef<
  HTMLInputElement,
  CountryMapSelectProps
>(function CountryMapSelect(props, forwardedRef) {
  const {
    value,
    defaultValue = null,
    onChange,
    countries: countriesProp,
    exclude,
    searchable = true,
    placeholder = "Select a country",
    getOptionLabel = defaultLabel,
    renderOption,
    mapSize = 20,
    disabled = false,
    id,
    ariaLabel,
    className,
    style,
    menuMaxHeight = 320,
    name,
    required = false,
    autoFocus = false,
  } = props;

  const items = useMemo(
    () => resolveItems(countriesProp, exclude),
    [countriesProp, exclude],
  );

  const [internalSelected, setInternalSelected] = useState<Country | null>(
    () => (defaultValue ? (getCountry(defaultValue) ?? null) : null),
  );
  const isControlled = value !== undefined;
  const selectedItem: Country | null = isControlled
    ? value
      ? (getCountry(value) ?? null)
      : null
    : internalSelected;

  const [inputValue, setInputValue] = useState("");
  const filteredItems = useMemo(
    () => (searchable ? filterCountries(items, inputValue) : items),
    [items, inputValue, searchable],
  );

  const inputValueRef = useRef(inputValue);
  inputValueRef.current = inputValue;
  useEffect(() => {
    if (
      selectedItem &&
      inputValueRef.current !== getOptionLabel(selectedItem)
    ) {
      setInputValue(getOptionLabel(selectedItem));
    }
    if (!selectedItem && inputValueRef.current !== "") {
      setInputValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    openMenu,
  } = useCombobox<Country>({
    items: filteredItems,
    itemToString: (item) => (item ? getOptionLabel(item) : ""),
    selectedItem,
    inputValue,
    onInputValueChange: ({ inputValue: next, type }) => {
      if (
        type === useCombobox.stateChangeTypes.InputBlur ||
        type === useCombobox.stateChangeTypes.ItemClick ||
        type === useCombobox.stateChangeTypes.InputKeyDownEnter
      ) {
        return;
      }
      setInputValue(next ?? "");
    },
    onSelectedItemChange: ({ selectedItem: next }) => {
      if (!next) return;
      if (!isControlled) setInternalSelected(next);
      setInputValue(getOptionLabel(next));
      onChange?.(next.code, next);
    },
  });

  const inputProps = getInputProps({
    placeholder,
    disabled,
    readOnly: !searchable,
    "aria-label": ariaLabel,
    "aria-required": required || undefined,
    id,
    required,
    autoFocus,
    onFocus: () => {
      if (!disabled && !isOpen) openMenu();
    },
  });

  const composedInputRef = composeRefs<HTMLInputElement>(
    (inputProps as { ref?: Ref<HTMLInputElement> }).ref,
    forwardedRef,
  );

  const wrapperClass = ["rcms-root", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass} style={style}>
      <div className="rcms-trigger" data-disabled={disabled || undefined}>
        {selectedItem ? (
          <CountryMap
            code={selectedItem.code}
            size={mapSize}
            aria-hidden
            className="rcms-trigger-map"
          />
        ) : (
          <span
            className="rcms-trigger-map rcms-trigger-map--empty"
            aria-hidden
            style={{ width: mapSize, height: mapSize }}
          />
        )}
        <input {...inputProps} ref={composedInputRef} className="rcms-input" />
        {name && (
          <input
            type="hidden"
            name={name}
            value={selectedItem?.code ?? ""}
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        <button
          type="button"
          className="rcms-toggle"
          aria-label={isOpen ? "Close country list" : "Open country list"}
          {...getToggleButtonProps({ disabled })}
        >
          <span className="rcms-toggle-caret" aria-hidden>
            ▾
          </span>
        </button>
      </div>

      <ul
        {...getMenuProps()}
        className="rcms-menu"
        style={{ maxHeight: menuMaxHeight }}
        data-open={isOpen || undefined}
      >
        {isOpen &&
          filteredItems.map((item, index) => {
            const highlighted = highlightedIndex === index;
            const selected = selectedItem?.code === item.code;
            const itemProps = getItemProps({ item, index });
            const optionClass = [
              "rcms-option",
              highlighted && "rcms-option--highlighted",
              selected && "rcms-option--selected",
            ]
              .filter(Boolean)
              .join(" ");

            if (renderOption) {
              return (
                <li {...itemProps} key={item.code} className={optionClass}>
                  {renderOption(item, { highlighted, selected })}
                </li>
              );
            }
            return (
              <li {...itemProps} key={item.code} className={optionClass}>
                <CountryMap
                  code={item.code}
                  size={mapSize}
                  aria-hidden
                  className="rcms-option-map"
                />
                <span className="rcms-option-label">
                  {getOptionLabel(item)}
                </span>
              </li>
            );
          })}
        {isOpen && filteredItems.length === 0 && (
          <li className="rcms-empty" role="presentation">
            No matches
          </li>
        )}
      </ul>
    </div>
  );
});
