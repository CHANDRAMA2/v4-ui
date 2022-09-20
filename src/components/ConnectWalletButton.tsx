import { SquareButton } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ConnectWalletButtonProps {
  className?: string
}

export const ConnectWalletButton = (props: ConnectWalletButtonProps) => {
  const { className } = props
  const connectWallet = useConnectWallet()
  const { t } = useTranslation()
  return (
    <SquareButton className={className} onClick={() => connectWallet()} type='button'>
      {t('connectWallet')}
    </SquareButton>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full'
}
