import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox2 } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import React, { useState } from 'react';
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
import SwitchableOutside from '../wizardHelpers/SwitchableOutside';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function // function to update nft list
    tokenContract: Contract,
    nftProtectContract: Contract,
    account: string | null | undefined
}

const UnSecureNFTButton = ({nft, metadata, nftReFetch, tokenContract, nftProtectContract, account}: ButtonInitialData) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    const stepMapping = {
        'requestUnwrap': 0,
        'waitingForFinal': 1,
        'finalCompleted': 2,
        'canceled': 3,
        'error': 4,
        'timeout': 5
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

    const onClick = () => {
        try {
            setNextStep(stepMapping.requestUnwrap);
            onOpen()
            nftProtectContract.burn(nft.tokenId, 0)
                .then( finalTransactionSent(tokenContract) )
                .catch( handleError )
        } catch (err: any) {
            handleError(err)
        }
    }

    return (<>
        <Button
            type='button'
            onClick={ onClick }
        >
            <Sandbox2 fontSize='20px'/>
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay />
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalHeader>Unsecuring your NFT</ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Allow unwrapping of your {metadata?.name || nft.name} to complete process.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Waiting for transaction to complete. After it will be completed, your will receive original NFT {metadata?.name || nft.name} to your wallet.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction complete! Your {metadata?.name || nft.name} is now in your wallet.
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

export default UnSecureNFTButton