import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox2 } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import NFTProtectABI from '../../abi/NFTProtectABI';
import { nftpContractAddress, dialogsTimeout } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import ERC721ABI from '../../abi/ERC721ABI';
import ERC1155ABI from '../../abi/ERC1155ABI';
import React, { useEffect, useState } from 'react';
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
}

const UnSecureNFTButton = (props: ButtonInitialData) => {

    const nft = props.nft
    const metadata = props.metadata
    const { chainId, account, setError, library, connector } = useWeb3React<Web3Provider>()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const nftProtect: Contract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())
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
        if (error.code === 'ACTION_REJECTED') {
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
                    props.nftReFetch();
                    setTimeout(onClose, dialogsTimeout)
                } else {
                    handleTransactionFailed(tx);
                }
            })
        }
    }

    const onClick = () => {
        const tokenContractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId
        try {
            const tokenContract: Contract = new Contract(
                tokenContractAddress, 
                (nft.contractType === 'ERC721') ? ERC721ABI : ERC1155ABI, 
                library?.getSigner()
            )
            setNextStep(stepMapping.requestUnwrap);
            onOpen()
            nftProtect.burn(nft.tokenId, 0)
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