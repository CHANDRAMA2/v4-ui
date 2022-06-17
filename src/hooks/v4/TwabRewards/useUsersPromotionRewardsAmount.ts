import { batch } from '@pooltogether/etherplex'
import { useQuery } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

import { NO_REFETCH } from '@constants/query'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/TwabRewards/getTwabRewardsContract'

/**
 * Fetch a promotion's data (eg. currentEpochId, etc)
 * @returns
 */
export const useUsersPromotionRewardsAmount = (
  chainId: number,
  promotionId: number,
  maxCompletedEpochId: number,
  usersAddress: string
) => {
  return useQuery(
    getUsersChainPromotionKey(chainId, promotionId, maxCompletedEpochId, usersAddress),
    async () =>
      getUsersPromotionRewardsAmount(chainId, promotionId, maxCompletedEpochId, usersAddress),
    {
      ...NO_REFETCH,
      enabled: Boolean(maxCompletedEpochId)
    }
  )
}

const getUsersChainPromotionKey = (
  chainId: number,
  promotionId: number,
  currentEpochId: number,
  usersAddress: string
) => ['getUsersChainPromotionRewardsAmount', chainId, promotionId, currentEpochId, usersAddress]

export const getUsersPromotionRewardsAmount = async (
  chainId: number,
  promotionId: number,
  maxCompletedEpochId: number,
  usersAddress: string
) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const twabRewardsContract = getTwabRewardsEtherplexContract(chainId)
  const twabRewardsContractAddress = getTwabRewardsContractAddress(chainId)

  const epochIds = [...Array(maxCompletedEpochId).keys()]

  const twabRewardsResults = await batch(
    provider,
    twabRewardsContract.getRewardsAmount(usersAddress, promotionId, epochIds)
  )

  const rewardsAmount =
    twabRewardsResults[twabRewardsContractAddress].getRewardsAmount[0].toString()

  return { rewardsAmount }
}
