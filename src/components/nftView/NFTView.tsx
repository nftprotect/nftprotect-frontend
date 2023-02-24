import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Grid,
    Heading,
    InputGroup,
    Input,
    IconButton,
    Flex,
    useDisclosure
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useEvmWalletNFTs, useEvmNFTMetadata } from '@moralisweb3/next';
import { EvmNft } from '@moralisweb3/common-evm-utils';
import NFTCard from './NFTCard'
import { nftpContractAddress } from '../../utils/config'
import { useAppContext } from '../../context/AppContextProvider';

const NFTView = () => {

    const { currentChain, account, active, library, nftProtectContract } = useAppContext()
    const { isOpen, onToggle } = useDisclosure()

    const { data, fetch, cursor, page, pageSize, total} = useEvmWalletNFTs({
        chain: currentChain.id,
        address: account || '0x0'
    })

    const nftIsWNFT = (nft: EvmNft) => nft.tokenAddress.format().toLowerCase() === nftpContractAddress.toLowerCase()

    const renderNFT = (nft: EvmNft) => {
        console.log('NFT: ', nft.name, nft)
        return <NFTCard
            key={nft.tokenHash}
            nft={nft}
            nftReFetch={fetch}
        />
    }
    const {data: dummyOriginalNFT} = useEvmNFTMetadata({ 
        chain: currentChain.id,
        address: nftpContractAddress,
        tokenId: '11'
    })

    const ownNfts = data?.filter(nft => !nftIsWNFT(nft) )
    const wNfts = data?.filter(nft => nftIsWNFT(nft) )
    const ownNftElements = ownNfts?.map(renderNFT)
    const wNftElements = wNfts?.map(renderNFT)
    const transferedWNftElements = [ dummyOriginalNFT && renderNFT(dummyOriginalNFT) ]

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
                                Your NFT
                            </Heading>
                        </AccordionButton>
                        <Flex>
                            <InputGroup my={4} >
                                <Input 
                                    type='text' 
                                    placeholder='Search'
                                    mr={2}
                                    _focus={{
                                        border: "1px solid #BC9CFF"
                                    }}
                                />
                                <IconButton
                                    bg="none"
                                    border="1px solid"
                                    aria-label='Search database'
                                    icon={<SearchIcon />}
                                    _hover={{
                                        bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                                        color: "#FFF"
                                    }}
                                />
                            </InputGroup>
                        </Flex>
                    </Flex>

                    <AccordionPanel pb={4}>
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
                        </Grid>
                    </AccordionPanel>
                </AccordionItem>

                <AccordionItem px={['1rem', '3rem']}>
                    <Flex alignItems="center" justifyContent="space-between">
                        <AccordionButton fontSize={['lg', 'xl', '2xl']} px="0">
                        <AccordionIcon mr={[2]} />
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                                NFT without pNFT
                            </Heading>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel pb={4}>
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
                        </Grid>
                    </AccordionPanel>
                </AccordionItem>
                
                <AccordionItem bgColor="#1A202C" px={['1rem', '3rem']}>
                    <Flex color="#FFF" alignItems="center" justifyContent="space-between">
                        <AccordionButton fontSize={['lg', 'xl', '2xl']} px="0">
                            <AccordionIcon mr={[2]} />
                            <Heading fontSize={['lg', 'xl', '2xl']}>
                                Your pNFT
                            </Heading>
                        </AccordionButton>
                    </Flex>
                        
                    <AccordionPanel pb={4}>
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
                        </Grid>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </>
)}

export default NFTView