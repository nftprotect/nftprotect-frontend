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
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';
import { AlertCircle } from '@web3uikit/icons'

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
        >Protect NFT
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
                                    mb="4"
                                >Protecting <br /> your asset...
                                </Heading>

                                { getNftImage() }

                                <Text fontSize={["md", "lg", "xl"]} textTransform="uppercase" fontWeight="500" mb={[8]} textAlign="center">
                                    {metadata?.name || nft.name}
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[4]} textAlign="center">
                                    Fee for Protection your NFT:
                                </Text>
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase" fontWeight="500" color="green">
                                    Free
                                </Text>
                                <Button 
                                    onClick={ startButtonOnClick }
                                    variant="primary-solid"
                                    my={2}
                                    w="100%"
                                    textTransform="uppercase"
                                >Protect NFT
                                </Button>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >Close
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
                                >Protecting <br /> your asset...
                                </Heading>
                                <Text fontSize={["md", "lg", "xl", "2xl"]} mb={[2]} textAlign="center">
                                    Checking permission to transfer token...
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
                                >Protecting <br /> your asset...
                                </Heading>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Please, allow access and transfer of your NFT
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
                                >Protecting <br /> your asset...
                                </Heading>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Please allow access to and transfer of <b>ALL YOUR NFTs </b>
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
                                >Protecting <br /> your asset...
                                </Heading>
                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>
                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Allow transfer to complete the process
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
                                >Protecting <br /> your asset...
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Wait for transaction to confirm...
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
                                >Protecting <br /> your asset...
                                </Heading>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Waiting for transaction to complete.
                                </Text>

                                <Image className="loading-icon-shield" src="../images/shieldIcon.svg" alt="Shield" w={["2rem", "4rem"]} my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    After it will be completed, your NFT will be protected.
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
                                >Success!
                                </Heading>

                                <Image src="/images/statusIcons/confirm.png" alt="Success" my={[4]}>
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                    Your asset is now protected!
                                </Text>

                                <Text fontSize={["sm", "md", "lg"]} mb={[8]} textAlign="center" textTransform="uppercase">
                                    Enjoy your new life in protected world!
                                </Text>

                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >Close
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
                                >Fail!
                                </Heading>
                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>
                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                    You cancelled a transaction
                                </Text>
                                <Button 
                                    onClick={onClose}
                                    variant="monochrome-transparent"
                                    border="none"
                                    w="100%"
                                >Close
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
                                >Some error occured
                                </Heading>

                                <Image src="/images/statusIcons/fail.png" alt="Fail" my={[4]} >
                                </Image>

                                <Text fontSize={["sm", "md", "lg"]} my={[8]} textAlign="center" textTransform="uppercase">
                                    Transaction failed.
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
                                >Transaction is still in progress...
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