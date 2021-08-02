import React, { useEffect } from 'react'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { parseUnits } from '@ethersproject/units'
// import { Button, TsunamiInput, TextInputGroup } from '@pooltogether/react-components'
import { useOnboard } from '@pooltogether/hooks'
import { Button } from '@pooltogether/react-components'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { TsunamiInput } from 'lib/components/TextInputs'
import { getMaxPrecision, numberWithCommas, queryParamUpdater } from '@pooltogether/utilities'

import { ErrorsBox } from 'lib/components/ErrorsBox'
// import { WithdrawAndDepositPaneTitle } from 'lib/components/WithdrawAndDepositPaneTitle'

import WalletIcon from 'assets/images/icon-wallet.svg'

export const DepositAmount = (props) => {
  const {
    quantity: queryQuantity,
    usersAddress,
    usersUnderlyingBalance,
    usersTicketBalance,
    decimals,
    label,
    tokenSymbol,
    tokenAddress,
    // nextStep,
    form
  } = props

  const { t } = useTranslation()
  const router = useRouter()

  const { handleSubmit, register, formState, setValue } = form
  const { errors } = formState

  const { isWalletConnected, connectWallet } = useOnboard()

  // Set quantity from the query parameter
  useEffect(() => {
    if (queryQuantity) {
      setValue('quantity', queryQuantity, { shouldValidate: true })
    }
  }, [])

  const onSubmit = (values) => {
    if (formState.isValid) {
      queryParamUpdater.add(router, {
        quantity: values.quantity,
        prevUnderlyingBalance: usersUnderlyingBalance,
        prevTicketBalance: usersTicketBalance
      })
      // nextStep()
    }
  }

  const handleDepositButtonClick = () => {
    if (isWalletConnected) {
      handleSubmit(onSubmit)
    } else {
      connectWallet()
    }
  }

  const depositValidationRules = {
    isValid: (v) => {
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      if (!usersUnderlyingBalance) return false
      if (!usersTicketBalance) return false
      if (getMaxPrecision(v) > decimals) return false
      if (parseUnits(usersUnderlyingBalance, decimals).lt(parseUnits(v, decimals))) return false
      if (parseUnits(v, decimals).isZero()) return false
      return true
    }
  }

  return (
    <>
      {/* <WithdrawAndDepositPaneTitle label={label} symbol={tokenSymbol} address={tokenAddress} /> */}

      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <div className='w-full mx-auto'>
          <TextInputGroup
            autoFocus
            unsignedNumber
            type='number'
            tickerUpcased='USDC'
            Input={TsunamiInput}
            validate={depositValidationRules}
            containerBgClasses={'bg-transparent'}
            containerRoundedClasses={'rounded-lg'}
            bgClasses={'bg-body'}
            placeholder='0.0'
            id='quantity'
            name='quantity'
            register={register}
            label={<div className='font-semibold text-accent-3'>{t('swap')}</div>}
            required={t('ticketQuantityRequired')}
            autoComplete='off'
            rightLabel={
              isWalletConnected &&
              usersUnderlyingBalance && (
                <>
                  <button
                    id='_setMaxDepositAmount'
                    type='button'
                    className='font-bold inline-flex items-center'
                    onClick={(e) => {
                      e.preventDefault()
                      setValue('quantity', usersUnderlyingBalance, { shouldValidate: true })
                    }}
                  >
                    <img src={WalletIcon} className='mr-2' style={{ maxHeight: 12 }} />
                    {numberWithCommas(usersUnderlyingBalance)} {tokenSymbol}
                  </button>
                </>
              )
            }
          />
        </div>

        <DownArrow />

        <div className='w-full mx-auto'>
          <TextInputGroup
            readOnly
            tickerUpcased='PRZUSDC'
            Input={TsunamiInput}
            roundedClasses={'rounded-lg'}
            containerRoundedClasses={'rounded-lg'}
            placeholder='0.0'
            id='result'
            name='result'
            register={register}
            label={null}
            value={console.log(formState)}
          />
        </div>

        <div
          className='text-sm text-highlight-1 font-bold mb-2'
          style={{
            minHeight: 26
          }}
        >
          {Object.values(errors).length > 0 && <ErrorsBox errors={errors} />}
        </div>

        <div className='flex flex-col mx-auto w-full items-center justify-center'>
          <button
            className='new-btn rounded-lg w-full text-xl py-3 mt-2'
            disabled={isWalletConnected && !formState.isValid}
            onClick={handleDepositButtonClick}
          >
            {isWalletConnected ? t('reviewDeposit') : t('connectWalletToDeposit')}
          </button>
        </div>

        <div className='font-bold gradient-new text-center py-1 mt-4 text-xxs rounded-lg text-white'>
          {t('chancesToWinAreProportional')}
        </div>

        <FormStepper activeStep={2} totalSteps={3} />
      </form>
    </>
  )
}

const DownArrow = (props) => {
  return (
    <div className='text-default opacity-40'>
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='fill-current mx-auto mb-2'
      >
        <path d='M7 1V12.17L2.12 7.29C1.73 6.9 1.09 6.9 0.700001 7.29C0.310001 7.68 0.310001 8.31 0.700001 8.7L7.29 15.29C7.68 15.68 8.31 15.68 8.7 15.29L15.29 8.7C15.68 8.31 15.68 7.68 15.29 7.29C14.9 6.9 14.27 6.9 13.88 7.29L9 12.17V1C9 0.45 8.55 0 8 0C7.45 0 7 0.45 7 1Z' />
      </svg>
    </div>
  )
}

const FormStepper = (props) => {
  const { totalSteps, activeStep } = props

  const defaultCircleClassNames = 'border-2 h-4 w-4 rounded-full trans'
  const activeCircleClassNames = 'bg-card border-highlight-1'
  const inactiveCircleClassNames = 'bg-card-selected border-transparent'

  const defaultLabelClassNames = 'font-inter text-xxs font-semibold relative trans'
  const activeLabelClassNames = 'text-highlight-1'
  const inactiveLabelClassNames = 'text-primary-soft opacity-60'

  const defaultBarClassNames = 'h-1 w-1/2 relative trans'
  const activeBarClassNames = 'bg-highlight-1'
  const inactiveBarClassNames = 'bg-transparent'

  const Circles = () => {
    return (
      <>
        <div
          className={classnames(defaultCircleClassNames, {
            [activeCircleClassNames]: activeStep >= 1,
            [inactiveCircleClassNames]: activeStep < 1
          })}
        ></div>
        <div
          className={classnames(defaultCircleClassNames, {
            [activeCircleClassNames]: activeStep >= 2,
            [inactiveCircleClassNames]: activeStep < 2
          })}
        ></div>
        <div
          className={classnames(defaultCircleClassNames, {
            [activeCircleClassNames]: activeStep >= 3,
            [inactiveCircleClassNames]: activeStep < 3
          })}
        ></div>
      </>
    )
  }

  const Bars = () => {
    return (
      <>
        <div
          className={classnames(defaultBarClassNames, {
            [activeBarClassNames]: activeStep > 1,
            [inactiveBarClassNames]: activeStep <= 1
          })}
          style={{ height: 2, top: 6, left: 2 }}
        ></div>
        <div
          className={classnames(defaultBarClassNames, {
            [activeBarClassNames]: activeStep > 2,
            [inactiveBarClassNames]: activeStep <= 2
          })}
          style={{ height: 2, top: 6, right: 2 }}
        ></div>
      </>
    )
  }

  const Labels = () => {
    return (
      <div className='flex justify-between items-center mt-2 relative mx-auto'>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= 1,
            [inactiveLabelClassNames]: activeStep < 1
          })}
          style={{ left: -34 }}
        >
          Allow USDC
        </div>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= 2,
            [inactiveLabelClassNames]: activeStep < 2
          })}
          style={{ right: -10 }}
        >
          Deposit USDC
        </div>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= 3,
            [inactiveLabelClassNames]: activeStep < 3
          })}
          style={{ right: -44 }}
        >
          Confirm Order
        </div>
      </div>
    )
  }

  const DepositCompleteMessage = (props) => {
    return (
      <div className={classnames('absolute flex flex-col w-full trans', activeLabelClassNames)}>
        <FeatherIcon icon='check-circle' className={classnames('w-4 h-4 mx-auto stroke-current')} />
        <div className={classnames('text-center', defaultLabelClassNames)}>Deposit complete!</div>
      </div>
    )
  }

  return (
    <>
      <div className='mt-6 pb-6 relative'>
        <span
          className={classnames({
            'opacity-0 trans': activeStep !== 4
          })}
        >
          <DepositCompleteMessage />
        </span>

        <span
          className={classnames({
            'opacity-0 trans': activeStep > 3
          })}
        >
          <div className='w-2/3 mx-auto relative bg-card-selected' style={{ height: 2 }}>
            <div className='flex justify-between items-center relative'>
              <Circles />
            </div>
            <div className='flex justify-between items-center w-full absolute t-0 l-0 r-0 b-0 z-20'>
              <Bars />
            </div>
            <Labels />
          </div>
        </span>
      </div>
    </>
  )
}
