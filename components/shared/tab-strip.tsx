'use client';

import { useRef, type KeyboardEvent } from 'react';

type TabStripProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>;
  activeId: T;
  onSelect: (id: T) => void;
  ariaLabel: string;
  idPrefix: string;
};

export function TabStrip<T extends string>({ tabs, activeId, onSelect, ariaLabel, idPrefix }: TabStripProps<T>) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onSelect(tabs[nextIndex].id);
  }

  return (
    <div className="tab-strip" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          tabIndex={activeId === tab.id ? 0 : -1}
          id={`${idPrefix}-tab-${tab.id}`}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
