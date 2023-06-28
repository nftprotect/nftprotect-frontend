import { useState, useEffect } from 'react';
import {
    chakra,
    Flex,
    Grid,
    GridItem,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react'
// import { StepsTheme as Steps } from 'chakra-ui-steps';
import KlerosCaseContent from './step/KlerosCaseContent';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import { metaEvidenceTypes } from '../../../utils/metaEvidence';
import { KlerosCaseInitialData } from './step/KlerosCaseContent';
import { useAppContext } from '../../../context/AppContextProvider';
import { Trans, t } from '@lingui/macro';
import Footer from '../../footer/Footer'
import NavBar from '../../navBar/NavBar'

const KlerosCaseDialog = () => {

    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const { setDialog } = useCallableDialogContext()
    const [ caseData, setCaseData ] = useState<KlerosCaseInitialData>()
    const { nft, metaEvidenceId } = caseData || {}
    const pageData = metaEvidenceId && metaEvidenceTypes.find((item) => item.value === metaEvidenceId.toString() )?.page
    const { account, library } = useAppContext()

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
                    // as="Grid"
                    borderRadius="0"
                    sx={{
                        "::-webkit-scrollbar": {
                            w: "5px",
                        },
                        "::-webkit-scrollbar-track": {
                            my: '16px',
                            overflowY: "hidden"
                        },
                        "::-webkit-scrollbar-thumb": {
                            bgColor: 'brand.light',
                        }
                    }}
                >
                    <GridItem
                        position="sticky"
                        top="0"
                        zIndex="1"
                        bgColor="brand.light"
                        color="#FFF"
                        w="100%"
                        display="flex"
                    >
                        <NavBar />
                        <ModalCloseButton onClick={onClose} />
                    </GridItem>

                    <GridItem area={'main'}>
                        <ModalBody mx={{base: "220px"}}>
                            <Flex flexDir="column" width="100%">
                                { nft && caseData && <KlerosCaseContent
                                    pageData={pageData}
                                    {...caseData}
                                /> }
                            </Flex>
                        </ModalBody>
                    </GridItem>

                    <GridItem area={'footer'}>
                        <Footer />
                    </GridItem>
                </ModalContent>
            </Modal>
        </>
    }</>)
}

export default KlerosCaseDialog