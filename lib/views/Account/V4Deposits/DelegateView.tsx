import {
  BlockExplorerLink,
  ModalTitle,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useState } from 'react'
import { FieldValues, useForm, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
import { Transaction, useTransaction } from '@pooltogether/hooks'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useUsersTicketDelegate } from 'lib/hooks/v4/PrizePool/useUsersTicketDelegate'
import { DepositItemsProps } from '.'
import { useUser } from 'lib/hooks/v4/User/useUser'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { InfoList } from 'lib/components/InfoList'
import { TxReceiptItem } from 'lib/components/InfoList/TxReceiptItem'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'

const DELEGATE_ADDRESS_KEY = 'delegate'

interface DelegateViewProps extends DepositItemsProps {}

enum DelegateViews {
  read = 'read',
  write = 'write'
}

export const DelegateView = (props: DelegateViewProps) => {
  const { prizePool } = props
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: delegate, isFetched, refetch } = useUsersTicketDelegate(usersAddress, prizePool)
  const [view, setView] = useState<DelegateViews>(DelegateViews.read)

  return (
    <>
      <ModalTitle
        className='mb-4'
        chainId={prizePool.chainId}
        title={t('delegateDeposit', 'Delegate deposit')}
      />
      <p className='mb-2'>
        {t(
          'delegationExplainer1',
          'Delegation is a new feature that allows you to maintain full custody of your funds while allowing another wallet to have a chance to win prizes based on your deposit.'
        )}
      </p>
      <p className='mb-6'>
        {t(
          'delegationExplainer2',
          'You can still withdraw at any time. To to keep your chances of winning reset the delegate to your own address.'
        )}
      </p>
      {view == DelegateViews.read && (
        <DelegateReadState
          chainId={prizePool.chainId}
          isFetched={isFetched}
          usersAddress={usersAddress}
          delegate={delegate?.[usersAddress]}
          setWriteView={() => setView(DelegateViews.write)}
        />
      )}
      {view == DelegateViews.write && (
        <DelegateWriteState
          prizePool={prizePool}
          refetchDelegate={refetch}
          setReadView={() => setView(DelegateViews.read)}
        />
      )}
    </>
  )
}

interface DelegateReadStateProps {
  chainId: number
  isFetched: boolean
  usersAddress: string
  delegate: string
  setWriteView: () => void
}

const DelegateReadState = (props: DelegateReadStateProps) => {
  const { isFetched, setWriteView } = props

  const { t } = useTranslation()

  return (
    <div className='flex flex-col w-full'>
      <span className='text-xs opacity-70 font-bold'>
        {t('currentDelegate', 'Current delegate')}
      </span>
      <DelegateDisplay {...props} className='mb-4' />
      <SquareButton
        onClick={setWriteView}
        disabled={!isFetched}
        className='flex space-x-2 items-center'
      >
        <span>{t('editDelegate', 'Edit delegate')}</span>
        <FeatherIcon icon='edit' className='w-4 h-4' />
      </SquareButton>
    </div>
  )
}

interface DelegateDisplayProps {
  className?: string
  chainId: number
  isFetched: boolean
  usersAddress: string
  delegate: string
}

const DelegateDisplay = (props: DelegateDisplayProps) => {
  const { className, isFetched, chainId, usersAddress, delegate } = props

  const { t } = useTranslation()

  if (!isFetched) {
    return <ThemedClipSpinner className={className} sizeClassName='w-4 h-4' />
  } else if (delegate === ethers.utils.getAddress(usersAddress)) {
    return (
      <span className={classNames(className, 'text-sm')}>
        {t('self', 'Self')} (
        <BlockExplorerLink shorten chainId={chainId} address={delegate} className='text-sm' />)
      </span>
    )
  } else if (delegate === ethers.constants.AddressZero) {
    return <span className={classNames(className, 'text-sm')}>None</span>
  } else {
    return (
      <BlockExplorerLink
        chainId={chainId}
        address={delegate}
        className={classNames(className, 'text-sm')}
      />
    )
  }
}

interface DelegateWriteStateProps {
  prizePool: PrizePool
  refetchDelegate: () => void
  setReadView: () => void
}

const DelegateWriteState = (props: DelegateWriteStateProps) => {
  const { setReadView } = props
  const { t } = useTranslation()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  return (
    <div className='flex flex-col w-full space-y-4'>
      <DelegateForm {...props} setTxId={setTxId} tx={tx} />
      {!tx?.sent && (
        <SquareButton theme={SquareButtonTheme.tealOutline} onClick={setReadView}>
          {t('cancel')}
        </SquareButton>
      )}
    </div>
  )
}

interface DelegateFormProps {
  prizePool: PrizePool
  tx: Transaction
  setTxId: (txId: number) => void
  refetchDelegate: () => void
}

const DelegateForm = (props: DelegateFormProps) => {
  const { prizePool, refetchDelegate, setTxId, tx } = props

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const sendTx = useSendTransaction()
  const user = useUser(prizePool)
  const isUserOnRightNetwork = useIsWalletOnNetwork(prizePool.chainId)

  const sendDelegateTx = async (x: FieldValues) => {
    const delegate = x[DELEGATE_ADDRESS_KEY]

    const txId = await sendTx({
      name: t('delegateDeposit', 'Delegate deposit'),
      method: 'delegate',
      callTransaction: () => user.delegateTickets(delegate),
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  const valitdationRules = {
    isValidAddress: (x: string) =>
      ethers.utils.isAddress(x) ? true : 'Please enter a valid address'
  }

  const errorMessage = errors?.[DELEGATE_ADDRESS_KEY]?.message

  if (tx?.inFlight || (tx?.completed && !tx?.error && !tx?.cancelled)) {
    return (
      <InfoList bgClassName='bg-body'>
        <TxReceiptItem depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <form onSubmit={handleSubmit(sendDelegateTx)} className='flex flex-col'>
      <button
        className='ml-auto mr-2 text-xs font-bold transition text-highlight-4 hover:opacity-70'
        type='button'
        onClick={() => {
          setValue(DELEGATE_ADDRESS_KEY, usersAddress)
          trigger(DELEGATE_ADDRESS_KEY)
        }}
      >
        {t('resetDelegate', 'Reset delegate')}
      </button>
      <Input inputKey={DELEGATE_ADDRESS_KEY} register={register} validate={valitdationRules} />
      <div className='h-8 text-pt-red text-center'>
        <span>{errorMessage}</span>
      </div>
      <TxButtonNetworkGated
        toolTipId='submit-new-delegate-tooltip'
        chainId={prizePool.chainId}
        className='w-full'
        type='submit'
        disabled={!isValid || !isUserOnRightNetwork}
      >
        {t('updateDelegate', 'Update delegate')}
      </TxButtonNetworkGated>
    </form>
  )
}

interface InputProps {
  inputKey: string
  register: UseFormRegister<FieldValues>
  validate: {
    [key: string]: (value: string) => boolean | string
  }
}

const Input = (props: InputProps) => {
  const { inputKey, register, validate } = props
  return (
    <div
      className={classNames(
        'p-0.5 bg-body rounded-lg overflow-hidden',
        'transition-all hover:bg-gradient-cyan focus-within:bg-pt-gradient',
        'cursor-pointer'
      )}
    >
      <div className='bg-body w-full rounded-lg flex'>
        <input
          className={classNames(
            'bg-transparent w-full outline-none focus:outline-none active:outline-none py-4 pr-8 pl-4 font-semibold'
          )}
          placeholder='0xabcde...'
          {...register(inputKey, { required: true, validate })}
        />
      </div>
    </div>
  )
}
