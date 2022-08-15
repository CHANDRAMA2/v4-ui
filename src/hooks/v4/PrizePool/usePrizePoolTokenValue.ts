import { PrizePool } from '@pooltogether/v4-client-js'
import { TokenPrice, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { UseQueryResult } from 'react-query'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

export const usePrizePoolTokenValue = (
  prizePool: PrizePool
): UseQueryResult<TokenPrice, unknown> => {
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const chainId = prizePool?.chainId
  const response = useCoingeckoTokenPrices(chainId, [tokens?.token.address])
  return { ...response, data: response.data?.[tokens?.token.address] } as UseQueryResult<
    TokenPrice,
    unknown
  >
}
