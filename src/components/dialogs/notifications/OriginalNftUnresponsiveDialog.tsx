import { useEffect, useState } from "react"
import {
    Box,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    useDisclosure
} from '@chakra-ui/react'

import { Trans } from '@lingui/macro';
import NFT from '../../../classes/NFT';
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"
import NFTImage from "../../nftView/NFTImage";

const OriginalNftUnresponsiveDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog, getDialog } = useCallableDialogContext()

    useEffect(() => {
        setDialog('OriginalNftUnresponsiveDialog', {...disclosure, setNft})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={() => {
                onClose()
            }}
            blockScrollOnMount={false}
        >
            <ModalOverlay />
            <ModalContent
                maxW={{base: "450px"}}
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
                <ModalBody>
                    <Card variant="stepContent">
                        <CardHeader>
                            <Text as="h3" textStyle="h3">
                                <Trans>The Original NFT owner unresponsive</Trans>
                            </Text>
                        </CardHeader>

                        <CardBody mb={{base: "20px"}} >
                            { nft && <NFTImage nft={nft} /> }
                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                <Trans>Want to initiate a dispute in the<br/>Kleros decentralized court?</Trans>
                            </Text>
                            <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "0px"}}>
                                <Trans>{"(Paid separately)"}</Trans>
                            </Text>
                        </CardBody>

                        <CardFooter w="100%" flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}}>
                                <Button 
                                    onClick={ () => {
                                        onClose()
                                        const dialog = getDialog('ArbitrateOwnershipAdjustmentDialog')
                                        dialog.setNft(nft)
                                        dialog.onOpen()
                                    } }
                                    variant="darkOutline"
                                >
                                    <Trans>Open dispute</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default OriginalNftUnresponsiveDialog