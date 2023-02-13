import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
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
    Text,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    Spinner,
    useDisclosure,
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

    return (<>
        <Button
            type='button'
            onClick={ onClick }
            my={2}
            justifyContent="flex-start"
            leftIcon={<Sandbox fontSize='20px'/>}
            w="100%"
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="12px"
            fontSize={['xs', 'sm', 'md', 'lg']}
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
            <ModalOverlay />
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalHeader>Securing your NFT</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex 
                                flexDirection="column"
                            >
                                <Text>
                                    Checking permission to transfer token...
                                </Text>
                                <Spinner 
                                    thickness='4px'
                                    speed='0.65s'
                                    emptyColor='gray.200'
                                    color='blue.500'
                                    size='xl'
                                    my={[8]}
                                    alignSelf="center"
                                />
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Flex 
                                flexDirection="column"
                            >
                                <Text>
                                    Allow access to and transfer of your <i>{metadata?.name || nft.name}</i>?
                                </Text>
                                <Text>
                                    This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
                                </Text>
                                
                            </Flex>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Allow access to and transfer of ALL YOUR NFTs? This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Allow transfer of your {metadata?.name || nft.name} to complete process.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                { "Waiting for transaction to complete. After that you'll be asked for confirmation for wrapping." }
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Waiting for transaction to complete. After it will be completed, your NFT {metadata?.name || nft.name} will be protected.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction complete! Your {metadata?.name || nft.name} is now secured.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                You canceled the transaction in your wallet.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Some error occured. Transaction failed.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction is still in progress.
                            </Box>
                        </SwitchableOutside>
                    </Wizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default SecureNFTButton