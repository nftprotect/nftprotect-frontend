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

interface ButtonInitialData {
    nft: EvmNft,
    metadata: EvmNftMetadataish // metadata of EvmNft can be empty, so passing it separately
}

const SecureNFTButton = (props: ButtonInitialData) => {

    const nft = props.nft
    const metadata = props.metadata
    const { chainId, account, setError, library, connector } = useWeb3React<Web3Provider>()
    const didDialogDisclosure = useDisclosure()

    const handleError = (error: any) => {
        // Нужно зарегистрировать DID
        if (error.error.code === -32603) {
            didDialogDisclosure.onOpen()
        } else {
            console.error(error)
        }
    }

    const secureNFT = () => {
        const tokenContractAddress = nft.tokenAddress.format()
        const tokenId = nft.tokenId

        console.log(tokenContractAddress, tokenId, metadata)

        const contract: Contract = new Contract(nftpContractAddress, NFTProtectABI, library?.getSigner())
        try {
            if (nft.contractType === 'ERC721') {
                contract.wrap721(tokenContractAddress, nft.tokenId, 0, account).catch(handleError)
            } else if (nft.contractType === 'ERC1155') {
                contract.wrap1155(tokenContractAddress, nft.tokenId, nft.amount, 0, account).catch(handleError)
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