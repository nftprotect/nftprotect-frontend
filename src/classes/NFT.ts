import { 
    Nft as NFTInterface, 
    NftContract,
    NftTokenType,
    TokenUri,
    Media,
    SpamInfo,
    NftMetadata
} from "alchemy-sdk";
import { Contract } from '@ethersproject/contracts';
import ERC721ABI from "../abi/ERC721ABI";
import ERC1155ABI from "../abi/ERC1155ABI";
import { BigNumber } from '@ethersproject/bignumber'
import { AppContextInterface } from "../context/AppContextProvider";

export interface OriginalNFTData {
    ownerAddress: string,
    tokenId: string,
    contractAddress: string,
    tokenType: NftTokenType
    amount: number,
    securityLevel: number
}

export interface ActionRequest {
    id: BigNumber,
    reqtype: number,
    tokenId: BigNumber,
    newowner: string,
    timeout: BigNumber,
    status: RequestStatus,
    arbitrator: string,
    localDisputeId: BigNumber,
    externalDisputeId: BigNumber
}

export enum RequestStatus {
    Initial,
    Accepted,
    Rejected,
    Disputed
}

export enum NFTEvents {
    OriginalNFTDataLoaded = 'originalNFTDataLoaded',
    PendingRequestLoaded = 'pendingRequestLoaded'
}

enum NftProtectStandard
{
    ERC721,
    ERC1155,
    ERC20
}

export default class NFT implements NFTInterface {
    tokenId: string;
    /** The type of ERC token, if known. */
    tokenType: NftTokenType;
    /** The NFT's underlying contract and relevant contract metadata. */
    contract: NftContract;
    /** The NFT title. */
    title: string;
    /** The NFT description. */
    description: string;
    /** When the NFT was last updated in the blockchain. Represented in ISO-8601 format. */
    timeLastUpdated: string;
    /** Holds an error message if there was an issue fetching metadata. */
    metadataError: string | undefined;
    /**
     * The raw metadata fetched from the metadata URL specified by the NFT. The
     * field is undefined if Alchemy was unable to fetch metadata.
     */
    rawMetadata: NftMetadata | undefined;
    /** URIs for accessing the NFT's metadata blob. */
    tokenUri: TokenUri | undefined;
    /** URIs for accessing the NFT's media assets. */
    media: Media[];
    /** Detailed information on why an NFT was classified as spam. */
    spamInfo: SpamInfo | undefined;
    /** Holds loaded owner address */
    ownerAddress: string | undefined
    /** Holds original data */
    originalData: OriginalNFTData | undefined
    /** Holds thumbnail */
    thumbnail: string
    /** Holds token amount */
    amount: number | undefined
    /** Holds application context */
    context: AppContextInterface
    /** Holds loaded ethers contract object */
    loadedContract: Contract
    //** Holds pending request data */
    pendingRequest: ActionRequest | undefined

    private events: EventTarget
    private nullAddress = '0x0000000000000000000000000000000000000000'

    //** Returns true if NFT is pNFT issued by NFTProtect */
    isPNFT(): boolean {
        return (this.contract.address.toLowerCase() === this.context.nftProtectContract.address.toLowerCase())
    }

    //** Returns true if NFT is pNFT transfered to another address */
    isOnAnotherAddress():boolean {
        if (this.context.account) {
            return this.isPNFT() ? 
                !this.isOwnedBy(this.context.account) :
                false
        } else {
            throw Error('Context is not initialized')
        }
    }

    //** Returns true if original is owned by current account */
    isOriginalOwnedByAccount():boolean {
        if (this.context.account) {
            if (this.isPNFT()) {
                if (this.originalData) {
                    return this.originalData.ownerAddress.toLowerCase() === this.context.account.toLowerCase()
                } else {
                    throw new Error('Original data is not loaded')
                }
            } else {
                return true
            }
        } else {
            throw Error('Context is not initialized')
        }
    }

    //** Returns true if NFT is burned */
    isBurned(): boolean {
        return (this.ownerAddress === undefined) || (this.ownerAddress === this.nullAddress)
    }

    //** Returns true if nft is owned by address */
    isOwnedBy(address: string) {
        return this.ownerAddress?.toLowerCase() === address.toLowerCase()
    }

    //** Returns true if nft is minted by contract */
    isMintedBy(address: string) {
        return this.contract.address.toLowerCase() === address.toLowerCase()
    }

    /** Loads owner address */
    async loadOwnerAddress() {
        if (this.ownerAddress !== undefined) return
        try {
            this.ownerAddress = await this.loadedContract.ownerOf(this.tokenId)
        } catch (e: any) {
            if (e.reason.includes('invalid token ID')) {
                // do nothing
            } else {
                throw e
            }
        }
    }

    /** Loads token amount */
    async loadTokenAmount() {
        if (this.amount !== undefined) return
        if (this.tokenType == NftTokenType.ERC1155) {
            //try {
                this.amount = await this.loadedContract.balanceOf(this.context.account, BigNumber.from(this.tokenId))
            //} catch {
                //console.log('DDDD', this, this.tokenId, BigNumber.from(this.tokenId))
            //}
        } else {
            this.amount = 1
        }
    }

    //** Runs assigned functions to fetch initial additional data */
    async loadInitialData() {
        return Promise.all([
            this.loadOwnerAddress(),
            this.loadTokenAmount()
        ])
    }

    //** If our NFT is pNFT we have to know about the original NFT */
    loadOriginalNFTData(): void {
        if (!this.isPNFT()) {
          return;
        }
      
        // Function to check if an address is not null
        const isNotNullAddress = (address: string): boolean => address !== this.nullAddress;
      
        // Get NFT data from the contract
        this.context.nftProtectContract.tokens(this.tokenId)
        .then(([standardId, contractAddress, tokenId, amount, owner, securityLevel]: any[]) => {
            // Create an object with the retrieved data
            const nftData:any = {
                tokenId: tokenId.toString(),
                amount,
                contractAddress,
                ownerAddress: owner,
                securityLevel,
            };
            
            // Determine the NFT token type based on the standard ID
            switch (standardId) {
                case NftProtectStandard.ERC721:
                    nftData.tokenType = NftTokenType.ERC721;
                break;
                case NftProtectStandard.ERC1155:
                    nftData.tokenType = NftTokenType.ERC1155;
                break;
                case NftProtectStandard.ERC20:
                default:    
                    nftData.tokenType = NftTokenType.NO_SUPPORTED_NFT_STANDARD;
                break;
            }
        
            // Store the original NFT data and dispatch an event to notify listeners
            this.originalData = { ...nftData };
            console.log('ORIGDATA', this.originalData, this.tokenId);
            this.dispatchEvent(new Event(NFTEvents.OriginalNFTDataLoaded));
        });
    }

    //** Loads a pending request if exists */
    loadPendingRequest():void {
        if (this.isPNFT()) {
            const nftProtectContract = this.context.nftProtectContract
            nftProtectContract.tokenToRequest(this.tokenId).then((requestId: BigNumber) => {
                if (requestId.toString() !== '0') {
                    nftProtectContract.requests(requestId).then((request: any) => {
                        this.pendingRequest = {id: requestId, ...request}
                        this.dispatchEvent(new Event(NFTEvents.PendingRequestLoaded))
                    })
                }
            })
        }
    }

    //** Runs assigned functions to fetch another additional data */
    loadAnotherData() {
        this.loadOriginalNFTData()
        this.loadPendingRequest()
    }

    //** Add event listener */
    addEventListener(eventType: string, listener: EventListener) {
        this.events.addEventListener(eventType, listener);
    }

    //** Remove event listener */
    removeEventListener(eventType: string, listener: EventListener) {
        this.events.removeEventListener(eventType, listener);
    }

    //** Dispatch evenet */
    dispatchEvent(event: Event) {
        this.events.dispatchEvent(event);
    }

    constructor(alchemyNFT: NFTInterface, context: AppContextInterface, otherProps?: any) {
        this.tokenId = alchemyNFT.tokenId;
        this.tokenType = alchemyNFT.tokenType;
        this.contract = alchemyNFT.contract;
        this.title = alchemyNFT.title || alchemyNFT.contract.name || '';
        this.description = alchemyNFT.description;
        this.timeLastUpdated = alchemyNFT.timeLastUpdated;
        this.metadataError = alchemyNFT.metadataError;
        this.tokenUri = alchemyNFT.tokenUri;
        this.rawMetadata = alchemyNFT.rawMetadata;
        this.media = alchemyNFT.media;
        this.spamInfo = alchemyNFT.spamInfo;
        this.thumbnail = this.media && this.media[0] && this.media[0].thumbnail || './images/noImage.png'
        this.context = context
        this.events = new EventTarget();

        if (otherProps) {
            Object.assign(this, otherProps);
        }

        this.loadedContract = (this.tokenType === NftTokenType.ERC721) ?
            new Contract(this.contract.address, ERC721ABI, context.active ? context.library.getSigner() : context.library) :
            new Contract(this.contract.address, ERC1155ABI, context.active ? context.library.getSigner() : context.library)
    }
  
}