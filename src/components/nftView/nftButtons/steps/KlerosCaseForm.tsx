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
    useDisclosure,
} from '@chakra-ui/react'
import { Form, Field, Formik } from 'formik'
import { IPFSFileUpload } from '../../../IPFSFileUpload';
import { generateMetaEvidence, KlerosCourts } from '../../../../utils/kleros';

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
    const [evidenceIpfsUrl, setEvidenceIpfsUrl] = useState('')

    const onSubmit = (data:any) => {
        const metaEvidence = generateMetaEvidence({
            title: title,
            category: category,
            description: data.description,
            claimant: claimant,
            defendant: defendant,
            question: question,
            ruling: ruling,
            fileURI: evidenceIpfsUrl
        })
        outerOnSubmit && outerOnSubmit(metaEvidence)
    }

    return (<>
        <Formik
            initialValues={{}}
            onSubmit={(values, actions) => {
                onSubmit(values)
                setTimeout(() => {
                    actions.setSubmitting(false)
                }, 1000)
            }}
        >
            {(props) => (
                <Form onSubmit={props.handleSubmit}>
                    <Field name='description' required>
                        {({ field, form }: any) => (
                        <FormControl isInvalid={form.errors.description && form.touched.description}>
                            <FormLabel>Description</FormLabel>
                            <Textarea 
                                type='text' 
                                {...field} 
                                placeholder='Describe the situation in detail...'
                            />
                            <FormErrorMessage>{form.errors.description}</FormErrorMessage>
                        </FormControl>
                        )}
                    </Field>
                    <IPFSFileUpload setIpfsUrl={setEvidenceIpfsUrl}/>
                    <Box w="100%">
                        <Button
                            type="submit"
                            variant="primary-solid"
                            my={2}
                            w="100%"
                        >
                            Initiate a dispute
                        </Button>
                    </Box>
                    <Button 
                        onClick={onClose as any}
                        variant="light-outline"
                        w="100%"
                        mt={[4, 8]}
                    >
                        Close
                    </Button>
                </Form>
            )}
        </Formik>
    </>)
}

export default KlerosCaseForm