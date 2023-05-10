import { useEffect } from "react"
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
import SecureNFTButton from '../nftView/nftButtons/SecureNFTButton'

interface DialogInitialData {
    nft: NFT,
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    nftReFetch: Function, // function to update nft list
}

const ClaimantWinDialog = ({nft, setRefreshPaused, nftReFetch, originalOwner }: DialogInitialData) => {

    const disclosure = useDisclosure()
    const { onClose, isOpen } = disclosure
    const { setDialog, getDialog } = useCallableDialogContext()
    // const { getDialog } = useCallableDialogContext()

    function getNftImage() {
        return <Flex
            borderRadius={{base: "16px"}}
            filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
            overflow="hidden"
            my={{base: "20px"}}
            justifyContent="center"
            h="150px"
            w="150px"
        >
            <Image 
                src={ nft.thumbnail }
                alt={ nft.title || t`NFT image`}
                borderRadius="1rem"
            />
        </Flex>
    }

    useEffect(() => {
        setDialog('ClaimantWinDialog', disclosure)
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={disclosure.isOpen}
            onClose={() => {
                onClose()
                setRefreshPaused(false)
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
                        bgColor: 'accent.light',
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

                            { getNftImage() }

                            <Flex flexDirection="column" textStyle="paragraph" letterSpacing={{base: "0.04em"}} mb={{base: "20px"}} textAlign="center">
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "10px"}}>
                                    <Trans>The original NFT has been restored to your wallet.</Trans>
                                </Text>
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" mb={{base: "20px"}}>
                                    <Trans>The pNFT was burned.</Trans>
                                </Text>
                                <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" textTransform="uppercase">
                                    <Trans>We recommend protecting<br/>your nft at once</Trans>
                                </Text>
                            </Flex>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "40%"}} mb={{base: "20px"}}>
                                <Button
                                    onClick={ () => { getDialog('SecureNFTButton').onOpen() }}
                                    variant="dark-outline"
                                ><Trans>Protect NFT</Trans>
                                </Button>
                            </Box>
                        </CardFooter>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
        { /* Dialogs used on this page */ }
        { <SecureNFTButton
            nft={ nft } 
            nftReFetch={ nftReFetch }
            setRefreshPaused={ setRefreshPaused }
            variant={"primary-solid"}
        /> }
    </>)
}

export default ClaimantWinDialog