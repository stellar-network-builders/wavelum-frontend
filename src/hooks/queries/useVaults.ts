import { useQuery } from '@tanstack/react-query';
import { apiFetch, toQueryString } from '@/src/services/apiClient';
import { queryKeys } from '@/src/services/queryKeys';
import type {
  PaginatedResponse,
  PaginationParams,
  Vault,
} from '@/src/types/domain';

export function useVaults(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.vaults.list(params),
    queryFn: () =>
      apiFetch<PaginatedResponse<Vault>>(
        `/vaults${toQueryString({
          page: params.page,
          pageSize: params.pageSize,
        })}`,
      ),
  });
}
