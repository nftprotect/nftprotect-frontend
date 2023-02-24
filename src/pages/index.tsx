import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import CheckUrlPopup from '../components/popups/CheckUrlPopup'
import {
    Container,
    Heading,
    Image,
    Flex,
    Text,
    Box
} from '@chakra-ui/react'
import { useAppContext } from '../context/AppContextProvider'
import NFTView from '../components/nftView/NFTView'

const Home: NextPage = () => {

    const { active } = useAppContext()

    // let innerPart = <div/>
    // if ( active ) {
    //     innerPart = <NFTView />
    // } else {
    //     innerPart = ( 
    //         <Container centerContent>
    //             <Heading
    //                 as='h3'
    //                 textAlign="center"
    //                 fontSize={['lg']}
    //                 mb={4}
    //                 color="#1F2041"
    //             >
    //                 Please connect your wallet
    //             </Heading>
    //             <Text
    //                 fontSize={['xs', 'sm', 'md']}
    //                 textAlign="center"
    //                 color="rgba(31, 32, 65, .9)"
    //             >
    //                 Please connect your wallet to see your NFT and wNFT (or ... to protect your NFT)
    //             </Text>
    //             <Text
    //                 fontSize={['xs', 'sm', 'md']} 
    //                 textAlign="center"
    //                 color="rgba(31, 32, 65, .9)"
    //                 mb={[4, 6]}
    //             >
    //                 View only permissions. We will never do anything without your permission
    //             </Text>
    //         </Container >
    //     )
    // }

    return (
        <>
        <Container 
            p={0}
            maxW="2200px"
        >
            <NavBar />
            <Box 
                position="relative" 
                px={[3, 6]}
                mb={["4em"]}
            >
                <Flex 
                    flexDirection="column" 
                    justifyContent="center"
                    pl={{base: 0, lg: '6rem'}}
                    maxW={{base: "100%", sm: "50%"}}
                >
                    <Heading 
                        mt={["2em"]}
                        fontSize={{sm:"2em", md: "3em", lg: "4rem"}} 
                        lineHeight={["28px", "36px", "42px", "58px"]} 
                    >Protect your digital assets from bad actors
                    </Heading>
                    <Text 
                        fontSize={["1em", "1.5em"]} 
                        mt={[8]}
                        lineHeight={["1em", "1.2em"]}
                    >Decentralized self-custody protocol for safeguarding digital assets from theft and private key compromise
                    </Text>

                    { !active &&
                        <>
                            <Text
                                mt={[4, 6]}
                                fontSize={['xs', 'sm', 'md']}
                                color="rgba(31, 32, 65, .9)"
                            > Please connect your wallet to see your NFT and wNFT (or ... to protect your NFT)
                            </Text>
                            <Text
                                fontSize={['xs', 'sm', 'md']} 
                                color="rgba(31, 32, 65, .9)"
                                mb={[4, 6]}
                            >View only permissions. We will never do anything without your permission
                            </Text>
                            <LoginForm />
                        </>
                    }
                </Flex>
                <Box 
                    p="0"
                    m="0"
                    w={["sm", "md", "lg"]}
                    position="absolute" 
                    top="0" 
                    right="0"
                    maxW="50%"
                    display={{ base: 'none', sm: 'flex'}}
                >
                    <Image src="/images/logo_banner.png" alt="Banner" />
                </Box>

            </Box>
            <main>
                {/* {innerPart} */}
                { active && <NFTView />}
            </main>
        </Container>
    </>
    )
}

export default Home