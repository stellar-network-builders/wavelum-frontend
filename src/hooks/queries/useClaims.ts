import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/services/queryKeys';
import { vestingService } from '@/src/services/vestingService';

export function useClaims(subScheduleId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.claims.list(subScheduleId ?? ''),
    queryFn: ({ signal }) => vestingService.getClaims(subScheduleId as string, signal),
    enabled: Boolean(subScheduleId),
  });
}
