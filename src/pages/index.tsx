import type { NextPage } from 'next'
import LoginForm from '../components/loginForm/LoginForm'
import NavBar from '../components/navBar/NavBar'
import DIDVerificationRequiredCard from '../components/nftView/DidVerificationRequiredCard'
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
import ShowNotifications from '../components/notifications/ShowNotifications'
import { useNotificationContext } from '../context/NotificationContextProvider'
import { useEffect } from 'react'
import { useState } from 'react'
import { Trans } from '@lingui/macro'
import { GetStaticProps } from 'next'

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

    const { active, didRegistered } = useAppContext()
    const {
        addNotifications, 
        notificationsCount
    } = useNotificationContext()

    useEffect(() => {
        addNotifications([
            {
                id:'cccc', 
                children:<div>000000</div>, 
                severity: 0,
                dateCreated: new Date()
            }, {
                id:'aaaz', 
                children:<div>11111</div>, 
                severity: 1,
                dateCreated: new Date(),
                closeable: false
            }, {
                id:'fdfs', 
                children:<div>2222</div>, 
                severity: 2,
                dateCreated: new Date(),
                closeable: false
            }, {
                id:'fdsf', 
                children:<div>3333</div>, 
                severity: 3,
                dateCreated: new Date()
            }, {
                id:';doksf', 
                children:<div>4444</div>, 
                severity: 4,
                dateCreated: new Date()
            }, {
                id:'vklsndn', 
                children:<div>5555</div>, 
                severity: 5,
                dateCreated: new Date()
            }
        ])
    }, [])

    let innerPart = <div/>
    if ( active ) {
        innerPart = <>
            { notificationsCount && <ShowNotifications/> }
        </>
    }

    return (
        <>
        <Container 
            p={0}
            maxW="2200px"
        >
            <NavBar />
            <Box
                px={[3, 6]}
                mb={["4em"]}
                bgImage={{base: "none", sm: "url('/images/logo_banner.png')"}}
                bgPosition="100% 0%"
                bgRepeat="no-repeat"
                bgSize="auto 100%"
            >
                <Flex 
                    flexDirection="column" 
                    justifyContent="center"
                    pl={{base: 0, lg: '6rem'}}
                    maxW={{base: "100%", sm: "50%"}}
                >
                    <Heading 
                        mt={["1em"]}
                        fontSize={{sm:"2em", md: "3em", lg: "4rem"}} 
                        lineHeight={["28px", "36px", "42px", "58px"]} 
                    ><Trans>Protect your digital assets from bad actors</Trans>
                    </Heading>
                    <Text 
                        fontSize={["1em", "1.5em"]} 
                        mt={[8]}
                        lineHeight={["1em", "1.2em"]}
                    >
                        <Trans>Decentralized self-custody protocol for safeguarding digital assets from theft and private key compromise</Trans>
                    </Text>

                    { !active &&
                        <>
                            <Text
                                mt={[4, 6]}
                                fontSize={['xs', 'sm', 'md']}
                                color="rgba(31, 32, 65, .9)"
                            >
                                <Trans>Please connect your wallet to see your NFT and pNFT (or ... to protect your NFT)</Trans>
                            </Text>
                            <Text
                                fontSize={['xs', 'sm', 'md']} 
                                color="rgba(31, 32, 65, .9)"
                                mb={[4, 6]}
                            >
                                <Trans>View only permissions. We will never do anything without your permission</Trans>
                            </Text>
                            <Box w={["15rem"]}>
                                <LoginForm />
                            </Box>
                        </>
                    }
                    {active && !didRegistered && <DIDVerificationRequiredCard /> }
                </Flex>
            </Box>
            <main>
                {innerPart}
                { active && <NFTView />}
            </main>
        </Container>
    </>
    )
}

export default Home