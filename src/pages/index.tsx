import type { NextPage } from 'next'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import {
    chakra,
    Container,
    Heading,
    Image,
    Flex,
    Text,
    Box,
    Grid,
    GridItem,
    ChakraBaseProvider
} from '@chakra-ui/react'
import { useAppContext } from '../context/AppContextProvider'
import NFTView from '../components/nftView/NFTView'
import Footer from '../components/footer/Footer'
import ShowNotifications from '../components/notifications/ShowNotifications'
import { useNotifications } from '../hooks/useNotifications'
import { Trans } from '@lingui/macro'
import { GetStaticProps } from 'next'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { useEffect } from 'react'
import { loadTranslation } from '../utils/lingui'

export const getStaticProps: GetStaticProps = async (ctx) => {
    const translation = await loadTranslation(
        ctx.locale!,
        process.env.NODE_ENV === 'production'
    )
  
    return {
        props: {
            translation
        }
    }
}

const Home: NextPage = () => {

    const { active } = useAppContext()
    const {
        addNotifications, 
        notificationsCount
    } = useNotifications()
    const { setBaseUrl } = useIPFSContext()

    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    // useEffect(() => {
    //     addNotifications([
    //         {
    //             id:'cccc', 
    //             children:
    //                 <div>
    //                     <Heading 
    //                         fontSize={{base: "0.875rem"}}
    //                         mb={{base: "0.625rem"}}
    //                     >
    //                         <Trans>{"You're being sued. Case #1231 Who should own the original NFT"}</Trans>
    //                     </Heading>
    //                     <Text
    //                         fontSize={{base: "0.625rem"}}
    //                     > 
    //                         <Trans>In 48 hours it will move to the Voting stage. We advise you to upload your proofs</Trans>
    //                     </Text>
    //                 </div>, 
    //             severity: 0,
    //             dateCreated: new Date()
    //         }
    //     ])
    // }, [])

    let innerPart = <div/>
    if ( active ) {
        innerPart = <>
            { notificationsCount ? <ShowNotifications/> : <></> }
        </>
    }

    return (
        <>
        <Grid
            templateAreas={`"nav"
                            "main"
                            "footer"`}
            gridTemplateRows={'60px 1fr 60px'}
            gridTemplateColumns={'1fr'}
            maxW="1920px"
            minH="100vh"
            p={0}
            mx="auto"
            flexDirection="column"
            position="relative"
        >
            <GridItem 
                area={'nav'} 
                position="sticky"
                top="0"
                zIndex="1"
                bgColor="#000"
                color="#FFF"
                w="100%"
                px={[3, 6]}
                py="0.375rem"
            >
                <NavBar />
            </GridItem>

            <GridItem area={'main'}>
                <chakra.main>
                <Box
                    position="relative"
                    top="0" 
                    left="0"
                    h={active ? "auto" : "100%"}
                    bg={active ? "url('/images/phone.png') top right no-repeat" : "url('/images/banner.png') top left / cover no-repeat"}
                    pb={{base: "0", sm: "0", md: "2rem", lg: "4rem", xl: "4rem"}}
                    maxH="1200px"
                >
                    <Flex 
                        flexDirection="column" 
                        justifyContent="center"
                        pt={{base:"2.5rem", md:"5.25rem", xl: "8.25rem" }}
                        px={['1rem', '3rem']}
                        pb={{base: "2rem"}}
                    >
                        {active &&
                            <Box w={{base: "100%", sm: "50%"}}>
                                <Heading as="h1" fontStyle="h1">
                                    <Trans>Protect your digital <br />assets from bad<br /> actors</Trans>
                                </Heading>
                                <Text 
                                    pt="1.25rem"
                                    pb="2rem"
                                    textStyle="h3"
                                >
                                    <Trans>Decentralized self-custody protocol for safeguarding digital assets from theft and private key compromise</Trans>
                                </Text>
                            </Box>
                        }

                        { !active &&
                            <>
                                <Text as="h1" textStyle="h1">
                                    <Trans>Connect your wallet<br></br>& get protected</Trans>
                                </Text>
                                    
                                <Text
                                    textStyle="h3"
                                    pt="1.25rem"
                                    pb="2rem"
                                >
                                    <Trans>Please connect your wallet to see your digital <br></br>assets and protect them</Trans>
                                </Text>
                                <Box w={{base: "14rem", sm: "16rem"}} >
                                    <LoginForm buttonVariant={'primary-solid'} />
                                </Box>
                            </>
                        }
                        {/* {active && !didRegistered && <DIDVerificationRequiredCard /> } */}
                    </Flex>
                    {!active && 
                        <Box
                            position="absolute"
                            display={{base: "none", md: "block"}}
                            right={{base: "1rem",lg: "1rem"}}
                            top={{base: "10rem", sm: "5.25rem", md: "4rem"}}
                            w={{base: "100%",  md: "60%"}}
                            zIndex="0"
                        >
                            <Image src="/images/phone.png" alt="Phone"></Image>
                        </Box>
                    }
                </Box>
                {active &&
                    <>
                        {innerPart}
                        { active && <NFTView />}
                    </>
                }
                </chakra.main>
            </GridItem>

            <GridItem area={'footer'}>
                <Footer />
            </GridItem>
        </Grid>
    </>
    )
}

export default Home