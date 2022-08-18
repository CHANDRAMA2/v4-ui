import { BigNumber } from 'ethers'
import { EstimateAction } from '../../../constants/odds'
import { useAllUsersPrizePoolTwabs } from './useUsersPrizePoolTwab'
import { useMemo } from 'react'
import { Amount } from '@pooltogether/hooks'
import { useAllPrizePoolOdds } from './useAllPrizePoolOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useAllUsersPrizePoolOdds = (
  usersAddress: string,
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const allUsersPrizePoolTwabsQueryResults = useAllUsersPrizePoolTwabs(usersAddress)

  const twabs = useMemo(() => {
    const isPrizePoolTwabsFetched = allUsersPrizePoolTwabsQueryResults.every(
      ({ isFetched }) => isFetched
    )
    if (!isPrizePoolTwabsFetched) {
      return null
    }
    return allUsersPrizePoolTwabsQueryResults.reduce((acc, qr) => {
      const data = qr.data
      acc[data?.prizePoolId] = data?.twab
      return acc
    }, {} as { [prizePoolId: string]: Amount })
  }, [allUsersPrizePoolTwabsQueryResults])

  return useAllPrizePoolOdds(twabs, actions)
}
