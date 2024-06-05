import type { GetStaticProps, NextPage } from 'next'
import { loadTranslation } from '../utils/lingui'
import { useEffect, useState } from 'react'
import { supportedChains } from '../config'
import { useAlchemy } from '../hooks/useAlchemy'
import NFT from '../classes/NFT'
import { useAppContext } from '../context/AppContextProvider'
import { Trans, t } from '@lingui/macro'
import { RequestGraphData, TokenGraphData, useNftProtectGraph } from '../hooks/useNftProtectGraph'
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
    Spinner
} from '@chakra-ui/react'
import { Form, Field, Formik } from 'formik';
import Head from 'next/head'
import NFTImage from '../components/nftView/NFTImage'
import NavBar from '../components/navBar/NavBar'
import { CheckCircleIcon, ExternalLinkIcon, WarningIcon } from '@chakra-ui/icons'
import { HelpCircle, Info } from '@web3uikit/icons'
import Footer from '../components/footer/Footer'
import { generateAddressURL, generateTokenURL } from '../utils/etherscan'
import { generateRequestLink } from '../utils/helpers'
import AddressDisplay from '../components/AddressDisplay'
import { ReqStatus } from '../hooks/useNftProtect'

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
    const { currentChain, defaultChain, setChainId } = useAppContext()
    const [ nft, setNft ] = useState<NFT>()
    const [ nftGraphData, setNftGraphData ] = useState<TokenGraphData>()
    const [ validationResult, setValidationResult ] = useState<boolean>()
    const [ loadingPending, setLoadingPending ] = useState<boolean>(false)
    const [ nftLoadingPending, setNftLoadingPending ] = useState<boolean>(false)
    const { nft: nftApi } = useAlchemy()
    const { getToken, getRequest } = useNftProtectGraph(currentChain?.id || defaultChain.id)
    const [ request, setRequest ] = useState<RequestGraphData|null>()

    const loadNft = async (tokenId: bigint) => {
        const alchemyNft = await nftApi.getNftMetadata(
            currentChain.nftpContractAddress,
            tokenId
        )
        return new NFT(alchemyNft)
    }

    useEffect(() => {
        if (nft) {
            console.log("NFT", nft)
        }
    }, [nft])

    const [ validationRequest, setValidationRequest ] = useState<{
        tokenId: bigint,
        contractAddress: string,
        chainId: number
    }>()
    
    const onSubmit = async (formValues:any) => {
        setLoadingPending(true)
        setChainId(parseInt(formValues.chainId))
        setValidationRequest({
            chainId: parseInt(formValues.chainId),
            contractAddress: formValues.contractAddress,
            tokenId: BigInt(formValues.tokenId)
        })
    }

    const checkContract = (address: string) => address.toLowerCase() === currentChain.nftpContractAddress.toLowerCase()
    
    const checkPNFT = async (tokenId: bigint) => {
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
            setLoadingPending(false)
            if (isValid) {
                setNftLoadingPending(true)
                const nft = await loadNft(validationRequest.tokenId)
                setNft(nft)
                setNftLoadingPending(false)
            }
        }
    }

    useEffect(() => {
        // Performing if request set and network switched
        if (currentChain && validationRequest && (currentChain.id === validationRequest.chainId)) {
            processRequest()
        }
    }, [currentChain, validationRequest])

    const loadRequest = async () => {
        if (nftGraphData?.latestRequest) {
            const request = await getRequest(nftGraphData.latestRequest.id)
            setRequest(request)
        }
    }

    useEffect(() => {
        loadRequest()
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
                        <Heading pb='0.5em'>
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
                                    <Flex flexDirection={{md: 'row', base: 'column'}} flexWrap="nowrap" mb={{md: '0', base: '1.5em'}}>
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
                                                        placeholder={t`Network`}
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
                        { loadingPending ?
                            <Spinner variant="primary" speed='0.65s' my={{base: "20px"}} /> : 
                            <>
                                { validationResult === true && <Box mb='1.5em'>
                                    <Text fontSize={'18px'} fontWeight='600'>
                                        <CheckCircleIcon color='green'/>&nbsp;
                                        <Trans>Valid</Trans>
                                    </Text>
                                </Box> }
                                { validationResult === false && <Box mb='1.5em'>
                                    <Text fontSize={'18px'} fontWeight='600'>
                                        <WarningIcon color='red'/>&nbsp;
                                        <Trans>Invalid</Trans>
                                    </Text>
                                    <Text textStyle={'paragraph'}>
                                        <Trans>The pNFT with the provided address and ID does not exist in {currentChain.name} network. Please ensure you have entered the correct information and try again.</Trans>
                                    </Text>
                                </Box> }
                                { nftLoadingPending ?
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}} /> :
                                        <>
                                        { validationResult && nftGraphData && nft && 
                                            <Card variant='outline' bgColor={'body.bgColor'}><CardBody bgColor={'body.bgColor'}>
                                                <Flex 
                                                    flexDirection={{md: 'row', base: 'column'}} 
                                                    bgColor={'body.bgColor'} 
                                                    alignItems="flex-start"
                                                >
                                                    <Box maxWidth={{sm: '400px', md: '150px', base: '100%' }}>
                                                        { nft && <NFTImage nft={nft} setDefaultStyles={ false } /> }
                                                    </Box>
                                                
                                                    <Flex flexDirection="column" ml={{base: '0', md: "18px"}} mt={{base: '1em', md: "0"}}>
                                                        <Heading size='md'>
                                                            { nft.title || nft?.contract?.name }
                                                        </Heading>
                                                        <Text textStyle="paragraph" display={'flex'} flexDirection={{base: 'column', md: 'row'}}>
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
                                                                    <AddressDisplay address={nftGraphData.contractAddress}/> (id: {nftGraphData.tokenId.toString()})
                                                                </chakra.span>
                                                                <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                                            </Link>
                                                        </Text>
                                                        <Text textStyle="paragraph" display={'flex'} flexDirection={{base: 'column', md: 'row'}} >
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
                                                                    <AddressDisplay address={nftGraphData.originalOwnerAddress} formatNumber={8}/>
                                                                </chakra.span>
                                                                <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                                            </Link>
                                                        </Text>
                                                            <Text textStyle="paragraph" display={'flex'} flexDirection={{base: 'column', md: 'row'}}>
                                                                <chakra.span fontWeight="600">
                                                                    <Trans>{"The protected NFT (pNFT) owner:"}</Trans>
                                                                </chakra.span>
                                                                {" "}
                                                                <Flex direction={'row'}>
                                                                    <Link 
                                                                        href={ generateAddressURL(nftGraphData.ownerAddress, currentChain.id) }
                                                                        isExternal 
                                                                        rel="noreferrer" 
                                                                        
                                                                        ml={{base: "5px"}}
                                                                    >
                                                                        <chakra.span wordBreak="break-all" color="#2D7BD6" textDecoration="underline">
                                                                            <AddressDisplay address={nftGraphData.ownerAddress} formatNumber={8}/>
                                                                        </chakra.span>
                                                                        <ExternalLinkIcon mx='5px' fontSize={{base: "14px"}} color="text.muted" />
                                                                    </Link>
                                                                    { (nftGraphData.ownerAddress.toLowerCase() !== nftGraphData.originalOwnerAddress.toLowerCase()) && 
                                                                        <Text textStyle="paragraph">
                                                                            <Popover placement="right">
                                                                                <PopoverTrigger>
                                                                                    <Box cursor="pointer" color="red" ml={[2]}>
                                                                                        <WarningIcon fontSize='18px' />
                                                                                    </Box>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent w={{base: "280px"}}  textStyle="paragraph" textAlign="left">
                                                                                    <PopoverArrow />
                                                                                    <PopoverBody  borderRadius="16px" px={{base: "10px"}} py={{base: "10px"}} >
                                                                                        <Trans>The owner of the pNFT and the original owner are different! Please be extremely careful, as if you purchase a stolen pNFT, the original owner can prove the fact of theft through court and burn the pNFT.</Trans>
                                                                                    </PopoverBody>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        </Text>
                                                                    }
                                                                </Flex>
                                                            </Text>

                                                        { request && (request.status === ReqStatus.Disputed) && 
                                                            <Text textStyle="paragraph">
                                                                <Badge bgColor='red' color='white' py='0.2em' px='0.4em'>
                                                                    <Link
                                                                        isExternal 
                                                                        rel="noreferrer"
                                                                        href={generateRequestLink(request.id, currentChain.id)}
                                                                        whiteSpace="nowrap"
                                                                        display="flex"
                                                                        alignItems="center"
                                                                    >
                                                                        <Trans>Under dispute</Trans>
                                                                        <ExternalLinkIcon fontSize='16px' ml="5px" />
                                                                    </Link>
                                                                </Badge>
                                                            </Text> 
                                                        }
                                                    </Flex>
                                                </Flex>
                                            </CardBody></Card> }
                                        </>
                                }
                            </>
                        }
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
