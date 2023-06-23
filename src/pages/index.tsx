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
import NotificationsLoader from '../components/notifications/NotificationsLoader'

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

    const { active, baseTokenPrice, currentChain } = useAppContext()
    const { notificationsCount } = useNotifications()
    const { setBaseUrl } = useIPFSContext()

    useEffect(() => {
        setBaseUrl(window.location.origin)
        currentChain && console.log(`Current ${currentChain.symbol} price is ${baseTokenPrice}`)
    }, [baseTokenPrice])

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
                bgColor="brand.light"
                color="#FFF"
                w="100%"
                display="flex"
            >
                <NavBar />
            </GridItem>

            <GridItem area={'main'}>
                <chakra.main>
                    {!active &&
                        <Flex 
                            w="100%" 
                            h={{base: "calc(100vh - 120px)"}} 
                            justifyContent="center" 
                            alignItems="center" 
                            bgImage="url('/images/startPageBanner.png')"
                            bgRepeat="no-repeat"
                            bgPosition="top center"
                            // bgSize="auto 100%"
                            bgSize="cover"
                        >
                            <Flex flexDir="column" alignItems="center">
                                <Image
                                    src='/images/logoBlue.svg'
                                    alt='Logo'
                                    h={{base: '75px'}}
                                    mb={{base: "40px"}}
                                />
                                <Text fontFamily="Roboto" fontSize={{base: "36px"}} lineHeight={{base: "42px"}} fontWeight={{base: "900"}} letterSpacing={{base: "0.04em"}} textAlign="center">
                                    <Trans>Connect your wallet<br></br>& get protected</Trans>
                                </Text>
                                    
                                <Text textStyle="paragraph" fontWeight={{base: "500"}} letterSpacing={{base: "0.04em"}} textAlign="center" pt="1.25rem" pb="2rem">
                                    <Trans>Please connect your wallet to see your digital assets and protect them</Trans>
                                </Text>
                                <Box w={{base: "14rem", sm: "16rem"}} >
                                    <LoginForm buttonVariant={'primaryLight'} />
                                </Box>
                            </Flex>
                        </Flex>
                    }

                    {active && 
                        <>
                            <Flex
                                h={{base: "360px"}}
                                my={{base: "40px"}}
                                mx={{base: '48px'}}
                                bgColor="brand.light"
                                pl={{base: "45px"}}
                                pt={{base: "50px"}}
                                borderRadius={{base: "8px"}}
                            >
                                <Flex flexDir="column" color="#FFF" w={{base: "60%"}} 
                                >
                                    <Text fontSize={{base: '64px'}} lineHeight={{base: "68px"}} fontWeight={{base: "600"}}>
                                        <Trans>Protect your digital <br />assets from bad actors</Trans>
                                    </Text>
                                    <Text 
                                        pt="1.25rem"
                                        pb="2rem"
                                        textStyle="h3"
                                        fontWeight="500"
                                    >
                                        <Trans>Decentralized self-custody protocol <br/>for safeguarding digital assets <br/>from theft and private key compromise</Trans>
                                    </Text>
                                </Flex>

                                <Flex
                                    ml={{base: "20px"}}
                                    w={{base: "40%"}}
                                    bgImage="url('/images//mainBannerBackground.png')" 
                                    bgRepeat="no-repeat"
                                >
                                </Flex>
                            </Flex>

                            {innerPart}
                            <NFTView />
                            {/* Load all notifications */}
                            <NotificationsLoader/>
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