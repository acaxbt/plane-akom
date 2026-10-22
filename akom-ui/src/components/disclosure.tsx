import { useState, type ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
export function Disclosure({ summary, children, className, defaultOpen = false }: { summary: ReactNode; children: ReactNode; className?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <Collapsible className={className} open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger className="disclosure-trigger">{summary}</CollapsibleTrigger>
    <CollapsibleContent>{children}</CollapsibleContent>
  </Collapsible>;
}
