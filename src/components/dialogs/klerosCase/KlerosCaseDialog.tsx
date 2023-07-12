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

    return (<>{
        pageData && <>
            <Modal
                variant="stepModal"
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
            >
                <ModalOverlay />
                <ModalContent
                    borderRadius="0"
                    sx={{
                        "::-webkit-scrollbar": {
                            w: "5px",
                        },
                        "::-webkit-scrollbar-track": {
                            my: '16px',
                            // overflowY: "hidden"
                        },
                        "::-webkit-scrollbar-thumb": {
                            bgColor: 'brand.light',
                        }
                    }}
                >
                    <Box
                        position="sticky"
                        top="0"
                        zIndex="1"
                        bgColor="brand.light"
                        color="#FFF"
                        w="100%"
                        display="flex"
                    >
                        <ModalCloseButton onClick={onClose} color={'grey'}/>
                    </Box>

                    <ModalBody mx={{base: "220px"}}>
                        <Container 
                            p={0}
                            maxW="1920px"
                            width={"auto"}
                            h={"auto"}
                        >
                            <Flex flexDir="column" width="100%">
                                { nft && caseData && <KlerosCaseContent
                                    requestType={
                                        caseData.metaEvidenceId === 3 ? 
                                            ReqType.OwnershipAdjustment : 
                                            ReqType.OwnershipRestore
                                    }
                                    pageData={pageData}
                                    {...caseData}
                                /> }
                            </Flex>
                        </Container>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    }</>)
}

export default KlerosCaseDialog