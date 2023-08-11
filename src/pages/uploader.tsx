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
import { ChangeEventHandler, useEffect, useState } from 'react'
import { loadTranslation } from '../utils/lingui'
import { Form, Field, Formik } from 'formik';
import { IPFSFileUpload } from '../components/IPFSFileUpload'
import IPFSUpload from '../classes/IPFSUpload'
import Head from 'next/head'

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

const UploaderPage: NextPage = () => {

    const [imageUpload, setImageUpload] = useState<IPFSUpload>()
    const [ fileName, setFileName ] = useState<string>()

    const { setBaseUrl } = useIPFSContext()
    const { ipfs } = useIPFSContext()

    const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => setFileName(event.target.value)

    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    return (
        <>
        <Head>
            <title>{t`NFT Protect IPFS File Uploader`}</title>
        </Head>
        <Container 
            p={0}
            maxW="1920px"
            h={"auto"}
        >
            <NavBar />
            <Box
                position="relative"
                top="0" 
                left="0"
                h={"auto"}
            >
                <Flex 
                    flexDirection={"row"}
                    justifyContent="left"
                    pt={{base:"2.5rem", md:"5.25rem", xl: "8.25rem" }}
                    px={['1rem', '3rem']}
                    pb={{base: "2rem"}}
                >
                    <Box w={{base: "100%", sm: "70%"}}>
                        <Heading as="h1" fontStyle="h1">
                            <Trans>IPFS File Uploader</Trans>
                        </Heading>
                        <Text 
                            pt="1.25rem"
                            pb="2rem"
                            textStyle="h3"
                        >
                            <Trans>Here you can upload files to IPFS</Trans>
                        </Text>
                    </Box>
                </Flex>

            </Box>
            <main>
                <Formik
                    initialValues={{}}
                    validateOnMount={true}
                    onSubmit={(values, actions) => {
                        //onSubmit(values)
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
                                        <Trans>Select a file to upload</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody my={{base: "20px"}}>
                                    <Field name='name'>
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.name && form.touched.name} mb={{base: "20px"}}>
                                                <Input
                                                    type='text' 
                                                    {...field} 
                                                    placeholder={t`Name of your file`}
                                                    variant='primary' 
                                                    resize="vertical"
                                                    onChange={handleNameChange}
                                                />
                                                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                    
                                    <Box w="100%" minW={'10em'} mb={{base: "10px"}}>
                                        <IPFSFileUpload 
                                            returnUploadedFiles={ setImageUpload }
                                            fileTypes={["JPG", "PNG", "GIF", "PDF", "RTF", "JSON"]}
                                            multiple={false}
                                            fileName={fileName}
                                        />
                                    </Box>
                                </CardBody>

                                <CardFooter flexDirection="column" alignItems="center">
                                    <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                        {/* <Button
                                            type="submit"
                                            variant="darkOutline"
                                            isDisabled={ !props.isValid || !imageUpload }
                                        >
                                            <Trans>Set to contract</Trans>
                                        </Button> */}
                                       <Text>{ imageUpload?.getRelativeIPFSUrl() }</Text>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </Form>
                    )}
                </Formik>

                { /** Dialogs used on this page */ }

            </main>
        </Container>
    </>
    )
}

export default UploaderPage