import { BellIcon } from "@chakra-ui/icons"
import { 
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Badge,
    Alert,
    AlertIcon,
    CloseButton,
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
        <Accordion allowMultiple>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex='1' textAlign='left'>
                            <Box as="span"
                                mr='0.5em'
                            >
                                <BellIcon 
                                    fontSize={'2em'}
                                />
                                <Badge>{notificationsCount}</Badge>
                            </Box>
                            Notifications
                        </Box>
                        Show all
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel 
                    pb={4}
                >
                    <Box 
                        maxHeight={'13em'}
                        overflowY={'scroll'}
                    >
                        { listNotifications().map((notification:any) => {
                            return <NotificationAlert notification={notification}/>
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
        <Alert { ...alertProps }
        >
            <AlertIcon />
            <Box width='100%'>
                { notification.children }
            </Box>
            {
                notification.closeable && <CloseButton
                    alignSelf='flex-start'
                    position='relative'
                    right={-1}
                    top={-1}
                    onClick={ () => deleteNotifications([notification.id]) }
                />
            }

        </Alert>
    )
}

export default ShowNotifications