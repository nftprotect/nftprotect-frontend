import React from "react"
import { 
    AlertDialog, 
    AlertDialogOverlay, 
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    Button
} from "@chakra-ui/react"
import { userDidDummyContractAddress } from "../../utils/config"
import UserDidDummyABI from "../../abi/UserDIDDummyABI"
import { Contract } from "@ethersproject/contracts"
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const RegisterDidDialog = (props: any) => {
    const { isOpen, onOpen, onClose } = props.disclosure
    const cancelRef = React.useRef<any>()
    const { account, library } = useWeb3React<Web3Provider>()

    const registerDummy = () => {
        const contract: Contract = new Contract(userDidDummyContractAddress, UserDidDummyABI, library?.getSigner())
        contract.setDummy(account, true).catch(console.error)
    }

    return (
        <>        
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Dummy DID Registration
                        </AlertDialogHeader>
            
                        <AlertDialogBody>
                            Press Register to register dummy DID.
                        </AlertDialogBody>
            
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme='red' 
                                onClick={registerDummy}
                                ml={3}
                            >
                                Register
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default RegisterDidDialog