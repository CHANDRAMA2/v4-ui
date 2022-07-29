import { contract, MulticallContract } from '@pooltogether/etherplex'
import { Contract, ethers } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { getReadProvider } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'
import EIP2612PermitAndDepositAbi from '@abis/EIP2612PermitAndDeposit'

const EIP_2612_PERMIT_AND_DEPOSIT_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.optimism]: '0xcddfa3BfC0e548d9A526E3355FefDf987F4e1aAE',
  // [CHAIN_ID.polygon]: '',
  // [CHAIN_ID.mainnet]: '',
  [CHAIN_ID.avalanche]: '0xC660A8De5eB9E123E475Ae9A9f62dB62c92a3648',
  [CHAIN_ID['optimism-kovan']]: '0xb38e46EBf90888D621Cde5661D3cC2476d7bCc2e',
  [CHAIN_ID.rinkeby]: '0x3E9FB7d86576852a6158586253Cd15500D8057DF',
  [CHAIN_ID.mumbai]: '0x72107103bA71F11761c32E2374611e349BA2Ee44',
  [CHAIN_ID.fuji]: '0xeCD1b222E4C60fBe57458De5F8b2f714b837677E'
})

export const getEip2612PermitAndDepositContract = (
  chainId: number,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const eip2612PermitAndDepositAddress = getEip2612PermitAndDepositAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(
    eip2612PermitAndDepositAddress,
    EIP2612PermitAndDepositAbi,
    providerOrSigner
  )
}

export const getEip2612PermitAndDepositAddress = (chainId: number) =>
  EIP_2612_PERMIT_AND_DEPOSIT_ADDRESS[chainId]
