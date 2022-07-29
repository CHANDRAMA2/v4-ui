export default [
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'address', name: '_to', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'delegate', type: 'address' },
          {
            components: [
              { internalType: 'uint256', name: 'deadline', type: 'uint256' },
              { internalType: 'uint8', name: 'v', type: 'uint8' },
              { internalType: 'bytes32', name: 'r', type: 'bytes32' },
              { internalType: 'bytes32', name: 's', type: 'bytes32' }
            ],
            internalType: 'struct Signature',
            name: 'signature',
            type: 'tuple'
          }
        ],
        internalType: 'struct DelegateSignature',
        name: '_delegateSignature',
        type: 'tuple'
      }
    ],
    name: 'depositToAndDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IPrizePool', name: '_prizePool', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'address', name: '_to', type: 'address' },
      {
        components: [
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint8', name: 'v', type: 'uint8' },
          { internalType: 'bytes32', name: 'r', type: 'bytes32' },
          { internalType: 'bytes32', name: 's', type: 'bytes32' }
        ],
        internalType: 'struct Signature',
        name: '_permitSignature',
        type: 'tuple'
      },
      {
        components: [
          { internalType: 'address', name: 'delegate', type: 'address' },
          {
            components: [
              { internalType: 'uint256', name: 'deadline', type: 'uint256' },
              { internalType: 'uint8', name: 'v', type: 'uint8' },
              { internalType: 'bytes32', name: 'r', type: 'bytes32' },
              { internalType: 'bytes32', name: 's', type: 'bytes32' }
            ],
            internalType: 'struct Signature',
            name: 'signature',
            type: 'tuple'
          }
        ],
        internalType: 'struct DelegateSignature',
        name: '_delegateSignature',
        type: 'tuple'
      }
    ],
    name: 'permitAndDepositToAndDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
