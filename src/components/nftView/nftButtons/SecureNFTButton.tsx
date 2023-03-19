import { EvmNft } from '@moralisweb3/common-evm-utils';
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { deIpfsUrl } from '../../../utils/helpers'
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
    useDisclosure
} from '@chakra-ui/react';
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle } from '@web3uikit/icons';
import { Trans } from '@lingui/macro';
import { formatEther } from "@ethersproject/units";

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract
}

const SecureNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress, fee} = useAppContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    enum StepMapping {
        start,
        checkPermission,
        requestConcrete,
        requestAll,
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
                    // after mined fire wrap
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
    }

    const startButtonOnClick = () => {
        const tokenContractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId
        try {
            if (nft.contractType === 'ERC721') {
                secureNFT(
                    tokenContract,
                    () => tokenContract.getApproved(nft.tokenId),
                    (result: any) => ( result.toLowerCase() === nftProtectContract.address.toLowerCase() ),
                    () => tokenContract.approve(nftProtectContract.address, nft.tokenId),
                    () => nftProtectContract.wrap721(tokenContractAddress, nft.tokenId, 0, referrerAddress, {value: fee})
                )
            } else if (nft.contractType === 'ERC1155') {
                secureNFT(
                    tokenContract,
                    () => tokenContract.isApprovedForAll(account, nftProtectContract.address),
                    (result: any) => result,
                    () => tokenContract.setApprovalForAll(nftProtectContract.address, true),
                    () => nftProtectContract.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, referrerAddress, {value: fee})
                )
            } else {
                console.log(`Unknown NFT contract type: ${nft.contractType}`)
            }
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    function getNftImage() {
        let nftImage = <div />
        if (metadata) {
            const imgUrl = deIpfsUrl(metadata?.image || '')
            nftImage = <Box
                            my={[4]}
                            border="2px solid rgba(255, 255, 255, 0.5)"
                            borderRadius={["20px"]}
                            overflow="hidden"
                            alignItems="center"
                        > 
                            <Image src={ imgUrl } />
                        </Box>
            }
        return nftImage
    }

    return (<>
        <Button
            onClick={ mainButtonOnClick }
            variant="primary-solid"
            w="100%"
        >
           <Trans>Protect NFT</Trans>
        </Button>

        <DidRequiredDialog disclosure={didDialogDisclosure}/>
        <Modal
            isCentered
            isOpen={isOpen} 
            onClose={() => {
                setNextStep(StepMapping.start)
                onClose()
            }}
        >
            <ModalOverlay 
                bg='blackAlpha.700'
            />
            <ModalContent
                w={["15rem", "20rem", "25rem"]}
                bg="#FFF"
                border="2px solid #000"
                borderRadius="30px"
            >
                <ModalBody px="0" py={[8]}>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    textAlign="center" 
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset{"…"}</Trans>
                                </Heading>

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[4]} textAlign="center">
                                    <Trans>Fee for Protection your NFT:</Trans>
                                </Text>
                                <Text fontSize={["xl", "2xl", "3xl"]} mb={[8]} textAlign="center" textTransform="uppercase" fontWeight="500">
                                    {"Ξ"}{ formatEther(fee || 0) } 
                                </Text>
                                <Button 
                                    onClick={ startButtonOnClick }
                                    variant="primary-solid"
                                    my={2}
                                    w="100%"
                                    textTransform="uppercase"
                                >
                                    <Trans>Protect NFT</Trans>
                                </Button>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >
                                    <Trans>Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside> 

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset{"…"}</Trans>
                                </Heading>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                    <Trans>{"Checking permission to transfer token…"}</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset{"…"}</Trans>
                                </Heading>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Please, allow access and transfer of your NFT</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset…</Trans>
                                </Heading>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Please allow access to and transfer of <b>ALL YOUR NFTs </b></Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset{"…"}</Trans>
                                </Heading>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Allow transfer to complete the process</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset…</Trans>
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>{"Wait for transaction to confirm…"}</Trans>
                                </Text>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                                
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    {"After that you'll be asked for confirmation for wrapping."}
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Protecting <br /> your asset{"…"}</Trans>
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Waiting for transaction to complete.</Trans>
                                </Text>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>After it will be completed, your NFT will be protected.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                >
                                    <Trans>Success!</Trans>
                                </Heading>

                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Your asset is now protected!</Trans>
                                </Text>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Enjoy your new life in protected world!</Trans>
                                </Text>

                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >
                                    <Trans>Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside>

                         <SwitchableOutside nextStepNumber={nextStep} >
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                    color="red"
                                >
                                    <Trans>Fail!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>You cancelled a transaction</Trans>
                                </Text>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >
                                    <Trans>Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                    textAlign="center"
                                >
                                    <Trans>Some error occured</Trans>
                                </Heading>

                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                <Trans>Transaction failed.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center" px={[8, 20]}>
                                <Heading
                                    lineHeight={["1.5rem", "2rem"]}
                                    textTransform="uppercase"
                                    fontSize={["lg", "xl", "2xl"]}
                                    fontWeight="700"
                                    mb="4"
                                    textAlign="center"
                                >
                                    <Trans>{"Transaction is still in progress…"}</Trans>
                                </Heading>

                                <Spinner 
                                    my={[4]} 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='#BC9CFF'
                                    size={['lg', 'xl']}>
                                </Spinner>

                            </Flex>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default SecureNFTButton