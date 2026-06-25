import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/src/services/apiClient';
import { queryKeys } from '@/src/services/queryKeys';
import type { Claim } from '@/src/types/domain';

export function useClaims(subScheduleId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.claims.list(subScheduleId ?? ''),
    queryFn: () => apiFetch<Claim[]>(`/vestings/${subScheduleId}/claims`),
    enabled: Boolean(subScheduleId),
  });
}
