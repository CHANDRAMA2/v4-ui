import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import React from 'react'
import Link from 'next/link'

import { ClipBoardWithCheckMark } from 'lib/components/Images/ClipBoardWithCheckMark'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
  closeModal: () => void
  hideCloseButton?: boolean
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className, closeModal, hideCloseButton } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.hash, chainId)

  return (
    <div className={classNames('flex flex-col', className)}>
      <SquareLink
        target='_blank'
        href={url}
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.md}
        className='w-full'
      >
        {t('viewReceipt', 'View receipt')}
      </SquareLink>
      {!hideCloseButton && (
        <SquareButton
          onClick={() => closeModal()}
          theme={SquareButtonTheme.purpleOutline}
          size={SquareButtonSize.sm}
          className='w-full mt-4'
        >
          {t('close', 'Close')}
        </SquareButton>
      )}
    </div>
  )
}

ModalTransactionSubmitted.defaultProps = {
  hideCloseButton: false
}
