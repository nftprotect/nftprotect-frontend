const UserRegistryABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "areg",
                "type": "address"
            },
            {
                "internalType": "contract IUserDID",
                "name": "did",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "nftprotectaddr",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountWei",
                "type": "uint256"
            }
        ],
        "name": "AffiliatePayment",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "percent",
                "type": "uint256"
            }
        ],
        "name": "AffiliatePercentChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "areg",
                "type": "address"
            }
        ],
        "name": "ArbitratorRegistryChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "did",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "provider",
                "type": "string"
            }
        ],
        "name": "DIDRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "did",
                "type": "address"
            }
        ],
        "name": "DIDUnregistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Deployed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract IArbitrator",
                "name": "_arbitrator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_disputeID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_metaEvidenceID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_evidenceGroupID",
                "type": "uint256"
            }
        ],
        "name": "Dispute",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract IArbitrator",
                "name": "_arbitrator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_evidenceGroupID",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_party",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "_evidence",
                "type": "string"
            }
        ],
        "name": "Evidence",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_metaEvidenceID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "_evidence",
                "type": "string"
            }
        ],
        "name": "MetaEvidence",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "partnet",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "percent",
                "type": "uint256"
            }
        ],
        "name": "PartnerSet",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "referrer",
                "type": "address"
            }
        ],
        "name": "ReferrerSet",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract IArbitrator",
                "name": "_arbitrator",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "_disputeID",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_ruling",
                "type": "uint256"
            }
        ],
        "name": "Ruling",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            }
        ],
        "name": "SuccessorAppealed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            }
        ],
        "name": "SuccessorApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            }
        ],
        "name": "SuccessorRejected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "successor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "arbitratorId",
                "type": "uint256"
            }
        ],
        "name": "SuccessorRequested",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "affiliatePercent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "arbitratorRegistry",
        "outputs": [
            {
                "internalType": "contract ArbitratorRegistry",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "dids",
        "outputs": [
            {
                "internalType": "contract IUserDID",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "disputes",
        "outputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "successor",
                "type": "address"
            },
            {
                "internalType": "contract IArbitrator",
                "name": "arbitrator",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "extraData",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "evidenceId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "hasSuccessor",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "isRegistered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "successor",
                "type": "address"
            }
        ],
        "name": "isSuccessor",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "metaEvidenceCounter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "metaEvidenceLoader",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nftprotect",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "partners",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "address payable",
                "name": "referrer",
                "type": "address"
            }
        ],
        "name": "processPayment",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "referrers",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IUserDID",
                "name": "did",
                "type": "address"
            }
        ],
        "name": "registerDID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ruling",
                "type": "uint256"
            }
        ],
        "name": "rule",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "scores",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "percent",
                "type": "uint256"
            }
        ],
        "name": "setAffiliatePercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "areg",
                "type": "address"
            }
        ],
        "name": "setArbitratorRegistry",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "mel",
                "type": "address"
            }
        ],
        "name": "setMetaEvidenceLoader",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "partner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "percent",
                "type": "uint256"
            }
        ],
        "name": "setPartner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "evidence",
                "type": "string"
            }
        ],
        "name": "submitEvidence",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "evidence",
                "type": "string"
            }
        ],
        "name": "submitMetaEvidence",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "successorOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "arbitratorId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "evidence",
                "type": "string"
            }
        ],
        "name": "successorRequest",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "disputeId",
                "type": "uint256"
            }
        ],
        "name": "successorRequestAppeal",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "successors",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IUserDID",
                "name": "did",
                "type": "address"
            }
        ],
        "name": "unregisterDID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

export default UserRegistryABI