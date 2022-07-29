import { contract, MulticallContract } from '@pooltogether/etherplex'
import { Contract, ethers } from 'ethers'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { getReadProvider } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'
// import TicketAbi from '@abis/TicketAbi'

let ticketAbi = ['function nonces(address owner) view returns (uint)']

export const getTicketContract = (
  prizePool: PrizePool,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const chainId = prizePool.chainId
  console.log(prizePool)
  const ticketAddress = prizePool.ticketMetadata.address
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(ticketAddress, ticketAbi, providerOrSigner)
}
