import {
    Grid,
    Text,
    Flex,
    Image,
    Link,
    Spinner
} from '@chakra-ui/react'
import NFTCard from './NFTCard'
import { useAppContext } from '../../context/AppContextProvider';
import { Trans } from '@lingui/macro'
import { useState, useEffect } from 'react';
import { useAlchemy } from '../../hooks/useAlchemy';
import { Nft as NFTInterface, NftFilters, NftMetadataBatchToken, NftTokenType } from 'alchemy-sdk';
import NFT, { OriginalNFTData } from '../../classes/NFT';
import KlerosCaseDialog from '../dialogs/klerosCase/KlerosCaseDialog';
import ProtectNftDialog from '../dialogs/nft/ProtectNftDialog';
import UnProtectNftDialog from '../dialogs/nft/UnProtectNftDialog';
import LostPNftDialog from '../dialogs/nft/LostPNftDialog';
import DoNotTransferOriginalNftDialog from '../dialogs/nft/DoNotTransferOriginalNftDialog';
import OriginalNftRequestedDialog from '../dialogs/nft/OriginalNftRequestedDialog';
import TransferOriginalNftDialog from '../dialogs/nft/TransferOriginalNftDialog';
import RequestOriginalNftDialog from '../dialogs/nft/RequestOriginalNftDialog';
import ArbitrateOwnershipAdjustmentDialog from '../dialogs/nft/ArbitrateOwnershipAdjustmentDialog';
import { TokenGraphData, useNftProtectGraph } from '../../hooks/useNftProtectGraph';

const NFTView = () => {
    const { nft: nftApi } = useAlchemy()
    const appContext = useAppContext()
    const { currentChain, account, active, nftProtectContract } = appContext
    const { listTokensTransfered, listTokensOwned } = useNftProtectGraph(currentChain?.id);

    const marketplaces = currentChain?.wagmiId?.testnet ?
        {
            opensea: "https://testnets.opensea.io/",
            rarible: "https://testnet.rarible.com/",
            blur: "https://blur.io/"
        } : {
            opensea: "https://opensea.io/",
            rarible: "https://rarible.com/",
            blur: "https://blur.io/"
        }

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
            toMe && nftProtectContract.removeAllListeners(toMe)
            fromMe && nftProtectContract.removeAllListeners(fromMe)
        }
    }

    // Stores original NFTs (not protected) owned by account
    const [myOwnNfts, setMyOwnNfts] = useState<NFT[]>()
    // Stores all pNFTs owned by account
    const [ownedPNfts, setOwnedPNfts] = useState<NFT[]>()
    // Stores pNFTs given to another accounts
    const [givenPNfts, setGivenPNfts] = useState<NFT[]>()

    // Loads all the NFTs (and NO pNFTs) owned by user
    const fetchOwnedNfts = () => {
        if (currentChain && account) {
            // Own NFTs
            nftApi.getNftsForOwner(
                account
            ).then(({blockHash, ownedNfts, totalCount}) => {
                const nftObjects = ownedNfts
                    // Remove all the pNFTs
                    .filter((item: NFTInterface) => {
                        return item.contract.address.toLowerCase() !== nftProtectContract.address.toLowerCase()
                    })
                    .map((item: NFTInterface) => {
                        return new NFT(item, appContext, {ownerAddress: account})
                    })
                Promise.all(nftObjects.map((nft: NFT) => {
                    return nft.loadInitialData()
                })).then(() => {
                    console.log('ALCHEMY ALL MY NFTS:', nftObjects)
                    setMyOwnNfts(nftObjects);
                })
            }).catch((error) => {
                console.error(error)
                setMyOwnNfts([])
            })
        }
    }

    const convertTokenGraphData = (tokenData: TokenGraphData): Partial<NFT> => {
        let assetType: NftTokenType;
        if (tokenData.assetType === 0) {
            assetType = NftTokenType.ERC721
        } else if (tokenData.assetType === 1) {
            assetType = NftTokenType.ERC1155
        } else {
            assetType = NftTokenType.UNKNOWN
        }
        return {
            ownerAddress: tokenData.ownerAddress,
            originalData: {
                ownerAddress: tokenData.originalOwnerAddress,
                tokenId: tokenData.tokenId.toString(),
                contractAddress: tokenData.contractAddress,
                tokenType: assetType,
                amount: tokenData.amount.toNumber(), 
                nonce: tokenData.nonce.toNumber()
            }
        };
    };

    const fetchNftDetailsInBatches = async (tokensData: TokenGraphData[]) => {
        const batchSize = 100;
        let batchedNfts: NFT[] = [];

        for (let i = 0; i < tokensData.length; i += batchSize) {
            const currentBatch = tokensData.slice(i, i + batchSize);
            const batchTokens: NftMetadataBatchToken[] = currentBatch.map(({id}: TokenGraphData) => ({
                contractAddress: currentChain.nftpContractAddress,
                tokenId: id.toString(),
                tokenType: NftTokenType.ERC721
            }));

            // Fetch every 100 items
            const batchDetails: NFTInterface[] = await nftApi.getNftMetadataBatch(batchTokens);
            // Create nfts
            const nfts: NFT[] = batchDetails.map(details => {
                // Find corresponding TokenGraphData
                const originalData = currentBatch.find(({id}) => id.toString() === details.tokenId);
                return new NFT(details, appContext, convertTokenGraphData(originalData!));
            });
            batchedNfts = batchedNfts.concat(nfts);
        }

        return batchedNfts;
    };

    const fetchOwnedAndGivenPNfts = async () => {
        if (account && currentChain) {
            try {
                const ownedTokensData = await listTokensOwned(account);
                const givenTokensData = await listTokensTransfered(account);
    
                // Concat data for batch request
                const allTokensData = ownedTokensData.concat(givenTokensData);
    
                const allNfts = await fetchNftDetailsInBatches(allTokensData);
    
                const ownedNfts: NFT[] = [];
                const givenNfts: NFT[] = [];
    
                // Grouping using indexes
                allNfts.forEach((nft, index) => {
                    if (index < ownedTokensData.length) {
                        ownedNfts.push(nft);
                    } else {
                        givenNfts.push(nft);
                    }
                });

                // const ownedNfts = allNfts.filter(nft => ownedTokensData.some(token => token.id.toString() === nft.tokenId));
                // const givenNfts = allNfts.filter(nft => givenTokensData.some(token => token.id.toString() === nft.tokenId));
    
                setOwnedPNfts(ownedNfts);
                setGivenPNfts(givenNfts);
            } catch (error) {
                console.error("Error loading NFTs:", error);
            }
        }
    };
    
    const fetchAllNfts = () => {
        fetchOwnedNfts();
        fetchOwnedAndGivenPNfts();
    }

    // Reload NFTs when chain or account changed
    useEffect(fetchAllNfts, [currentChain, account])

    useEffect(() => {
        console.log('MY OWN NFTS', myOwnNfts)
        console.log('OWNED pNFTS', ownedPNfts)
        console.log('GIVEN pNFTS', givenPNfts)
    },[myOwnNfts, ownedPNfts, givenPNfts])

    useEffect(subscribeNftTransfers, [account, currentChain])

    return (
        <>
            <Flex px={['1rem', '3rem']} flexDirection="column" mb={{base: "20px"}}>
                <Flex flexDirection="column" alignItems="flex-start" mb={{base: "20px"}}>
                    <Text textStyle="h2">
                        <Trans>All your NFTs</Trans> 
                    </Text>
                    <Text textStyle="h3">
                        <Trans>{"It's all not protected yet"}</Trans>
                    </Text>
                </Flex>

                { myOwnNfts && (myOwnNfts.length > 0) ? 
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
                    </Grid> :
                    myOwnNfts ? <Flex w="100%" textAlign={'center'} alignItems={'center'} flexDirection="column">
                        <Image w='120' h='120' py="1.5rem" src="/images/no-results.png"/>
                        <Text
                            fontSize={'lg'}
                            fontWeight={800}
                        >
                            <Trans>{"You don't have any NFTs"}</Trans>
                        </Text>
                        <Text
                            fontSize={'lg'}
                        ><Trans>
                            Go get some on 
                            <Link color="#2D7BD6" href={marketplaces['opensea']} target='_blank'>
                                <Text as="span">OpenSea</Text>
                            </Link>, 
                            <Link color="#2D7BD6" href={marketplaces['rarible']} target='_blank'>
                                <Text as="span">Rarible</Text>
                            </Link> or 
                            <Link color="#2D7BD6" href={marketplaces['blur']} target='_blank'>
                                <Text as="span">Blur</Text>
                            </Link>
                                    
                        </Trans></Text>

                    </Flex> :
                    <Spinner/>
                }
            </Flex>

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