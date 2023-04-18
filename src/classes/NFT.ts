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
    originalData: any
    /** Holds thumbnail */
    thumbnail: string
    /** Holds token amount */
    amount: number | undefined
    /** Holds application context */
    context: AppContextInterface
    /** Holds loaded ethers contract object */
    loadedContract: Contract

    //** Returns true if NFT is burned */
    isBurned(): boolean {
        return (this.ownerAddress === '0x0000000000000000000000000000000000000000') || (this.ownerAddress === undefined) 
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

    //** Runs assigned functions to fetch another additional data */
    loadAnotherData() {
        
    }

    constructor(alchemyNFT: NFTInterface, context: AppContextInterface, otherProps?: any) {
        this.tokenId = alchemyNFT.tokenId;
        this.tokenType = alchemyNFT.tokenType;
        this.contract = alchemyNFT.contract;
        this.title = alchemyNFT.title;
        this.description = alchemyNFT.description;
        this.timeLastUpdated = alchemyNFT.timeLastUpdated;
        this.metadataError = alchemyNFT.metadataError;
        this.tokenUri = alchemyNFT.tokenUri;
        this.rawMetadata = alchemyNFT.rawMetadata;
        this.media = alchemyNFT.media;
        this.spamInfo = alchemyNFT.spamInfo;
        this.thumbnail = this.media && this.media[0] && this.media[0].thumbnail || './images/noImage.png'
        this.context = context

        if (otherProps) {
            Object.assign(this, otherProps);
        }

        this.loadedContract = (this.tokenType === NftTokenType.ERC721) ?
            new Contract(this.contract.address, ERC721ABI, context.library?.getSigner()) :
            new Contract(this.contract.address, ERC1155ABI, context.library?.getSigner())
    }
  
}