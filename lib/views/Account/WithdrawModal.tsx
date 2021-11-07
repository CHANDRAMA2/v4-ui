import React, { useCallback, useEffect } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import {
  Modal,
  LoadingDots,
  SquareButton,
  SquareButtonTheme,
  Tooltip,
  ErrorsBox,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { Amount, Token, TokenBalance, Transaction } from '@pooltogether/hooks'
import { calculateOdds, getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { parseUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { BigNumber, ethers } from 'ethers'
import { TextInputGroup } from 'lib/components/Input/TextInputGroup'
import { RectangularInput } from 'lib/components/Input/TextInputs'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { MaxAmountTextInputRightLabel } from 'lib/components/Input/MaxAmountTextInputRightLabel'
import { DownArrow as DefaultDownArrow } from 'lib/components/DownArrow'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { PrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { InfoList, InfoListItem } from 'lib/components/InfoList'
import { EstimatedWithdrawalGasItem } from 'lib/components/InfoList/EstimatedGasItem'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { WithdrawalSteps } from 'lib/views/Account/ManageBalancesList'

import { useOddsData } from 'lib/hooks/Tsunami/useOddsData'
import { useUsersCurrentPrizePoolTwab } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwab'
import { useNetworkTwab } from 'lib/hooks/Tsunami/PrizePool/useNetworkTwab'
import { UpdatedOdds } from 'lib/components/UpdatedOddsListItem'
import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'

const WITHDRAW_QUANTITY_KEY = 'withdrawal-quantity'

interface WithdrawModalProps {
  isOpen: boolean
  player: Player
  prizePool: PrizePool
  withdrawTx: Transaction
  currentStep: WithdrawalSteps
  prizePoolTokens: PrizePoolTokens
  isPrizePoolTokensFetched: boolean
  usersBalances: UsersPrizePoolBalances
  isUsersBalancesFetched: boolean
  amountToWithdraw: Amount
  form: UseFormReturn<FieldValues, object>
  sendWithdrawTx: (e: any) => Promise<void>
  closeModal: () => void
  setWithdrawTxId: (txId: number) => void
  setCurrentStep: (step: WithdrawalSteps) => void
  refetchUsersBalances: () => void
  setAmountToWithdraw: (amount: Amount) => void
}

export const WithdrawModal = (props: WithdrawModalProps) => {
  const {
    isOpen,
    player,
    prizePool,
    withdrawTx,
    currentStep,
    prizePoolTokens,
    isPrizePoolTokensFetched,
    amountToWithdraw,
    usersBalances,
    isUsersBalancesFetched,
    form,
    closeModal,
    refetchUsersBalances,
    sendWithdrawTx,
    setWithdrawTxId,
    setCurrentStep,
    setAmountToWithdraw
  } = props

  const { t } = useTranslation()

  const { reset } = form

  const closeModalAndMaybeReset = useCallback(() => {
    closeModal()
  }, [currentStep])

  useEffect(() => {
    reset()
  }, [isOpen])

  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  if (!isWalletOnProperNetwork) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
      </ModalWithStyles>
    )
  }

  if (currentStep === WithdrawalSteps.viewTxReceipt) {
    return (
      <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
        <ModalTitle
          chainId={prizePool.chainId}
          title={t('withdrawalSubmitted', 'Withdrawal submitted')}
        />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={prizePool.chainId}
          tx={withdrawTx}
          closeModal={closeModal}
        />
      </ModalWithStyles>
    )
  }

  return (
    <ModalWithStyles isOpen={isOpen} closeModal={closeModalAndMaybeReset}>
      <BackButton resetForm={reset} currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <ModalTitle chainId={prizePool.chainId} title={t('withdrawTokens', 'Withdraw tokens')} />
      <div className='w-full mx-auto mt-8'>
        <WithdrawStepContent
          form={form}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          player={player}
          prizePool={prizePool}
          usersBalances={usersBalances}
          prizePoolTokens={prizePoolTokens}
          isUsersBalancesFetched={isUsersBalancesFetched}
          isPrizePoolTokensFetched={isPrizePoolTokensFetched}
          refetchUsersBalances={refetchUsersBalances}
          amountToWithdraw={amountToWithdraw}
          setAmountToWithdraw={setAmountToWithdraw}
          withdrawTx={withdrawTx}
          setWithdrawTxId={setWithdrawTxId}
          sendWithdrawTx={sendWithdrawTx}
        />
      </div>
    </ModalWithStyles>
  )
}

const BackButton = (props) => {
  const { currentStep, setCurrentStep, resetForm } = props
  const { t } = useTranslation()

  if (currentStep === WithdrawalSteps.input || currentStep === WithdrawalSteps.viewTxReceipt)
    return null

  return (
    <button
      className='text-white hover:text-white absolute top-7 left-8 text-xs border-b opacity-30 hover:opacity-100 trans leading-tight'
      onClick={() => {
        const newStep = currentStep - 1
        if (newStep === WithdrawalSteps.input) {
          resetForm()
        }
        setCurrentStep(newStep)
      }}
    >
      <FeatherIcon
        icon={'arrow-left'}
        className='relative w-4 h-4 inline-block'
        style={{ top: -1 }}
      />{' '}
      {t('back')}
    </button>
  )
}

interface WithdrawStepContentProps {
  form: UseFormReturn<FieldValues, object>
  currentStep: WithdrawalSteps
  player: Player
  prizePool: PrizePool
  usersBalances: UsersPrizePoolBalances
  prizePoolTokens: PrizePoolTokens
  isUsersBalancesFetched: boolean
  isPrizePoolTokensFetched: boolean
  withdrawTx: Transaction
  amountToWithdraw: Amount
  sendWithdrawTx: (e: any) => Promise<void>
  setWithdrawTxId: (txId: number) => void
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
  refetchUsersBalances: () => void
}

const WithdrawStepContent = (props: WithdrawStepContentProps) => {
  const {
    form,
    player,
    prizePool,
    usersBalances,
    prizePoolTokens,
    isUsersBalancesFetched,
    currentStep,
    amountToWithdraw,
    withdrawTx,
    sendWithdrawTx,
    setWithdrawTxId,
    setCurrentStep,
    setAmountToWithdraw,
    refetchUsersBalances
  } = props

  const chainId = player.chainId

  if (!isUsersBalancesFetched) {
    return (
      <div className='h-full sm:h-28 flex flex-col justify-center'>
        <LoadingDots className='mx-auto' />
      </div>
    )
  }

  const { ticket: ticketBalance, token: tokenBalance } = usersBalances
  const { ticket, token } = prizePoolTokens

  if (currentStep === WithdrawalSteps.review) {
    return (
      <WithdrawReviewStep
        player={player}
        prizePool={prizePool}
        chainId={chainId}
        amountToWithdraw={amountToWithdraw}
        token={token}
        ticket={ticket}
        tokenBalance={tokenBalance}
        ticketBalance={ticketBalance}
        tx={withdrawTx}
        sendWithdrawTx={sendWithdrawTx}
        setCurrentStep={setCurrentStep}
        setTxId={setWithdrawTxId}
        refetchUsersBalances={refetchUsersBalances}
      />
    )
  }

  return (
    <WithdrawInputStep
      chainId={chainId}
      form={form}
      token={token}
      ticket={ticket}
      tokenBalance={tokenBalance}
      ticketBalance={ticketBalance}
      setCurrentStep={setCurrentStep}
      setAmountToWithdraw={setAmountToWithdraw}
    />
  )
}

interface WithdrawInputStepProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props: WithdrawInputStepProps) => {
  const {
    chainId,
    form,
    token,
    ticket,
    tokenBalance,
    ticketBalance,
    setCurrentStep,
    setAmountToWithdraw
  } = props

  const { t } = useTranslation()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const amount = watch(WITHDRAW_QUANTITY_KEY)

  const onSubmit = (data) => {
    const amount = data[WITHDRAW_QUANTITY_KEY]
    setAmountToWithdraw(getAmountFromString(amount, token.decimals))
    setCurrentStep(WithdrawalSteps.review)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WithdrawForm
        chainId={chainId}
        form={form}
        token={token}
        ticket={ticket}
        tokenBalance={tokenBalance}
        ticketBalance={ticketBalance}
      />

      <DownArrow />

      <SquaredTokenAmountContainer chainId={chainId} amount={amount} token={token} />

      <ErrorsBox errors={isDirty ? errors : null} className='opacity-75' />

      <WithdrawWarning className='mt-2' />

      <SquareButton disabled={!isValid && isDirty} type='submit' className='w-full mt-8'>
        {t('reviewWithdrawal')}
      </SquareButton>
    </form>
  )
}

interface WithdrawReviewStepProps {
  player: Player
  prizePool: PrizePool
  chainId: number
  amountToWithdraw: Amount
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  tx: Transaction
  sendWithdrawTx: (e: any) => Promise<void>
  setCurrentStep: (step: WithdrawalSteps) => void
  setTxId: (txId: number) => void
  refetchUsersBalances: () => void
}

/**
 * The second step in the withdrawal flow.
 * The user can review their amount & send the transaction to their wallet.
 * @param {*} props
 * @returns
 */
const WithdrawReviewStep = (props: WithdrawReviewStepProps) => {
  const { prizePool, chainId, amountToWithdraw, token, ticket, ticketBalance, tx, sendWithdrawTx } =
    props

  const { t } = useTranslation()

  const isTxInWallet = tx?.inWallet && !tx?.error && !tx.cancelled

  return (
    <>
      <WithdrawLabel symbol={ticket.symbol} />

      <SquaredTokenAmountContainer
        chainId={chainId}
        amount={amountToWithdraw.amount}
        token={ticket}
      />

      <DownArrow />

      <SquaredTokenAmountContainer
        className='mb-8'
        chainId={chainId}
        amount={amountToWithdraw.amount}
        token={token}
      />

      <div className='my-8'>
        <UpdatedStats
          prizePool={prizePool}
          amountToWithdraw={amountToWithdraw}
          token={token}
          ticket={ticket}
          ticketBalance={ticketBalance}
        />
      </div>

      <TxButtonNetworkGated
        chainId={prizePool.chainId}
        toolTipId='withdrawal-tx'
        className='w-full'
        theme={SquareButtonTheme.orangeOutline}
        onClick={sendWithdrawTx}
        disabled={isTxInWallet}
      >
        <span>{t('confirmWithdrawal')}</span>
      </TxButtonNetworkGated>
    </>
  )
}

const WithdrawLabel = (props) => {
  const { symbol } = props
  const { t } = useTranslation()
  return (
    <div className='font-inter font-semibold uppercase text-accent-3 opacity-60'>
      {t('withdrawTicker', { ticker: symbol })}
    </div>
  )
}

interface WithdrawFormProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  tokenBalance: TokenBalance
  ticketBalance: TokenBalance
  token: Token
  ticket: Token
  disabled?: boolean
}

const WithdrawForm = (props: WithdrawFormProps) => {
  const { disabled, chainId, form, token, ticket, ticketBalance } = props
  const { register, setValue } = form

  const { address: ticketAddress, symbol: ticketSymbol } = ticket
  const { amount, amountUnformatted, hasBalance } = ticketBalance

  const withdrawValidationRules = {
    isValid: (v) => {
      if (!v) return false
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      const decimals = token.decimals
      if (getMaxPrecision(v) > Number(decimals)) return false
      const valueUnformatted = parseUnits(v, decimals)
      if (valueUnformatted.isZero()) return false
      if (valueUnformatted.lt(ethers.constants.Zero)) return false
      if (valueUnformatted.gt(amountUnformatted)) return t('insufficientFunds')
      return true
    }
  }

  const { t } = useTranslation()

  return (
    <TextInputGroup
      unsignedNumber
      readOnly={disabled}
      Input={RectangularInput}
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={ticket} />}
      validate={withdrawValidationRules}
      containerBgClassName={'bg-transparent'}
      containerRoundedClassName={'rounded-lg'}
      bgClassName={'bg-body'}
      placeholder='0.0'
      id={WITHDRAW_QUANTITY_KEY}
      name={WITHDRAW_QUANTITY_KEY}
      autoComplete='off'
      register={register}
      required={t('ticketQuantityRequired')}
      label={<WithdrawLabel symbol={ticket.symbol} />}
      rightLabel={
        <MaxAmountTextInputRightLabel
          valueKey={WITHDRAW_QUANTITY_KEY}
          setValue={setValue}
          amount={amount}
          tokenSymbol={ticketSymbol}
          isAmountZero={!hasBalance}
        />
      }
    />
  )
}

WithdrawForm.defaultProps = {
  disabled: false
}

const SquaredTokenAmountContainer = (props) => {
  const { chainId, amount, token } = props

  return (
    <TextInputGroup
      readOnly
      disabled
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={token} />}
      Input={RectangularInput}
      roundedClassName={'rounded-lg'}
      containerRoundedClassName={'rounded-lg'}
      placeholder='0.0'
      id='result'
      name='result'
      register={() => {}}
      label={null}
      value={amount}
    />
  )
}

SquaredTokenAmountContainer.defaultProps = {
  borderClassName: 'border-body'
}

const WithdrawWarning = (props) => {
  const { t } = useTranslation()

  return (
    <div
      className={classnames(
        'w-full py-1 px-4 text-xxs text-center rounded-lg bg-orange-darkened text-orange',
        props.className
      )}
    >
      {t(
        'withdrawingWillReduceYourOddsToWin',
        'Withdrawing funds will decrease your chances to win prizes!'
      )}
    </div>
  )
}

const UpdatedStats = (props: {
  className?: string
  prizePool: PrizePool
  amountToWithdraw: Amount
  token: Token
  ticket: Token
  ticketBalance: TokenBalance
}) => {
  const { className, prizePool, amountToWithdraw, token, ticket, ticketBalance } = props

  return (
    <InfoList className={className}>
      <UpdatedOdds
        amount={amountToWithdraw}
        prizePool={prizePool}
        action={EstimateAction.withdraw}
      />
      <FinalTicketBalanceStat
        amount={amountToWithdraw?.amount}
        ticket={ticket}
        ticketBalance={ticketBalance}
      />
      <UnderlyingReceivedStat amount={amountToWithdraw?.amount} token={token} />
      <EstimatedWithdrawalGasItem
        prizePool={prizePool}
        amountUnformatted={amountToWithdraw?.amountUnformatted}
      />
    </InfoList>
  )
}

const FinalTicketBalanceStat = (props) => {
  const { amount, ticket, ticketBalance } = props
  const { t } = useTranslation()
  const amountUnformatted = ethers.utils.parseUnits(amount, ticket.decimals)
  const finalBalanceUnformatted = ticketBalance.amountUnformatted.sub(amountUnformatted)
  const finalBalance = ethers.utils.formatUnits(finalBalanceUnformatted, ticket.decimals)
  const finalBalancePretty = numberWithCommas(finalBalance)
  const fullFinalBalancePretty = numberWithCommas(finalBalance, {
    precision: getMaxPrecision(finalBalance)
  })

  return (
    <InfoListItem
      label={t('finalDepositBalance', 'Remaining balance')}
      value={
        <Tooltip id='final-ticket-balance' tip={`${fullFinalBalancePretty} ${ticket.symbol}`}>
          <div className='flex flex-wrap justify-end'>
            <span>{finalBalancePretty}</span>
            <span className='ml-1'>{ticket.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const UnderlyingReceivedStat = (props) => {
  const { token, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount)
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: token.symbol })}
      value={
        <Tooltip
          id={`${token.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${token.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{token.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const DownArrow = () => <DefaultDownArrow className='my-2 text-inverse' />

interface ModalWithStylesProps {
  isOpen: boolean
  closeModal: () => void
  children: React.ReactNode
}

const ModalWithStyles = (props: ModalWithStylesProps) => (
  <Modal
    noSize
    noBgColor
    noPad
    className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal px-2 xs:px-8 py-10'
    label='Withdrawal Modal'
    {...props}
  />
)
