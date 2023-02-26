import { BellIcon } from "@chakra-ui/icons"
import { 
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Flex,
    Badge,
    Text,
    Alert,
    AlertIcon,
    CloseButton,
    Image,
    Button
} from "@chakra-ui/react"
import { useEffect } from "react"
import { useNotificationContext } from "../../context/NotificationContextProvider"
import {Bell} from '@web3uikit/icons'


const severityMapping: {
    status: 'success'|'info'|'warning'|'error'
}[] = [
    { // Ok
        status:'success'
    }, { // Info
        status:'info'
    }, { // Major
        status:'warning'
    }, { // Critical
        status:'error'
    }
]

const ShowNotifications = () => {
    const {
        listNotifications,
        notificationsCount
    } = useNotificationContext()

    useEffect(() => {
        console.log(listNotifications())
    }, [notificationsCount])

    return (<>
        <Accordion 
            allowMultiple 
            mx={['1rem', '3rem']}
            
        >
            <AccordionItem 
                border="2px solid #000"
                borderRadius="15px"
                overflow="hidden"
            >
                <AccordionButton
                    py={[6]}
                    justifyContent="space-between"
                    _hover={{
                        bgColor: "#FFF"
                    }}
                >
                    <Flex flexWrap="nowrap" alignItems="center" fontWeight="600">
                        <Box fontSize={["1.5em", "2.2em"]} >
                            <Bell />
                        </Box>
                        
                        <Badge 
                            position="relative"
                            top={["-8px", "-14px"]}
                            left={["-15px", "-24px" ]}
                            bg="#E12222" 
                            w={["20px", "30px" ]}
                            h={["20px", "30px" ]}
                            borderRadius={["10px", "15px"]}
                            color="#FFF" 
                            fontSize={[".8em", "1.2em"]} 
                        >
                            {notificationsCount}
                        </Badge>
                        <Text 
                            fontSize={["1em", "1.2em"]} 
                            lineHeight={["1em", "1.2em"]}
                        >
                            Notifications
                        </Text>
                    </Flex>
                    <Flex 
                        flexWrap="nowrap" 
                        alignItems="center" 
                        fontSize={["1em", "1.2em"]} 
                        lineHeight={["1em", "1.2em"]}
                        fontWeight="600"
                    >
                        <Text>
                            Show all
                        </Text>
                        <AccordionIcon />
                    </Flex>
                </AccordionButton>
                <AccordionPanel
                    px="0"
                    pb={4}
                >
                    <Box 
                        maxHeight={'13em'}
                        overflowY={'scroll'}
                    >
                        { listNotifications().map((notification:any) => {
                            return <NotificationAlert key={notification.id} notification={notification}/>
                        }) }
                    </Box>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    </>)
}

const NotificationAlert = ({
    notification
}: any) => {
    const alertProps = {
        key: notification.id,
        ...severityMapping[notification.severity]
    }
    const { deleteNotifications } = useNotificationContext()

    return (
        // <Alert { ...alertProps }
        // >
        //     <AlertIcon />
            <Flex 
                justifyContent="space-between" mb={[8]} 
                border="4px solid #FF0000"
                borderRadius="15px"
            >
                <Flex alignItems="center" w="70%">
                    <Box p={[2]} w="3em">
                        <Image src="./images/shieldIcon.svg" alt="example" w="100%"/>
                    </Box>
                    <Box width='100%'>
                        { notification.children }
                    </Box>
                </Flex>

                <Flex alignItems="center" w="30%">
                    <Button 
                        variant="primary-solid"
                        fontSize={['xs', 'sm', 'md', 'lg']}
                        w={["7em"]}
                        mr={[4]}
                    >
                        Read more
                    </Button>
                    {
                        notification.closeable && <CloseButton
                            border="2px solid #000"
                            mr={[4]}
                            onClick={ () => deleteNotifications([notification.id]) }
                        />
                    }
                </Flex>
            </Flex>
        // </Alert>
    )
}

export default ShowNotifications