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
    Grid,
    Alert,
    AlertIcon,
    CloseButton,
    Image,
    Button
} from "@chakra-ui/react"
import { useEffect } from "react"
import { useNotificationContext } from "../../context/NotificationContextProvider"
import {Bell} from '@web3uikit/icons'
import { Trans } from '@lingui/macro'

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

    return (
        <Box 
            px={['1rem', '3rem']} 
            py={[4, 8]} 
            bgColor="#000"
        >
            <Accordion allowMultiple>
                <AccordionItem
                border="none"
                    borderRadius="15px"
                    overflow="hidden"
                >
                    <AccordionButton
                        py={[6]}
                        justifyContent="space-between"
                        border="none"
                        borderRadius="15px"
                        bgColor="#FFF"
                        _hover={{
                            bgColor: "none"
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
                                fontWeight="normal"
                            >
                                {notificationsCount}
                            </Badge>
                            <Text 
                                fontSize={["1em", "1.2em"]} 
                                lineHeight={["1em", "1.2em"]}
                            >
                                <Trans>Notifications</Trans>
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
                            <Trans>Show all</Trans>
                            </Text>
                            <AccordionIcon />
                        </Flex>
                    </AccordionButton>
                    <AccordionPanel
                        px="0"
                        // pb={4}
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
        </Box>
)}

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
            <Grid 
                templateColumns="1fr 8fr 2fr 1fr" 
                mb={[2]} 
                border="4px solid #FF0000"
                borderRadius="15px"
                alignItems="center"
                bgColor="#FFF"
            >
                <Box p={[2]} mr={[4]} w={["3rem", "4rem"]}>
                    <Image src="./images/shieldIcon.svg" alt="example" w="100%"/>
                </Box>
                <Box mr={[4]}>
                    <Text py={4}>
                        { notification.children }
                    </Text>
                </Box>
                <Button 
                    variant="primary-solid"
                    fontSize={['xs', 'sm', 'md', 'lg']}
                    mr={[4]}
                    textTransform="uppercase"
                >
                    <Trans>Read more</Trans>
                </Button>
                <Flex justifyContent="center" >
                    {
                        notification.closeable && <CloseButton
                            border="2px solid #000"
                            mr={[4]}
                            onClick={ () => deleteNotifications([notification.id]) }
                        />
                    }
                </Flex>
                
            </Grid>
        // </Alert>
    )
}

export default ShowNotifications