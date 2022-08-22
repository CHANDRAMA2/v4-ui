import React, { useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { ThemedClipSpinner, CountUp } from '@pooltogether/react-components'
import { Token } from '@pooltogether/hooks'
import { PrizePool, PrizeTier } from '@pooltogether/v4-client-js'

import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useDrawBeaconPeriod } from '@hooks/v4/PrizePoolNetwork/useDrawBeaconPeriod'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { ViewPrizesSheetCustomTrigger } from '@components/ViewPrizesSheetButton'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Time } from '@components/Time'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useAllPrizePoolTotalNumberOfPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolTotalNumberOfPrizes'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { Dot } from '@components/Dot'

export const UpcomingPrize: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)

  const ticket = prizePoolTokens?.ticket
  const isFetched = isPrizePoolTokensFetched && isPrizeTierFetched

  return (
    <div className={classNames('flex flex-col text-center relative max-w-xl pt-20 ', className)}>
      <LightningBolts />
      <Dots />

      <AmountOfPrizes
        prizePool={prizePool}
        isFetched={isFetched}
        prizeTier={prizeTierData?.prizeTier}
        ticket={ticket}
      />
      <PrizeAmount isFetched={isFetched} prizeTier={prizeTierData?.prizeTier} ticket={ticket} />
      <p className='uppercase font-semibold text-inverse text-xs xs:text-lg'>to win</p>
      <DrawCountdown />
    </div>
  )
}

const AmountOfPrizes = (props: {
  prizePool: PrizePool
  isFetched: boolean
  ticket: Token
  prizeTier: PrizeTier
}) => {
  const { ticket, prizeTier, prizePool } = props

  const queryResults = useAllPrizePoolTotalNumberOfPrizes()

  const amountOfPrizes = useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    return isFetched
      ? Math.round(
          queryResults
            .filter(({ isFetched }) => isFetched)
            .reduce((sum, { data }) => sum + data.numberOfPrizes, 0)
        )
      : 0
  }, [queryResults])

  return (
    <div className='uppercase font-semibold text-inverse text-xs xs:text-lg mt-2 mb-1'>
      <ViewPrizesSheetCustomTrigger
        ticket={ticket}
        prizeTier={prizeTier}
        Button={(props) => (
          <button
            {...props}
            className='uppercase text-gradient-magenta hover:opacity-50 font-bold transition'
          >
            <CountUp countFrom={0} countTo={amountOfPrizes * 7} decimals={0} /> Prizes.
          </button>
        )}
      />{' '}
      Every. Week.
      {/* <Trans
        i18nKey='prizesEverySingleDay'
        components={{
          button: (
            <ViewPrizesSheetCustomTrigger
              ticket={ticket}
              prizeTier={prizeTier}
              Button={(props) => (
                <button
                  {...props}
                  className='underline text-gradient-magenta hover:opacity-50 font-bold transition'
                />
              )}
            />
          )
        }}
        values={{ amount: amountOfPrizes }}
      /> */}
    </div>
  )
}

const PrizeAmount = (props: { isFetched: boolean; ticket: Token; prizeTier: PrizeTier }) => {
  const { isFetched, ticket, prizeTier } = props

  let amount = 0
  if (isFetched) {
    amount = Number(formatUnits(prizeTier.prize.mul(BigNumber.from(7)), ticket.decimals))
  }

  return (
    <h1
      className={classNames(
        'text-12xl xs:text-14xl xs:-mt-0 font-extrabold  pointer-events-none mx-auto leading-none relative hover:text-gradient-magenta',
        { 'opacity-50': !amount }
      )}
    >
      $<CountUp countFrom={0} countTo={amount} decimals={0} />
      {!amount && <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />}
    </h1>
  )
}

const DrawCountdown = (props) => {
  const { t } = useTranslation()
  const { data: drawBeaconPeriod } = useDrawBeaconPeriod()
  const { secondsLeft } = useTimeUntil(drawBeaconPeriod?.endsAtSeconds.toNumber())
  const drawId = drawBeaconPeriod?.drawId

  if (secondsLeft < 60) {
    return (
      <div className='flex flex-col mx-auto pt-3'>
        <DrawNumberString>
          <span>{t('drawNumber', 'Draw #{{number}}', { number: drawId })}</span>
        </DrawNumberString>
        <span className='h-14 uppercase font-semibold text-accent-1 text-xl mx-auto'>
          {t('closingSoon', 'Closing soon')}
        </span>
      </div>
    )
  }

  return (
    <div className='flex flex-col mx-auto pt-3'>
      <DrawNumberString>
        <span>{t('joinDrawNumber', 'Join draw #{{number}}', { number: drawId })}</span>
      </DrawNumberString>
      <Time
        seconds={secondsLeft}
        className='mx-auto justify-center items-center text-center'
        timeClassName='text-sm xs:text-lg mx-auto w-6 xs:w-8'
        colonYOffset={-12}
      />
    </div>
  )
}

const DrawNumberString = (props) => (
  <span {...props} className='uppercase font-semibold opacity-50 text-xs xs:text-xs mx-auto' />
)

const LightningBolt = (props: {
  className: string
  color: string
  scale: number
  rotate: number
  flip?: boolean
}) => {
  const { color } = props

  const fillBackgroundColor = color === 'yellow' ? '#FC9447' : '#0BF0B9'
  const fillForegroundColor = color === 'yellow' ? '#FFC448' : '#34FDCD'

  return (
    <div
      className={classNames(props.className, 'bg-contain bg-no-repeat absolute')}
      style={{
        transform: `rotate(${props.rotate}deg) scale(${props.flip ? '' : '-'}${props.scale}, ${
          props.scale
        })`
      }}
    >
      <svg viewBox='0 0 121 101' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='m78.667 12.83 43.728 10.131L133.441 50 83.64 60.695l10.217 8.885 4.695 24.71L7.9 98.809l-6.567-6.804 49.738-26.993-16.138-14.023 43.734-38.157Z'
          fill={fillBackgroundColor}
        />
        <path
          d='m78.667 12.83-.302 1.3 43.056 9.974 10.184 24.927L83.36 59.392c-.495.105-.884.48-1.01.97a1.33 1.33 0 0 0 .415 1.34l9.868 8.58 4.323 22.753-88.517 4.412L3.51 92.34l48.196-26.157c.384-.21.641-.594.689-1.027a1.338 1.338 0 0 0-.45-1.152L36.963 50.987l42.579-37.15-.876-1.006-.302 1.298.302-1.298-.876-1.004-43.734 38.157a1.334 1.334 0 0 0 .002 2.01l14.685 12.762L.697 90.832c-.368.2-.617.555-.681.97-.064.413.067.826.357 1.127l6.567 6.806c.268.277.64.425 1.027.405l90.652-4.517a1.333 1.333 0 0 0 1.242-1.582l-4.694-24.71a1.345 1.345 0 0 0-.435-.758l-8.204-7.134 47.193-10.135a1.332 1.332 0 0 0 .955-1.808l-11.047-27.04a1.34 1.34 0 0 0-.933-.795L78.968 11.532a1.33 1.33 0 0 0-1.177.295l.876 1.004'
          fill='#11131A'
        />
        <path
          d='m66.417 2.299 55.978 20.662-51.026 27.196 22.43 19.49L1.334 92.004l37.478-37.53-16.138-14.02L66.417 2.3'
          fill={fillForegroundColor}
        />
        <path
          d='m66.417 2.299-.461 1.25 53.188 19.634L70.743 48.98a1.338 1.338 0 0 0-.698 1.027c-.049.433.12.87.45 1.156l20.48 17.795L5.623 89.595l34.132-34.179c.262-.263.402-.619.389-.99a1.328 1.328 0 0 0-.459-.958L24.704 40.452l42.59-37.15-.877-1.003-.461 1.25.461-1.25-.876-1.006L21.797 39.45a1.335 1.335 0 0 0 .001 2.012l15.06 13.082L.388 91.06a1.338 1.338 0 0 0-.218 1.596c.292.519.896.783 1.476.643l92.466-22.357a1.334 1.334 0 0 0 .56-2.303L73.708 50.423l49.313-26.286a1.33 1.33 0 0 0 .704-1.266 1.327 1.327 0 0 0-.869-1.16L66.88 1.047c-.46-.17-.97-.075-1.339.246l.876 1.006'
          fill='#11131A'
        />
      </svg>
    </div>
  )
}

LightningBolt.defaultProps = {
  scale: 1,
  rotate: 0
}

const LightningBolts = () => (
  <>
    {/* Left */}
    <LightningBolt
      color='yellow'
      rotate={20}
      className='top-10 left-2 sm:left-12 w-8 h-8 xs:w-12 xs:h-12'
    />
    <LightningBolt
      color='teal'
      className='top-24 xs:top-28 sm:top-32 left-0 xs:pt-2 w-8 h-8 xs:w-12 xs:h-12'
      scale={0.8}
      rotate={-20}
    />
    {/* Right */}
    <LightningBolt
      flip
      color='teal'
      scale={1.2}
      rotate={5}
      className='top-20 xs:top-28 sm:top-32 right-0 xs:right-2 lg:-right-8 w-10 h-10 xs:w-12 xs:h-12'
    />
    <LightningBolt
      flip
      color='yellow'
      className='top-10 right-4 w-8 h-8 xs:w-12 xs:h-12'
      scale={0.7}
      rotate={-20}
    />
  </>
)

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-4 left-2' />
    <Dot className='top-2 left-24' />
    <Dot className='top-22 sm:top-28 left-0 xs:-left-8' />

    {/* Right */}
    <Dot className='top-2  right-32' />
    <Dot className='top-10 right-52' />
    <Dot className='top-14 right-0 xs:-right-12' />
    <Dot className='top-28 right-10 xs:right-20 sm:right-28' />
  </>
)
