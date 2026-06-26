import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/services/queryKeys';
import { vestingService } from '@/src/services/vestingService';
import type { PaginationParams } from '@/src/types/domain';

export function useVaults(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.vaults.list(params),
    queryFn: ({ signal }) => vestingService.getVaults(params, signal),
  });
}
