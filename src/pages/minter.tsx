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
    CardHeader,
    CardBody,
    CardFooter,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Textarea,
    Input,
    Select
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
import { defaultChain } from '../utils/config'
import { Form, Field, Formik } from 'formik';
import { IPFSFileUpload } from '../components/IPFSFileUpload'
import IPFSUpload from '../classes/IPFSUpload'
import { useMinters } from '../hooks/useMinters'
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

const MinterPage: NextPage = () => {

    const { account, active, dynamicArbRegistryContract, currentChain } = useAppContext()
    const [imageUpload, setImageUpload] = useState<IPFSUpload>()
    const { setBaseUrl } = useIPFSContext()
    const { getDialog } = useCallableDialogContext()
    const { ipfs } = useIPFSContext()
    const { mint } = useMinters()
    const graphUpdateTimeout = 3000

    const onSubmit = async (formValues:any) => {
        console.log('FORM DATA', formValues, imageUpload)
        if (imageUpload) {
            const metadataJson = {
                description: formValues.description, 
                image: imageUpload?.getAbsoluteIPFSUrl(), 
                name: formValues.name
              }
            console.log('METADATA JSON:', metadataJson)
            const metadataUpload =  await uploadMetadata(metadataJson)
            console.log('METADATA UPLOAD:', metadataUpload.getCentralizedUrl(), metadataUpload.getAbsoluteIPFSUrl())
            mint(formValues.type, formValues.amount, metadataUpload.getAbsoluteIPFSUrl())        
        }
    }

    const uploadMetadata = async (metadata: any) => {
        const fileName = 'metadata.json'
        if (ipfs) {
            const result = await ipfs.add(
                {
                    path: fileName,
                    content: JSON.stringify(metadata)
                }, 
                {wrapWithDirectory: false}
            )
            return new IPFSUpload({
                uploadResult: result,
                fileName: fileName,
                wrappedWithDirectory: false
            })
        } else {
            throw Error('IPFS client not configured!')
        }
    }


    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [active, account])


    return (
        <>
        <Head>
            <meta name="robots" content="noindex,nofollow" />
            <title>{t`NFT Protect • NFT Minter`}</title>
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
                        <Box w={{base: "100%", sm: "70%"}}>
                            <Heading as="h1" fontStyle="h1">
                                <Trans>Simple NFT Minter</Trans>
                            </Heading>
                            <Text 
                                pt="1.25rem"
                                pb="2rem"
                                textStyle="h3"
                            >
                                <Trans>Here you can mint any NFTs for your purposes</Trans>
                            </Text>
                        </Box>
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
                                <Trans>Please connect your wallet to mint <br></br>an NFT</Trans>
                            </Text>
                            <Box w={{base: "14rem", sm: "16rem"}} >
                                <ConnectButton buttonVariant={'primaryLight'} />
                            </Box>
                        </>
                    }
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
                                <Card variant="stepContent">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3" mb={{base: "10px"}}>
                                            <Trans>Please fill the form to create an NFT</Trans>
                                        </Text>
                                    </CardHeader>

                                    <CardBody my={{base: "20px"}}>
                                        <Field name='tokenType'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.name && form.touched.name} mb={{base: "20px"}}>
                                                    <Select
                                                        {...field} 
                                                        placeholder={t`Type of your NFT`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                    >
                                                        <option value='ERC721'>ERC721</option>
                                                        <option value='ERC1155'>ERC1155</option>
                                                    </Select>
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Field name='name'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.name && form.touched.name} mb={{base: "20px"}}>
                                                    <Input
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Name of your NFT`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                    />
                                                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        <Field name='description'>
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.description && form.touched.description} mb={{base: "20px"}}>
                                                    <Textarea 
                                                        type='text' 
                                                        {...field} 
                                                        placeholder={t`Describe your NFT in details…`}
                                                        variant='primary' 
                                                        resize="vertical"
                                                        isRequired
                                                    />
                                                    <FormErrorMessage>{form.errors.description}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>

                                        { <Field name='amount' >
                                            {({ field, form }: any) => (
                                                <FormControl isInvalid={form.errors.amount && form.touched.amount} mb={{base: "20px"}}>
                                                    <Input 
                                                        type='number' 
                                                        {...field} 
                                                        placeholder={t`Amount of minted NFTs`}
                                                        variant='primary' 
                                                        resize="vertical" 
                                                        mb={{base: "20px"}} 
                                                        isRequired 
                                                        minH={{base: "38px" }}
                                                    />
                                                    <FormErrorMessage>{form.errors.amount}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>}
                                        
                                        <Box w="100%" mb={{base: "10px"}}>
                                            <IPFSFileUpload 
                                                returnUploadedFiles={ setImageUpload }
                                                fileTypes={["JPG", "PNG", "GIF", "PDF", "RTF", "JSON"]}
                                                multiple={false}
                                            />
                                        </Box>
                                    </CardBody>

                                    <CardFooter flexDirection="column" alignItems="center">
                                        <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                            <Button
                                                type="submit"
                                                variant="darkOutline"
                                                isDisabled={ !props.isValid || !imageUpload }
                                            >
                                                <Trans>Mint</Trans>
                                            </Button>
                                        </Box>
                                    </CardFooter>
                                </Card>
                            </Form>
                        )}
                    </Formik>

                    { /** Dialogs used on this page */ }

                </main>
            }
        </Container>
    </>
    )
}

export default MinterPage