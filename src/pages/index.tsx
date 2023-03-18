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
import { NodeNextRequest } from 'next/dist/server/base-http/node'

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
                position="relative"
                top="0" 
                left="0"
                mb={{base: "0", sm: "0", md: "2rem", lg: "4rem", xl: "4rem"}}
                bgImage={active ? "none" : "url('/images/banner.png')"}
                bgRepeat="no-repeat"
                bgSize="cover"
            >
                <Flex 
                    flexDirection="column" 
                    justifyContent="center"
                    pt={{base:"2.5rem", md:"5.25rem", xl: "8.25rem" }}
                    pl={{base: "1rem", sm: "2rem", md: "4rem", lg: "5rem", xl: "10rem"}}
                    pb={{base: "2rem"}}
                >
                    {active &&
                        <Box w={{base: "100%", sm: "50%"}}>
                            <Heading 
                                fontSize={{base: "1.5rem", md: "2.625rem"}}
                                lineHeight={{base: "1.75rem", md: "2.625rem"}}
                            >
                                <Trans>Protect your digital assets from bad actors</Trans>
                            </Heading>
                            <Text 
                                pt="1.25rem"
                                pb="2rem"
                                fontSize={{base: "1rem", md: "1.125rem", lg: "1.375rem"}}
                                lineHeight={{base: "1.25rem", md: "1.5rem", lg: "1.75rem"}}
                            >
                                <Trans>Decentralized self-custody protocol for safeguarding digital assets from theft and private key compromise</Trans>
                            </Text>
                        </Box>
                    }

                    { !active &&
                        <>
                            <Heading
                                fontSize={{base: "1.5rem", md: "2.75rem", lg: "3.875rem"}}
                                lineHeight={{base: "1.75rem", md: "3.25rem", lg: "3.875rem"}}
                            >
                                <Trans>Connect your wallet<br></br>& get protected</Trans>
                            </Heading>
                                
                            <Text
                                pt="1.25rem"
                                pb="2rem"
                                fontSize={{base: "1rem", md: "1.125rem", lg: "1.375rem"}}
                                lineHeight={{base: "1.25rem", md: "1.5rem", lg: "1.75rem"}}
                            >
                                <Trans>Please connect your wallet to see your digital <br></br>assets and protect them</Trans>
                            </Text>
                            <Box>
                                <LoginForm buttonVariant={'primary-solid-wide'} />
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
                {active && 
                    <Box
                        position="absolute"
                        display={{base: "none", sm: "block"}}
                        right={{base: "1rem", lg: "1rem", '2xl': "16rem"}}
                        top={{base: "0", sm: "0", md: "0", lg: "-1.5rem", xl: "-3rem", '2xl': "-3rem"}}
                        w={{base: "35%", sm: "35%", md: "35%", lg: "35%", xl: "35%", '2xl': "25%"}}
                        zIndex="0"
                    >
                        <Image src="/images/phone.png" alt="Phone"></Image>
                    </Box>
                }

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