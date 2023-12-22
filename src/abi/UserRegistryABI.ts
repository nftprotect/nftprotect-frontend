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
		  "internalType": "uint8",
		  "name": "percent",
		  "type": "uint8"
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
		  "internalType": "enum IUserRegistry.Security",
		  "name": "level",
		  "type": "uint8"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "feeWei",
		  "type": "uint256"
		}
	  ],
	  "name": "FeeChanged",
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
		  "name": "partner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint8",
		  "name": "discount",
		  "type": "uint8"
		},
		{
		  "indexed": false,
		  "internalType": "uint8",
		  "name": "affiliatePercent",
		  "type": "uint8"
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
		  "internalType": "uint256",
		  "name": "requestId",
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
		  "name": "requestId",
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
		  "name": "requestId",
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
		  "internalType": "uint8",
		  "name": "",
		  "type": "uint8"
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
	  "inputs": [],
	  "name": "coupons",
	  "outputs": [
		{
		  "internalType": "contract NFTPCoupons",
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
		  "name": "partner",
		  "type": "address"
		}
	  ],
	  "name": "deletePartner",
	  "outputs": [],
	  "stateMutability": "nonpayable",
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
		  "internalType": "address",
		  "name": "user",
		  "type": "address"
		},
		{
		  "internalType": "enum IUserRegistry.Security",
		  "name": "level",
		  "type": "uint8"
		}
	  ],
	  "name": "feeForUser",
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
		  "internalType": "enum IUserRegistry.Security",
		  "name": "",
		  "type": "uint8"
		}
	  ],
	  "name": "feeWei",
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
		  "name": "requestId",
		  "type": "uint256"
		}
	  ],
	  "name": "fetchRuling",
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
	  "name": "metaEvidenceURI",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
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
		  "internalType": "uint8",
		  "name": "discount",
		  "type": "uint8"
		},
		{
		  "internalType": "uint8",
		  "name": "affiliatePercent",
		  "type": "uint8"
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
		},
		{
		  "internalType": "bool",
		  "name": "canUseCoupons",
		  "type": "bool"
		},
		{
		  "internalType": "enum IUserRegistry.Security",
		  "name": "level",
		  "type": "uint8"
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
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "name": "requests",
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
		  "internalType": "contract IArbitrableProxy",
		  "name": "arbitrator",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "externalDisputeId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "localDisputeId",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "requestsCounter",
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
		  "internalType": "uint8",
		  "name": "percent",
		  "type": "uint8"
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
		  "internalType": "enum IUserRegistry.Security",
		  "name": "level",
		  "type": "uint8"
		},
		{
		  "internalType": "uint256",
		  "name": "fw",
		  "type": "uint256"
		}
	  ],
	  "name": "setFee",
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
		  "internalType": "uint8",
		  "name": "discount",
		  "type": "uint8"
		},
		{
		  "internalType": "uint8",
		  "name": "affPercent",
		  "type": "uint8"
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