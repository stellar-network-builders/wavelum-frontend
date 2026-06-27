import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/src/services/queryKeys';
import { vestingService } from '@/src/services/vestingService';
import type { CreateVaultInput, Vault } from '@/src/types/domain';

type UseCreateVaultOptions = {
  onSuccess?: (vault: Vault) => void;
};

export function useCreateVault(options: UseCreateVaultOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVaultInput) => vestingService.createVault(input),
    onSuccess: (vault) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaults.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      options.onSuccess?.(vault);
    },
  });
}
