import { useEffect, useRef } from "react"
import { useAppContext } from "../../context/AppContextProvider"
import { ReqStatus, ReqType, TokenGraphData, useNftProtectGraph } from "../../hooks/useNftProtectGraph"
import { useNotifications } from "../../hooks/useNotifications"
import { Heading, Text, Link } from "@chakra-ui/react"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import { Trans } from "@lingui/macro"
import { formatAddress, timestampToDate } from "../../utils/helpers"
import { useAlchemy } from "../../hooks/useAlchemy"
import { BigNumber } from '@ethersproject/bignumber'
import NFT, { ActionRequest } from "../../classes/NFT"
import { createDisputeLink } from "../../utils/kleros"
import { Period, useArbitratorGraph } from "../../hooks/useArbitratorGraph"
import { defaultArbitrator } from "../../utils/config"
import { SeverityLevel } from "../../context/NotificationContextProvider"
import { 
    Nft as AlchemyNFT, 
} from "alchemy-sdk";
import NFTImage from "../nftView/NFTImage"

const CommonNotificationBody = ({
    header,
    message
}:{
    header?: JSX.Element,
    message?: JSX.Element
}) => <div>
        <Heading 
            fontSize={{base: "0.875rem"}}
            mb={{base: "0.625rem"}}
        >
            {header && header}
        </Heading>
        <Text
            fontSize={{base: "0.625rem"}}
        > 
            {message && message}
        </Text>
    </div>

const klerosAppealPeriod = 84

const NotificationsLoader = () => {
    const context = useAppContext()
    const { account, active, currentChain, nftProtectContract } = context
    const { listTokensReceived, listTokensTransfered } = useNftProtectGraph()
    const { getDispute } = useArbitratorGraph(currentChain.chainId, defaultArbitrator)
    const { addNotification } = useNotifications()
    const { getNftMetadata } = useAlchemy(currentChain?.alchemyId)
    const originalsCache = useRef<NFT[]>([])

    const generateNotificationId = (nft: TokenGraphData) => {
        const requestPart = nft.latestRequest ? 
            `${nft.latestRequest.id}-${nft.latestRequest.type}-${nft.latestRequest.status}` :
            'none'
        return `${nft.id}-${requestPart}`
    }

    const loadRequest = async (requestId: BigNumber): Promise<ActionRequest> => {
        const request = await nftProtectContract.requests(requestId)
        return {id: requestId, ...request}
    }

    const loadOriginalNFT = async (nft: TokenGraphData): Promise<NFT> => {
        const result = await getNftMetadata([nft.contractAddress, nft.tokenId])
        return new NFT(result, context)
    }

    const getOriginalNft = async (nft: TokenGraphData): Promise<NFT> => {
        let result = originalsCache.current.find( it => (it.tokenId === nftProtectContract.tokenId) && (it.contract.address === nftProtectContract.contractAddress))
        if (!result) {
            result = await loadOriginalNFT(nft)
        }
        return result
    }

    const getCourtSides = (nft: TokenGraphData, requestType: ReqType): {
        claimant: string,
        defendant: string
    } => {
        switch(requestType) {
            case ReqType.Burn:
            case ReqType.OwnershipRestore: // actually defendant probably is not nft.ownerAddress
                return {
                    claimant: nft.originalOwnerAddress,
                    defendant: nft.ownerAddress
                }
            case ReqType.OwnershipAdjustment:
                return {
                    claimant: nft.ownerAddress,
                    defendant: nft.originalOwnerAddress
                }
        }
    }

    const loadNotifications = async () => {
        if (account) {
            // All pNFTs received by account
            const receivedNfts = await listTokensReceived(account)
            // All pNfts transfered from account
            const transferedNfts = await listTokensTransfered(account)
            console.log('GRAPH TOKENS', receivedNfts, transferedNfts)
            // So these notifications are for the pNFT owner
            receivedNfts.forEach(async (nft) => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    const loadedRequest = await loadRequest(request.id)
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {
                        if (loadedRequest.externalDisputeId) {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 19. Original NFT received by request with dispute
                                addNotification({
                                    id: notificationId+'.19',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Arbitrator’s ruling on the dispute #${loadedRequest.externalDisputeId.toString()} is now in effect.`}</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.Burn) {
                                // 30.2 pNFT burn accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId+'.30.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>Dispute #{loadedRequest.externalDisputeId.toString()} decision is now in force.</Trans>
                                            }
                                            message={
                                                <Trans>Your pNFT has been burned.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            }
                        } else {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 2. Original NFT received by request without dispute
                                addNotification({
                                    id: notificationId+'.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has transferred the original NFT to you.</Trans>
                                            }
                                            message={
                                                <Trans>We recommend protecting it using NFT Protect.</Trans>
                                            }
                                        />,
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    } else if (request.status === ReqStatus.Disputed) {
                        // If request is disputed we have to load data from arbitrator graph
                        const dispute = await getDispute(loadedRequest.externalDisputeId)
                        const { claimant } = getCourtSides(nft, request.type)
                        if (dispute.period === Period.Evidence) {
                            if (nft.ownerAddress === claimant) {
                                // 3 Evidence period started
                                addNotification({
                                    id: notificationId+'.3',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Evidence period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            } else {
                                // 24 Evidence period started
                                addNotification({
                                    id: notificationId+'.24',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Evidence Period for the dispute #{loadedRequest.externalDisputeId.toString()} has been started.</Trans>
                                            }
                                            message={
                                                <Trans>You can now submit your evidence.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            }
                        } else if ((dispute.period === Period.Commit) || (dispute.period === Period.Vote)) {
                            if (nft.ownerAddress === claimant) {
                                // 8 Voting period started
                                addNotification({
                                    id: notificationId+'.8',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Voting period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            } else {
                                // 26 Voting period started
                                addNotification({
                                    id: notificationId+'.26',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Voting period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            }
                        } else if (dispute.period === Period.Appeal) {
                            if (nft.ownerAddress === claimant) {
                                if (dispute.currentRulling.toNumber() === 0) {
                                    // 9 Case refused
                                    addNotification({
                                        id: notificationId+'.9',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>The case will now be closed.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    })
                                } else if (dispute.currentRulling.toNumber() === 1) {
                                    // 10 You have won the case
                                    addNotification({
                                        id: notificationId+'.10',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Congratulations! You have won the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    }) 
                                } else if (dispute.currentRulling.toNumber() === 2) {
                                    // 11 You have lost the case
                                    const currentDate = new Date()
                                    const targetDate = timestampToDate(dispute.startTime)
                                    const timePassed = targetDate.getTime() - currentDate.getTime()
                                    const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                    const hoursLeft = klerosAppealPeriod - hoursPassed
                                    addNotification({
                                        id: notificationId+'.11',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>You have the option to file an appeal within {hoursLeft} hours</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: targetDate
                                    })
                                }
                            } else {
                                if (dispute.currentRulling.toNumber() === 0) {
                                    // 27 Case refused
                                    addNotification({
                                        id: notificationId+'.27',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                }
                                                message={
                                                    <Trans>The case will now be closed.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    })
                                } else if (dispute.currentRulling.toNumber() === 2) {
                                    // 28 You have won the case
                                    addNotification({
                                        id: notificationId+'.28',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Congratulations! You have won the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    }) 
                                } else if (dispute.currentRulling.toNumber() === 1) {
                                    // 11 You have lost the case
                                    const currentDate = new Date()
                                    const targetDate = timestampToDate(dispute.startTime)
                                    const timePassed = targetDate.getTime() - currentDate.getTime()
                                    const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                    const hoursLeft = klerosAppealPeriod - hoursPassed
                                    addNotification({
                                        id: notificationId+'.11',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>You have the option to file an appeal within {hoursLeft} hours</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: targetDate
                                    })
                                }
                            }
                        } else if (dispute.period === Period.Execution) {

                        }
                    } else if (request.status === ReqStatus.Initial) {
                        if (request.type === ReqType.OwnershipAdjustment) {
                            // If request timeout expired
                            if (loadedRequest.timeout) {
                                const timeoutDate = timestampToDate(loadedRequest.timeout.toNumber())
                                if (timeoutDate <= new Date()) {
                                    // 4. Original NFT request timeout
                                    addNotification({
                                        id: notificationId+'.4',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children:
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has not responded.</Trans>
                                                }
                                                message={
                                                    <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                                }
                                            />,
                                        severity: SeverityLevel.Major,
                                        dateCreated: timeoutDate
                                    })
                                } else {
                                    // 1. Request sent to the original NFT owner
                                    addNotification({
                                        id: notificationId+'.1',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children:
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Request sent to the original NFT owner.</Trans>
                                                }
                                            />,
                                        severity: SeverityLevel.Info,
                                        dateCreated: request.updateDate
                                    })
                                }
                            }
                        }
                    } else if (request.status === ReqStatus.Rejected) {
                        if (loadedRequest.externalDisputeId) {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 20. Original NFT rejected by request with dispute
                                addNotification({
                                    id: notificationId+'.20',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Arbitrator’s ruling on the dispute #${loadedRequest.externalDisputeId.toString()} is now in effect.`}</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            }
                        } else {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 3. Original NFT request rejected without dispute
                                addNotification({
                                    id: notificationId+'.3',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children:
                                        <CommonNotificationBody
                                            header={
                                                <Trans>User ${formatAddress(nft.originalOwnerAddress, 4)} has refused to transfer the original NFT to you.</Trans>
                                            }
                                            message={
                                                <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                            }
                                        />,
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    }
                } else {
                    // NFT has no pending request
                    // 0. pNFT received
                    addNotification({
                        id: notificationId+'.0',
                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                        children:
                            <CommonNotificationBody
                                header={
                                    <Trans>You have received a pNFT! </Trans>
                                }
                                message={
                                    <Trans>Would you like to request the original NFT?</Trans>
                                }
                            />,
                        severity: SeverityLevel.Major,
                        dateCreated: new Date() // TODO: search for transaction
                    })
                }

            })
            // So these notifications are for the ORIGINAL NFT owner
            transferedNfts.forEach(async (nft) => {
                const notificationId = generateNotificationId(nft)
                const { latestRequest: request } = nft
                if (request) {
                    const loadedRequest = await loadRequest(request.id)
                    // NFT has a pending request
                    if (request.status === ReqStatus.Accepted) {
                        if (loadedRequest.externalDisputeId) {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 30.1 Original NFT request accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId+'.30.1',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>Dispute #{loadedRequest.externalDisputeId.toString()} decision is now in force.</Trans>
                                            }
                                            message={
                                                <Trans>{`The original NFT has been transferred to the new owner ${formatAddress(nft.ownerAddress, 4)}.`}</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    } else if (request.status === ReqStatus.Disputed) {
                        // If request is disputed we have to load data from arbitrator graph
                        const dispute = await getDispute(loadedRequest.externalDisputeId)
                        const { claimant } = getCourtSides(nft, request.type)
                        if (dispute.period === Period.Evidence) {
                            if (nft.originalOwnerAddress === claimant) {
                                // 3 Evidence period started
                                addNotification({
                                    id: notificationId+'.3',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Evidence period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            } else {
                                // 24 Evidence period started
                                addNotification({
                                    id: notificationId+'.24',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Evidence Period for the dispute #{loadedRequest.externalDisputeId.toString()} has been started.</Trans>
                                            }
                                            message={
                                                <Trans>You can now submit your evidence.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            }
                            if (!dispute.appealed) { // First time
                                if (request.type === ReqType.OwnershipAdjustment) {
                                    // 23.2 Original NFT disputed
                                    addNotification({
                                        id: notificationId+'.23.2',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>User {formatAddress(nft.ownerAddress, 4)} has filed a claim for Ownership Adjustment and wants to obtain the rights of the original NFT. More details on dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: request.updateDate
                                    })
                                } else if (request.type === ReqType.Burn) {
                                    // 23.1 pNFT burn disputed
                                    addNotification({
                                        id: notificationId+'.23.1',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>User {formatAddress(nft.originalOwnerAddress, 4)} has filed a claim to burn your pNFT. More details on dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: request.updateDate
                                    })
                                }
                            } else { // it's an appeal

                            }
                        } else if ((dispute.period === Period.Commit) || (dispute.period === Period.Vote)) {
                            if (nft.originalOwnerAddress === claimant) {
                                // 8 Voting period started
                                addNotification({
                                    id: notificationId+'.8',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Voting period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            } else {
                                // 26 Voting period started
                                addNotification({
                                    id: notificationId+'.26',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Voting period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Info,
                                    dateCreated: timestampToDate(dispute.startTime)
                                })
                            }
                        } else if (dispute.period === Period.Appeal) { // User can make an appeal
                            if (nft.originalOwnerAddress === claimant) {
                                if (dispute.currentRulling.toNumber() === 0) {
                                    // 9 Case refused
                                    addNotification({
                                        id: notificationId+'.9',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>The case will now be closed.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    })
                                } else if (dispute.currentRulling.toNumber() === 1) {
                                    // 10 You have won the case
                                    addNotification({
                                        id: notificationId+'.10',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Congratulations! You have won the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    }) 
                                } else if (dispute.currentRulling.toNumber() === 2) {
                                    // 11 You have lost the case
                                    const currentDate = new Date()
                                    const targetDate = timestampToDate(dispute.startTime)
                                    const timePassed = targetDate.getTime() - currentDate.getTime()
                                    const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                    const hoursLeft = klerosAppealPeriod - hoursPassed
                                    addNotification({
                                        id: notificationId+'.11',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>You have the option to file an appeal within {hoursLeft} hours</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: targetDate
                                    })
                                }
                            } else {
                                if (dispute.currentRulling.toNumber() === 0) {
                                    // 27 Case refused
                                    addNotification({
                                        id: notificationId+'.27',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                }
                                                message={
                                                    <Trans>The case will now be closed.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    })
                                } else if (dispute.currentRulling.toNumber() === 2) {
                                    // 28 You have won the case
                                    addNotification({
                                        id: notificationId+'.28',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Congratulations! You have won the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Major,
                                        dateCreated: timestampToDate(dispute.startTime)
                                    }) 
                                } else if (dispute.currentRulling.toNumber() === 1) {
                                    // 11 You have lost the case
                                    const currentDate = new Date()
                                    const targetDate = timestampToDate(dispute.startTime)
                                    const timePassed = targetDate.getTime() - currentDate.getTime()
                                    const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                    const hoursLeft = klerosAppealPeriod - hoursPassed
                                    addNotification({
                                        id: notificationId+'.11',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                }
                                                message={
                                                    <Trans>You have the option to file an appeal within {hoursLeft} hours</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Critical,
                                        dateCreated: targetDate
                                    })
                                }
                            }
                        } else if (dispute.period === Period.Execution) {
                            if (dispute.ruled) { // Rule performed
                                if (dispute.ruling === 0) { // Refused to arbitrate

                                } else if (dispute.ruling === 2) { // Accepted
                                    
                                } else { // Rejected

                                }
                            }
                        }
                    } else if (request.status === ReqStatus.Initial) {
                        // 21. Request to transfer original received
                        addNotification({
                            id: notificationId+'.21',
                            image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                            children:
                                <CommonNotificationBody
                                    header={
                                        <Trans>User ${formatAddress(nft.ownerAddress, 4)} is requesting the original NFT.</Trans>
                                    }
                                    message={
                                        <Trans>Do you want to transfer the original NFT to them?</Trans>
                                    }
                                />,
                            severity: SeverityLevel.Major,
                            dateCreated: request.updateDate
                        })
                    } else if (request.status === ReqStatus.Rejected) {

                    }
                } else {
                    // NFT has no pending request

                }

            })
        }
    }

    useEffect(() => { loadNotifications() }, [account, active])


    return <></>
}

export default NotificationsLoader