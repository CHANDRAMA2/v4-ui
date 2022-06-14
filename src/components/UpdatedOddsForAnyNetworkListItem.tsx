import { Amount } from '@pooltogether/hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from '@hooks/v4/Odds/useEstimatedOddsForAmount'
import { InfoListItem } from './InfoList'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from '@hooks/v4/Odds/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { useUsersAddress } from '@pooltogether/wallet-connection'

export const UpdatedOddsForAnyNetworkListItem = (props: {
  amount: Amount
  action: EstimateAction
}) => {
  const { amount, action } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const oddsData = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(
    usersAddress,
    action,
    amount?.amountUnformatted
  )

  const isFetched = !!oddsData

  let value
  if (isFetched) {
    if (oddsData?.odds === 0) {
      value = <span className='opacity-80'>{t('none')}</span>
    } else {
      value = t('oneInOdds', { odds: oddsData.oneOverOdds.toFixed(2) })
    }
  }

  return (
    <InfoListItem
      label={t('updatedWinningOdds', 'Updated winning odds')}
      labelToolTip={t('oddsToWinOnePrize', 'Your estimated odds of winning at least one prize')}
      loading={!isFetched}
      value={value}
    />
  )
}
