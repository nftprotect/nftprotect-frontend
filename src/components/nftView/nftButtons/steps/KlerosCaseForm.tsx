import React, { useState } from 'react';
import {
    Button,
    Box,
    Image,
    Flex,
    Heading,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Container,
    Badge,
    Progress,
    List,
    ListItem,
    ListIcon,
    Textarea,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure,
} from '@chakra-ui/react';
import { Form, Field, Formik } from 'formik';
import { Info } from '@web3uikit/icons';
import { Trans, t } from '@lingui/macro';
import { IPFSFileUpload } from '../../../IPFSFileUpload';
import { generateMetaEvidence, KlerosCourts } from '../../../../utils/kleros';
import IPFSUpload from '../../../../classes/IPFSUpload';

interface FormInitialData {
    onSubmit?: Function | undefined,
    onClose: Function,
    claimant: string,
    defendant: string,
    title: string,
    category: string,
    question: string,
    ruling: any
}

const KlerosCaseForm = ({
    onSubmit: outerOnSubmit, 
    onClose, 
    claimant,
    defendant,
    title,
    category,
    question,
    ruling
}: FormInitialData) => {
    const [evidenceUpload, setEvidenceUpload] = useState<IPFSUpload>()

    const onSubmit = (data:any) => {
        const metaEvidence = generateMetaEvidence({
            title: title,
            category: category,
            description: data.description,
            claimant: claimant,
            defendant: defendant,
            question: question,
            ruling: ruling,
            fileURI: ''//evidenceIpfsUrl
        })
        outerOnSubmit && outerOnSubmit(metaEvidence)
    }

    // Textarea input validation
    function validateDescription(value: string) {
        let error
        if (!value) {
          error = <Trans>Description is required</Trans>
        }
        return error
      }

    return (<>
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
                                <Trans>Open dispute <br /> in Kleros</Trans>
                            </Text>
                            <Text textStyle="paragraph" textAlign="center" textTransform="uppercase" fontWeight="700">
                                <Trans>Bona fide transfer</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody my={{base: "20px"}}>
                            <Field name='description' validate={validateDescription} >
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.description && form.touched.description} mb={{base: "20px"}}>
                                        <Textarea 
                                            type='text' 
                                            {...field} 
                                            placeholder={t`Describe the situation in details…`}
                                            variant='primary' resize="vertical" 
                                        />
                                        <FormErrorMessage>{form.errors.description}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>

                            <Flex mb={{base: "20px"}} flexDirection="column" textStyle="paragraph" >
                                <Text mb={{base: "8px"}}>
                                    <Trans>Upload all available evidence:</Trans>
                                </Text>
                                <Text>
                                    <Trans>To ensure a fair review by expert arbitrators, be sure to provide evidence. The more detail you provide, including text, images, or other documentation, the better the review.</Trans>
                                </Text>
                            </Flex>
                            
                            <Box w="100%">
                                { evidenceUpload && evidenceUpload.fileName }
                                <IPFSFileUpload returnUploadedFile={ setEvidenceUpload }/>
                            </Box>
                            
                            <Flex flexWrap="nowrap" alignItems="center" mt={{base: "8px"}} mb={{base: "10px"}}>
                                <Box color="#2D7BD6" mr={[2]}>
                                    <Info fontSize='20px' />
                                </Box>
                                <Text textStyle="paragraph" color="muted">
                                    <Trans>You can add an external file in PDF or add multiple files in a single .zip file.</Trans>
                                </Text>
                            </Flex>
                        </CardBody>

                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                <Button
                                    type="submit"
                                    variant="dark-outline"
                                    textTransform="uppercase"
                                    isDisabled={ !props.isValid || !evidenceUpload }
                                >
                                    <Trans>Open dispute</Trans>
                                </Button>
                            </Box>
                            <Box w={{base: "60%", sm: "50%"}}>
                                <Button 
                                    onClick={onClose as any}
                                    variant="dark-outline"
                                >
                                    Close
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </Form>
            )}
        </Formik>
    </>)
}

export default KlerosCaseForm