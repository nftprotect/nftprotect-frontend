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
            fetch()
        } else {
            if (refreshPaused) {
                setRefreshNeeded(true)
            } else if (!refreshNeeded) {
                fetch()
                console.log('FETCH STR!!!')
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
        useEvmNFTMetadata({tokenId: '32', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '33', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '35', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '36', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '37', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '38', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '39', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '40', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '41', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '42', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '43', ...restOfParams}).data,
        useEvmNFTMetadata({tokenId: '44', ...restOfParams}).data,
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
                console.log('FETCH EFF!!!')
            }
        }
    }, [refreshPaused, refreshNeeded])

    useEffect(subscribeNftTransfers, [account, active])

    return (
        <>
            <Accordion border="none" defaultIndex={[0, 1, 2]} allowMultiple>
                <AccordionItem bgColor="#1A202C" px={['1rem', '3rem']}>
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton 
                            fontSize={['lg', 'xl', '2xl']} 
                            px="0" py={[2, 4]}
                            w="15em"
                        >
                            <AccordionIcon mr={[2]} />
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                                <Trans>Your NFT</Trans> 
                            </Heading>
                        </AccordionButton>
                    </Flex>

                    <AccordionPanel pb={4}>
                        { ownNftElements && (ownNftElements.length > 0) ? 
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, minmax(6em, 1fr))",
                                sm: "repeat(auto-fill, 10em)",
                                md: "repeat(auto-fill, 10em)",
                                lg: "repeat(auto-fill, 14em)", 
                                xl: "repeat(auto-fill, 16em)"
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { ownNftElements }
                        </Grid> : 
                        <Text color={'white'}><Trans>You have no NFTs in your wallet.</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem px={['1rem', '3rem']}>
                    <Flex alignItems="center" justifyContent="space-between">
                        <AccordionButton fontSize={['lg', 'xl', '2xl']} px="0">
                        <AccordionIcon mr={[2]} />
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                                <Trans>Protected assets without pNFT</Trans>
                            </Heading>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel pb={4}>
                        { transferedWNftElements && (transferedWNftElements.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, minmax(6em, 1fr))",
                                sm: "repeat(auto-fill, 10em)",
                                md: "repeat(auto-fill, 10em)",
                                lg: "repeat(auto-fill, 14em)", 
                                xl: "repeat(auto-fill, 16em)"
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { transferedWNftElements }
                        </Grid> :
                        <Text><Trans>You have no pNFTs transfered to third parties.</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem bgColor="#1A202C" px={['1rem', '3rem']}>
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton fontSize={['lg', 'xl', '2xl']} px="0">
                            <AccordionIcon mr={[2]} />
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                            <Trans>Your pNFT</Trans>
                            </Heading>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel pb={4}>
                        { wNftElements && (wNftElements.length > 0) ?
                        <Grid
                            templateColumns={{
                                base: "repeat(auto-fill, minmax(6em, 1fr))",
                                sm: "repeat(auto-fill, 10em)",
                                md: "repeat(auto-fill, 10em)",
                                lg: "repeat(auto-fill, 14em)", 
                                xl: "repeat(auto-fill, 16em)"
                            }}
                            gap={[6]}
                            my={[4, 8]}
                        >
                            { wNftElements }
                        </Grid> :
                        <Text color={'white'}><Trans>You have no protected NFTs yet</Trans></Text> }
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
)}

export default NFTView