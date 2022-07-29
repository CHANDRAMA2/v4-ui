import { contract, MulticallContract } from '@pooltogether/etherplex'
import { Contract, ethers } from 'ethers'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { getReadProvider } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'
// import TokenAbi from '@abis/TokenAbi'

let tokenAbi = ['function nonces(address owner) view returns (uint)']

export const getTokenContract = (
  prizePool: PrizePool,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const chainId = prizePool.chainId
  console.log(prizePool)
  const tokenAddress = prizePool.tokenMetadata.address
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(tokenAddress, tokenAbi, providerOrSigner)
}
