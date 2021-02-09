import React, { useContext } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { PTHint } from 'lib/components/PTHint'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { RetroactivePoolClaimBanner } from 'lib/components/RetroactivePoolClaimBanner'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'

export const ProposalsUI = (props) => {
  const { connectWallet } = useContext(AuthControllerContext)

  const { error, isFetched } = useAllProposalsSorted()

  if (!isFetched) {
    return (
      <div className='flex flex-grow'>
        <V3LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <>
      <RetroactivePoolClaimBanner />

      <UsersVotesCard />

      <h1 className='text-inverse'>Vote</h1>

      <p className='text-inverse sm:w-10/12 mb-4 sm:mb-8'>
        The protocol is controlled by decentralized governance. Any changes are presented as
        “proposals” and voted on by POOL token holders.{' '}
        <a
          href='https://medium.com/p/23b09f36db48'
          target='_blank'
          rel='noreferrer noopener'
          className='text-inverse underline'
        >
          Read more about PoolTogether governance
        </a>
        .
      </p>

      <div className='flex flex-col sm:flex-row mb-8 sm:mb-12'>
        <a href='https://gov.pooltogether.com/' target='_blank' rel='noreferrer noopener'>
          <Button textSize='xxs' type='button' className='mb-4 sm:mb-0 w-full sm:w-auto'>
            Discuss Proposals
          </Button>
        </a>

        <PTHint
          tip={
            <div className='my-2 text-center text-xs sm:text-sm'>
              <p>Proposal creation is currently in development.</p>
              <p>Check back soon!</p>
            </div>
          }
        >
          <Button
            disabled
            textSize='xxs'
            className='sm:ml-8 w-full sm:w-auto'
            onClick={(e) => {
              e.preventDefault()
              connectWallet()
            }}
            border='green'
            text='primary'
            bg='green'
            hoverBorder='green'
            hoverText='primary'
            hoverBg='green'
          >
            Create a Proposal
          </Button>
        </PTHint>
      </div>

      <ProposalsList />

      <AddGovernanceTokenToMetaMask />
    </>
  )
}
