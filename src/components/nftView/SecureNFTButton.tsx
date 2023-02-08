import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import NFTProtectABI from '../../abi/NFTProtectABI';
import { nftpContractAddress } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../dialogs/DidRequiredDialog';
import ERC721ABI from '../../abi/ERC721ABI';
import ERC1155ABI from '../../abi/ERC1155ABI';
import { useEffect, useState } from 'react';
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
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    Spinner,
    useDisclosure,
} from '@chakra-ui/react'
import StepWizard from 'react-step-wizard';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
}

const secureNFTButton = (props: ButtonInitialData) => {

    const nft = props.nft
    const metadata = props.metadata
    const { chainId, account, setError, library, connector } = useWeb3React<Web3Provider>()
    const didDialogDisclosure = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const referrer = '0x0000000000000000000000000000000000000000' // should be replaced by real referrer
    const nftProtect: Contract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())
    const [ nextStep, setNextStep ] = useState<Number>()

    const stepMapping = {
        'checkPermission': 1,
        'requestConcrete': 2,
        'requestAll': 3,
        'requestWrap': 4,
        'waitingForAllow': 5,
        'waitingForFinal': 6,
        'finalCompleted': 7,
        'canceled': 8,
        'error': 9,
        'timeout': 10
    }

    const handleError = (error: any) => {
        const errorMessage = error.error?.data?.originalError?.message
        if (errorMessage) {
            if (errorMessage.includes('NFTProtect: user must be registered')) {
                // Must register DID
                didDialogDisclosure.onOpen()
            } else if (errorMessage.includes('NFTProtect: invalid referrer')) {
                // Invalid referrer address
                console.log('Invalid referrer!')
                setNextStep(stepMapping.error)
            } else {
                console.error(error)
                setNextStep(stepMapping.error)
            }
        } else {
            console.error(error)
            setNextStep(stepMapping.error)
        }
    }

    const finalTransactionSent = (tokenContract: Contract) => {
        return (tx: any) => {
            setNextStep(stepMapping.waitingForFinal);
            tokenContract.provider.once(tx.hash, (receipt) => {
                if (receipt.status === 1) {
                    // after mined fire wrap
                    setNextStep(stepMapping.finalCompleted)
                    console.log("Transaction successful", tx.hash);
                } else {
                    setNextStep(stepMapping.error)
                    console.log("Transaction failed", tx.hash);
                    setTimeout(onClose, 3000)
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
                                    setNextStep(stepMapping.requestWrap)
                                    console.log("Transaction failed", tx.hash);
                                    setTimeout(onClose, 3000)
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
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC721ABI, library?.getSigner())
                console.log('ERC721')
                secureNFT(
                    tokenContract,
                    () => tokenContract.getApproved(nft.tokenId),
                    (result: any) => ( result.toLowerCase() === nftpContractAddress.toLowerCase() ),
                    () => tokenContract.approve(nftpContractAddress, nft.tokenId),
                    () => nftProtect.wrap721(tokenContractAddress, nft.tokenId, 0, referrer)
                )
            } else if (nft.contractType === 'ERC1155') {
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC1155ABI, library?.getSigner())
                console.log('ERC1155')
                secureNFT(
                    tokenContract,
                    () => tokenContract.isApprovedForAll(account, nftpContractAddress),
                    (result: any) => result,
                    () => tokenContract.setApprovalForAll(nftpContractAddress, true),
                    () => nftProtect.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, referrer)
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
                <ModalHeader>Login with wallet</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <StepWizard initialStep={ stepMapping.checkPermission }>
                        <Box>
                            Checking permission to transfer token...
                        </Box>
                        <Box>
                            Allow access to and transfer of your {metadata?.name || nft.name}? This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
                        </Box>
                        <Box>
                            Allow access to and transfer of ALL YOUR NFTs? This allows a third party to access and transfer the following NFTs without further notice until you revoke its access.
                        </Box>
                        <Box>
                            Allow transfer of your {metadata?.name || nft.name} to complete process.
                        </Box>
                        <Box>
                            Waiting for transaction to complete. After that you'll be asked for confirmation for wrapping.
                        </Box>
                        <Box>
                            Waiting for transaction to complete. After it will be completed, your NFT {metadata?.name || nft.name} will be protected.
                        </Box>
                        <Box>
                            Transaction complete! Your {metadata?.name || nft.name} is now secured.
                        </Box>
                        <Box>
                            You canceled the transaction in your wallet.
                        </Box>
                        <Box>
                            Some error occured. Transaction failed.
                        </Box>
                        <Box>
                            Transaction is still in progress.
                        </Box>
                        <StepSwitcher nextStepNumber={nextStep}/>
                    </StepWizard>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

const StepSwitcher = (props: any) => {
    const nextStep = props.nextStepNumber

    useEffect(() => {
        if (nextStep && (nextStep != props.currentStep)) {
            props.goToStep(nextStep)
        }
    }, [nextStep])

    return <div/>
}

export default secureNFTButton