import {
    Grid,
    Heading,
    Text,
    InputGroup,
    Input,
    IconButton,
    Flex,
    useDisclosure
} from '@chakra-ui/react'
import NFTCard from './NFTCard'
import { nftpContractAddress } from '../../utils/config'
import { useAppContext } from '../../context/AppContextProvider';
import { Trans } from '@lingui/macro'
import { useState, useEffect } from 'react';
import { useAlchemy } from '../../hooks/useAlchemy';
import { Nft as NFTInterface, NftFilters } from 'alchemy-sdk';
import NFT from '../../classes/NFT';
import KlerosCaseDialog from '../dialogs/klerosCase/KlerosCaseDialog';
import ProtectNftDialog from '../dialogs/nft/ProtectNftDialog';
import UnProtectNftDialog from '../dialogs/nft/UnProtectNftDialog';
import LostPNftDialog from '../dialogs/nft/LostPNftDialog';
import DoNotTransferOriginalNftDialog from '../dialogs/nft/DoNotTransferOriginalNftDialog';
import OriginalNftRequestedDialog from '../dialogs/nft/OriginalNftRequestedDialog';
import TransferOriginalNftDialog from '../dialogs/nft/TransferOriginalNftDialog';
import RequestOriginalNftDialog from '../dialogs/nft/RequestOriginalNftDialog';
import ArbitrateOwnershipAdjustmentDialog from '../dialogs/nft/ArbitrateOwnershipAdjustmentDialog';

const NFTView = () => {
    const { getNftsForOwner, getNftMetadata, getNftsForContract, getMintedNfts, getOwnersForNft } = useAlchemy()
    const appContext = useAppContext()
    const { currentChain, account, active, library, nftProtectContract } = appContext
    const { isOpen, onToggle } = useDisclosure()

    const renderNFT = (nft: NFT) => {
        console.log('NFT: ', nft.title, nft)
        return <NFTCard
            key={`${nft.contract.address}:${nft.tokenId}`}
            nft={nft}
            nftReFetch={fetchAllNfts}
        />
    }

    const subscribeNftTransfers = () => {
        const nftEventReceived = () => {
            fetchAllNfts()
        }
        let fromMe:any 
        let toMe:any
        if (account && active) {
            fromMe = nftProtectContract.filters.Transfer(account, null)
            toMe = nftProtectContract.filters.Transfer(null, account)
            nftProtectContract.on(fromMe, nftEventReceived)
            nftProtectContract.on(toMe, nftEventReceived)
        }
        return () => {
            fromMe && nftProtectContract.removeAllListeners(toMe)
            toMe && nftProtectContract.removeAllListeners(fromMe)
        }
    }

    // Stores all NFTs owned by account (with pNFTS)
    const [ownedNfts, setOwnedNfts] = useState<NFT[]>()
    // Stores all pNFTs minted by account (owned and given)
    const [mintedNfts, setMintedNfts] = useState<NFT[]>()

    // Stores original NFTs (not protected) owned by account
    const [myOwnNfts, setMyOwnNfts] = useState<NFT[]>()
    // Stores all pNFTs owned by account
    const [ownedPNfts, setOwnedPNfts] = useState<NFT[]>()
    // Stores pNFTs given to another accounts
    const [givenPNfts, setGivenPNfts] = useState<NFT[]>()

    // Loads all the NFTs and pNFTs owned by user
    const fetchOwnedNfts = () => {
        if (currentChain && account) {
            // Own NFTs
            getNftsForOwner([
                account
            ]).then(({blockHash, ownedNfts, totalCount}) => {
                const nftObjects = ownedNfts
                    .map((item: NFTInterface) => {
                        return new NFT(item, appContext, {ownerAddress: account})
                    })
                Promise.all(nftObjects.map((nft: NFT) => {
                    return nft.loadInitialData()
                })).then(() => {
                    console.log('ALCHEMY ALL MY NFTS:', nftObjects)
                    setOwnedNfts(nftObjects);
                })
            })
        }
    }

    // Loads all the pNFTs minted by user
    const fetchMintedNfts = () => {
        if (currentChain && account) {
            // pNFTs
            getMintedNfts([
                account,
                {
                    contractAddresses: [nftpContractAddress]
                }
            ]).then(({blockHash, nfts, totalCount}) => {
                const nftObjects = nfts
                    .map((item: NFTInterface) => {
                        return new NFT(item, appContext)
                    })
                
                Promise.all(nftObjects.map((nft: NFT) => {
                    return nft.loadInitialData()
                })).then(() => {
                    console.log('ALCHEMY ALL pNFTS:', nftObjects)
                    setMintedNfts(nftObjects);
                })
            })
        }
    }

    const fetchAllNfts = () => {
        fetchOwnedNfts()
        fetchMintedNfts()
    }



    // Reload NFTs when chain or account changed
    useEffect(fetchAllNfts, [currentChain, account])

    useEffect(() => {
        // non-protected NFTs owned by account
        setMyOwnNfts(
            ownedNfts?.filter((item: NFT) => {
                return !item.isMintedBy(nftpContractAddress)
            })
        )

        // all pNFTs owned by account (minted by him or another account)
        setOwnedPNfts(
            ownedNfts?.filter((item: NFT) => {
                return item.isMintedBy(nftpContractAddress)
            })
        )
    }, [ownedNfts])

    useEffect(() => {
        if (account) {
            setGivenPNfts(
                mintedNfts?.filter((item: NFT) => {
                    return !item.isBurned() && !item.isOwnedBy(account)
                })
            )
        }
    }, [mintedNfts])

    useEffect(() => {
        console.log('MY OWN NFTS', myOwnNfts)
        console.log('OWNED pNFTS', ownedPNfts)
        console.log('GIVEN pNFTS', givenPNfts)
    },[myOwnNfts, ownedPNfts, givenPNfts])

    useEffect(subscribeNftTransfers, [account, active])

    return (
        <>
            { myOwnNfts && (myOwnNfts.length > 0) &&
                <Flex px={['1rem', '3rem']} flexDirection="column" mb={{base: "20px"}}>
                    <Flex flexDirection="column" alignItems="flex-start" mb={{base: "20px"}}>
                        <Text textStyle="h2">
                            <Trans>All your NFTs</Trans> 
                        </Text>
                        <Text textStyle="h3">
                            <Trans>{"It's all not protected yet"}</Trans>
                        </Text>
                    </Flex>

                    <Grid
                        templateColumns={{
                            base: "repeat(auto-fill, 8rem)",
                            sm: "repeat(auto-fill, 10rem)",
                            md: "repeat(auto-fill, 12rem)",
                        }}
                        gap={[6]}
                        borderBottom="2px solid" borderColor="brand.light"
                        pb={{base: "20px"}}
                    >
                        { myOwnNfts.map(nft => renderNFT(nft)) }
                    </Grid>
                </Flex>
            }

            { givenPNfts && (givenPNfts.length > 0) &&
                <Flex  px={['1rem', '3rem']} flexDirection="column" mb={{base: "20px"}}>
                    <Flex flexDirection="column" alignItems="flex-start" mb={{base: "20px"}}>
                        <Text textStyle="h2">
                            <Trans>Transfered pNFT</Trans> 
                        </Text>
                        <Text textStyle="h3">
                            <Trans>This section displays your pNFTs that were moved to another adresses</Trans>
                        </Text>
                    </Flex>
                        
                    <Grid
                        templateColumns={{
                            base: "repeat(auto-fill, 8rem)",
                            sm: "repeat(auto-fill, 10rem)",
                            md: "repeat(auto-fill, 12rem)",
                        }}
                        gap={[6]}
                        borderBottom="2px solid" borderColor="brand.light"
                        pb={{base: "20px"}}
                    >
                        { givenPNfts.map(nft => renderNFT(nft)) }
                    </Grid>
                </Flex>
            }

            { ownedPNfts && (ownedPNfts.length > 0) &&
                <Flex  px={['1rem', '3rem']} flexDirection="column" mb={{base: "20px"}}>
                    <Flex flexDirection="column" alignItems="flex-start" mb={{base: "20px"}}>
                        <Text textStyle="h2">
                            <Trans>All your protected assets</Trans> 
                        </Text>
                        <Text textStyle="h3">
                            <Trans>This section displays all the NFTs and their associated pNFTs that you own</Trans>
                        </Text>
                    </Flex>
                        
                    <Grid
                        templateColumns={{
                            base: "repeat(auto-fill, 8rem)",
                            sm: "repeat(auto-fill, 10rem)",
                            md: "repeat(auto-fill, 12rem)",
                        }}
                        gap={[6]}
                        pb={{base: "20px"}}
                    >
                        { ownedPNfts.map(nft => renderNFT(nft)) }
                    </Grid>
                    </Flex>
            }

            {/** Dialogs registration following */}
            <KlerosCaseDialog/>
            <ProtectNftDialog nftReFetch={ fetchAllNfts } />
            <UnProtectNftDialog nftReFetch={ fetchAllNfts } />
            <LostPNftDialog nftReFetch={ fetchAllNfts } />
            <OriginalNftRequestedDialog nftReFetch={ fetchAllNfts } />
            <TransferOriginalNftDialog nftReFetch={ fetchAllNfts } />
            <DoNotTransferOriginalNftDialog nftReFetch={ fetchAllNfts } />
            <RequestOriginalNftDialog nftReFetch={ fetchAllNfts } />
            <ArbitrateOwnershipAdjustmentDialog nftReFetch={ fetchAllNfts } />
        </>
)}

export default NFTView