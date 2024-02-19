import type { GetStaticProps, NextPage } from 'next'
import { loadTranslation } from '../utils/lingui'
import { Trans, t } from '@lingui/macro'
import {
    Container,
    Heading,
    Flex,
    Text,
    Grid,
    GridItem,
    Divider,
    VStack
} from '@chakra-ui/react'
import Head from 'next/head'
import NavBar from '../components/navBar/NavBar'
import Footer from '../components/footer/Footer'
import ReferralLink from '../components/referral/ReferralLink'
import AffilateActions from '../components/referral/AffilateActions'
import UserRewards from '../components/referral/UserRewards'
import LoginScreen from '../components/LoginScreen'
import { useAppContext } from '../context/AppContextProvider'
import SocialButtons from '../components/referral/SocialButtons'
import ReferralSteps from '../components/referral/ReferralSteps'

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

const ReferralPage: NextPage = () => {
    const { account, active, currentChain } = useAppContext()

    return (
        <>
            <Head>
                <meta name="description" content={t`The referral program page.`} />
                <title>{t`NFT Protect • Referral program`}</title>
            </Head>
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
                    <NavBar showConnectButton={true}/>
                </GridItem>

                <GridItem area={'main'}>
                    <main>
                        { !active && <LoginScreen/> }

                        { active && <Container 
                            p={0}
                            maxW="1920px"
                            width={"auto"}
                            h={"auto"}
                        >                            
                            <Flex direction={{ base: 'column', xl: 'row' }} justify="flex-end" my={{ base: '1.5rem', md: '3rem' }} mr={{ base: '1.5rem', md: '3rem' }}>
                                <VStack spacing={4} align="stretch"  mb="2rem" ml={{ base: '1.5rem', md: '3rem' }} flex={1}>
                                    <Heading 
                                        size='2xl'
                                        as="h1"
                                        fontWeight="800"
                                    >
                                        <Trans>Referral program</Trans>
                                    </Heading>
                                    <Text textStyle={'h3'} mb={{ base: '0', md: '1rem' }}>
                                        <Trans>Get comission every time your referral protects an NFT!</Trans>
                                    </Text>
                                    <Text textStyle={'h3'}>
                                        <Trans>Copy your unique referral link</Trans>
                                    </Text>
                                    <ReferralLink/>
                                    <Text textStyle={'h3'}>
                                        <Trans>Or share link via</Trans>
                                    </Text>
                                    <SocialButtons/>
                                    <Divider borderColor="#D9D9D9" borderWidth="1px" />
                                    <Heading 
                                        as="h2"
                                        size="xl"
                                        fontWeight="800"
                                    >
                                        <Trans>How it works?</Trans>
                                    </Heading>
                                    <ReferralSteps/>
                                </VStack>
                                {/* Vertical break here */}
                                <VStack spacing={10} flex={1} align="stretch" ml={{ base: '1.5rem', md: '3rem' }}>
                                    <UserRewards/>
                                    <AffilateActions/>
                                </VStack>
                            </Flex>
                        </Container> }
                    </main>
                </GridItem>

                <GridItem area={'footer'}>
                    <Footer />
                </GridItem>
            </Grid>
        </>
    )
}

export default ReferralPage;