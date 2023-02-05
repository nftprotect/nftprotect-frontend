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

    const secureNFT = () => {
        const tokenContractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId

        console.log(tokenContractAddress, tokenId, metadata)

        try {
            if (nft.contractType === 'ERC721') {
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC721ABI, library?.getSigner())
                // check if transfer already approved for this token
                console.log('ERC721')
                tokenContract.getApproved(nft.tokenId).then( (result: string) => {
                    console.log('RESULT', result)
                    if (result.toLowerCase() === nftpContractAddress.toLowerCase()) {
                        // already approved, fire wrap
                        nftProtect.wrap721(tokenContractAddress, nft.tokenId, 0, referrer).catch(handleError)
                    } else {
                        tokenContract.approve(nftpContractAddress, nft.tokenId).then(() => {
                        //     //should wait for transaction to mine, now waiting for transaction sent only
                        // after mined fire wrap
                        //     nftProtect.wrap721(tokenContractAddress, nft.tokenId, 0, referrer).catch(handleError)
                        }).catch(handleError)
                    }
                }).catch(handleError)
            } else if (nft.contractType === 'ERC1155') {
                const tokenContract: Contract = new Contract(tokenContractAddress, ERC1155ABI, library?.getSigner())
                // check if NFT Protect is allowed to transfer user's tokens
                tokenContract.isApprovedForAll(account, nftpContractAddress).then( (result: boolean) => {
                    console.log('RESULT', result)
                    if (result) {
                        // already approved, fire wrap
                        nftProtect.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, referrer).catch(handleError)
                    } else {
                        // set approval
                        console.log('SET APPROVAL')
                        tokenContract.setApprovalForAll(nftpContractAddress, true).then(() => {
                            // should wait for transaction to mine, now waiting for transaction sent only
                            // after mined fire wrap
                            // nftProtect.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, referrer).catch(handleError)
                        }).catch(handleError)
                    }
                }).catch(handleError)
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