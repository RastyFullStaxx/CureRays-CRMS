'use client';

type TabStripProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>;
  activeId: T;
  onSelect: (id: T) => void;
  ariaLabel: string;
  idPrefix: string;
};

export function TabStrip<T extends string>({ tabs, activeId, onSelect, ariaLabel, idPrefix }: TabStripProps<T>) {
  return (
    <div className="tab-strip" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          id={`${idPrefix}-tab-${tab.id}`}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
