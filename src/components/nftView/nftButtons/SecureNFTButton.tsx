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
    Spinner,
    useDisclosure,
} from '@chakra-ui/react'
import { Wizard } from 'react-use-wizard';
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish, // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function, // function to update nft list
    tokenContract: Contract
}

const SecureNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const {account, nftProtectContract, referrerAddress} = useAppContext()
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

    const handleError = (error: any) => {
        // Provider errors
        const onUnknownError = (error: any) => {
            console.error(error)
            setNextStep(stepMapping.error)
            setTimeout(onClose, dialogsTimeout)
        }
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            // Transaction declined
            setNextStep(stepMapping.canceled)
            setTimeout(onClose, dialogsTimeout)
        } else {
            // Other errors
            const errorMessage = error.error?.data?.originalError?.message
            if (errorMessage) {
                const findTerm = (term: String) => errorMessage.includes(term) ? term : '';
                switch(errorMessage) {
                    case findTerm('NFTProtect: user must be registered'):
                        // Must register DID
                        didDialogDisclosure.onOpen();
                        break;
                    case findTerm('NFTProtect: invalid referrer'):
                    default:
                        onUnknownError(error)
                }
            } else {
                onUnknownError(error)
            }
        }
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
        setNextStep(stepMapping.checkPermission);
        onOpen()
        checkApprovedMethodCall()
            .then((result: any) => {
                // check if transfer already approved 
                if (checkApproved(result)) {
                    setNextStep(stepMapping.requestWrap);
                    console.log('Token transfer already approved')
                    wrapMethodCall()
                        .then( finalTransactionSent(tokenContract) )
                        .catch( handleError )
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
                                        .catch( handleError )
                                } else {
                                    handleTransactionFailed(tx);
                                }
                            })
                        })
                        .catch( handleError )
                }
            })
            .catch( handleError )
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
            handleError(err)
        }
    }

    return (<>
        <Button
            type='button'
            onClick={ onClick }
        >
            <Sandbox fontSize='20px'/>
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
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Checking permission to transfer token...
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Allow access to and transfer of your {metadata?.name || nft.name}? This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
                            </Box>
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