import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Button } from '@chakra-ui/react'
import { EvmNft } from '@moralisweb3/common-evm-utils';
import { Sandbox } from '@web3uikit/icons'
import { EvmNftMetadataish } from '@moralisweb3/common-evm-utils';
import NFTProtectABI from '../../abi/NFTProtectABI';
import { nftpContractAddress } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import DidRequiredDialog from '../dialogs/DidRequiredDialog';
import { useDisclosure } from '@chakra-ui/react';
import ERC721ABI from '../../abi/ERC721ABI';
import ERC1155ABI from '../../abi/ERC1155ABI';

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
}

const SecureNFTButton = (props: ButtonInitialData) => {

    const nft = props.nft
    const metadata = props.metadata
    const { chainId, account, setError, library, connector } = useWeb3React<Web3Provider>()
    const didDialogDisclosure = useDisclosure()
    const referrer = '0x0000000000000000000000000000000000000000' // should be replaced by real referrer
    const nftProtect: Contract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())

    const handleError = (error: any) => {
        const errorMessage = error.error?.data?.originalError?.message
        if (errorMessage) {
            if (errorMessage.includes('NFTProtect: user must be registered')) {
                // Must register DID
                didDialogDisclosure.onOpen()
            } else if (errorMessage.includes('NFTProtect: invalid referrer')) {
                // Invalid referrer address
                console.log('Invalid referrer!')
            } else {
                console.error(error)
            }
        } else {
            console.error(error)
        }
    }

    const finalTransactionSent = () => {

    }

    const performSecure = (
        tokenContract: Contract,
        checkApprovedMethodCall: Function,
        checkApproved: Function,
        setApproveMethodCall: Function,
        wrapMethodCall: Function
    ) => {
        checkApprovedMethodCall()
            .then((result: any) => {
                // check if transfer already approved 
                if (checkApproved(result)) {
                    console.log('Token transfer already approved')
                    wrapMethodCall()
                        .then( finalTransactionSent )
                        .catch( handleError )
                } else {
                    console.log('Asking to approve token transfer')
                    setApproveMethodCall()
                        .then((tx: any) => {
                            console.log('Waiting for TX', tx.hash);
                            // Waiting for transaction to complete
                            tokenContract.provider.once(tx.hash, (receipt) => {
                                if (receipt.status === 1) {
                                    // after mined fire wrap
                                    console.log("Transaction successful", tx.hash);
                                    wrapMethodCall()
                                        .then( finalTransactionSent )
                                        .catch( handleError )
                                } else {
                                    console.log("Transaction failed", tx.hash);
                                }
                            })
                        })
                        .catch( handleError )
                }
            })
            .catch( handleError )
    }

    const secureNFT = () => {
        const tokenContractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId

        console.log(tokenContractAddress, tokenId, metadata)

        try {
            if (nft.contractType === 'ERC721') {
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC721ABI, library?.getSigner())
                console.log('ERC721')
                performSecure(
                    tokenContract,
                    () => tokenContract.getApproved(nft.tokenId),
                    (result: any) => ( result.toLowerCase() === nftpContractAddress.toLowerCase() ),
                    () => tokenContract.approve(nftpContractAddress, nft.tokenId),
                    () => nftProtect.wrap721(tokenContractAddress, nft.tokenId, 0, referrer)
                )
            } else if (nft.contractType === 'ERC1155') {
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC1155ABI, library?.getSigner())
                console.log('ERC1155')
                performSecure(
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
            onClick={ secureNFT }
        >
            <Sandbox fontSize='20px'/>
        </Button>
        <DidRequiredDialog disclosure={didDialogDisclosure}/>
    </>)
}

export default SecureNFTButton