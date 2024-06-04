import { useEffect, useState } from 'react';
import {
    Button,
    Box,
    Flex,
    Image,
    Heading,
    Text,
    Spinner,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalCloseButton,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Link,
    useDisclosure
} from '@chakra-ui/react';
import { ArrowForwardIcon} from '@chakra-ui/icons'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleTransactionError } from '../../../utils/errorHandling';
import { Trans, t } from '@lingui/macro';
import { formatEther } from "@ethersproject/units";
import NFT from '../../../classes/NFT';
import { NftTokenType } from 'alchemy-sdk';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';
import { usePublicClient } from "wagmi";
import useERC721 from "../../../hooks/useERC721";
import useERC1155 from "../../../hooks/useERC1155";
import useNftProtect, { NFTPTokenStandard } from "../../../hooks/useNftProtect";

const ProtectNftDialog = () => {

    const [ nft, setNft ] = useState<NFT>()
    const {
        account,
        referrerAddress, 
        fee, 
        baseTokenPrice,
        currentChain,
        defaultChain
    } = useAppContext()
    const { setDialog } = useCallableDialogContext()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const [ nextStep, setNextStep ] = useState<number>(0)
    const publicClient = usePublicClient()

    const { approve, getApproved } = useERC721(currentChain?.id || defaultChain.id)
    const { setApprovalForAll, isApprovedForAll } = useERC1155(currentChain?.id || defaultChain.id)
    const { protect } = useNftProtect(currentChain?.id || defaultChain.id)

    enum StepMapping {
        start,
        requestConcrete,
        requestAll,
        checkPermission,
        requestWrap,
        waitingForAllow,
        waitingForFinal,
        finalCompleted,
        canceled,
        error,
        timeout
    }

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(StepMapping.error)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
    }

    const finalTransactionSent = async (hash: `0x${string}`) => {
        setNextStep(StepMapping.waitingForFinal);
        const receipt = await publicClient!.waitForTransactionReceipt({ hash })
        if (receipt.status === 'success') {
            setNextStep(StepMapping.finalCompleted)
            console.log("Transaction successful", hash);
        } else {
            handleTransactionFailed(receipt);
        }
    }

    const secureNFT = async (
        checkApprovedMethodCall: Function,
        checkApproved: Function,
        setApproveMethodCall: Function,
        wrapMethodCall: Function
    ) => {
        const errorHandlings = {
            default: handleUnknownError,
            UserRejectedRequestError: handleRejected
        }
        setNextStep(StepMapping.checkPermission);
        onOpen()
        // check if transfer already approved 
        let checkApprovedResult
        try {
            checkApprovedResult = await checkApprovedMethodCall()
        } catch (error) {
            handleTransactionError(error, errorHandlings)
        }
        let hash
        if (checkApproved(checkApprovedResult)) {
            setNextStep(StepMapping.requestWrap);
            console.log('Token transfer already approved')
            try {
                hash = await wrapMethodCall()
            } catch (error) {
                handleTransactionError(error, errorHandlings)
                return
            }
        } else {
            setNextStep(StepMapping.requestConcrete)
            console.log('Asking to approve token transfer')
            try {
                hash = await setApproveMethodCall()
            } catch (error) {
                handleTransactionError(error, errorHandlings)
                return
            }
            setNextStep(StepMapping.waitingForAllow)
            console.log('Waiting for TX', hash);
            // Waiting for transaction to complete
            // 2 confirmations to fix priblem when connector client doesn't know transaction is complete
            const receipt = await publicClient!.waitForTransactionReceipt({ hash, confirmations: 2 })
            if (receipt.status === 'success') {
                // after mined fire wrap
                setNextStep(StepMapping.requestWrap)
                console.log("Transaction successful", hash);
                try {
                    hash = await wrapMethodCall()
                } catch (error) {
                    handleTransactionError(error, errorHandlings)
                    return
                }
            } else {
                handleTransactionFailed(receipt);
            }
        }
        finalTransactionSent(hash);
    }

    const startButtonOnClick = () => {
        try {
            const contractAddress = nft ? nft.contract.address as `0x${string}` : undefined
            if (nft?.tokenType === NftTokenType.ERC721) {
                secureNFT(
                    () => getApproved(contractAddress!, nft.tokenId),
                    (result: string) => ( result.toLowerCase() === currentChain.nftpContractAddress.toLowerCase() ),
                    () => approve(contractAddress!, currentChain.nftpContractAddress, nft.tokenId),
                    () => protect(NFTPTokenStandard.ERC721, contractAddress!, nft.tokenId, 0, account!, referrerAddress, fee || 0)
                )
            } else if (nft?.tokenType === NftTokenType.ERC1155) {
                secureNFT(
                    () => isApprovedForAll(contractAddress!, account!, currentChain.nftpContractAddress),
                    (result: boolean) => result,
                    () => setApprovalForAll(contractAddress!, currentChain.nftpContractAddress),
                    () => protect(NFTPTokenStandard.ERC1155, contractAddress!, nft.tokenId, nft.amount!, account!, referrerAddress, fee || 0)
                )
            } else {
                console.log(`Unknown NFT contract type: ${nft?.tokenType}`)
            }
        } catch (err: any) {
            console.log(err);
            handleUnknownError(err)
        }
    }

    const dialogClose = () => {
        setNextStep(StepMapping.start)
        onClose()
    }

    useEffect(() => {
        setDialog('ProtectNftDialog', {...disclosure, setNft})
    }, [])

    return (<>
        <Modal
            variant="stepModal"
            closeOnOverlayClick={false}
            isOpen={isOpen} 
            onClose={dialogClose}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "450px"}}
            >
                <ModalCloseButton onClick={onClose} />
                <ModalBody>
                    <Wizard>
                        {/* Start */}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody mb={{base: "20px"}} >
                                    { nft && <NFTImage nft={nft} /> }
                                    { fee ? <Box>
                                        <Text textStyle="paragraph" mb={{base: "1em"}} letterSpacing="0.04em" fontWeight={'bold'}>
                                            <Trans>Fee for Protection your NFT:</Trans>
                                        </Text>
                                        <Flex justifyContent="center" w={"100%"}>
                                            <Text textStyle="h3">
                                                {"Ξ"}{ formatEther(fee || 0) } 
                                            </Text>
                                            &nbsp;
                                            { baseTokenPrice && <Text fontSize={['12px']} lineHeight={'1em'}>
                                                ~${ Math.round(parseFloat(formatEther(fee)) * baseTokenPrice) }
                                            </Text> }
                                        </Flex>
                                    </Box> : '' }
                                </CardBody>

                                <CardFooter w="100%" justifySelf="flex-start">
                                    <Box w={{base: "60%", sm: "50%"}}>
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant="darkOutline"
                                        >
                                            <Trans>Protect NFT</Trans>
                                        </Button>
                                    </Box>
                                </CardFooter>
                            </Card>
                        </SwitchableOutside>

                        {/* requestConcrete*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>

                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        {"When you grant permission for access and transfer of NFTs, they are securely stored in a smart contract. The NFT Protect team will not have access to your assets, nor will they have the right to manage them.\u0020"}
                                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textStyle="paragraph" textDecoration="underline">
                                            <Trans>To learn more</Trans>
                                            <ArrowForwardIcon ml={{base: '2px'}} />
                                        </Link>
                                        
                                    </Text>

                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>Please, allow access and <br />transfer of your NFT</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* requestAll*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                        <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    
                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        {"When you grant permission for access and transfer of NFTs, they are securely stored in a smart contract. The NFT Protect team will not have access to your assets, nor will they have the right to manage them.\u0020"}
                                        <Link href='#' isExternal rel="noreferrer" color="#2D7BD6" textStyle="paragraph" textDecoration="underline">
                                            <Trans>To learn more</Trans>
                                            <ArrowForwardIcon ml={{base: '2px'}} />
                                        </Link>
                                        
                                    </Text>

                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>Please, allow access and <br />transfer of your NFTs</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* checkPermission*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>{"Wait for transaction to confirm..."}</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* requestWrap*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>Confirm the transaction in the wallet</Trans>
                                    </Text>
                                </CardBody>

                            </Card>
                        </SwitchableOutside>

                        {/* waitingForAllow*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>{"Wait for transaction to confirm..."}</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                        
                        {/* waitingForFinal*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" >
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Protecting your asset{"…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Flex my={{base: "20px"}}>
                                        <Spinner variant="primary" speed='0.65s'></Spinner>
                                    </Flex>
                                    <Text textStyle="paragraph" textAlign="center">
                                        <Trans>{"Wait for transaction to confirm…"}</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                        
                        {/* finalCompleted*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>Success</Trans>
                                    </Text>
                                </CardHeader>

                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/confirm.png" alt="Success" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="paragraph" mb={{base: "20px"}} letterSpacing="0.04em" textAlign="center">
                                        <Trans>Your asset is now protected!</Trans>
                                    </Text>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center">
                                        <Trans>Enjoy your new life in protected world!</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* canceled*/}
                        <SwitchableOutside nextStepNumber={nextStep} >
                            <Card variant="stepContent">
                                <Flex flexDirection="column" alignItems="center">
                                    <CardHeader>
                                        <Text as="h3" textStyle="h3">
                                            <Trans>Fail!</Trans>
                                        </Text>
                                    </CardHeader>
                                    <CardBody>
                                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                            <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                            </Image>
                                        </Box>
                                        <Text textStyle="h3" textAlign="center">
                                            <Trans>You cancelled a transaction</Trans>
                                        </Text>
                                    </CardBody>
                                </Flex>
                            </Card>
                        </SwitchableOutside>
                        
                        {/* error*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent">
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                    <Trans>Some error occured</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                                        <Image src="/images/icons-status/fail.png" alt="Fail" w="100%">
                                        </Image>
                                    </Box>
                                    <Text textStyle="h3" textAlign="center">
                                        <Trans>Transaction failed.</Trans>
                                    </Text>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>

                        {/* timeout*/}
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Card variant="stepContent" minH={{base: "270px"}}>
                                <CardHeader>
                                    <Text as="h3" textStyle="h3">
                                        <Trans>{"Transaction is still in progress…"}</Trans>
                                    </Text>
                                </CardHeader>
                                <CardBody>
                                    <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
                                </CardBody>
                            </Card>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default ProtectNftDialog