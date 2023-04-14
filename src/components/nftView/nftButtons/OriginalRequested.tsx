import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Contract } from "@ethersproject/contracts";
import { useState } from 'react';
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
    Divider,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverArrow,
    PopoverBody,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    useDisclosure
} from '@chakra-ui/react'
import { useAppContext } from '../../../context/AppContextProvider';
import { formatAddress, copyTextToClipboard } from '../../../utils/helpers';
import { Info } from '@web3uikit/icons'
import { CopyIcon } from '@chakra-ui/icons'
import { Trans, t } from '@lingui/macro';
import { centralizeIpfsUrl } from '../../../utils/ipfs';
import ReleaseOriginalNFTButton from './ReleaseOriginalNFTButton';
import LostPNFTButton from './LostPNFTButton'
import DoNotTransferOriginal from './DoNotTransferOriginal';
import { ActionRequest } from '../NFTCard';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    originalOwner: string, // Owner address of original NFT,
    tokenContract: Contract,
    pendingRequest: any | undefined,
    variant: any
}

const OriginalRequested = ({nft, metadata, nftReFetch, setRefreshPaused, tokenContract, originalOwner, variant, pendingRequest}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    enum StepMapping {
        start,
    }

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.start)
        onOpen()
        setRefreshPaused(true)
    }

    const copyOriginalOwnerToClipboard = () => {
        copyTextToClipboard(originalOwner || '', '#originalOwnerAddressHolder')
    }

    function getNftImage() {
        let nftImage = <div />
        let imgUrl = ''
        // If image available in metadata, use this image, else use "no-image" plug
        if (metadata) {
            imgUrl = centralizeIpfsUrl(metadata.image)
        } else {
            imgUrl = './images/noImage.png'
        }
            nftImage = <Flex
                            borderRadius={{base: "16px"}}
                            filter="drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.25))"
                            overflow="hidden"
                            my={{base: "20px"}}
                            justifyContent="center"
                            h="150px"
                            w="150px"
                        >
                            <Image 
                                src={ imgUrl }
                                alt={t`NFT image`}
                                borderRadius="1rem"
                            />
                        </Flex>
        return nftImage
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={ variant }
            w="100%"
        >
            <Trans>Original requested</Trans>
        </Button>

        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen}
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
                setRefreshPaused(false)
            }}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "450px"}}
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
                    <Card variant="stepContent" borderRadius="0" pb="0" >
                        <CardHeader>
                            <Text as="h3" textStyle="h3">
                                <Trans>Transfer the original NFT<br /> to the new owner?</Trans>
                            </Text>
                        </CardHeader>
                        <CardBody>

                            { getNftImage() }

                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                <Trans>If you transferred the pNFT to user</Trans>
                                {" "}
                                <Popover placement='top'>
                                    <PopoverTrigger>
                                        <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                    </PopoverTrigger>
                                    <PopoverContent w="150px">
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody >
                                            <Trans>Copied{"!"}</Trans>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                                
                                <chakra.span id='originalOwnerAddressHolder'>
                                    { " (" + formatAddress(originalOwner, 4) + ") " }
                                </chakra.span>
                                {" "}
                                <chakra.span>
                                    <Trans>, confirm the transmission of the original NFT</Trans>
                                </chakra.span>
                            </Text>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center" mb={{base: "20px"}}>
                            <Box w={{base: "60%", sm: "50%"}}>
                                <ReleaseOriginalNFTButton 
                                    nft={ nft } 
                                    metadata={ metadata } 
                                    nftReFetch={ nftReFetch }
                                    setRefreshPaused = { setRefreshPaused }
                                    tokenContract={ tokenContract }
                                    pendingRequest={ pendingRequest?.id }
                                    variant={"dark-outline"}
                                />
                            </Box>
                        </CardFooter>
                    </Card>
                    <Divider orientation='horizontal' borderBottom="1px solid #000"/>

                    <Card variant="stepContent" borderRadius="0" bgColor="rgba(255, 96, 96, 0.2)" py={{base: "10px"}}>
                        <CardBody>
                            <Text textStyle="paragraph" textAlign="center" letterSpacing="0.04em" mb={{base: "10px"}}>
                                <Trans>If you did not transfer the pNFT to</Trans>
                                {" "}
                                <Popover placement='top'>
                                    <PopoverTrigger>
                                        <CopyIcon onClick={ copyOriginalOwnerToClipboard } cursor="pointer" mr={{base: "5px"}} fontSize="18px" />
                                    </PopoverTrigger>
                                    <PopoverContent w="150px">
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody >
                                            <Trans>Copied{"!"}</Trans>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                                
                                <chakra.span id='originalOwnerAddressHolder'>
                                    { " (" + formatAddress(originalOwner, 4) + ") " }
                                </chakra.span>
                            </Text>
                            <Text textStyle="paragraph" fontWeight="700" mb={{base: "10px"}} textAlign="center" letterSpacing="0.04em" textTransform="uppercase" color="danger">
                                <Trans>your asset may have been stolen!</Trans>
                            </Text>
                            <Text textStyle="paragraph" textAlign="center" letterSpacing="0.04em" mb={{base: "20px"}}>
                                <Trans>We recommend opening a dispute in the Kleros decentralized court to burn the pNFT in the attacker's wallet. This will prevent them from using or selling your asset, and help to protect your property rights.</Trans>
                            </Text>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%", sm: "50%"}} mb={{base: "10px"}}>
                                <LostPNFTButton 
                                    nft={ nft } 
                                    metadata={ metadata } 
                                    nftReFetch={ nftReFetch }
                                    setRefreshPaused = { setRefreshPaused }
                                    tokenContract={ tokenContract }
                                    originalOwner={originalOwner}
                                    variant={"dark-outline"}
                                />
                            </Box>
                        </CardFooter>
                    </Card>

                    <Divider orientation='horizontal' borderTop="1px solid #000" />

                    <Card variant="stepContent" borderRadius="0">
                        <CardBody>
                            <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                <Trans>You can refuse to give the owner of the pNFT the original NFT</Trans>
                            </Text>
                        </CardBody>
                        <CardFooter flexDirection="column" alignItems="center">
                            <Box w={{base: "60%"}} mb={{base: "20px"}}>
                                <DoNotTransferOriginal 
                                    nft={nft}
                                    metadata={metadata}
                                    nftReFetch={nftReFetch}
                                    setRefreshPaused={setRefreshPaused}
                                    originalOwner={originalOwner}
                                    pendingRequest={pendingRequest}
                                    tokenContract={tokenContract}
                                    variant={"dark-outline"}
                                />
                            </Box>
                        </CardFooter>

                        <Flex flexWrap="nowrap" alignItems="center" py={{base: "15px"}} px={{base: "20px"}} border="1px solid" borderColor="accent.light" borderRadius="16px">
                            <Box color="#2D7BD6" mr={[2]} >
                                <Info fontSize='32px' />
                            </Box>
                            <Flex flexDirection="column">
                                <Text textStyle="paragraph" color="muted">
                                    <Trans>Please note that refusing to hand over the original NFT to its rightful owner may result in legal action against you in the Kleros decentralized court. We recommend using Kleros to resolve disputes fairly and protect your property rights</Trans>
                                </Text>
                            </Flex>
                        </Flex>
                    </Card>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default OriginalRequested