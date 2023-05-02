import type { NextPage } from 'next'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import {
    Container,
    Heading,
    Image,
    Flex,
    Text,
    Box,
    Button
} from '@chakra-ui/react'
import { useAppContext } from '../context/AppContextProvider'
import { Trans } from '@lingui/macro'
import { GetStaticProps } from 'next'
import { useIPFSContext } from '../context/IPFSContextProvider'
import { useEffect, useState } from 'react'
import { useCallableDialogContext } from '../context/CallableDialogContextProvider'
import RegisterArbitratorDialog from '../components/dialogs/arbitrator/RegisterArbitratorDialog'
import { BigNumber } from '@ethersproject/bignumber'
import { useTheGraph } from '../hooks/useTheGraph'
import ArbitratorRequestList, { ArbitratorData, ArbitratorRequest } from '../components/arbitrator/ArbitratorRequestList'

async function loadTranslation(locale: string, isProduction = true) {
    let data
    if (isProduction) {
        data = await import(`../locales/${locale}/messages`)
    } else {
        data = await import(
            `@lingui/loader!../locales/${locale}/messages.po`
        )
    }
  
    return data.messages
}

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

    const { account, active, arbitratorRegistryContract } = useAppContext()
    const [ disputeId, setDisputeId ] = useState<BigNumber>()
    const { setBaseUrl } = useIPFSContext()
    const { getDialog } = useCallableDialogContext()
    const { loadDyArbitrators } = useTheGraph()
    const [ arbitratorsData, setArbitratorsData ] = useState<{
        arbitrators: ArbitratorData[]
        requests: ArbitratorRequest[]
    }>()

    const reloadDyArbitrators = () => {
        if (active) {
            loadDyArbitrators().then(({data}) => {
                console.log('GRAPH ARBITRATORS DATA', data)
                setArbitratorsData(data)
            })
        }
    }

    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    useEffect(reloadDyArbitrators, [active, account])

    return (
        <>
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
                bg={active ? "url('/images/phone.png') top right no-repeat" : "url('/images/banner.png') top left / cover no-repeat"}
                pb={{base: "0", sm: "0", md: "2rem", lg: "4rem", xl: "4rem"}}
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
            { active &&
                <main>
                    { arbitratorsData?.requests ?
                        <ArbitratorRequestList requests={ arbitratorsData.requests }/> :
                        <Box><Trans>You have no requests yet</Trans></Box>
                    }
                    <br/>
                    <Button onClick={ () => { getDialog('RegisterArbitratorDialog').onOpen() }}>
                        <Trans>Register new arbitrator</Trans>
                    </Button>


                    { /** Dialogs used on this page */ }
                    <RegisterArbitratorDialog setDisputeId={setDisputeId}/>
                </main>
            }
        </Container>
    </>
    )
}

export default Home