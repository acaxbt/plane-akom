import { useRef, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

export function dialogReturnTarget(active: Element | null = document.activeElement): HTMLElement | null {
  const layer = active?.closest('[data-slot="popover-content"],[data-slot="dropdown-menu-content"]');
  const trigger = layer?.id ? document.querySelector<HTMLElement>(`[aria-controls="${layer.id}"]`) : null;
  return trigger || (active instanceof HTMLElement ? active : null);
}

export function AppDialog({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const previousFocus = useRef(dialogReturnTarget());
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="akom-dialog-shell" showCloseButton={false} aria-describedby={undefined}
      onEscapeKeyDown={event => event.stopPropagation()}
      onCloseAutoFocus={event => { event.preventDefault(); previousFocus.current?.focus(); }}>
      <DialogTitle className="sr-only">{label}</DialogTitle>
      {children}
    </DialogContent>
  </Dialog>;
}
