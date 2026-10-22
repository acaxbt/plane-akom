import { useState, type ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from './ui/command';

export type FilterGroup = { id: string; label: string; options: { value: string; label: string; icon?: ReactNode }[] };

export function FilterMenu({ groups, value, onChange, children, initialGroup }: {
  groups: FilterGroup[]; value: Record<string, string[]>; onChange: (value: Record<string, string[]>) => void;
  children: ReactNode; initialGroup?: string;
}) {
  const [groupId, setGroupId] = useState(initialGroup);
  const group = groups.find(item => item.id === groupId);
  const count = Object.values(value).reduce((sum, items) => sum + items.length, 0);
  return <Popover onOpenChange={open => { if (open) setGroupId(initialGroup); }}>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="filter-menu" align="start" onEscapeKeyDown={event => event.stopPropagation()}>
      {group && !initialGroup && <Button className="filter-menu-back" onClick={() => setGroupId(undefined)}><ChevronLeft size={14}/>Filters · {group.label}</Button>}
      <Command key={group?.id || 'properties'}>
        <CommandInput autoFocus aria-label={group ? `Search ${group.label.toLowerCase()} filters` : 'Search filter properties'} placeholder={group ? `Search ${group.label.toLowerCase()}…` : 'Add filter…'}/>
        <CommandList><CommandEmpty>No matching filters</CommandEmpty>
          {group ? group.options.map(option => {
            const selected = (value[group.id] || []).includes(option.value);
            return <CommandItem key={option.value} value={option.value} keywords={[option.label]} onSelect={() => onChange({ ...value, [group.id]: selected ? value[group.id].filter(item => item !== option.value) : [...(value[group.id] || []), option.value] })}>
              <span className="filter-option-check" aria-hidden="true">{selected && <Check size={12}/>}</span>{option.icon}<span>{option.label}</span>
              <span className="sr-only">{selected ? 'Selected' : 'Not selected'}</span>
            </CommandItem>;
          }) : groups.map(item => <CommandItem key={item.id} value={item.id} keywords={[item.label]} onSelect={() => setGroupId(item.id)}>{item.label}<span className="filter-menu-count">{value[item.id]?.length || ''}</span><ChevronRight size={13}/></CommandItem>)}
        </CommandList>
      </Command>
      {count > 0 && <Button className="filter-menu-clear" onClick={() => onChange(Object.fromEntries(groups.map(item => [item.id, []])))}>Clear {initialGroup ? group?.label.toLowerCase() : 'all filters'}</Button>}
    </PopoverContent>
  </Popover>;
}
