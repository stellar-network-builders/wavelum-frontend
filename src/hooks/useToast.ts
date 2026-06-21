'use client';

/**
 * Hook to trigger toast notifications programmatically.
 *
 * Re-exported from the <ToastProvider> context.
 * Must be used inside a <ToastProvider>.
 *
 * @example
 * const { toast } = useToast();
 * toast({ title: 'Claim submitted', variant: 'success' });
 */
export { useToast } from '@/src/components/ui/Toast';
