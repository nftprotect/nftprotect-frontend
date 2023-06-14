import { useState, useEffect } from 'react';
import {
    chakra,
    Button,
    Box,
    Flex,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Textarea,
    ListItem,
    OrderedList,
    Link,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure
} from '@chakra-ui/react'
// import { StepsTheme as Steps } from 'chakra-ui-steps';
import KlerosCaseContent from './step/KlerosCaseContent';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import { metaEvidenceTypes } from '../../../utils/metaEvidence';
import { KlerosCaseInitialData } from './step/KlerosCaseContent';
import { useAppContext } from '../../../context/AppContextProvider';
import { Trans, t } from '@lingui/macro';

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
                    <ModalCloseButton onClick={onClose} />
                    <ModalBody mx={{base: "220px"}}>
                        <Flex flexDir="column" width="100%">
                            { nft && caseData && <KlerosCaseContent
                                pageData={pageData}
                                {...caseData}
                            /> }
                        </Flex>

                        <Flex 
                            flexDirection="row"
                            flexWrap={{base: "wrap", sm: "nowrap"}}
                            alignSelf="flex-start"
                            justifyContent="center"
                            w="100%"
                            p="0"
                            mb={{base: "30px"}}
                        >
                            <Box w={{base: "14rem"}} mr={{base: "20px"}}>
                                <Button
                                    onClick={ onClose }
                                    variant="darkOutline"
                                >
                                    <Trans>Cancel</Trans>
                                </Button>
                            </Box>
                            <Box w={{base: "14rem"}} ml={{base: "20px"}}>
                                <Button
                                    onClick={ onClose }
                                    variant="darkOutline"
                                >
                                    <Trans>Proceed to payment</Trans>
                                </Button>
                            </Box>
                        </Flex>
                        
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    }</>)
}

export default KlerosCaseDialog