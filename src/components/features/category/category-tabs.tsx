import type { CategoryTab } from './category-data';

type CategoryTabsProps = {
  tabs: CategoryTab[];
};

export function CategoryTabs({ tabs }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={[
            'whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            tab.active
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-[#dfe4eb] bg-white text-[#34435a] hover:border-primary/30 hover:text-primary hover:shadow-md'
          ].join(' ')}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
