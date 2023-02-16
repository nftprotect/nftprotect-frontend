import { EvmNft } from '@moralisweb3/common-evm-utils';
import { SpeedyNode } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import { dialogsTimeout } from '../../../utils/config' 
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
import SwitchableOutside from '../../wizardHelpers/SwitchableOutside';
import { useAppContext } from '../../../context/AppContextProvider';
import { handleContractError } from '../../../utils/errorHandling';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
    nftReFetch: Function // function to update nft list
    tokenContract: Contract
}

const RequestOriginalNFTButton = ({nft, metadata, nftReFetch, tokenContract}: ButtonInitialData) => {

    const { nftProtectContract } = useAppContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ nextStep, setNextStep ] = useState<number>(0)

    // Naming of wizard step numbers
    const stepMapping = {
        requestAskOnwership: 0,
        waitingForFinal: 1,
        finalCompleted: 2,
        canceled: 3,
        error: 4,
        timeout: 5
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

    const mainButtonOnClick = () => {
        setNextStep(stepMapping.requestAskOnwership);
        onOpen()
    }

    const startButtonOnClick = () => {
        try {
            nftProtectContract.askOwnershipAdjustment(nft.tokenId)
                .then( finalTransactionSent(tokenContract) )
                .catch( 
                    handleContractError({
                        'ACTION_REJECTED': handleRejected,
                        default: handleUnknownError
                    }) 
                )
        } catch (err: any) {
            handleUnknownError(err)
        }
    }

    return (<>
        <Button
            type='button'
            onClick={ mainButtonOnClick }
            my={2}
            justifyContent="flex-start"
            leftIcon={<SpeedyNode />}
            w="100%"
            h={[8, 10]}
            bg="none"
            border="2px"
            borderColor="#BC9CFF"
            borderRadius="12px"
            whiteSpace="break-spaces"
            fontSize={['2xs', 'xs', 'sm', 'md']}
            _hover={{
                bg: "linear-gradient(180deg, #BC9CFF 0%, #8BA4F9 100%)",
                color: "#FFF"
            }}
        >Request original
        </Button>
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
        >
            <ModalOverlay 
                bg='blackAlpha.800'
                backdropFilter='blur(10px)'
            />
            <ModalContent
                w={{base: "90vw", sm: "70vw", xl: "50vw"}}
                maxW="700px"
            >
                <ModalHeader>Requesting transfer of original NFT</ModalHeader>
                <ModalBody>
                    <Wizard>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Press button to request the owner of original NFT {metadata?.name || nft.name} to transfer the original NFT to you.
                                <Button type='button' onClick={ startButtonOnClick }>
                                    Start
                                </Button>
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Waiting for transaction to complete. Owner of original NFT will be notified.
                            </Box>
                        </SwitchableOutside>
                        <SwitchableOutside nextStepNumber={nextStep}>
                            <Box>
                                Transaction complete! Your request to transfer {metadata?.name || nft.name} sent.
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

export default RequestOriginalNFTButton