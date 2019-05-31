
export const contractAbis = {
  tokenAbi: `[
    {
        "constant": true,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "getApproved",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_depositContract",
                "type": "address"
            }
        ],
        "name": "setDepositContract",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "custodianApproval",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            },
            {
                "name": "_declaredNonce",
                "type": "uint256"
            }
        ],
        "name": "revertTransfer",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "exists",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "transferNonce",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_tokenId",
                "type": "uint256"
            },
            {
                "name": "_declaredNonce",
                "type": "uint256"
            }
        ],
        "name": "custodianApprove",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "mintNonce",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_to",
                "type": "address"
            }
        ],
        "name": "mint",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_approvalHash",
                "type": "bytes32"
            }
        ],
        "name": "viewTransferRequest",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_approved",
                "type": "bool"
            }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_operator",
                "type": "address"
            }
        ],
        "name": "isApprovedForAll",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_tokenId",
                "type": "uint256"
            },
            {
                "name": "_declaredNonce",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_custodian",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "depositedTo",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "mintNonce",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "withdrawer",
                "type": "address"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "declaredNonce",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "approvalHash",
                "type": "bytes32"
            }
        ],
        "name": "TransferRequest",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_approved",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_operator",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_approved",
                "type": "bool"
            }
        ],
        "name": "ApprovalForAll",
        "type": "event"
    }
]`,
  depositAbi: `[
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "challengeTime",
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "depositedAmount",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "name": "tokenIdToMinter",
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "finalizeStake",
        "inputs": [],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "challengeWithPastCustody",
        "inputs": [
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "bytes32[]",
                "name": "_rawTxBundle"
            },
            {
                "type": "uint256[]",
                "name": "_txLengths"
            },
            {
                "type": "bytes32[]",
                "name": "_txMsgHashes"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "stakedAmount",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "name": "custodian",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "claim",
        "inputs": [
            {
                "type": "uint256",
                "name": "_tokenId"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [
            {
                "type": "bool",
                "name": ""
            }
        ],
        "name": "ecverify",
        "inputs": [
            {
                "type": "bytes32",
                "name": "hash"
            },
            {
                "type": "bytes",
                "name": "sig"
            },
            {
                "type": "address",
                "name": "signer"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "claimStake",
        "inputs": [
            {
                "type": "uint256",
                "name": "_tokenId"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "name": "tokenContract",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "payable",
        "payable": true,
        "outputs": [],
        "name": "withdraw",
        "inputs": [
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "bytes32[]",
                "name": "_rawTxBundle"
            },
            {
                "type": "uint256[]",
                "name": "_txLengths"
            },
            {
                "type": "bytes32[]",
                "name": "_txMsgHashes"
            },
            {
                "type": "uint256",
                "name": "_declaredNonce"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "tokenIdToAmount",
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "payable",
        "payable": true,
        "outputs": [],
        "name": "initiateChallengeWithPastCustody",
        "inputs": [
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "bytes32[]",
                "name": "_rawTxBundle"
            },
            {
                "type": "uint256[]",
                "name": "_txLengths"
            },
            {
                "type": "bytes32[]",
                "name": "_txMsgHashes"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "payable",
        "payable": true,
        "outputs": [],
        "name": "deposit",
        "inputs": [
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "address",
                "name": "_minter"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "name": "ecrecovery",
        "inputs": [
            {
                "type": "bytes32",
                "name": "hash"
            },
            {
                "type": "bytes",
                "name": "sig"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "challengeNonce",
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "submitCustodianDoubleSign",
        "inputs": [
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "bytes32[]",
                "name": "_rawTxBundle"
            },
            {
                "type": "uint256[]",
                "name": "_txLengths"
            },
            {
                "type": "bytes32[]",
                "name": "_txMsgHashes"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "challengeEndNonce",
        "inputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "address",
                "name": ""
            }
        ],
        "name": "custodianForeign",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "setTokenContract",
        "inputs": [
            {
                "type": "address",
                "name": "_tokenContract"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "challengeWithFutureCustody",
        "inputs": [
            {
                "type": "address",
                "name": "_to"
            },
            {
                "type": "uint256",
                "name": "_tokenId"
            },
            {
                "type": "bytes32[]",
                "name": "_rawTxBundle"
            },
            {
                "type": "uint256[]",
                "name": "_txLengths"
            },
            {
                "type": "bytes32[]",
                "name": "_txMsgHashes"
            }
        ],
        "constant": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "payable": false,
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ],
        "name": "depositCap",
        "inputs": [],
        "constant": true
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "payable": false,
        "outputs": [],
        "name": "setCustodianForeign",
        "inputs": [
            {
                "type": "address",
                "name": "_custodianForeign"
            }
        ],
        "constant": false
    },
    {
        "type": "constructor",
        "stateMutability": "nonpayable",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_custodian"
            }
        ]
    },
    {
        "type": "fallback",
        "stateMutability": "payable",
        "payable": true
    },
    {
        "type": "event",
        "name": "Deposit",
        "inputs": [
            {
                "type": "address",
                "name": "depositer",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "amount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "tokenId",
                "indexed": false
            },
            {
                "type": "address",
                "name": "minter",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ChallengeInitiated",
        "inputs": [
            {
                "type": "address",
                "name": "challenger",
                "indexed": true
            },
            {
                "type": "address",
                "name": "depositedTo",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "tokenId",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Challenge",
        "inputs": [
            {
                "type": "address",
                "name": "rechallenger",
                "indexed": true
            },
            {
                "type": "address",
                "name": "depositedTo",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "tokenId",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "finalChallengeNonce",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ChallengeResolved",
        "inputs": [
            {
                "type": "uint256",
                "name": "tokenId",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdrawal",
        "inputs": [
            {
                "type": "address",
                "name": "withdrawer",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "tokenId",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "stakedAmount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "declaredNonce",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Test",
        "inputs": [
            {
                "type": "bytes",
                "name": "tx1",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "tx2",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "tx3",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Trace",
        "inputs": [
            {
                "type": "bytes",
                "name": "out",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TraceAddress",
        "inputs": [
            {
                "type": "address",
                "name": "out",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Trace32",
        "inputs": [
            {
                "type": "bytes32",
                "name": "out",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TraceUint256",
        "inputs": [
            {
                "type": "uint256",
                "name": "out",
                "indexed": false
            }
        ],
        "anonymous": false
    }
]`
};
