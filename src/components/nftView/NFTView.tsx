import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
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

const NFTView = () => {
    const { getNftsForOwner, getNftMetadata, getNftsForContract, getMintedNfts, getOwnersForNft } = useAlchemy()
    const appContext = useAppContext()
    const { currentChain, account, active, library, nftProtectContract } = appContext
    const { isOpen, onToggle } = useDisclosure()
    // Holds component data refresh while refreshPaused
    const [ refreshPaused, setRefreshPaused ] = useState(false)
    const [ refreshNeeded, setRefreshNeeded ] = useState(false)

    const reFetch = (force = false) => {
        if (force) {
            setRefreshNeeded(false)
            console.log('Fetching NFTs forced...')
            fetchAllNfts()
        } else {
            if (refreshPaused) {
                console.log('Fetching NFTs paused, waiting...')
                setRefreshNeeded(true)
            } else if (!refreshNeeded) {
                console.log('Fetching NFTs...')
                fetchAllNfts()
            }
        }
    }

    const renderNFT = (nft: NFT) => {
        console.log('NFT: ', nft.title, nft)
        return <NFTCard
            key={`${nft.contract.address}:${nft.tokenId}`}
            nft={nft}
            nftReFetch={reFetch}
            setRefreshPaused={setRefreshPaused}
        />
    }

    const subscribeNftTransfers = () => {
        const nftEventReceived = () => {
            reFetch()
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
        // Update data when refresh unpaused if needed
        if (!refreshPaused) {
            if (refreshNeeded) {
                fetchAllNfts()
                setRefreshNeeded(false)
                console.log('Fetching NFTs after pause...')
            }
        }
    }, [refreshPaused, refreshNeeded])

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
            <Accordion border="none" defaultIndex={[0, 1, 2]}>
                <AccordionItem 
                    bgGradient="linear(180deg, dark 70%, #FFF 70%)"
                    px={['1rem', '3rem']}
                >
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton px="0" py={[4, 6]}>
                            <Flex flexDirection="column" alignItems="flex-start">
                                <Text textStyle="h2">
                                    <Trans>All your NFT</Trans> 
                                </Text>
                                <Text textStyle="h3">
                                    <Trans>{"It's all not protected yet"}</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>

                    <AccordionPanel px="0" pb={4}>
                        { myOwnNfts && (myOwnNfts.length > 0) ? 
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { myOwnNfts.map(nft => renderNFT(nft)) }
                        </Grid> : 
                        <Text color={'#FFF'}><Trans>You have no NFTs in your wallet.</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem 
                    px={['1rem', '3rem']} 
                    bgGradient="linear(180deg, dark 70%, #FFF 70%)"
                >
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton px="0" py={[4, 6]}>
                            <Flex flexDirection="column" alignItems="flex-start">
                                <Text textStyle="h2">
                                    <Trans>Transfered pNFT</Trans> 
                                </Text>
                                <Text textStyle="h3">
                                    <Trans>This section displays your pNFTs that were moved to another adresses</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel px="0" pb={4}>
                        { givenPNfts && (givenPNfts.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { givenPNfts.map(nft => renderNFT(nft)) }
                        </Grid> :
                        <Text color={'#FFF'}><Trans>You have no pNFTs transfered to third parties.</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem 
                    bgImage="url('./images/shieldBackground.png'), linear-gradient(180deg, #0D0E14 70%, #FFF 70%)"
                    bgRepeat="no-repeat"
                    bgPosition="right 110px top 76px, top left"
                    bgSize="auto calc(100% - 76px), cover"
                    px={['1rem', '3rem']}
                >
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton px="0" py={[4, 6]}>
                            <Flex flexDirection="column" alignItems="flex-start">
                                <Text textStyle="h2">
                                    <Trans>All your protected assets</Trans> 
                                </Text>
                                <Text textStyle="h3">
                                    <Trans>This section displays all the pNFTs that you own</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel px="0" pb={4}>
                        { ownedPNfts && (ownedPNfts.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { ownedPNfts.map(nft => renderNFT(nft)) }
                        </Grid> :
                        <Text color={'#FFF'}><Trans>You have no protected NFTs yet</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
)}

export default NFTView