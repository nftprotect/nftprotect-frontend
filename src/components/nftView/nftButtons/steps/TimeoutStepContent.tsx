import React from 'react';
import {
    Text,
    Spinner,
    Card,
    CardBody,
    CardHeader
} from '@chakra-ui/react';

import { Trans } from '@lingui/macro';

const TimeoutStepContent = () => {

    return (<>
        <Card variant="stepContent" minH={{base: "270px"}}>
            <CardHeader>
                <Text as="h3" textStyle="h3">
                    <Trans>{"Transaction is still in progress…"}</Trans>
                </Text>
            </CardHeader>
            <CardBody>
                <Spinner variant="primary" speed='0.65s' my={{base: "20px"}}></Spinner>
            </CardBody>
        </Card>
    </>)
}

export default TimeoutStepContent