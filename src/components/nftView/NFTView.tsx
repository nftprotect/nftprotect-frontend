import {
    Container,
    Grid,
    SimpleGrid,
    Heading,
    Box,
    Button,
    Flex,
    Collapse,
    useDisclosure,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
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
        tokenId: '1'
    })

    const ownNfts = data?.filter(nft => !nftIsWNFT(nft) )
    const wNfts = data?.filter(nft => nftIsWNFT(nft) )
    const ownNftElements = ownNfts?.map(renderNFT)
    const wNftElements = wNfts?.map(renderNFT)
    const transferedWNftElements = [ dummyOriginalNFT && renderNFT(dummyOriginalNFT) ]

    return (
        <>
            <Box
                bgColor="#1A202C"
                px={['1rem', '3rem']}
                pb={['2rem']}
            >
                    <Flex 
                        pt={[4]}
                        alignItems="center"
                        color="#FFF"
                    >
                        <Heading
                            fontSize={['lg', 'xl', '2xl']}
                        >
                            My NFTs
                        </Heading>
                        <Button 
                            onClick={onToggle} 
                            fontSize={['lg', 'xl', '2xl']}
                            bg="none"
                            _hover= {{
                                bg: 'none'
                            }}
                        > 
                            { isOpen ? <ChevronDownIcon /> : <ChevronRightIcon/> }
                        </Button>
                    </Flex>
                    
                    <Collapse in={!isOpen} animateOpacity>
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
                    </Collapse>
            </Box>

            <Box
                px={['1rem', '3rem']}
                pb={['2rem']}
            >
                    <Flex 
                        pt={[4]}
                        alignItems="center"
                        color="#FFF"
                    >
                        <Heading
                            fontSize={['lg', 'xl', '2xl']}
                        >My wNFTs
                        </Heading>
                    </Flex>

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
            </Box>

            <Box
                bgColor="#1A202C"
                px={['1rem', '3rem']}
                pb={['2rem']}
            >
                    <Flex 
                        pt={[4]}
                        alignItems="center"
                        color="#FFF"
                    >
                        <Heading
                            fontSize={['lg', 'xl', '2xl']}
                        >
                            My wNFTs at another adresses
                        </Heading>
                    </Flex>
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
            </Box>
        </>
)}

export default NFTView