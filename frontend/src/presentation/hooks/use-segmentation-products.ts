'use client'

import { listSegmentationProductsUseCase } from '@lib/composition'
import { queryKeys } from '@/src/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export function useSegmentationProducts() {
  return useQuery({
    queryKey: queryKeys.segmentationProducts.all,
    queryFn: listSegmentationProductsUseCase,
  })
}
