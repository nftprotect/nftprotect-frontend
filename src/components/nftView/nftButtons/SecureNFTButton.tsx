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
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle } from '@web3uikit/icons'
import { Trans } from '@lingui/react'

interface ButtonInitialData {
    nft: EvmNft,
    metadata: any, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract
}

const SecureNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress} = useAppContext()
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
                    () => nftProtectContract.wrap721(tokenContractAddress, nft.tokenId, 0, referrerAddress)
                )
            } else if (nft.contractType === 'ERC1155') {
                secureNFT(
                    tokenContract,
                    () => tokenContract.isApprovedForAll(account, nftProtectContract.address),
                    (result: any) => result,
                    () => tokenContract.setApprovalForAll(nftProtectContract.address, true),
                    () => nftProtectContract.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, referrerAddress)
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
            nftImage = <Image 
                        src={ imgUrl }
                        my={[4]}
                        border="1px solid rgba(255, 255, 255, 0.5)"
                        borderRadius={["20px"]}
                        h="auto"
                        w="60%"
                    />
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
                py={[4, 8]}
            >
                <ModalHeader  textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700"><Trans> Protecting <br /> your asset...</Trans></ModalHeader>
                <ModalCloseButton size={["sm", "md"]} border="2px solid #000" borderRadius="15px" top={[3, 4]} right={[3, 4]} />
                <ModalBody>
                    <Wizard>
                    <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Box
                                    my={[4]}
                                    border="1px solid rgba(255, 255, 255, 0.5)"
                                    borderRadius={["20px"]}
                                    w="50%" 
                                    overflow="hidden"
                                    alignSelf="center"
                                >  
                                    { getNftImage() }
                                </Box>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>
                                <Box w="100%">
                                    <Button 
                                        onClick={ startButtonOnClick }
                                        variant="primary-solid"
                                        my={2}
                                        w="100%"
                                    >
                                        <Trans> PROTECT NFT</Trans>
                                    </Button>
                                </Box>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    w="100%"
                                    mt={[4, 8]}
                                >
                                    <Trans> Close</Trans>
                                </Button>
                            </Flex>
                        </SwitchableOutside> 

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                <Trans> Checking permission to transfer token...</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl", "2xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>

                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                <Trans> Please, allow access and transfer of your NFT</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>  
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex 
                                flexDirection="column"
                            >
                                <Text fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500" mb={[8]} textAlign="center" >
                                <Trans>Please, allow access and transfer of your NFTAllow access to and transfer of <b>ALL YOUR NFTs </b>???</Trans>
                                </Text>
                                
                                <Text fontSize={["sm", "md", "lg", "xl"]} mb={[2]} textAlign="center">
                                <Trans>This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside> 
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl", "2xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>

                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                <Trans> Allow transfer to complete the process</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[4, 8]} textAlign="center">
                                <Trans> Waiting for transaction to complete.</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center">
                                    {"After that you'll be asked for confirmation for wrapping."}
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[4, 8]} textAlign="center">
                                <Trans> Waiting for transaction to complete.</Trans>
                                </Text>
                                { getNftImage() }
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" >
                                <Trans> After it will be completed, your NFT will be protected.</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside> 
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]}  fontWeight="500">
                                <Trans> Success!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>
                                <Box w="80%">
                                    <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    <Trans> Your asset is now protected!</Trans>
                                    </Text>
                                    <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center">
                                    <Trans> Enjoy your new life in protected world!</Trans>
                                    </Text>
                                </Box>
                            </Flex>
                        </SwitchableOutside>
                         <SwitchableOutside nextStepNumber={nextStep} >
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    <Trans>Fail!</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                <Trans>You cancelled a transaction</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    <Trans>Some error occured</Trans>
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    <Trans>Transaction failed.</Trans>
                                </Text>
                            </Flex>
                        </SwitchableOutside>

                        <SwitchableOutside nextStepNumber={nextStep}>

                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    <Trans>Transaction is still in progress...</Trans>
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default SecureNFTButton