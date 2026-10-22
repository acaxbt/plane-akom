import { createContext, useContext, useState, type ReactNode } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

type Confirm = (message: string) => Promise<boolean>;
const ConfirmationContext = createContext<Confirm | null>(null);
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{ message: string; resolve: (answer: boolean) => void } | null>(null);
  const finish = (answer: boolean) => { request?.resolve(answer); setRequest(null); };
  return <ConfirmationContext.Provider value={message => new Promise(resolve => setRequest({ message, resolve }))}>
    {children}
    <AlertDialog open={!!request} onOpenChange={open => { if (!open) finish(false); }}>
      <AlertDialogContent onEscapeKeyDown={event => event.stopPropagation()}>
        <AlertDialogHeader><AlertDialogTitle>Confirm changes</AlertDialogTitle><AlertDialogDescription>{request?.message}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel onClick={() => finish(false)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => finish(true)}>Continue</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </ConfirmationContext.Provider>;
}
export function useConfirm() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error('ConfirmationProvider is required');
  return confirm;
}
