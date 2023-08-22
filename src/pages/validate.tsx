import type { GetStaticProps, NextPage } from 'next'
import { loadTranslation } from '../utils/lingui'
import { useEffect, useState } from 'react'
import { supportedChains } from '../utils/config'
import { BigNumber } from '@ethersproject/bignumber'
import { useAlchemy } from '../hooks/useAlchemy'
import NFT from '../classes/NFT'
import { useAppContext } from '../context/AppContextProvider'
import { Trans, t } from '@lingui/macro'
import { ReqStatus, RequestGraphData, TokenGraphData, useNftProtectGraph } from '../hooks/useNftProtectGraph'
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
    Badge
} from '@chakra-ui/react'
import { Form, Field, Formik } from 'formik';
import Head from 'next/head'
import NFTImage from '../components/nftView/NFTImage'
import NavBar from '../components/navBar/NavBar'
import { CheckCircleIcon, ExternalLinkIcon, WarningIcon } from '@chakra-ui/icons'
import Footer from '../components/footer/Footer'
import { generateAddressURL, generateTokenURL } from '../utils/etherscan'
import { formatAddress } from '../utils/helpers'

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

const ValidatePage: NextPage = () => {
    const context = useAppContext()
    const { account, active, library, currentChain, nftProtectContract, setChainId } = context
    const [ nft, setNft ] = useState<NFT>()
    const [ nftGraphData, setNftGraphData ] = useState<TokenGraphData>()
    const [ validationResult, setValidationResult ] = useState<boolean>()
    const { getNftMetadata } = useAlchemy()
    const { getToken, getRequest } = useNftProtectGraph()
    const [ request, setRequest ] = useState<RequestGraphData|null>()

    const loadNft = async (tokenId: BigNumber) => {
        const alchemyNft = await getNftMetadata([
            nftProtectContract.address,
            tokenId
        ])
        return new NFT(alchemyNft, context)
    }

    useEffect(() => {
        if (nft) {
            console.log("NFT", nft)
        }
    }, [nft])

    const [ validationRequest, setValidationRequest ] = useState<{
        tokenId: BigNumber,
        contractAddress: string,
        chainId: number
    }>()
    
    const onSubmit = async (formValues:any) => {
        setChainId(parseInt(formValues.chainId))
        setValidationRequest({
            chainId: parseInt(formValues.chainId),
            contractAddress: formValues.contractAddress,
            tokenId: BigNumber.from(formValues.tokenId)
        })
    }

    const checkContract = (address: string) => address.toLowerCase() === currentChain.nftpContractAddress.toLowerCase()
    
    const checkPNFT = async (tokenId: BigNumber) => {
        const graphNft = await getToken(tokenId)
        setNftGraphData(graphNft)
        return graphNft ? true : false
    }
    
    const processRequest = async () => {
        if (currentChain && validationRequest) {
            console.log('VALIDATION REQUEST', validationRequest, currentChain)
            let isValid = checkContract(validationRequest.contractAddress)
            console.log(isValid, validationRequest.contractAddress, currentChain.nftpContractAddress)
            isValid = isValid && await checkPNFT(validationRequest.tokenId)
            console.log('IS VALID:', isValid)
            setRequest(undefined)
            setValidationResult(isValid)
            const nft = isValid ? await loadNft(validationRequest.tokenId) : undefined
            setNft(nft)
        }
    }

    useEffect(() => {
        // Performing if request set and network switched
        if (currentChain && validationRequest && (currentChain.id === validationRequest.chainId)) {
            processRequest()
        }
    }, [currentChain, validationRequest])

    const loadDispute = async () => {
        if (nftGraphData?.latestRequest) {
            const request = await getRequest(nftGraphData.latestRequest.id)
            setRequest(request)
        }
    }

    useEffect(() => {
        loadDispute()
    }, [nftGraphData])

    return (<>
        <Head>
            <meta name="description" content={t`The page where you can verify the authenticity of pNFTs and find out who owns the original NFT.`} />
            <title>{t`NFT Protect • pNFT Validator`}</title>
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
                        mx={'2em'}
                    >
                        <Heading>
                            <Trans>Validate</Trans>
                        </Heading>
                        <Formik
                            initialValues={{}}
                            validateOnMount={true}
                            onSubmit={(values, actions) => {
                                onSubmit(values)
                                setTimeout(() => {
                                    actions.setSubmitting(false)
                                }, 1000)
                            }}
                        >

                            {(props) => (
                                <Form onSubmit={props.handleSubmit}>
                                    <Flex flexDirection="row" flexWrap="nowrap">

                                        <Field name='contractAddress'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.contractAddress && form.touched.contractAddress} mb={{base: "20px"}}>
                                                    <Input 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Enter the token smart contract address`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                    />
                                                    <FormErrorMessage>{form.errors.contractAddress}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Spacer minW={'1em'}/>
                                        <Field name='tokenId'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.tokenId && form.touched.tokenId} mb={{base: "20px"}}>
                                                    <Input
                                                        type='number' 
                                                        {...field} 
                                                        placeholder={t`Enter the ID*`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                    />
                                                    <FormErrorMessage>{form.errors.tokenId}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Spacer minW={'1em'}/>
                                        <Field name='chainId'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.chainId && form.touched.chainId} mb={{base: "20px"}}>
                                                    <Select
                                                        {...field} 
                                                        placeholder={t`Chain`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                        defaultValue={currentChain?.id}
                                                    >
                                                        { supportedChains.map((chain) => {
                                                            return <option 
                                                                key={`option-chain-${chain.id}`} 
                                                                value={chain.id}
                                                            >
                                                                {chain.name}
                                                            </option>
                                                        }) }
                                                    </Select>
                                                    <FormErrorMessage>{form.errors.chainId}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Spacer minW={'1em'}/>
                                        <Box w={{base: "60%", sm: "50%"}}>
                                            <Button
                                                type="submit"
                                                variant="primaryDark"
                                                isDisabled={ !props.isValid }
                                            >
                                                <Trans>Verify</Trans>
                                            </Button>
                                        </Box>
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                        { validationResult === true && <Box>
                            <CheckCircleIcon color='green'/>&nbsp;
                            <Trans>Valid</Trans>
                        </Box> }
                        { validationResult === false && <Box>
                            <WarningIcon color='red'/>&nbsp;
                            <Trans>Invalid</Trans>
                        </Box> }
                        { validationResult && nftGraphData && nft && 
                            <Flex bgColor="#F8F8F8" p={{base: "18px"}} alignItems="flex-start" mb={{base: "30px"}}>
                            <Box my={{base: "-20px"}}>
                                { nft && <NFTImage nft={nft} /> }
                            </Box>
                            
                            <Flex flexDirection="column" ml={{base: "18px"}} >
                                <Heading size='md'>
                                    { nft.title || nft?.contract?.name }
                                </Heading>
                                <Text textStyle="paragraph">
                                    <chakra.span fontWeight="600">
                                        <Trans>{"The original NFT:"}</Trans>
                                    </chakra.span>
                                    {" "}
                                    <Link 
                                        href={ generateTokenURL(nftGraphData.contractAddress, nftGraphData.tokenId.toString(), currentChain.id) }
                                        isExternal 
                                        rel="noreferrer" 
                                        
                                        ml={{base: "5px"}}
                                    >
                                        <chakra.span wordBreak="break-all">
                                            { `${formatAddress(nftGraphData.contractAddress, 4) } (id: ${nftGraphData.tokenId})` }
                                        </chakra.span>
                                        <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                    </Link>
                                </Text>
                                <Text textStyle="paragraph">
                                    <chakra.span fontWeight="600">
                                        <Trans>{"The original NFT owner:"}</Trans>
                                    </chakra.span>
                                    {" "}
                                    <Link 
                                        href={ generateAddressURL(nftGraphData.originalOwnerAddress, currentChain.id) }
                                        isExternal 
                                        rel="noreferrer" 
                                        
                                        ml={{base: "5px"}}
                                    >
                                        <chakra.span wordBreak="break-all" color="#2D7BD6" textDecoration="underline">
                                            { formatAddress(nftGraphData.originalOwnerAddress, 8) }
                                        </chakra.span>
                                        <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                    </Link>
                                </Text>
                                <Text textStyle="paragraph">
                                    <chakra.span fontWeight="600">
                                        <Trans>{"The protected NFT (pNFT) owner:"}</Trans>
                                    </chakra.span>
                                    {" "}
                                    <Link 
                                        href={ generateAddressURL(nftGraphData.ownerAddress, currentChain.id) }
                                        isExternal 
                                        rel="noreferrer" 
                                        
                                        ml={{base: "5px"}}
                                    >
                                        <chakra.span wordBreak="break-all" color="#2D7BD6" textDecoration="underline">
                                            { formatAddress(nftGraphData.ownerAddress, 8) }
                                        </chakra.span>
                                        <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                    </Link>
                                </Text>
                                { request && (request.status === ReqStatus.Disputed) && 
                                    <Badge>
                                        <Trans>Under dispute</Trans>
                                    </Badge>
                                }
                            </Flex>
                        </Flex> }
                    </Container>
                </main>
            </GridItem>

            <GridItem area={'footer'}>
                <Footer />
            </GridItem>
        </Grid>
    </>)
}

export default ValidatePage;
