import { 
    Nft as NFTInterface, 
    NftTokenType,
    NftContractForNft,
    NftRawMetadata,
    NftImage
} from "alchemy-sdk";
import { centralizeIpfsUrl } from '../utils/ipfs';
import { ActionRequest, OriginalNFTData } from "../hooks/useNftProtect";

const nullAddress = '0x0000000000000000000000000000000000000000'

export default class NFT implements NFTInterface {
    tokenId: string;
    /** The type of ERC token, if known. */
    tokenType: NftTokenType;
    /** The NFT's underlying contract and relevant contract metadata. */
    contract: NftContractForNft;
    /** The NFT name. */
    name: string|undefined;
    /** The NFT title. */
    title: string;
    /** The NFT description. */
    description: string|undefined;
    /** When the NFT was last updated in the blockchain. Represented in ISO-8601 format. */
    timeLastUpdated: string;
    /**
     * The raw metadata fetched from the metadata URL specified by the NFT. The
     * field is undefined if Alchemy was unable to fetch metadata.
     */
    raw: NftRawMetadata;
    /** URIs for accessing the NFT's metadata blob. */
    tokenUri: string | undefined;
    /** URIs for accessing the NFT's image. */
    image: NftImage;
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
        this.name = alchemyNFT.name;
        this.title = alchemyNFT.name || alchemyNFT.contract.name || '';
        this.description = alchemyNFT.description;
        this.timeLastUpdated = alchemyNFT.timeLastUpdated;
        this.tokenUri = alchemyNFT.tokenUri;
        this.raw = alchemyNFT.raw;
        this.image = alchemyNFT.image;
        this.thumbnail = (this.image.originalUrl && centralizeIpfsUrl(this.image.originalUrl)) || '/images/no-image.png' // At the moment we use original image for thumbnails

        if (otherProps) {
            Object.assign(this, otherProps);
            if (otherProps.originalData) {
                this.originalData = otherProps.originalData;
            }
        }

    }
  
}