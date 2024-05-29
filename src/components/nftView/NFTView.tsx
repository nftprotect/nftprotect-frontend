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
import { TokenGraphData, convertTokenGraphData, useNftProtectGraph } from '../../hooks/useNftProtectGraph';
import useERC1155 from '../../hooks/useERC1155';
import NFTProtectABI from '../../abi/NFTProtectABI';
import { usePublicClient } from 'wagmi';
import { Log } from 'viem';
import { nftMarketplaces } from '../../config';

const NFTView = () => {
    const { nft: nftApi } = useAlchemy()
    const { currentChain, account, active, defaultChain } = useAppContext()
    const { getBalance } = useERC1155(currentChain?.id || defaultChain.id)
    const { listTokensTransfered, listTokensOwned } = useNftProtectGraph(currentChain?.id || defaultChain.id);
    const publicClient = usePublicClient({chainId: currentChain?.id || defaultChain.id})

    const marketplaces = currentChain?.wagmiId?.testnet ?
        nftMarketplaces.testnet :
        nftMarketplaces.mainnet

    // Stores original NFTs (not protected) owned by account
    const [myOwnNfts, setMyOwnNfts] = useState<NFT[]>()
    // Stores all pNFTs owned by account
    const [ownedPNfts, setOwnedPNfts] = useState<NFT[]>()
    // Stores pNFTs given to another accounts
    const [givenPNfts, setGivenPNfts] = useState<NFT[]>()

    const renderNFT = (nft: NFT) => {
        console.log('NFT: ', nft.title, nft)
        return <NFTCard
            key={`${nft.contract.address}:${nft.tokenId}`}
            nft={nft}
        />
    }

    const subscribeNftTransfers = () => {
        const onEvent = (logs: any) => {
            console.log('NFT Protect event:', logs);
            fetchAllNfts();
        }

        const config = {
            address: currentChain.nftpContractAddress,
            abi: NFTProtectABI,
            onLogs: (logs: Log[]) => {
                const foundLog = logs.find(
                    // Only events for account (oldowner and newowner)
                    (log: any) => log.args && account && 
                        ((log.args.newowner.toLowerCase() === account.toLowerCase()) ||
                        (log.args.oldowner.toLowerCase() === account.toLowerCase()))
                );
                if (foundLog) {
                    onEvent(logs);
                }
            }
        };

        // Transfer uses to and from args
        const uwatchTransfer = publicClient!.watchContractEvent({
            ...config,
            eventName: 'Transfer',
            onLogs: (logs: Log[]) => {
                const foundLog = logs.find(
                    (log: any) => log.args && account &&
                        ((log.args.to.toLowerCase() === account.toLowerCase()) ||
                        (log.args.from.toLowerCase() === account.toLowerCase()))
                );
                if (foundLog) {
                    onEvent(logs);
                }
            }
        });

        // Unprotect uses dst args
        const uwatchUnprotected = publicClient!.watchContractEvent({
            ...config,
            eventName: 'Unprotected',
            onLogs: (logs: Log[]) => {
                const foundLog = logs.find(
                    (log: any) => log.args && account &&
                        (log.args.dst.toLowerCase() === account.toLowerCase())
                );
                if (foundLog) {
                    config.onLogs(logs);
                }
            }
        }); 
    
        const uwatchOwnershipAdjusted = publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipAdjusted'
        });
    
        const uwatchOwnershipAdjustmentAsked = publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipAdjustmentAsked'
        });
    
        const uwatchOwnershipRestoreAsked = publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipRestoreAsked'
        });

        const uwatchOwnershipAdjustmentArbitrateAsked= publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipAdjustmentArbitrateAsked'
        })
        const uwatchOwnershipAdjustmentAnswered= publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipAdjustmentAnswered'
        })
        const uwatchOwnershipRestoreAnswered= publicClient!.watchContractEvent({
            ...config,
            eventName: 'OwnershipRestoreAnswered',
            onLogs: (logs: Log[]) => {
                const foundLog = logs.find(
                    // Only events for account (oldowner and newowner)
                    // Exclude accept to prevent duplicate loading because Transfer event will be fired
                    (log: any) => log.args && !log.args.accept && account &&
                        ((log.args.newowner.toLowerCase() === account.toLowerCase()) ||
                        (log.args.oldowner.toLowerCase() === account.toLowerCase()))
                );
                if (foundLog) {
                    onEvent(logs);
                }
            }
        })
    
        return () => {
            uwatchTransfer();
            uwatchUnprotected();
            uwatchOwnershipAdjusted();
            uwatchOwnershipAdjustmentAsked();
            uwatchOwnershipRestoreAsked();
            uwatchOwnershipAdjustmentArbitrateAsked();
            uwatchOwnershipAdjustmentAnswered();
            uwatchOwnershipRestoreAnswered();
        };
    };

    // Loads all the NFTs (NOT pNFTs) owned by user
    const fetchOwnedNfts = () => {
        if (currentChain && account) {
            // Own NFTs
            nftApi.getNftsForOwner(
                account
            ).then(({blockHash, ownedNfts, totalCount}) => {
                const nftObjects = ownedNfts
                    // Remove all the pNFTs
                    .filter((item: NFTInterface) => {
                        return item.contract.address.toLowerCase() !== currentChain.nftpContractAddress.toLowerCase()
                    })
                    .map((item: NFTInterface) => {
                        return new NFT(item, {ownerAddress: account})
                    })
                // Load amounts for every ERC1155
                Promise.all(nftObjects.map(async (nft: NFT) => {
                    const amount = (nft.tokenType === NftTokenType.ERC1155) ?
                        await getBalance(nft.contract.address as `0x${string}`, nft.tokenId, account) || 1 :
                        1;
                    nft.amount = Number(amount); // TODO: use BigNumber/bigint
                    return amount;
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
                return new NFT(details, convertTokenGraphData(originalData!));
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
    useEffect(() => {
        console.log('Fetching all NFTs'); // Trying to catch requests in requestId
        fetchAllNfts();
    }, [currentChain, account]);

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
            <ProtectNftDialog/>
            <UnProtectNftDialog/>
            <LostPNftDialog />
            <OriginalNftRequestedDialog/> 
            <TransferOriginalNftDialog/> 
            <DoNotTransferOriginalNftDialog/> 
            <RequestOriginalNftDialog/> 
            <ArbitrateOwnershipAdjustmentDialog/> 
        </>
)}

export default NFTView