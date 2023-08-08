import React from 'react';
import {
    Button,
    Box,
    Image,
    Flex,
    Text,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    useDisclosure
} from '@chakra-ui/react';

import { Trans } from '@lingui/macro';

const CancelledStepContent = () => {

    const { isOpen, onClose } = useDisclosure()

    return (<>
            <Card variant="stepContent" minH={{base: "270px"}}>
                <Flex flexDirection="column" alignItems="center">
                    <CardHeader>
                        <Text as="h3" textStyle="h3">
                            <Trans>Fail!</Trans>
                        </Text>
                    </CardHeader>
                    <CardBody>
                        <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                            <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
                            </Image>
                        </Box>
                        <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                            <Trans>You cancelled a transaction</Trans>
                        </Text>
                    </CardBody>
                </Flex>
            </Card>
    </>)
}

export default CancelledStepContent