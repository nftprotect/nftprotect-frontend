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
import { useEvmWalletNFTs, useEvmNFTMetadata } from '@moralisweb3/next';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import NFTCard from './NFTCard'
import { nftpContractAddress } from '../../utils/config'
import { useAppContext } from '../../context/AppContextProvider';
import { Trans } from '@lingui/macro'
import { useState, useEffect } from 'react';

const NFTView = () => {

    const { currentChain, account, active, library, nftProtectContract } = useAppContext()
    const { isOpen, onToggle } = useDisclosure()
    // Holds component data refresh while refreshPaused
    const [ refreshPaused, setRefreshPaused ] = useState(false)
    const [ refreshNeeded, setRefreshNeeded ] = useState(false)

    const { data, fetch, cursor, page, pageSize, total} = useEvmWalletNFTs({
        chain: currentChain.id,
        address: account || '0x0'
    })

    const nftIsWNFT = (nft: EvmNft) => nft.tokenAddress.format().toLowerCase() === nftpContractAddress.toLowerCase()

    const reFetch = (force = false) => {
        if (force) {
            setRefreshNeeded(false)
            console.log('Fetching NFTs forced...')
            fetch()
        } else {
            if (refreshPaused) {
                console.log('Fetching NFTs paused, waiting...')
                setRefreshNeeded(true)
            } else if (!refreshNeeded) {
                console.log('Fetching NFTs...')
                fetch()
            }
        }
    }

    const renderNFT = (nft: EvmNft) => {
        console.log('NFT: ', nft.name, nft)
        return <NFTCard
            key={nft.tokenHash}
            nft={nft}
            nftReFetch={reFetch}
            setRefreshPaused={setRefreshPaused}
        />
    }
    const {data: dummyOriginalNFT} = useEvmNFTMetadata({ 
        chain: currentChain.id,
        address: nftpContractAddress,
        tokenId: '1'
    })

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

    const ownNfts = data?.filter(nft => !nftIsWNFT(nft) )
    const wNfts = data?.filter(nft => nftIsWNFT(nft) )
    const ownNftElements = ownNfts?.map(renderNFT)
    const wNftElements = wNfts?.map(renderNFT)
    //const transferedWNfts: EvmNft[] = []

    // Following block is for testing purposes only
    // Remove after The Graph integration
    const restOfParams = {
        chain: currentChain.id,
        address: nftpContractAddress
    }
    const transferedWNfts: any[] = [
        useEvmNFTMetadata({tokenId: '47', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '48', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '49', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '50', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '51', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '52', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '53', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '54', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '55', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '56', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '57', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '58', ...restOfParams}).data,
    ].filter((item: EvmNft|undefined) => {
        return item && item.ownerOf?.format().toLowerCase() !== account?.toLowerCase()
    })
    // Ends here
    const transferedWNftElements:any[] = transferedWNfts?.map(renderNFT)

    useEffect(() => {
        // Update data when refresh unpaused if needed
        if (!refreshPaused) {
            if (refreshNeeded) {
                fetch()
                setRefreshNeeded(false)
                console.log('Fetching NFTs after pause...')
            }
        }
    }, [refreshPaused, refreshNeeded])

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
                                    <Trans>{"It's all yours!"}</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>

                    <AccordionPanel px="0" pb={4}>
                        { ownNftElements && (ownNftElements.length > 0) ? 
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { ownNftElements }
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
                                    <Trans>All your pNFT</Trans> 
                                </Text>
                                <Text textStyle="h3">
                                    <Trans>This section displays your pNFTs that are linked to original NFTs owned by other users</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel px="0" pb={4}>
                        { transferedWNftElements && (transferedWNftElements.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { transferedWNftElements }
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
                                    <Trans>This section displays all the NFTs and their associated pNFTs that you own</Trans>
                                </Text>
                            </Flex>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel px="0" pb={4}>
                        { wNftElements && (wNftElements.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, 8rem)",
                                sm: "repeat(auto-fill, 10rem)",
                                md: "repeat(auto-fill, 12rem)",
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { wNftElements }
                        </Grid> :
                        <Text color={'#FFF'}><Trans>You have no protected NFTs yet</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
)}

export default NFTView