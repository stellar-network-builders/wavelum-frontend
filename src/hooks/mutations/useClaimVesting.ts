import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/src/services/queryKeys';
import { vestingService } from '@/src/services/vestingService';
import type {
  Claim,
  ClaimVestingInput,
  VestingSchedule,
} from '@/src/types/domain';

type ClaimMutationContext = {
  previousVestings?: VestingSchedule[];
  previousClaims?: Claim[];
};

export function useClaimVesting() {
  const queryClient = useQueryClient();

  return useMutation<Claim, Error, ClaimVestingInput, ClaimMutationContext>({
    mutationFn: ({ subScheduleId, amount }) =>
      vestingService.claimVesting(subScheduleId, amount),
    onMutate: async ({ vaultId, subScheduleId, amount }) => {
      const vestingsKey = queryKeys.vestings.list(vaultId);
      const claimsKey = queryKeys.claims.list(subScheduleId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: vestingsKey }),
        queryClient.cancelQueries({ queryKey: claimsKey }),
      ]);

      const previousVestings =
        queryClient.getQueryData<VestingSchedule[]>(vestingsKey);
      const previousClaims = queryClient.getQueryData<Claim[]>(claimsKey);
      const optimisticClaim = createOptimisticClaim(subScheduleId, amount);

      queryClient.setQueryData<VestingSchedule[]>(vestingsKey, (current) =>
        current?.map((schedule) =>
          schedule.id === subScheduleId
            ? {
                ...schedule,
                claimableAmount: subtractDecimalStrings(
                  schedule.claimableAmount,
                  amount,
                ),
                claimedAmount: addDecimalStrings(
                  schedule.claimedAmount,
                  amount,
                ),
              }
            : schedule,
        ),
      );
      queryClient.setQueryData<Claim[]>(claimsKey, (current = []) => [
        optimisticClaim,
        ...current,
      ]);

      return { previousVestings, previousClaims };
    },
    onError: (_error, variables, context) => {
      if (context?.previousVestings) {
        queryClient.setQueryData(
          queryKeys.vestings.list(variables.vaultId),
          context.previousVestings,
        );
      }

      if (context?.previousClaims) {
        queryClient.setQueryData(
          queryKeys.claims.list(variables.subScheduleId),
          context.previousClaims,
        );
      }
    },
    onSettled: (_data, _error, { vaultId, subScheduleId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vestings.list(vaultId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.claims.list(subScheduleId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
    },
  });
}

function createOptimisticClaim(subScheduleId: string, amount: string): Claim {
  return {
    id: `optimistic-${subScheduleId}-${Date.now()}`,
    subScheduleId,
    amount,
    claimedAt: new Date().toISOString(),
    status: 'pending',
  };
}

function addDecimalStrings(left: string, right: string) {
  const scale = Math.max(decimalPlaces(left), decimalPlaces(right));
  const total = toScaledBigInt(left, scale) + toScaledBigInt(right, scale);

  return fromScaledBigInt(total, scale);
}

function subtractDecimalStrings(left: string, right: string) {
  const scale = Math.max(decimalPlaces(left), decimalPlaces(right));
  const total = toScaledBigInt(left, scale) - toScaledBigInt(right, scale);
  const zero = BigInt(0);

  return fromScaledBigInt(total > zero ? total : zero, scale);
}

function decimalPlaces(value: string) {
  return value.split('.')[1]?.length ?? 0;
}

function toScaledBigInt(value: string, scale: number) {
  const [integerPart, fractionalPart = ''] = value.split('.');
  const normalizedFraction = fractionalPart.padEnd(scale, '0').slice(0, scale);
  const normalized = `${integerPart}${normalizedFraction}`.replace(
    /^(-?)0+(?=\d)/,
    '$1',
  );

  return BigInt(normalized || '0');
}

function fromScaledBigInt(value: bigint, scale: number) {
  if (scale === 0) {
    return value.toString();
  }

  const zero = BigInt(0);
  const sign = value < zero ? '-' : '';
  const digits = (value < zero ? -value : value)
    .toString()
    .padStart(scale + 1, '0');
  const integerPart = digits.slice(0, -scale);
  const fractionalPart = digits.slice(-scale).replace(/0+$/, '');

  return `${sign}${integerPart}${fractionalPart ? `.${fractionalPart}` : ''}`;
}
