import React from "react"
import { 
    AlertDialog, 
    AlertDialogOverlay, 
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    Button,
    useDisclosure
} from "@chakra-ui/react"
// import RegisterDidDialog from "./RegisterDidDialog"

const DidRequiredDialog = (props: any) => {
    const { isOpen, onOpen, onClose } = props.disclosure
    const cancelRef = React.useRef<any>()
    const registerDidDisclosure = useDisclosure()

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
                    Please register DID
                    </AlertDialogHeader>
        
                    <AlertDialogBody>
                    You have to register DID to proceed.
                    </AlertDialogBody>
        
                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={(event) => {
                        // registerDidDisclosure.onOpen()
                        onClose(event)
                    }} ml={3}>
                        Register
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {/* <RegisterDidDialog disclosure={ registerDidDisclosure } /> */}
        </>
    )
}

export default DidRequiredDialog