import { useEffect, useState } from "react"
import {
    chakra,
    Box,
    Flex,
    Image,
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure
} from '@chakra-ui/react'
import { Trans, t } from '@lingui/macro';
import NFT from '../../classes/NFT';
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"
import NFTImage from "../nftView/NFTImage";

const ClaimantWinDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog, getDialog } = useCallableDialogContext()

    useEffect(() => {
        setDialog('ClaimantWinDialog', {...disclosure, setNft})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
            onClose={() => {
                onClose()
            }}
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
                                <Trans>The court{'\u0027'}s decision<br/>is now in effect</Trans>
                            </Text>
                        </CardHeader>
                        <CardBody>

                            { nft && <NFTImage nft={nft} /> }

                            <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "10px"}}>
                                    <Trans>The original NFT has been restored to your wallet.</Trans>
                                </Text>
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                    <Trans>The pNFT was burned.</Trans>
                                </Text>
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center">
                                    <Trans>We recommend protecting<br/>your nft at once</Trans>
                                </Text>
                            </Flex>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "40%"}} mb={{base: "20px"}}>
                                <Button
                                    variant={"darkOutline"}
                                    onClick={ () => {
                                        const dialog = getDialog('ProtectNftDialog')
                                        dialog.setNft(nft)
                                        dialog.onOpen()
                                    } }
                                >
                                    <Trans>Protect NFT</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ClaimantWinDialog