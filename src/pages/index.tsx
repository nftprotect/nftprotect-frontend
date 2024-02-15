import type { NextPage } from "next";
import NavBar from "../components/navBar/NavBar";
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
    Link,
    ChakraBaseProvider,
    CloseButton,
} from "@chakra-ui/react";
import { useAppContext } from "../context/AppContextProvider";
import NFTView from "../components/nftView/NFTView";
import Footer from "../components/footer/Footer";
import ShowNotifications from "../components/notifications/ShowNotifications";
import { useNotifications } from "../hooks/useNotifications";
import { Trans, t } from "@lingui/macro";
import { GetStaticProps } from "next";
import { useIPFSContext } from "../context/IPFSContextProvider";
import { useEffect, useState } from "react";
import { loadTranslation } from '../utils/lingui';
import NotificationsLoader from "../components/notifications/NotificationsLoader";
import Head from "next/head";
import ConnectButton from "../components/ConnectButton";

export const getStaticProps: GetStaticProps = async (ctx) => {
    const translation = await loadTranslation(
        ctx.locale!,
        process.env.NODE_ENV === "production"
    );

    return {
        props: {
            translation,
        },
    };
};

const Home: NextPage = () => {
    const { active, baseTokenPrice, currentChain } = useAppContext();
    const { notificationsCount } = useNotifications();
    const { setBaseUrl } = useIPFSContext();
    const [ blackBoxClosed, setBlackBoxClosed ] = useState<Boolean>(false)

    useEffect(() => {
        setBaseUrl(window.location.origin);
        currentChain &&
            console.log(`Current ${currentChain.symbol} price is ${baseTokenPrice}`);
    }, [baseTokenPrice]);

    let innerPart = <div />;
    if (active) {
        innerPart = <>{notificationsCount ? <ShowNotifications /> : <></>}</>;
    }

    return (
        <>
            <Head>
                <meta
                    name="description"
                    content={t`NFT Protect is an application that allows you to protect your NFTs and be sure of their safety without fear of theft.`}
                />
                <title>{t`NFT Protect • Dapp`}</title>
            </Head>
            <Grid
                templateAreas={blackBoxClosed ? 
                                `"nav"
                                "main"
                                "footer"` :
                                `"blackBox"
                                "nav"
                                "main"
                                "footer"`
                            }
                gridTemplateRows={blackBoxClosed ?
                    "60px 1fr 60px" :
                    "60px 60px 1fr 60px"
                }
                gridTemplateColumns={"1fr"}
                maxW="1920px"
                minH="100vh"
                p={0}
                mx="auto"
                flexDirection="column"
                position="relative"
            >
                {!blackBoxClosed && <GridItem
                    area={"blackBox"}
                    position="sticky"
                    top="0"
                    zIndex="1"
                    bgColor="black"
                    color="white"
                    w="100%"
                    h="60px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Text
                        // fontFamily={"Euclid Circular A"}
                        // fontSize={"24px"}
                        px={'1rem'}
                    >
                        <Trans>
                            This is β-version of NFT Protect. If you encouter some glitch, please <Link href="https://go.nftprotect.app/feedback" target={'blank'}><u>leave your feedback</u></Link>! Thanks!
                        </Trans>
                    </Text>
                    <CloseButton 
                        onClick={()=>{
                            setBlackBoxClosed(true)
                        }}
                        position="absolute"
                        right="10px"
                    />
                </GridItem>}

                <GridItem
                    area={"nav"}
                    position="sticky"
                    top={blackBoxClosed ? "0px" : "60px"}
                    zIndex="1"
                    bgColor="brand.light"
                    color="#FFF"
                    w="100%"
                    display="flex"
                >
                    <NavBar />
                </GridItem>

                <GridItem area={"main"}>
                    <chakra.main>
                        {!active && (
                            <Flex
                                w="100%"
                                h={{ base: "calc(100vh - 120px)" }}
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
                                        src="/images/logoBlue.svg"
                                        alt="Logo"
                                        h={{ base: "75px" }}
                                        mb={{ base: "40px" }}
                                    />
                                    <Text
                                        fontFamily="Lexend"
                                        fontSize={{ base: "44px" }}
                                        lineHeight={{ base: "42px" }}
                                        fontWeight={{ base: "900" }}
                                        letterSpacing={{ base: "0.04em" }}
                                        textAlign="center"
                                    >
                                        <Trans>Connect your wallet<br/>& get protected</Trans>
                                    </Text>
                                    <Box mt={10}>
                                        <Box w={{ base: "14rem", sm: "16rem" }}>
                                            <ConnectButton buttonVariant={"primaryLight"} />
                                        </Box>
                                    </Box>
                                </Flex>
                            </Flex>
                        )}

                        {active && (
                            <>
                                <Flex
                                    minH={{ base: "auto", md: "360px" }}
                                    my={{ base: "20px", md: "40px" }}
                                    mx={{ base: "16px", sm: "48px" }}
                                    bgColor="brand.light"
                                    pl={{ base: "45px" }}
                                    pt={{ base: "50px" }}
                                    borderRadius={{ base: "8px" }}
                                >
                                    <Flex flexDir="column" color="#FFF" w={{ md: "60%", base: "100%" }}>
                                        <Text
                                            //fontSize="3rem"
                                        
                                            // fontSize={{ md: "48px", base: '24px' }}
                                            // lineHeight={{ md: "68px", sm: '20px' }}
                                            pt="1.25rem"
                                            pb="1rem"
                                            fontWeight={{ base: "600" }}
                                            textStyle={{base: "h1", md: "h1", lg: "h1"}}
                                        >
                                            <Trans>
                                                Welcome to NFT Protect<br />
                                                Your digital asset guardian
                                            </Trans>
                                        </Text>
                                        <Text
                                            //fontSize="1.375rem"
                                            //pt="1rem"
                                            pb="2rem"
                                            textStyle={{ base: "h3", md: "h3", lg: "h3"}}
                                            fontWeight="500"
                                        >
                                            <Trans>
                                                Manage your NFTs and pNFTs, stay updated with
                                                notifications, and rest assured with our advanced secuirity features.
                                            </Trans>
                                        </Text>
                                    </Flex>

                                    <Flex
                                        ml={{ base: "20px" }}
                                        w={{ md: "40%", base: "0%" }}
                                        bgImage="url('/images//mainBannerBackground.png')"
                                        bgRepeat="no-repeat"
                                    ></Flex>
                                </Flex>

                                {innerPart}
                                <NFTView />
                                {/* Load all notifications */}
                                <NotificationsLoader />
                            </>
                        )}
                    </chakra.main>
                </GridItem>

                <GridItem area={"footer"}>
                    <Footer />
                </GridItem>
            </Grid>
        </>
    );
};

export default Home;
