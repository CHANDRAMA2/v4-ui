// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, Contract } from 'ethers'

const domainSchema = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

const permitSchema = [
  { name: 'user', type: 'address' },
  { name: 'delegate', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' }
]

export const signDelegateMessage = async (signer: any, domain: any, message: any) => {
  let myAddr = signer._address

  console.log({ domain })
  console.log({ message })
  if (myAddr.toLowerCase() !== message.user.toLowerCase()) {
    throw `signDelegate: address of signer does not match user address in message`
  }

  if (message.nonce === undefined) {
    let tokenAbi = ['function nonces(address user) view returns (uint)']

    let tokenContract = new Contract(domain.verifyingContract, tokenAbi, signer)

    let nonce = await tokenContract.nonces(myAddr)

    message = { ...message, nonce: nonce.toString() }
  }

  console.log(message)

  let typedData = {
    types: {
      EIP712Domain: domainSchema,
      Delegate: permitSchema
    },
    primaryType: 'Delegate',
    domain,
    message
  }
  console.log(typedData)

  let sig

  console.log('signer')
  console.log(signer)
  console.log(signer.provider)
  if (signer && signer.provider) {
    try {
      console.log([myAddr, typedData])
      sig = await signer.provider.send('eth_signTypedData', [myAddr, typedData])
    } catch (e: any) {
      console.log(e)
      console.log(e)
      console.log(e)
      if (/is not supported/.test(e.message)) {
        sig = await signer.provider.send('eth_signTypedData_v4', [myAddr, typedData])
      }
    }
  }

  return { domain, message, sig }
}

type Delegate = {
  ticket: Contract
  userWallet: any
  fromAddress: string
  delegate: string
}

export async function delegateSignature({
  ticket,
  fromAddress,
  userWallet,
  delegate
}: Delegate): Promise<any> {
  console.log({ ticket, fromAddress, userWallet, delegate })

  const nonce = (await ticket.nonces(fromAddress)).toNumber()
  const chainId = (await ticket.provider.getNetwork()).chainId
  const deadline = (await ticket.provider.getBlock('latest')).timestamp + 100

  let delegateSig = await signDelegateMessage(
    userWallet,
    {
      name: 'PoolTogether ControlledToken',
      version: '1',
      chainId,
      verifyingContract: ticket.address
    },
    {
      user: fromAddress,
      delegate,
      nonce,
      deadline
    }
  )
  console.log('delegateSig')
  console.log(delegateSig)

  const sig = ethers.utils.splitSignature(delegateSig.sig)
  console.log('sig')
  console.log(sig)

  return {
    user: userWallet.address,
    delegate,
    nonce,
    deadline,
    ...sig
  }
}

export async function generateDelegateSignature(
  ticketContract: any,
  fromWallet: any,
  fromAddress: string,
  delegateAddress: string
) {
  console.log(ticketContract, fromWallet, delegateAddress)
  const {
    user,
    delegate,
    deadline: delegateDeadline,
    v,
    r,
    s
  } = await delegateSignature({
    ticket: ticketContract,
    userWallet: fromWallet,
    fromAddress,
    delegate: delegateAddress
  })
  console.log(user, delegate, delegateDeadline, v, r, s)

  return { user, delegate, signature: { deadline: delegateDeadline, v, r, s } }
}
