import { EstimateAction } from '@constants/odds'
import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { estimateOddsForAmount } from '@utils/estimateOddsForAmount'
import { BigNumber, ethers } from 'ethers'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { usePrizePoolOddsData } from './usePrizePoolOddsData'
import { useUsersPrizePoolTwab } from './useUsersPrizePoolTwab'


/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolOdds = (
  usersAddress: string,
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: twabData, isFetched: isTwabDataFetched } = useUsersPrizePoolTwab(
    usersAddress,
    prizePool
  )
  const { data: oddsData, isFetched: isOddsDataFetched } = usePrizePoolOddsData(prizePool)

  const enabled = !!isOddsDataFetched && !!isTwabDataFetched

  return useQuery(
    getUsersPrizePoolOddsKey(
      usersAddress,
      prizePool,
      twabData?.twab,
      oddsData?.totalSupply,
      oddsData?.numberOfPrizes,
      action,
      actionAmountUnformatted
    ),
    () =>
      getUsersPrizePoolOdds(
        usersAddress,
        prizePool,
        oddsData,
        twabData,
        action,
        actionAmountUnformatted
      ),
    { enabled }
  )
}

export const getUsersPrizePoolOddsKey = (
  usersAddress: string,
  prizePool: PrizePool,
  twab: Amount,
  totalSupply: Amount,
  numberOfPrizes: number,
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => [
  'useUsersPrizePoolOdds',
  usersAddress,
  prizePool?.id(),
  action,
  actionAmountUnformatted?.toString(),
  twab?.amount,
  totalSupply?.amount,
  numberOfPrizes
]

export const getUsersPrizePoolOdds = (
  usersAddress: string,
  prizePool: PrizePool,
  oddsData: {
    decimals: string
    totalSupply: Amount
    numberOfPrizes: number
  },
  twabData: {
    chainId: number
    twab: Amount
    usersAddress: string
  },
  action: EstimateAction = EstimateAction.none,
  actionAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { totalSupply, numberOfPrizes, decimals } = oddsData
  const { twab } = twabData
  const { odds, oneOverOdds } = estimateOddsForAmount(
    twab,
    totalSupply,
    numberOfPrizes,
    decimals,
    action,
    actionAmountUnformatted
  )

  return {
    prizePoolId: prizePool?.id(),
    usersAddress,
    odds,
    oneOverOdds
  }
}
