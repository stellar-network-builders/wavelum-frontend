export { Button } from './Button';
export { Card } from './Card';
export { Badge } from './Badge';
export { Input } from './Input';
export { Modal } from './Modal';
export { Select } from './Select';
export { ToastProvider, useToast } from './Toast';
export { Tabs } from './Tabs';
export { Table } from './Table';
export { LocaleSwitcher } from './LocaleSwitcher';
export { SkipLink } from './SkipLink';
export { AriaLiveRegion } from './AriaLiveRegion';
export { VisuallyHidden } from './VisuallyHidden';
export { WebVitals } from './WebVitals';
export { AxeCore } from './AxeCore';

// Re-export variant types and styles for consumers
export {
  buttonVariants,
  cardVariants,
  badgeVariants,
  inputBaseClasses,
  inputErrorClasses,
} from './styles';
export type { ButtonVariantProps, CardVariantProps, BadgeVariantProps } from './styles';
