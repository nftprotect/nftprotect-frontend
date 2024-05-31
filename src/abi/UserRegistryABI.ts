const UserRegistryABI = [
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "areg",
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
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "account",
		  "type": "address"
		}
	  ],
	  "name": "AddressInsufficientBalance",
	  "type": "error"
	},
	{
	  "inputs": [],
	  "name": "FailedInnerCall",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "amount",
		  "type": "uint256"
		}
	  ],
	  "name": "IncorrectPaymentAmount",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint8",
		  "name": "discount",
		  "type": "uint8"
		}
	  ],
	  "name": "InvalidDiscount",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "referrer",
		  "type": "address"
		}
	  ],
	  "name": "InvalidReferrer",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "sender",
		  "type": "address"
		}
	  ],
	  "name": "NotNFTProtect",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		}
	  ],
	  "name": "OwnableInvalidOwner",
	  "type": "error"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "account",
		  "type": "address"
		}
	  ],
	  "name": "OwnableUnauthorizedAccount",
	  "type": "error"
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
	  "inputs": [],
	  "name": "Deployed",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "enum IUserRegistry.FeeType",
		  "name": "feeType",
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
		}
	  ],
	  "name": "PartnerDeleted",
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
		  "internalType": "address",
		  "name": "user",
		  "type": "address"
		},
		{
		  "internalType": "enum IUserRegistry.FeeType",
		  "name": "feeType",
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
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "name": "fees",
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
		  "name": "",
		  "type": "address"
		}
	  ],
	  "name": "hasProtections",
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
		  "internalType": "bool",
		  "name": "isRegistered",
		  "type": "bool"
		},
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
		  "name": "sender",
		  "type": "address"
		},
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
		  "internalType": "enum IUserRegistry.FeeType",
		  "name": "feeType",
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
	  "inputs": [],
	  "name": "renounceOwnership",
	  "outputs": [],
	  "stateMutability": "nonpayable",
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
		  "internalType": "enum IUserRegistry.FeeType",
		  "name": "feeType",
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
		  "internalType": "address",
		  "name": "newOwner",
		  "type": "address"
		}
	  ],
	  "name": "transferOwnership",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	}
]
  
export default UserRegistryABI