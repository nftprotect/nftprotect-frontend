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
import { useNotifications } from "../../hooks/useNotifications"
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
    } = useNotifications()

    useEffect(() => {
        console.log(listNotifications())
    }, [notificationsCount])

    return (
        <Box 
            px={['1rem', '3rem']} 
            py={[4, 8]} 
            bgColor="#000"
        >
            <Accordion defaultIndex={[0]} allowMultiple>
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
                        bgColor="#000"
                        color="#FFF"
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
    const { deleteNotifications } = useNotifications()

    return (
        <Flex 
            mb={[2]} 
            border="4px solid #FF0000"
            borderRadius="15px"
            alignItems={{md: "center"}}
            bgColor="#FFF"
            h={{base: "auto", md: "80px"}}
            p={{base: "0.75rem"}}
            justifyContent={{md: "space-between"}}
            flexDirection={{base: "column", md: "row"}}
        >
            <Flex alignItems={{md: "center"}}>
                <Box
                    mr={{base: "1.625rem"}}
                    w={{base: "70px", sm: "100px", md: "3.375rem"}}
                    h={{base: "70px", sm: "100px", md: "3.375rem"}}
                >
                    <Image src={ notification.image?.url || "./images/notificationImageExample.png"} alt={ notification.image?.text || "example" } w="100%"/>
                </Box>
                <Box mr={[4]}>
                    <Text fontSize={{base: "0.875rem"}}>
                        { notification.children }
                    </Text>
                </Box>
            </Flex>

            <Flex 
                alignItems= "center"
                
            >
                { notification.callback && <Button 
                    variant="dark-outline"
                    fontSize={{base: "0.875rem"}}
                    mr={{base: "0.875rem"}}
                    textTransform="uppercase"
                    py={{base: "0.625rem"}}
                    px={{base:"2.25rem"}}
                    w={{base: "80%", md: "auto"}}
                    minW="170px"
                    onClick={notification.callback}
                >
                    <Trans>Read more</Trans>
                </Button> }
                <Flex justifyContent="center" minW="2rem">
                    {
                        notification.closeable && 
                        <CloseButton
                            onClick={ () => deleteNotifications([notification.id]) }
                            border="2px solid #000"
                            _hover={{
                                bgColor: "rgba(255, 255, 255, 0.15)",
                                transform: "scale(1.03)"
                            }}
                            _active={{
                                bgColor: "rgba(255, 255, 255, 0.15)"
                            }}
                        />
                    }
                </Flex>
            </Flex>
        </Flex>
    )
}

export default ShowNotifications