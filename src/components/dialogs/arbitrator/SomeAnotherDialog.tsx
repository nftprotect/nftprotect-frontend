import React, { useEffect } from "react"
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
import { useCallableDialogContext } from "../../../context/CallableDialogContextProvider"

const SomeAnotherDialog = () => {
    const cancelRef = React.useRef<any>()
    const disclosure = useDisclosure()
    const { setDialog } = useCallableDialogContext()

    useEffect(() => {
        setDialog('SomeAnotherDialog', disclosure)
    }, [])

    return (
        <>        
            <AlertDialog
                isOpen={disclosure.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={disclosure.onClose}
            >
                <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    Please register SomeAnotherDialog
                    </AlertDialogHeader>
        
                    <AlertDialogBody>
                    You have to register SomeAnotherDialog to proceed.
                    </AlertDialogBody>
        
                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={disclosure.onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={disclosure.onClose} ml={3}>
                        Register
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default SomeAnotherDialog