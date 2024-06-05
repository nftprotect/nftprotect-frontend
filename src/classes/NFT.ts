import { 
    Nft as NFTInterface, 
    NftContract,
    NftTokenType,
    TokenUri,
    Media,
    SpamInfo,
    NftMetadata
} from "alchemy-sdk";
import { centralizeIpfsUrl } from '../utils/ipfs';
import { ActionRequest, OriginalNFTData } from "../hooks/useNftProtect";

const nullAddress = '0x0000000000000000000000000000000000000000'

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
    amount: bigint | undefined
    //** Holds pending request data */
    pendingRequest: ActionRequest | undefined

    //** Returns true if NFT is pNFT transfered to another address */
    isOnAnotherAddress():boolean {
       if (this.originalData) {
            return this.ownerAddress?.toLowerCase() !== this.originalData.ownerAddress.toLowerCase()
       } else {
            return false // if no original data assume it IS original
       }
    }

    //** Returns true if original is owned by current account */
    isOriginalOwnedByAccount(account: `0x${string}`):boolean {
        if (this.originalData) {
            return account.toLowerCase() === this.originalData.ownerAddress.toLowerCase()
       } else {
            return account.toLowerCase() === this.ownerAddress?.toLowerCase() // if no original data assume it IS original
       }
    }

    //** Returns true if NFT is burned */
    isBurned(): boolean {
        return (this.ownerAddress === undefined) || (this.ownerAddress === nullAddress)
    }

    //** Returns true if nft is owned by address */
    isOwnedBy(address: string) {
        return this.ownerAddress?.toLowerCase() === address.toLowerCase()
    }

    //** Returns true if nft is minted by contract */
    isMintedBy(address: string) {
        return this.contract.address.toLowerCase() === address.toLowerCase()
    }

    constructor(alchemyNFT: NFTInterface, otherProps?: any) {
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
        this.thumbnail = this.media && this.media[0] &&  centralizeIpfsUrl(this.media[0].raw) || '/images/no-image.png'

        if (otherProps) {
            Object.assign(this, otherProps);
            if (otherProps.originalData) {
                this.originalData = otherProps.originalData;
            }
        }

    }
  
}