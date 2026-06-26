import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/services/queryKeys';
import { vestingService } from '@/src/services/vestingService';

export function useVestings(vaultId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.vestings.list(vaultId ?? ''),
    queryFn: ({ signal }) => vestingService.getSubSchedules(vaultId as string, signal),
    enabled: Boolean(vaultId),
  });
}
