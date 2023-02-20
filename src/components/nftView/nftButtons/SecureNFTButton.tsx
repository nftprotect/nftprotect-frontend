import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
import { deIpfsUrl } from '../../../utils/helpers'
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../../dialogs/DidRequiredDialog';
import { useState } from 'react';
import {
    Button,
    Box,
    Card, 
    CardBody,
    Flex,
    Heading,
    Image,
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

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract
}

const SecureNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const {account, didRegistered, nftProtectContract, referrerAddress} = useAppContext()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    const stepMapping = {
        'checkPermission': 0,
        'requestConcrete': 1,
        'requestAll': 2,
        'requestWrap': 3,
        'waitingForAllow': 4,
        'waitingForFinal': 5,
        'finalCompleted': 6,
        'canceled': 7,
        'error': 8,
        'timeout': 9
    }

    const handleUnknownError = (error: any) => {
        console.error(error)
        setNextStep(stepMapping.error)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleRejected = () => {
        // Transaction declined
        setNextStep(stepMapping.canceled)
        setTimeout(onClose, dialogsTimeout)
    }

    const handleTransactionFailed = (tx: any) => {
        setNextStep(stepMapping.error)
        console.log("Transaction failed", tx.hash);
        setTimeout(onClose, dialogsTimeout)
    }

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(stepMapping.waitingForFinal);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setNextStep(stepMapping.finalCompleted)
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

        setNextStep(stepMapping.checkPermission);
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
                    setNextStep(stepMapping.requestWrap);
                    console.log('Token transfer already approved')
                    wrapMethodCall()
                        .then( finalTransactionSent(tokenContract) )
                        .catch( 
                            handleContractError(wrapErrorMapping)
                        )
                } else {
                    setNextStep(stepMapping.requestConcrete)
                    console.log('Asking to approve token transfer')
                    setApproveMethodCall()
                        .then((tx: any) => {
                            setNextStep(stepMapping.waitingForAllow)
                            console.log('Waiting for TX', tx.hash);
                            // Waiting for transaction to complete
                            tokenContract.provider.once(tx.hash, (receipt) => {
                                if (receipt.status === 1) {
                                    // after mined fire wrap
                                    setNextStep(stepMapping.requestWrap)
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

    const onClick = () => {
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
            const imgUrl = deIpfsUrl(metadata.image)
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
            type='button'
            onClick={ onClick }
            my={2}
            leftIcon={<Sandbox />}
            w="100%"
            h={[8, 10]}
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="12px"
            whiteSpace="break-spaces"
            fontSize={['xs', 'sm', 'md']}
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
        >Protect NFT
        </Button>

        <DidRequiredDialog disclosure={didDialogDisclosure}/>
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
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
                <ModalHeader  textAlign="center" w="100%" textTransform="uppercase" fontSize={["lg", "xl", "2xl"]} fontWeight="700">Protecting <br /> your asset...</ModalHeader>
                <ModalCloseButton size={["sm", "md"]} border="2px solid #000" borderRadius="15px" top={[3, 4]} right={[3, 4]} />
                <ModalBody>
                    <Wizard>
                         <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                    Checking permission to transfer token...
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
                                    Allow access to and transfer
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
                                    Allow access to and transfer of <b>ALL YOUR NFTs </b>???
                                </Text>
                                
                                <Text fontSize={["sm", "md", "lg", "xl"]} mb={[2]} textAlign="center">
                                    This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
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
                                    Allow transfer to complete the process
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[4, 8]} textAlign="center">
                                    Waiting for transaction to complete.
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center">
                                    After that you'll be asked for confirmation for wrapping.
                                </Text>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[4, 8]} textAlign="center">
                                    Waiting for transaction to complete.
                                </Text>
                                { getNftImage() }
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" >
                                    After it will be completed, your NFT will be protected.
                                </Text>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                            </Flex>
                        </SwitchableOutside> 
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]}  fontWeight="500">
                                    Success!
                                </Heading>
                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>
                                <Box w="80%">
                                    <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                        Your asset is now protected!
                                    </Text>
                                    <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center">
                                        Enjoy your new life in protected world!
                                    </Text>
                                </Box>
                            </Flex>
                        </SwitchableOutside>
                         <SwitchableOutside nextStepNumber={nextStep} >
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    Fail!
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    You cancelled a transaction
                                </Text>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex flexDirection="column" alignItems="center">
                                <Heading my={[4, 8]} textAlign="center" textTransform="uppercase" fontSize={["md", "lg", "xl", "2xl"]} fontWeight="500">
                                    Some error occured
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    Transaction failed.
                                </Text>
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>

                            <Flex flexDirection="column" alignItems="center">
                                <Text fontSize={["md", "lg", "xl", "2xl"]} textAlign="center" my={[4]}>
                                    Transaction is still in progress...
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