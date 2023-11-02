import { useState, useEffect } from 'react';
import {
    chakra,
    Flex,
    Box,
    Container,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react'
import KlerosCaseContent from './step/KlerosCaseContent';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import { metaEvidenceTypes } from '../../../utils/metaEvidence';
import { KlerosCaseInitialData } from './step/KlerosCaseContent';
import { ReqType } from '../../../hooks/useNftProtectGraph';

const KlerosCaseDialog = () => {

    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ caseData, setCaseData ] = useState<KlerosCaseInitialData>()
    const { nft, metaEvidenceId } = caseData || {}
    const pageData = metaEvidenceId && metaEvidenceTypes.find((item) => item.value === metaEvidenceId.toString() )?.page

    useEffect(() => {
        setDialog('KlerosCaseDialog', {...disclosure, setCaseData})
    }, [])

    return <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={onClose}
            size="full"                    
        >
            <ModalOverlay />
            <ModalContent
                borderRadius="0"
                sx={{ // This is needed to override scrollbar which is grey because Modal is called from Modal
                    "::-webkit-scrollbar": {
                        w: "4px",
                    },
                    "::-webkit-scrollbar-track": {
                        my: '4px',
                    },
                    "::-webkit-scrollbar-thumb": {
                        bgColor: 'brand.light',
                    }
                }}
            >
                <ModalCloseButton onClick={onClose} color={'grey'}/>

                <ModalBody>
                    <Container 
                        maxW="1920px"
                        width={"100%"}
                        // h={"100%"}
                    >
                        { nft && caseData && pageData && <KlerosCaseContent
                            requestType={
                                caseData.metaEvidenceId === 3 ? 
                                    ReqType.OwnershipAdjustment : 
                                    ReqType.OwnershipRestore
                            }
                            pageData={pageData}
                            {...caseData}
                        /> }
                    </Container>
                </ModalBody>
            </ModalContent>
        </Modal>
}

export default KlerosCaseDialog