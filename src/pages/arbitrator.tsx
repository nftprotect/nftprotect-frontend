import type { NextPage } from 'next'
import NavBar from '../components/navBar/NavBar'
import {
    Container,
    Heading,
    Image,
    Flex,
    Text,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader
} from '@chakra-ui/react'
import { useAppContext } from '../context/AppContextProvider'
import { Trans, t } from '@lingui/macro'
import { GetStaticProps } from 'next'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { useEffect, useState } from 'react'
import { useCallableDialogContext } from '../context/CallableDialogContextProvider'
import RegisterArbitratorDialog from '../components/dialogs/arbitrator/RegisterArbitratorDialog'
import { BigNumber } from '@ethersproject/bignumber'
import ArbitratorRequestList,  { ArbitratorRequest } from '../components/arbitrator/ArbitratorRequestList'
import ArbitratorsList, { ArbitratorData } from '../components/arbitrator/ArbitratorsList'
import ShowArbitratorDialog from '../components/dialogs/arbitrator/ShowArbitratorDialog'
import ShowRequestDialog from '../components/dialogs/arbitrator/ShowRequestDialog'
import { loadTranslation } from '../utils/lingui'
import { useDyArbitratorGraph } from '../hooks/useDyArbitratorGraph'
import { defaultChain } from '../config'
import Head from 'next/head'
import ConnectButton from '../components/ConnectButton'

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

const ArbitratorPage: NextPage = () => {

    const { account, active, dynamicArbRegistryContract, currentChain } = useAppContext()
    const [ disputeId, setDisputeId ] = useState<BigNumber>()
    const { setBaseUrl } = useIPFSContext()
    const { getDialog } = useCallableDialogContext()
    const { loadDyArbitrators } = useDyArbitratorGraph(currentChain?.id || defaultChain)
    const [ arbitratorsData, setArbitratorsData ] = useState<{
        arbitrators: ArbitratorData[]
        requests: ArbitratorRequest[]
    }>()
    const graphUpdateTimeout = 3000

    const reloadDyArbitrators = () => {
        if (account && active) {
            loadDyArbitrators(account).then(({data}) => {
                console.log('GRAPH ARBITRATORS DATA', data)
                setArbitratorsData(data)
            })
        }
    }

    const reloadDyArbitratorsWithTimeout = () => {
        setTimeout(reloadDyArbitrators, graphUpdateTimeout)
    }

    useEffect(() => {
        setBaseUrl(window.location.origin)
        if (active && account) {
            dynamicArbRegistryContract.on({}, reloadDyArbitratorsWithTimeout)
            return () => {
                dynamicArbRegistryContract.removeAllListeners()
            }
        }
    }, [active, account])

    useEffect(reloadDyArbitrators, [active, account])

    return (
        <>
        <Head>
            <meta name="robots" content="noindex,nofollow" />
            <title>{t`NFT Protect • Arbitrator Registry`}</title>
        </Head>
        <Container 
            p={0}
            maxW="1920px"
            h={active ? "auto" : "calc(100vh - 60px)"}
        >
            <NavBar />
            <Box
                position="relative"
                top="0" 
                left="0"
                h={active ? "auto" : "100%"}
                //bg={active ? "url('/images/phone.png') top right no-repeat" : "url('/images/banner.png') top left / cover no-repeat"}
                //pb={{base: "0", sm: "0", md: "2rem", lg: "4rem", xl: "4rem"}}
            >
                <Flex 
                    flexDirection={active ? "row" : "column"}
                    justifyContent="left"
                    pt={{base:"2.5rem", md:"5.25rem", xl: "8.25rem" }}
                    px={['1rem', '3rem']}
                    pb={{base: "2rem"}}
                >
                    {active &&
                        <>
                        <Box w={{base: "100%", sm: "70%"}}>
                            <Heading as="h1" fontStyle="h1">
                                <Trans>Arbitrator management</Trans>
                            </Heading>
                            <Text 
                                pt="1.25rem"
                                pb="2rem"
                                textStyle="h3"
                            >
                                <Trans>Here you can register new arbitrator or change the parameters of the existing one</Trans>
                            </Text>
                        </Box>
                        <Box w={{base: "100%", sm: "30%"}}>
                            <Button 
                                variant={ "primaryLight" }
                                width="auto"
                                float="right"
                                onClick={ () => { getDialog('RegisterArbitratorDialog').onOpen() }}
                            >
                                <Trans>Register new arbitrator</Trans>
                            </Button>
                        </Box>
                        </>
                    }

                    { !active &&
                        <>
                            <Text as="h1" textStyle="h1">
                                <Trans>Connect your wallet<br></br>& register</Trans>
                            </Text>
                                
                            <Text
                                textStyle="h3"
                                pt="1.25rem"
                                pb="2rem"
                            >
                                <Trans>Please connect your wallet to register <br></br>a new arbitrator</Trans>
                            </Text>
                            <Box w={{base: "14rem", sm: "16rem"}} >
                                <ConnectButton buttonVariant={'primaryLight'} />
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
                        <Image src="/images/mainBannerBackground.png" alt="Bubbles"></Image>
                    </Box>
                }
                </Box>
            { active &&
                <main>
                    <Card mx="2em" mt="0" mb="1em">
                        <CardHeader>
                           <Heading as="h2" size='md'><Trans>Registered Arbitrators</Trans></Heading>
                        </CardHeader>
                        <CardBody>
                            { arbitratorsData?.arbitrators?.length ?
                                <ArbitratorsList arbitrators={ arbitratorsData.arbitrators }/> :
                                <Box><Trans>You did not register any arbitrator yet</Trans></Box>
                            }
                        </CardBody>
                    </Card>
                    <Card mx="2em" mt="0" mb="2em">
                        <CardHeader>
                            <Heading as="h2" size='md'><Trans>Pending Requests</Trans></Heading>
                        </CardHeader>
                        <CardBody>
                            { arbitratorsData?.requests?.length ?
                                <ArbitratorRequestList requests={ arbitratorsData.requests }/> :
                                <Box><Trans>You have no requests yet</Trans></Box>
                            }
                        </CardBody>
                    </Card>

                    { /** Dialogs used on this page */ }
                    <RegisterArbitratorDialog/>
                    <ShowArbitratorDialog/>
                    <ShowRequestDialog/>
                </main>
            }
        </Container>
    </>
    )
}

export default ArbitratorPage