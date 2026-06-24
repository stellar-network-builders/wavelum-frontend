import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/src/services/apiClient';
import { queryKeys } from '@/src/services/queryKeys';
import type { VestingSchedule } from '@/src/types/domain';

export function useVestings(vaultId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vestings.list(vaultId ?? ''),
    queryFn: () => apiFetch<VestingSchedule[]>(`/vaults/${vaultId}/vestings`),
    enabled: Boolean(vaultId),
  });
}
