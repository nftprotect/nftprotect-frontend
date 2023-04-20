import { dialogsTimeout } from '../../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../../dialogs/DidRequiredDialog';
import { useState } from 'react';
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
import { centralizeIpfsUrl } from '../../../utils/ipfs';
import NFT from '../../../classes/NFT';
import { NftTokenType } from 'alchemy-sdk';

interface ButtonInitialData {
    nft: NFT,
    nftReFetch: Function, // function to update nft list
    setRefreshPaused: Function, // Function to pause/unpause nft list updating
    variant: any
}

const SecureNFTButton = ({nft, nftReFetch, setRefreshPaused, variant}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
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
        setTimeout(onClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(StepMapping.canceled)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(StepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(onClose, dialogsTimeout)
    }

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(StepMapping.waitingForFinal);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    setNextStep(StepMapping.finalCompleted)
                    console.log("Transaction successful", tx.hash);
                    nftReFetch();
                    setTimeout(onClose, dialogsTimeout)
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
        setRefreshPaused(true)
        setNextStep(StepMapping.checkPermission);
        onOpen()
        checkApprovedMethodCall()
            .then((result: any) => {
                const wrapErrorMapping = {
                    'NFTProtect: user must be registered': didDialogDisclosure.onOpen,
                    'NFTProtect: invalid referrer': handleUnknownError,
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

    const mainButtonOnClick = () => {
        setNextStep(StepMapping.start)
        onOpen()
        setRefreshPaused(true)
    }

    const startButtonOnClick = () => {
        const tokenContract = nft.loadedContract
        try {
            if (nft.tokenType === NftTokenType.ERC721) {
                secureNFT(
                    tokenContract,
                    () => tokenContract.getApproved(nft.tokenId),
                    (result: any) => ( result.toLowerCase() === nftProtectContract.address.toLowerCase() ),
                    () => tokenContract.approve(nftProtectContract.address, nft.tokenId),
                    () => nftProtectContract.wrap721(tokenContract.address, nft.tokenId, 0, referrerAddress, {value: fee})
                )
            } else if (nft.tokenType === NftTokenType.ERC1155) {
                secureNFT(
                    tokenContract,
                    () => tokenContract.isApprovedForAll(account, nftProtectContract.address),
                    (result: any) => result,
                    () => tokenContract.setApprovalForAll(nftProtectContract.address, true),
                    () => nftProtectContract.wrap1155(tokenContract.address, nft.tokenId, nft.amount, 0, referrerAddress, {value: fee})
                )
            } else {
                console.log(`Unknown NFT contract type: ${nft.tokenType}`)
            }
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

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

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant={variant}
        >
           <Trans>Protect NFT</Trans>
        </Button>

        {/* <DidRequiredDialog disclosure={didDialogDisclosure}/> */}
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
                                    { getNftImage() }
                                    <Text textStyle="paragraph" mb={{base: "20px"}} textAlign="center" letterSpacing="0.04em">
                                        <Trans>Fee for Protection your NFT:</Trans>
                                    </Text>
                                    <Text textStyle="h3" textAlign="center">
                                        {"Ξ"}{ formatEther(fee || 0) } 
                                    </Text>
                                </CardBody>

                                <CardFooter w="100%" justifySelf="flex-start">
                                    <Box w={{base: "60%", sm: "50%"}}>
                                        <Button 
                                            onClick={ startButtonOnClick }
                                            variant="dark-outline"
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

                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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

                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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
                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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
                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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
                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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
                                    <Text textStyle="paragraph" textAlign="center" textTransform="uppercase">
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
                                    <Text textStyle="paragraph" mb={{base: "20px"}} letterSpacing="0.04em" textAlign="center" textTransform="uppercase">
                                        <Trans>Your asset is now protected!</Trans>
                                    </Text>
                                    <Text textStyle="paragraph" letterSpacing="0.04em" textAlign="center" textTransform="uppercase">
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

export default SecureNFTButton