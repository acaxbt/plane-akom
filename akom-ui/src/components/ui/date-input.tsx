import type { ComponentProps } from 'react';
import { Input } from './input';

export function DateInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  return <Input {...props} type="date" data-slot="date-input"/>;
}
