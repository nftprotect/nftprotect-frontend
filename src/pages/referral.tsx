import type { GetStaticProps, NextPage } from 'next'
import { loadTranslation } from '../utils/lingui'
import { useAppContext } from '../context/AppContextProvider'
import { Trans, t } from '@lingui/macro'
import {
    chakra,
    Container,
    Heading,
    Image,
    Flex,
    Text,
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Textarea,
    Input,
    Select,
    Spacer,
    Grid,
    GridItem,
    Link,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
    Spinner,
    Divider
} from '@chakra-ui/react'
import Head from 'next/head'
import NavBar from '../components/navBar/NavBar'
import Footer from '../components/footer/Footer'
import ReferralLink from '../components/referral/ReferralLink'
import AffilateActions from '../components/referral/AffilateActions'
import UserRewards from '../components/referral/UserRewards'

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
    


    return (<>
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
                <NavBar showConnectButton={false}/>
            </GridItem>

            <GridItem area={'main'}>
                <main>
                    <Container 
                        p={0}
                        maxW="1920px"
                        width={"auto"}
                        h={"auto"}
                        mx={'3em'}
                    >
                        <Heading 
                            pt='1em' 
                            pb='0.4em'
                            textStyle="h1"
                            fontWeight="800"
                        >
                            <Trans>Referral program</Trans>
                        </Heading>
                        <Text 
                            textStyle={'h3'}
                        >
                            <Trans>Get comission every time your referral protects an NFT!</Trans>
                        </Text>
                        <br/>
                        <Text 
                            textStyle={'h3'}
                        >
                            <Trans>Copy your unique referral link</Trans>
                        </Text>
                        <ReferralLink/>
                        <br/>
                        <Divider/>
                        <br/>
                        <AffilateActions/>
                        <br/>
                        <UserRewards/>
                    </Container>
                </main>
            </GridItem>

            <GridItem area={'footer'}>
                <Footer />
            </GridItem>
        </Grid>
    </>)
}

export default ReferralPage;
