import {
    Box,
    Flex,
    Text,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody
} from '@chakra-ui/react'
import { HelpCircle } from '@web3uikit/icons'
import { Trans, t } from '@lingui/macro';

interface stepLabelData {
    labelKey: string
}

const KlerosCaseLabel = ({labelKey}: stepLabelData) => {

    return(
        <Flex flexDirection="row" flexWrap="nowrap">
            <Text fontSize="14px" lineHeight="18px" fontWeight="600">{labelKey}</Text>
            <Popover placement="bottom">
                <PopoverTrigger>
                    <Box cursor="pointer" color="#2D7BD6" ml={[2]}>
                        <HelpCircle fontSize='20px' />
                    </Box>
                </PopoverTrigger>
                <PopoverContent w={{base: "280px"}} color="#FFF" bgColor="#030303" fontSize="14px" lineHeight="18px" textAlign="left">
                    <PopoverArrow bgColor="#030303"/>
                    <PopoverBody  borderRadius="16px" color="#FFF" px={{base: "10px"}} py={{base: "8px"}} >
                        {labelKey === "Evidence period" && <Trans>During the evidence submission period where all interested parties (disputing parties, jurors, challengers and any external agent) are able to submit their evidence.</Trans>}

                        {labelKey === "Voting period" && <Trans>During the voting period, Kleros Jurors make a determination and cast their votes in favor of one of the disputing parties.</Trans>}

                        {labelKey === "Apealing period" && <Trans>During the appeal period, both parties can challenge the initial decision by paying a fee within 84 hours. If the appeal is funded, the dispute is reviewed again. If no appeal is made, the original decision is final and the case is resolved. If only one side pays the appeal fee, they win the dispute, regardless of the initial ruling.</Trans>}

                        {labelKey === "Decision period" && <Trans>The final ruling has been rendered and becomes binding.</Trans>}

                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </Flex>
    )
}

export default KlerosCaseLabel