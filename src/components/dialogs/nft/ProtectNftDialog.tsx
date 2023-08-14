import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../DidRequiredDialog';
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
import { handleContractError } from '../../../utils/errorHandling';
import { Trans, t } from '@lingui/macro';
import { formatEther } from "@ethersproject/units";
import NFT from '../../../classes/NFT';
import { NftTokenType } from 'alchemy-sdk';
import { useCallableDialogContext } from '../../../context/CallableDialogContextProvider';
import NFTImage from '../../nftView/NFTImage';

interface DialogInitialData {
    nftReFetch: Function, // function to update nft list
}

enum NFTPTokenStandard
{
    ERC721,
    ERC1155,
    ERC20
}

const svgBackground = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><path d='M100 0 L0 100 ' stroke='red' stroke-width='2'/><path d='M0 0 L100 100 ' stroke='red' stroke-width='2'/></svg>")`;

const ProtectNftDialog = ({ nftReFetch }: DialogInitialData) => {

    const [ nft, setNft ] = useState<NFT>()
    const {
        account, 
        didRegistered, 
        nftProtectContract, 
        referrerAddress, 
        fee, 
        baseTokenPrice, 
        couponsBalance
    } = useAppContext()
    const { setDialog } = useCallableDialogContext()
    const didDialogDisclosure = useDisclosure()
    const disclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = disclosure
    const [ nextStep, setNextStep ] = useState<number>(0)

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
        setTimeout(dialogClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
        setTimeout(dialogClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(dialogClose, dialogsTimeout)
    }

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForFinal);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    setNextStep(StepMapping.finalCompleted)
                    console.log("Transaction successful", tx.hash);
                    nftReFetch();
                    setTimeout(dialogClose, dialogsTimeout)
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const secureNFT = (
        tokenContract: Contract,
        checkApprovedMethodCall: Function,
        checkApproved: Function,
        setApproveMethodCall: Function,
        wrapMethodCall: Function
    ) => {
        if (!didRegistered) {
            didDialogDisclosure.onOpen();
            return
        }
        setNextStep(StepMapping.checkPermission);
        onOpen()
        checkApprovedMethodCall()
            .then((result: any) => {
                const wrapErrorMapping = {
                    'user must be registered': didDialogDisclosure.onOpen,
                    'invalid referrer': handleUnknownError,
                    'ACTION_REJECTED': handleRejected,
                    default: handleUnknownError
                }
                // check if transfer already approved 
                if (checkApproved(result)) {
                    setNextStep(StepMapping.requestWrap);
                    console.log('Token transfer already approved')
                    wrapMethodCall()
                        .then( finalTransactionSent(tokenContract) )
                        .catch( 
                            handleContractError(wrapErrorMapping)
                        )
                } else {
                    setNextStep(StepMapping.requestConcrete)
                    console.log('Asking to approve token transfer')
                    setApproveMethodCall()
                        .then((tx: any) => {
                            setNextStep(StepMapping.waitingForAllow)
                            console.log('Waiting for TX', tx.hash);
                            // Waiting for transaction to complete
                            tokenContract.provider.once(tx.hash, (receipt) => {
                                if (receipt.status === 1) {
                                    // after mined fire wrap
                                    setNextStep(StepMapping.requestWrap)
                                    console.log("Transaction successful", tx.hash);
                                    wrapMethodCall()
                                        .then( finalTransactionSent(tokenContract) )
                                        .catch(
                                            handleContractError(wrapErrorMapping)
                                        )
                                } else {
                                    handleTransactionFailed(tx);
                                }
                            })
                        })
                        .catch(
                            handleContractError({
                                'ACTION_REJECTED': handleRejected,
                                default: handleUnknownError
                            })
                        )
                }
            })
    }

    const startButtonOnClick = () => {
        try {
            if (nft?.tokenType === NftTokenType.ERC721) {
                const tokenContract = nft.getContract()
                secureNFT(
                    tokenContract,
                    () => tokenContract.getApproved(nft.tokenId),
                    (result: any) => ( result.toLowerCase() === nftProtectContract.address.toLowerCase() ),
                    () => tokenContract.approve(nftProtectContract.address, nft.tokenId),
                    () => nftProtectContract.protect(NFTPTokenStandard.ERC721, tokenContract.address, nft.tokenId, 0, 0, referrerAddress, {value: fee})
                )
            } else if (nft?.tokenType === NftTokenType.ERC1155) {
                const tokenContract = nft.getContract()
                secureNFT(
                    tokenContract,
                    () => tokenContract.isApprovedForAll(account, nftProtectContract.address),
                    (result: any) => result,
                    () => tokenContract.setApprovalForAll(nftProtectContract.address, true),
                    () => nftProtectContract.protect(NFTPTokenStandard.ERC1155, tokenContract.address, nft.tokenId, nft.amount, 0, referrerAddress, {value: fee})
                )
            } else {
                console.log(`Unknown NFT contract type: ${nft?.tokenType}`)
            }
        } catch (err: any) {
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
                                    <Box
                                        backgroundImage={(couponsBalance !== undefined) && (couponsBalance > 0) ? svgBackground : undefined }
                                    >
                                        <Text textStyle="paragraph" mb={{base: "1em"}} letterSpacing="0.04em" fontWeight={'bold'}>
                                            <Trans>Fee for Protection your NFT:</Trans>
                                        </Text>
                                        <Flex justifyContent="center" w={"100%"}>
                                            <Text textStyle="h3">
                                                {"Ξ"}{ formatEther(fee || 0) } 
                                            </Text>
                                            &nbsp;
                                            { fee && baseTokenPrice && <Text fontSize={['12px']} lineHeight={'1em'}>
                                                ~${ Math.round(parseFloat(formatEther(fee)) * baseTokenPrice) }
                                            </Text> }
                                        </Flex>
                                    </Box>
                                    { (couponsBalance !== undefined) && (couponsBalance > 0) &&
                                        <Text textStyle="paragraph" mt={'1em'} textAlign="center" letterSpacing="0.04em" fontWeight={'bold'}>
                                            <Trans>You have special NFT Protect coupon! It allows you to protect of your NFT for FREE!</Trans>
                                        </Text>
                                    }
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
                                        <Image src="/images/statusIcons/confirm.png" alt="Success" w="100%">
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
                                            <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
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
                                        <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
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