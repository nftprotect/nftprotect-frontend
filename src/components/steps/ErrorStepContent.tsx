import React from 'react';
import {
    Box,
    Image,
    Text,
    Card,
    CardBody,
    CardHeader
} from '@chakra-ui/react';

import { Trans } from '@lingui/macro';

const ErrorStepContent = () => {

    return (<>
        <Card variant="stepContent" minH={{base: "270px"}}>
            <CardHeader>
                <Text as="h3" textStyle="h3">
                <Trans>Some error occured</Trans>
                </Text>
            </CardHeader>
            <CardBody>
                <Box my={{base: "20px"}} w={{base: "110px"}} h={{base: "110px"}}>
                    <Image src="/images/statusIcons/fail.png" alt="Fail" w="100%">
                    </Image>
                </Box>
                <Text textStyle="h3" mb={{base: "20px"}} textAlign="center">
                    <Trans>Transaction failed.</Trans>
                </Text>
            </CardBody>
        </Card>
    </>)
}

export default ErrorStepContent