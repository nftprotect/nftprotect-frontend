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
                        {labelKey === "Evidence period" && <Trans>Период сбора доказательств по делу. Любой может загрузить доказательства, которые считает нужными для принятия решения</Trans>}

                        {labelKey === "Voting period" && <Trans>Voting period</Trans>}

                        {labelKey === "Apealing period" && <Trans>Apealing period</Trans>}

                        {labelKey === "Decision period" && <Trans>Decision period</Trans>}

                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </Flex>
    )
}

export default KlerosCaseLabel