import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { TokenBalance, Transaction, Token, Amount, TokenWithBalance } from '@pooltogether/hooks'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { User, PrizePool } from '@pooltogether/v4-js-client'
import { FieldValues, UseFormReturn } from 'react-hook-form'

import { InfoList } from 'lib/components/InfoList'
import { TxReceiptItem } from 'lib/components/InfoList/TxReceiptItem'
import { useUsersDepositAllowance } from 'lib/hooks/v4/PrizePool/useUsersDepositAllowance'
import { TxButtonInFlight } from 'lib/components/Input/TxButtonInFlight'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from 'lib/components/InfoList/EstimatedGasItem'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { InfoListItem } from 'lib/components/InfoList'
import { DepositAmountInput } from 'lib/components/Input/DepositAmountInput'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { BigNumber } from '@ethersproject/bignumber'
import { EstimatedAPRItem } from 'lib/components/InfoList/EstimatedAPRItem'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  user: User
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isUsersBalancesFetched: boolean
  isUsersDepositAllowanceFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  openModal: () => void
}

export const DepositForm = (props: DepositFormProps) => {
  const { form, prizePool, depositTx, isUsersBalancesFetched, amountToDeposit, token, openModal } =
    props

  const { isWalletConnected } = useOnboard()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = form

  const router = useRouter()

  const setReviewDeposit = (values) => {
    const { query, pathname } = router
    const quantity = values[DEPOSIT_QUANTITY_KEY]
    query[DEPOSIT_QUANTITY_KEY] = quantity
    router.replace({ pathname, query }, null, { scroll: false })
    openModal()
  }

  return (
    <>
      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
        <div className='w-full mx-auto'>
          <DepositAmountInput
            prizePool={prizePool}
            className=''
            form={form}
            inputKey={DEPOSIT_QUANTITY_KEY}
          />
        </div>

        <DepositInfoBox
          chainId={prizePool.chainId}
          className='mt-3'
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          errors={isDirty ? errors : null}
          labelClassName='text-accent-1'
          valueClassName='text-inverse'
        />

        <DepositBottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          isUsersBalancesFetched={isUsersBalancesFetched}
          token={token}
          amountToDeposit={amountToDeposit}
        />
      </form>
    </>
  )
}

interface DepositBottomButtonProps {
  className?: string
  disabled: boolean
  isWalletConnected: boolean
  isUsersBalancesFetched: boolean
  token: TokenWithBalance
  depositTx: Transaction
  amountToDeposit: Amount
}

export const DepositBottomButton = (props: DepositBottomButtonProps) => {
  const { isWalletConnected } = props

  if (!isWalletConnected) {
    return <ConnectWalletButton {...props} />
  }

  return <DepositButton {...props} />
}

const DepositButton = (props: DepositBottomButtonProps) => {
  const { className, token, depositTx, disabled, isUsersBalancesFetched, amountToDeposit } = props
  const { t } = useTranslation()

  const { amountUnformatted } = amountToDeposit

  let label
  if (amountUnformatted?.isZero()) {
    label = t('enterAnAmountToDeposit')
  } else {
    label = t('reviewDeposit')
  }

  return (
    <TxButtonInFlight
      disabled={disabled}
      className={className}
      inFlight={depositTx?.inFlight}
      label={label}
      inFlightLabel={t('depositingAmountTicker', { ticker: token?.symbol })}
      type='submit'
    />
  )
}

interface DepositInfoBoxProps {
  className?: string
  bgClassName?: string
  depositTx: Transaction
  chainId: number
  amountToDeposit: Amount
  depositAllowance?: BigNumber
  labelClassName?: string
  valueClassName?: string
  errors?: { [x: string]: { message: string } }
}

export const DepositInfoBox = (props: DepositInfoBoxProps) => {
  const {
    chainId,
    bgClassName,
    className,
    depositAllowance,
    amountToDeposit,
    valueClassName,
    labelClassName,
    depositTx,
    errors
  } = props

  const { t } = useTranslation()

  const errorMessages = errors ? Object.values(errors) : null
  if (
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    !depositTx?.inFlight
  ) {
    const messages = errorMessages.map((error) => (
      <span key={error.message} className='text-red font-semibold'>
        {error.message}
      </span>
    ))

    return (
      <InfoList bgClassName='bg-pt-purple-lighter dark:bg-pt-purple-dark' className={className}>
        <InfoListItem
          label={t('issues', 'Issues')}
          value={<div>{messages}</div>}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  if (depositTx?.inFlight) {
    return (
      <InfoList bgClassName={bgClassName} className={className}>
        <TxReceiptItem
          depositTx={depositTx}
          chainId={chainId}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  return (
    <InfoList bgClassName={bgClassName} className={className}>
      <EstimatedAPRItem
        chainId={chainId}
        labelClassName={labelClassName}
        valueClassName={valueClassName}
      />
      {depositAllowance?.gt(0) ? (
        <EstimatedDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          chainId={chainId}
          amountUnformatted={amountToDeposit.amountUnformatted}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      )}
    </InfoList>
  )
}
