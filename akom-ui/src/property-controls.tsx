import { useState, type ReactNode } from 'react';
import { CalendarDays, Check, ChevronDown, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from './components/ui/command';

export function PopSelect<T extends string>({ value, options, onChange, display, label, optionText }: {
  value: T; label?: string; options: readonly T[]; onChange: (value: T) => void;
  display?: (value: T) => ReactNode; optionText?: (value: T) => string;
}) {
  const [open, setOpen] = useState(false);
  return <div className="popover-root"><Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><Button className="property-value" role="combobox" aria-label={label} aria-expanded={open}>
      {display ? display(value) : value}<ChevronDown size={12} className="muted"/>
    </Button></PopoverTrigger>
    <PopoverContent className="property-picker" align="start" onEscapeKeyDown={event => event.stopPropagation()}>
      <Command><CommandInput aria-label={`Search ${label || 'options'}`} placeholder="Search…"/>
        <CommandList><CommandEmpty>No options found.</CommandEmpty>
          {options.map(option => <CommandItem key={option} value={option || '__none__'} keywords={[optionText?.(option) || option]} onSelect={() => { onChange(option); setOpen(false); }}>
            {display ? display(option) : option}{option === value && <Check size={14} className="accent ml-auto"/>}
          </CommandItem>)}
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover></div>;
}

export function DateProperty({ value, onChange, label, disabled = false }: {
  value: string; onChange: (value: string) => void; label: string; disabled?: boolean;
}) {
  const date = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Set date';
  if (disabled) return <div className="property-static" aria-label={label}><CalendarDays size={15}/>{value ? date : 'No due date'}<span className="issue-property-locked">Owner-managed</span></div>;
  return <Popover><PopoverTrigger asChild><Button className="property-value date-trigger" aria-label={label}><CalendarDays size={15}/><span>{date}</span></Button></PopoverTrigger>
    <PopoverContent className="date-picker-panel" align="start" onEscapeKeyDown={event => event.stopPropagation()}>
      <Input type="date" aria-label={`Choose ${label.toLowerCase()}`} value={value} onInput={event => onChange(event.currentTarget.value)}/>
      <Button className="text-link" onClick={() => onChange('')}>Clear date</Button>
    </PopoverContent>
  </Popover>;
}

export function LabelPicker({ value, options, onChange, readOnly }: {
  value: string[]; options: string[]; onChange: (value: string[]) => void; readOnly: boolean;
}) {
  const [query, setQuery] = useState('');
  const choices = [...new Set([...options, ...value])].sort();
  const tags = <span className="property-tags">{value.map(label => <span key={label} className="detail-tag">{label}</span>)}{!value.length && <span className="muted">Add label</span>}</span>;
  return <div className="issue-labels property-block"><span className="property-heading">Labels</span>{readOnly ? tags :
    <Popover><PopoverTrigger asChild><Button className="label-trigger" aria-label="Edit labels">{tags}<Plus size={13}/></Button></PopoverTrigger>
      <PopoverContent className="label-picker-panel" align="start" onEscapeKeyDown={event => event.stopPropagation()}>
        <Input className="picker-search" aria-label="Search or create label" placeholder="Search or create label…" value={query} onChange={event => setQuery(event.target.value)}/>
        {choices.filter(label => label.toLowerCase().includes(query.toLowerCase())).map(label => <label key={label}><Checkbox aria-label={label} checked={value.includes(label)} onCheckedChange={checked => onChange(checked === true ? [...value, label] : value.filter(item => item !== label))}/>{label}</label>)}
        {query.trim() && !choices.some(label => label.toLowerCase() === query.trim().toLowerCase()) && <Button className="text-link" onClick={() => { onChange([...value, query.trim()]); setQuery(''); }}><Plus size={13}/> Create “{query.trim()}”</Button>}
      </PopoverContent>
    </Popover>}
  </div>;
}
