import { useQuery } from '@tanstack/react-query';

import { portfolioService } from '@/src/services/portfolioService';
import { queryKeys } from '@/src/services/queryKeys';

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.portfolio.summary(),
    queryFn: ({ signal }) => portfolioService.getPortfolioSummary(signal),
  });
}
