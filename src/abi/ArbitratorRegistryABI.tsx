const ArbitratorRegistryABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
		"name": "ArbitratorAddRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "manager",
				"type": "address"
			}
		],
		"name": "ArbitratorAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			}
		],
		"name": "ArbitratorDeleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "manager",
				"type": "address"
			}
		],
		"name": "ArbitratorManagerChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "contr",
				"type": "address"
			}
		],
		"name": "ContractAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "contr",
				"type": "address"
			}
		],
		"name": "ContractRemoved",
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
		"name": "ContractsAddRequested",
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
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			}
		],
		"name": "DisputeAccepted",
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
		"name": "DisputeRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "extraData",
				"type": "bytes"
			}
		],
		"name": "OperationAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "extraData",
				"type": "bytes"
			}
		],
		"name": "OperationChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			}
		],
		"name": "OperationRemoved",
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
		"name": "OperationsAddRequested",
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
				"indexed": false,
				"internalType": "contract IArbitrableProxy",
				"name": "arbitratorProxy",
				"type": "address"
			}
		],
		"name": "SetMasterArbitrator",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "extraData",
				"type": "bytes"
			}
		],
		"name": "SetMasterOperation",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arb",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "operations",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "extraData",
				"type": "bytes[]"
			},
			{
				"internalType": "address[]",
				"name": "contracts",
				"type": "address[]"
			},
			{
				"internalType": "string",
				"name": "evidence",
				"type": "string"
			}
		],
		"name": "addArbitrator",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "contracts",
				"type": "address[]"
			},
			{
				"internalType": "string",
				"name": "evidence",
				"type": "string"
			}
		],
		"name": "addContracts",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "operations",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "extraData",
				"type": "bytes[]"
			},
			{
				"internalType": "string",
				"name": "evidence",
				"type": "string"
			}
		],
		"name": "addOperations",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			}
		],
		"name": "arbitrationCost",
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
				"internalType": "contract IArbitrableProxy",
				"name": "",
				"type": "address"
			}
		],
		"name": "arbitrators",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "manager",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "allContracts",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newManager",
				"type": "address"
			}
		],
		"name": "changeArbitratorManager",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "operations",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes[]",
				"name": "extraData",
				"type": "bytes[]"
			}
		],
		"name": "changeOperations",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			}
		],
		"name": "checkArbitrator",
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
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "contr",
				"type": "address"
			}
		],
		"name": "checkArbitratorByOperation",
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
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			}
		],
		"name": "deleteArbitrator",
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
		"name": "disputes",
		"outputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "master",
				"type": "address"
			},
			{
				"internalType": "enum DyArbitratorRegistry.MasterOperations",
				"name": "op",
				"type": "uint8"
			},
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arb",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "manager",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "operation",
				"type": "uint256"
			}
		],
		"name": "extraDataForOperation",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
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
		"name": "fetchRuling",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "master",
		"outputs": [
			{
				"internalType": "contract IArbitrableProxy",
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
				"internalType": "enum DyArbitratorRegistry.MasterOperations",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "masterExtraData",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum DyArbitratorRegistry.MasterOperations",
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
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "contracts",
				"type": "address[]"
			}
		],
		"name": "removeContracts",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IArbitrableProxy",
				"name": "arbAddr",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "operations",
				"type": "uint256[]"
			}
		],
		"name": "removeOperations",
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
				"internalType": "contract IArbitrableProxy",
				"name": "arb",
				"type": "address"
			},
			{
				"internalType": "bytes[]",
				"name": "extraData",
				"type": "bytes[]"
			},
			{
				"internalType": "string[]",
				"name": "evidence",
				"type": "string[]"
			}
		],
		"name": "setMaster",
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

export default ArbitratorRegistryABI