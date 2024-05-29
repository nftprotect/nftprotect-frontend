const NFTProtectABI = [
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "areg",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "signatureVerifier",
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
		  "indexed": false,
		  "internalType": "bool",
		  "name": "allowed",
		  "type": "bool"
		}
	  ],
	  "name": "AllowThirdPartyTransfersChanged",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "approved",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
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
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "ApprovalForAll",
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
		  "indexed": false,
		  "internalType": "string",
		  "name": "base",
		  "type": "string"
		}
	  ],
	  "name": "BaseChanged",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "boa",
		  "type": "bool"
		}
	  ],
	  "name": "BurnOnActionChanged",
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
		  "indexed": false,
		  "internalType": "address",
		  "name": "mel",
		  "type": "address"
		}
	  ],
	  "name": "MetaEvidenceLoaderChanged",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "evidenceType",
		  "type": "uint8"
		},
		{
		  "indexed": false,
		  "internalType": "string",
		  "name": "evidence",
		  "type": "string"
		}
	  ],
	  "name": "MetaEvidenceSet",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "OwnershipAdjusted",
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
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "accept",
		  "type": "bool"
		}
	  ],
	  "name": "OwnershipAdjustmentAnswered",
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
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "OwnershipAdjustmentArbitrateAsked",
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
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "OwnershipAdjustmentAsked",
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
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "accept",
		  "type": "bool"
		}
	  ],
	  "name": "OwnershipRestoreAnswered",
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
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "oldowner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "metaEvidenceType",
		  "type": "uint8"
		}
	  ],
	  "name": "OwnershipRestoreAsked",
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
		  "internalType": "uint256",
		  "name": "assetType",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "partner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "contr",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "tokenIdOrig",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "amount",
		  "type": "uint256"
		}
	  ],
	  "name": "Protected",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "newSigVerifier",
		  "type": "address"
		}
	  ],
	  "name": "SignatureVerifierChanged",
	  "type": "event"
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
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
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
		  "internalType": "address",
		  "name": "dst",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "Unprotected",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": false,
		  "internalType": "address",
		  "name": "ureg",
		  "type": "address"
		}
	  ],
	  "name": "UserRegistryChanged",
	  "type": "event"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "signature",
		  "type": "bytes"
		}
	  ],
	  "name": "adjustOwnership",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "allowThirdPartyTransfers",
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
		  "internalType": "uint256",
		  "name": "requestId",
		  "type": "uint256"
		},
		{
		  "internalType": "bool",
		  "name": "accept",
		  "type": "bool"
		},
		{
		  "internalType": "bytes",
		  "name": "signature",
		  "type": "bytes"
		}
	  ],
	  "name": "answerOwnershipAdjustment",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "approve",
	  "outputs": [],
	  "stateMutability": "nonpayable",
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
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "dst",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "arbitratorId",
		  "type": "uint256"
		}
	  ],
	  "name": "askOwnershipAdjustment",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "requestId",
		  "type": "uint256"
		},
		{
		  "internalType": "string",
		  "name": "evidence",
		  "type": "string"
		}
	  ],
	  "name": "askOwnershipAdjustmentArbitrate",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "dst",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "arbitratorId",
		  "type": "uint256"
		},
		{
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "metaEvidenceType",
		  "type": "uint8"
		},
		{
		  "internalType": "string",
		  "name": "evidence",
		  "type": "string"
		}
	  ],
	  "name": "askOwnershipRestoreArbitrate",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		}
	  ],
	  "name": "balanceOf",
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
	  "name": "base",
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
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "dst",
		  "type": "address"
		},
		{
		  "internalType": "bytes",
		  "name": "signature",
		  "type": "bytes"
		}
	  ],
	  "name": "burn",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "burnOnAction",
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
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "signature",
		  "type": "bytes"
		}
	  ],
	  "name": "claim",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bytes32",
		  "name": "",
		  "type": "bytes32"
		}
	  ],
	  "name": "disputeToRequest",
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
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "getApproved",
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
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		}
	  ],
	  "name": "isApprovedForAll",
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
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "candidate",
		  "type": "address"
		}
	  ],
	  "name": "isOriginalOwner",
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
	  "inputs": [
		{
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "",
		  "type": "uint8"
		}
	  ],
	  "name": "metaEvidences",
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
	  "name": "name",
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
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		},
		{
		  "internalType": "uint256[]",
		  "name": "",
		  "type": "uint256[]"
		},
		{
		  "internalType": "uint256[]",
		  "name": "",
		  "type": "uint256[]"
		},
		{
		  "internalType": "bytes",
		  "name": "",
		  "type": "bytes"
		}
	  ],
	  "name": "onERC1155BatchReceived",
	  "outputs": [
		{
		  "internalType": "bytes4",
		  "name": "",
		  "type": "bytes4"
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
		},
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "",
		  "type": "bytes"
		}
	  ],
	  "name": "onERC1155Received",
	  "outputs": [
		{
		  "internalType": "bytes4",
		  "name": "",
		  "type": "bytes4"
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
		},
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "",
		  "type": "bytes"
		}
	  ],
	  "name": "onERC721Received",
	  "outputs": [
		{
		  "internalType": "bytes4",
		  "name": "",
		  "type": "bytes4"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "originalOwnerOf",
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
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "ownerOf",
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
		  "internalType": "enum NFTProtect.Standard",
		  "name": "std",
		  "type": "uint8"
		},
		{
		  "internalType": "address",
		  "name": "contr",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "amount",
		  "type": "uint256"
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
		}
	  ],
	  "name": "protect",
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
		  "internalType": "enum NFTProtect.ReqType",
		  "name": "reqtype",
		  "type": "uint8"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "newowner",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "timeout",
		  "type": "uint256"
		},
		{
		  "internalType": "enum NFTProtect.Status",
		  "name": "status",
		  "type": "uint8"
		},
		{
		  "internalType": "uint256",
		  "name": "arbitratorId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "localDisputeId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "externalDisputeId",
		  "type": "uint256"
		},
		{
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "metaevidence",
		  "type": "uint8"
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
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "_data",
		  "type": "bytes"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bool",
		  "name": "_allow",
		  "type": "bool"
		}
	  ],
	  "name": "setAllowThirdPartyTransfers",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "setApprovalForAll",
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
		  "internalType": "string",
		  "name": "b",
		  "type": "string"
		}
	  ],
	  "name": "setBase",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bool",
		  "name": "boa",
		  "type": "bool"
		}
	  ],
	  "name": "setBurnOnAction",
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
		  "name": "newSigVerifier",
		  "type": "address"
		}
	  ],
	  "name": "setSignatureVerifier",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "ureg",
		  "type": "address"
		}
	  ],
	  "name": "setUserRegistry",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "sigVerifier",
	  "outputs": [
		{
		  "internalType": "contract SignatureVerifier",
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
		  "internalType": "enum NFTProtect.MetaEvidenceType",
		  "name": "evidenceType",
		  "type": "uint8"
		},
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
		  "internalType": "bytes4",
		  "name": "interfaceId",
		  "type": "bytes4"
		}
	  ],
	  "name": "supportsInterface",
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
	  "name": "symbol",
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
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenToRequest",
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
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenURI",
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
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "name": "tokens",
	  "outputs": [
		{
		  "internalType": "enum NFTProtect.Standard",
		  "name": "standard",
		  "type": "uint8"
		},
		{
		  "internalType": "address",
		  "name": "contr",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "amount",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "nonce",
		  "type": "uint256"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "tokensCounter",
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
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "transferFrom",
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
	},
	{
	  "inputs": [],
	  "name": "userRegistry",
	  "outputs": [
		{
		  "internalType": "contract IUserRegistry",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	}
]

export default NFTProtectABI