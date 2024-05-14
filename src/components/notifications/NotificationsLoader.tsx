import { useEffect, useRef, useState } from "react"
import { useAppContext } from "../../context/AppContextProvider"
import { ReqStatus, ReqType, TokenGraphData, convertTokenGraphData, useNftProtectGraph } from "../../hooks/useNftProtectGraph"
import { useNotifications } from "../../hooks/useNotifications"
import { Heading, Text, Link, getToken } from "@chakra-ui/react"
import { Trans } from "@lingui/macro"
import { generateRequestLink, timestampToDate } from "../../utils/helpers"
import { useAlchemy } from "../../hooks/useAlchemy"
import { BigNumber } from '@ethersproject/bignumber'
import NFT, { ActionRequest } from "../../classes/NFT"
import { Period, useArbitratorGraph } from "../../hooks/useArbitratorGraph"
import { SeverityLevel } from "../../context/NotificationContextProvider"
import NFTImage from "../nftView/NFTImage"
import OriginalNftReceivedDialog from "../dialogs/notifications/OriginalNftReceivedDialog"
import OriginalNftRejectedDialog from "../dialogs/notifications/OriginalNftRejectedDialog"
import { useCallableDialogContext } from "../../context/CallableDialogContextProvider"
import SuedForBurnNFTDialog from "../dialogs/notifications/SuedForBurnNFTDialog"
import SuedToObtainTheOriginalNFTDialog from "../dialogs/notifications/SuedToObtainTheOriginalNFTDialog"
import OriginalNftUnresponsiveDialog from "../dialogs/notifications/OriginalNftUnresponsiveDialog"
import { arbitratorGraphs } from "../../config"
import { useArbitrableProxy } from "../../hooks/useArbitrableProxy"
import { Contract } from "@ethersproject/contracts"
import AddressDisplay from "../AddressDisplay"

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
    const { listTokensReceived, listTokensTransfered } = useNftProtectGraph(currentChain.id)
    const { getArbitrableProxy, getArbitrator } = useArbitrableProxy()
    const { getDispute } = useArbitratorGraph(currentChain.id, currentChain.defaultArbitrator)
    const { addNotification, getNotification, deleteNotification, clearNotifications } = useNotifications()
    const { nft: nftApi } = useAlchemy()
    const originalsCache = useRef<NFT[]>([])
    const pNftsCache = useRef<NFT[]>([])
    const { getDialog } = useCallableDialogContext()
    const [ arbitrableProxies, setArbitrableProxies ] = useState<Contract[]>()
    const [ arbitrators, setArbitrators ] = useState<Contract[]>()


    const generateNotificationId = (nft: TokenGraphData) => {
        const requestPart = nft.latestRequest ? 
            `${nft.latestRequest.id}-${nft.latestRequest.type}` :
            'none'
        return `${currentChain?.id}-${nft.id}-${requestPart}`
    }

    const loadRequest = async (requestId: BigNumber): Promise<ActionRequest> => {
        const request = await nftProtectContract.requests(requestId)
        return {id: requestId, ...request}
    }

    const loadOriginalNFT = async (nft: TokenGraphData): Promise<NFT> => {
        const result = await nftApi.getNftMetadata(nft.contractAddress, nft.tokenId)
        return new NFT(result, context)
    }

    const loadPNFT = async (nft: TokenGraphData): Promise<NFT> => {
        const result = await nftApi.getNftMetadata(nftProtectContract.address, nft.id)
        return new NFT(result, context, convertTokenGraphData(nft))
    }

    const getOriginalNft = async (nft: TokenGraphData): Promise<NFT> => {
        let result = originalsCache.current.find( it => {
            return (it.tokenId === nft.tokenId.toString()) && 
                    (it.contract.address.toLowerCase() === nft.contractAddress.toLowerCase())
        })
        if (!result) {
            result = await loadOriginalNFT(nft)
            originalsCache.current.push(result)
        }
        return result
    }

    const getPNft = async (nft: TokenGraphData): Promise<NFT> => {
        let result = pNftsCache.current.find( it => {
            return (it.tokenId === nft.id.toString())
        })
        if (!result) {
            result = await loadPNFT(nft)
            pNftsCache.current.push(result)
        }
        return result
    }

    const getCourtSides = (nft: TokenGraphData, requestType: ReqType): {
        claimant: string,
        defendant: string
    } => {
        switch(requestType) {
            case ReqType.Burn: // never really used
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
                        if (loadedRequest.externalDisputeId.toString() !== '0') { // Decision is already applied
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 19.2 Original NFT received by request with dispute
                                addNotification({
                                    id: notificationId+'.19.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>The original NFT is now yours. Keep using pNFT as a secure substitute.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.OwnershipRestore) {
                                // 30.2 pNFT restore accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId+'.30.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Ruling on dispute #{loadedRequest.externalDisputeId.toString()} is now enforced!</Trans>
                                            }
                                            message={
                                                <Trans>pNFT has been returned to original owner.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            }
                        } else {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 2. Original NFT received by request without dispute
                                const originalNft = await getOriginalNft(nft)
                                addNotification({
                                    id: notificationId+'.2',
                                    image: <NFTImage nft={ originalNft } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> has transferred the original NFT to you.</Trans>
                                            }
                                            message={
                                                <Trans>We recommend protecting it using NFT Protect.</Trans>
                                            }
                                        />,
                                    buttonCallback: () => {
                                        const dialog = getDialog('OriginalNftReceivedDialog')
                                        dialog.setNft(originalNft)
                                        dialog.setPreviousOriginalOwner(nft.originalOwnerAddress)
                                        dialog.onOpen()
                                    },
                                    severity: SeverityLevel.Major,
                                    dateCreated: request.updateDate
                                })
                                // Close message 1 if exists
                                let toClose = getNotification(notificationId+'.1')
                                toClose && deleteNotification(toClose)
                                // Close message 4 if exists
                                toClose = getNotification(notificationId+'.4')
                                toClose && deleteNotification(toClose)
                            }
                        }
                    } else if (request.status === ReqStatus.Disputed) {
                        // If request is disputed we have to load data from arbitrator graph
                        const dispute = await getDispute(loadedRequest.externalDisputeId)
                        const { claimant } = getCourtSides(nft, request.type)
                        if (dispute) {
                            if (dispute.period === Period.Evidence) {
                                if (nft.ownerAddress === claimant) {
                                    // 5. Evidence period started
                                    addNotification({
                                        id: notificationId+'.5',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Evidence period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Info,
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
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
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
                                    })
                                }
                            } else if ((dispute.period === Period.Commit) || (dispute.period === Period.Vote)) {
                                if (nft.ownerAddress === claimant) {
                                    // 8. Voting period started
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
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
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
                                        dateCreated: dispute.startTime
                                    })
                                }
                            } else if (dispute.period === Period.Appeal) {
                                if (nft.ownerAddress === claimant) {
                                    if (dispute.currentRulling === 0) {
                                        // 9. Case refused
                                        addNotification({
                                            id: notificationId+'.9',
                                            image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                            children: 
                                                <CommonNotificationBody
                                                    header={
                                                        <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                    }
                                                    message={
                                                        <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Major,
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: dispute.startTime
                                        })
                                    } else if (dispute.currentRulling === 1) {
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
                                            dateCreated: dispute.startTime
                                        }) 
                                    } else if (dispute.currentRulling === 2) {
                                        // 11 You have lost the case
                                        const currentDate = new Date()
                                        const targetDate = dispute.startTime
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
                                    if (dispute.currentRulling === 0) {
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
                                            dateCreated: dispute.startTime
                                        })
                                    } else if (dispute.currentRulling === 2) {
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
                                            dateCreated: dispute.startTime
                                        }) 
                                    } else if (dispute.currentRulling === 1) {
                                        // 29 You have lost the case
                                        const currentDate = new Date()
                                        const targetDate = dispute.startTime
                                        const timePassed = targetDate.getTime() - currentDate.getTime()
                                        const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                        const hoursLeft = klerosAppealPeriod - hoursPassed
                                        addNotification({
                                            id: notificationId+'.29',
                                            image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                            children: 
                                                <CommonNotificationBody
                                                    header={
                                                        <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                    }
                                                    message={
                                                        <Trans>You may file an appeal within {hoursLeft} hours</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Critical,
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: targetDate
                                        })
                                    }
                                }
                            } else if (dispute.period === Period.Execution) {
                                // TODO: Probably have to show also if period is Appeal and time is up.
                                if (dispute.ruled) {
                                    if (nft.ownerAddress === claimant) {
                                        if (dispute.currentRulling === 0) {
                                            // 9. Case refused (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.9',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                        }
                                                        message={
                                                            <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            })
                                        } else if (dispute.currentRulling === 1) {
                                            // 38 You have won the case (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.38',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You won the dispute!</Trans>
                                                        }
                                                        message={
                                                            <Trans>{'Press the button to enforce the ruling…'}</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            }) 
                                        } else if (dispute.currentRulling === 2) {
                                            // 39 You have lost the case (final decision, not enforced)
                                            const currentDate = new Date()
                                            const targetDate = dispute.startTime
                                            const timePassed = targetDate.getTime() - currentDate.getTime()
                                            const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                            const hoursLeft = klerosAppealPeriod - hoursPassed
                                            addNotification({
                                                id: notificationId+'.39',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You lost the dispute!</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Critical,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: targetDate
                                            })
                                        }
                                    } else {
                                        if (dispute.currentRulling === 0) {
                                            // 9. Case refused (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.9',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                        }
                                                        message={
                                                            <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            })
                                        } else if (dispute.currentRulling === 2) {
                                            // 38 You have won the case (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.38',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You won the dispute!</Trans>
                                                        }
                                                        message={
                                                            <Trans>{'Press the button to enforce the ruling…'}</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            }) 
                                        } else if (dispute.currentRulling === 1) {
                                            // 39 You have lost the case (final decision, not enforced)
                                            const currentDate = new Date()
                                            const targetDate = dispute.startTime
                                            const timePassed = targetDate.getTime() - currentDate.getTime()
                                            const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                            const hoursLeft = klerosAppealPeriod - hoursPassed
                                            addNotification({
                                                id: notificationId+'.39',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You lost the dispute!</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Critical,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: targetDate
                                            })
                                        }
                                    }
                                }
                            }
                        }
                        // Close message 4 if exists
                        let toClose = getNotification(notificationId+'.4')
                        toClose && deleteNotification(toClose)
                    } else if (request.status === ReqStatus.Initial) {
                        if (request.type === ReqType.OwnershipAdjustment) {
                            // If request timeout expired
                            if (loadedRequest.timeout.toString() !== '0') {
                                const timeoutDate = timestampToDate(loadedRequest.timeout.toNumber())
                                if (timeoutDate <= new Date()) {
                                    const loadedNft = await getPNft(nft)
                                    // Pending request is needed for dialog
                                    if (!loadedNft.pendingRequest) {
                                        await loadedNft.loadPendingRequest()
                                    }
                                    // 4. Original NFT request timeout
                                    addNotification({
                                        id: notificationId+'.4',
                                        image: <NFTImage nft={ loadedNft } setDefaultStyles={false} />,
                                        children:
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> has not responded.</Trans>
                                                }
                                                message={
                                                    <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                                }
                                            />,
                                        severity: SeverityLevel.Major,
                                        buttonCallback: () => {
                                            const dialog = getDialog('OriginalNftUnresponsiveDialog')
                                            dialog.setNft(loadedNft)
                                            dialog.onOpen()
                                        },
                                        dateCreated: timeoutDate,
                                    })
                                    // Close message 1 if exists
                                    const toClose = getNotification(notificationId+'.1')
                                    toClose && deleteNotification(toClose)
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
                        if (loadedRequest.externalDisputeId.toString() !== '0') {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 20.2 Original NFT rejected by request with dispute
                                addNotification({
                                    id: notificationId+'.20.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> is still the owner of the orginal NFT. He can now sue you for Ownership restoration in dispute of loss of the pNFT.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.OwnershipRestore) {
                                // 31.2 pNFT restore rejected by request with dispute
                                addNotification({
                                    id: notificationId+'.31.2',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>Your pNFT remains unchanged. We suggest contacting the NFT owner to request the original version.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            }
                        } else {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 3. Original NFT request rejected without dispute
                                const loadedNft = await getPNft(nft)
                                addNotification({
                                    id: notificationId+'.3',
                                    image: <NFTImage nft={ loadedNft } setDefaultStyles={false} />,
                                    children:
                                        <CommonNotificationBody
                                            header={
                                                <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> has refused to transfer the original NFT to you.</Trans>
                                            }
                                            message={
                                                <Trans>Would you like to initiate the transfer of the original NFT through the court?</Trans>
                                            }
                                        />,
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const dialog = getDialog('OriginalNftRejectedDialog')
                                        dialog.setNft(loadedNft)
                                        dialog.onOpen()
                                    },
                                    dateCreated: request.updateDate
                                })
                                // Close message 1 if exists
                                let toClose = getNotification(notificationId+'.1')
                                toClose && deleteNotification(toClose)
                                // Close message 4 if exists
                                toClose = getNotification(notificationId+'.4')
                                toClose && deleteNotification(toClose)
                            }
                        }
                    }
                } else {
                    // NFT has no pending request
                    if (!nft.burned) {
                        const loadedNft = await getPNft(nft)
                        // 0. pNFT received
                        addNotification({
                            id: notificationId+'.0',
                            image: <NFTImage nft={ loadedNft} setDefaultStyles={false} />, 
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
                            buttonCallback: () => {
                                const dialog = getDialog('RequestOriginalNftDialog')
                                dialog.setNft(loadedNft)
                                dialog.onOpen()
                            },
                            dateCreated: new Date() // TODO: search for transaction
                        })
                    } else {
                        // If received pNFT is burned and there was no request,
                        // it means there was a transfer of original
                        // 22. Original transfered without request
                        const originalNft = await getOriginalNft(nft)
                        addNotification({
                            id: notificationId+'.22',
                            image: <NFTImage nft={ originalNft } setDefaultStyles={false} />,
                            children: 
                                <CommonNotificationBody
                                    header={
                                        <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> transferred the original NFT to you.</Trans>
                                    }
                                    message={
                                        <Trans>We recommend protecting it using NFT Protect</Trans>
                                    }
                                />, 
                            severity: SeverityLevel.Major,
                            buttonCallback: () => {
                                const dialog = getDialog('OriginalNftReceivedDialog')
                                dialog.setNft(originalNft)
                                dialog.setPreviousOriginalOwner(nft.originalOwnerAddress)
                                dialog.onOpen()
                            },
                            dateCreated: new Date() // TODO: put burn date
                        })
                        // Close message 0 if exists
                        let toClose = getNotification(notificationId+'.0')
                        toClose && deleteNotification(toClose)
                    }
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
                        if (loadedRequest.externalDisputeId.toString() !== '0') {
                            if (request.type === ReqType.OwnershipAdjustment) {
                                // 30.1 Original NFT request accepted with dispute (original owner)
                                addNotification({
                                    id: notificationId+'.30.1',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>The Ruling on dispute #{loadedRequest.externalDisputeId.toString()} is now enforced!</Trans>
                                            }
                                            message={
                                                <Trans>The original NFT has been transferred to a new owner <AddressDisplay address={nft.ownerAddress}/>.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.OwnershipRestore) {
                                // 19.1 pNFT restored by request with dispute
                                addNotification({
                                    id: notificationId+'.19.1',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>The pNFT has been returned to your wallet. We recommend to keep it protected.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    } else if (request.status === ReqStatus.Disputed) {
                        // If request is disputed we have to load data from arbitrator graph
                        const dispute = await getDispute(loadedRequest.externalDisputeId)
                        const { claimant } = getCourtSides(nft, request.type)
                        if (dispute) {
                            if (dispute.period === Period.Evidence) {
                                if (nft.originalOwnerAddress === claimant) {
                                    // 5. Evidence period started
                                    addNotification({
                                        id: notificationId+'.5',
                                        image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                        children: 
                                            <CommonNotificationBody
                                                header={
                                                    <Trans>The Evidence period for the dispute #{loadedRequest.externalDisputeId.toString()} is on.</Trans>
                                                }
                                            />, 
                                        severity: SeverityLevel.Info,
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
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
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
                                    })
                                }

                                if (!dispute.appealed) { // First time
                                    if (request.type === ReqType.OwnershipAdjustment) {
                                        const loadedNft = await getPNft(nft)
                                        // 23.2 Original NFT disputed
                                        addNotification({
                                            id: notificationId+'.23.2',
                                            image: <NFTImage nft={ loadedNft } setDefaultStyles={false} />,
                                            children: 
                                                <CommonNotificationBody
                                                    header={
                                                        <Trans>User <AddressDisplay address={nft.ownerAddress}/> has filed a claim for Ownership Adjustment and wants to obtain the rights of the original NFT.</Trans>
                                                    }
                                                    message={
                                                        <Trans>More details on dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Critical,
                                            buttonCallback: () => {
                                                const dialog = getDialog('SuedToObtainTheOriginalNFTDialog')
                                                dialog.setNft(loadedNft)
                                                dialog.setRequest(loadedRequest)
                                                dialog.onOpen()
                                            },
                                            dateCreated: request.updateDate
                                        })
                                    } else if (request.type === ReqType.OwnershipRestore) {
                                        const loadedNft = await getPNft(nft)
                                        // 23.1 pNFT restore disputed
                                        addNotification({
                                            id: notificationId+'.23.1',
                                            image: <NFTImage nft={ loadedNft } setDefaultStyles={false} />,
                                            children: 
                                                <CommonNotificationBody
                                                    header={
                                                        <Trans>User <AddressDisplay address={nft.originalOwnerAddress}/> initiated a dispute to reclaim the pNFT you hold.</Trans>
                                                    }
                                                    message={
                                                        <Trans>More details on dispute #{loadedRequest.externalDisputeId.toString()}.</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Critical,
                                            buttonCallback: () => {
                                                const dialog = getDialog('SuedForBurnNFTDialog')
                                                dialog.setNft(loadedNft)
                                                dialog.setRequest(loadedRequest)
                                                dialog.onOpen()
                                            },
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
                                        dateCreated: dispute.startTime
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
                                        buttonCallback: () => {
                                            const uri = generateRequestLink(request.id, currentChain?.id)
                                            window.open(uri, '_blank');
                                        },
                                        dateCreated: dispute.startTime
                                    })
                                }
                            } else if (dispute.period === Period.Appeal) { // User can make an appeal
                                if (nft.originalOwnerAddress === claimant) {
                                    if (dispute.currentRulling === 0) {
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
                                                        <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Major,
                                            dateCreated: dispute.startTime
                                        })
                                    } else if (dispute.currentRulling === 1) {
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
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: dispute.startTime
                                        }) 
                                    } else if (dispute.currentRulling === 2) {
                                        // 11 You have lost the case
                                        const currentDate = new Date()
                                        const targetDate = dispute.startTime
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
                                    if (dispute.currentRulling === 0) {
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
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: dispute.startTime
                                        })
                                    } else if (dispute.currentRulling === 2) {
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
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: dispute.startTime
                                        }) 
                                    } else if (dispute.currentRulling === 1) {
                                        // 29 You have lost the case
                                        const currentDate = new Date()
                                        const targetDate = dispute.startTime
                                        const timePassed = targetDate.getTime() - currentDate.getTime()
                                        const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                        const hoursLeft = klerosAppealPeriod - hoursPassed
                                        addNotification({
                                            id: notificationId+'.29',
                                            image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                            children: 
                                                <CommonNotificationBody
                                                    header={
                                                        <Trans>Unfortunately, you have lost the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                    }
                                                    message={
                                                        <Trans>You may file an appeal within {hoursLeft} hours</Trans>
                                                    }
                                                />, 
                                            severity: SeverityLevel.Critical,
                                            buttonCallback: () => {
                                                const uri = generateRequestLink(request.id, currentChain?.id)
                                                window.open(uri, '_blank');
                                            },
                                            dateCreated: targetDate
                                        })
                                    }
                                }
                            } else if (dispute.period === Period.Execution) {
                                if (dispute.ruled) { // Rule performed
                                    // TODO: Probably have to show also if period is Appeal and time is up.
                                    if (nft.originalOwnerAddress === claimant) {
                                        if (dispute.currentRulling === 0) {
                                            // 9. Case refused (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.9',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                        }
                                                        message={
                                                            <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            })
                                        } else if (dispute.currentRulling === 1) {
                                            // 38 You have won the case (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.38',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You won the dispute!</Trans>
                                                        }
                                                        message={
                                                            <Trans>{'Press the button to enforce the ruling…'}</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            }) 
                                        } else if (dispute.currentRulling === 2) {
                                            // 39 You have lost the case (final decision, not enforced)
                                            const currentDate = new Date()
                                            const targetDate = dispute.startTime
                                            const timePassed = targetDate.getTime() - currentDate.getTime()
                                            const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                            const hoursLeft = klerosAppealPeriod - hoursPassed
                                            addNotification({
                                                id: notificationId+'.39',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You lost the dispute!</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Critical,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: targetDate
                                            })
                                        }
                                    } else {
                                        if (dispute.currentRulling === 0) {
                                            // 9. Case refused (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.9',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The Jurors refused to arbitrate the dispute #{loadedRequest.externalDisputeId.toString()}</Trans>
                                                        }
                                                        message={
                                                            <Trans>The case will now be closed. Press the button to enforce the ruling.</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            })
                                        } else if (dispute.currentRulling === 2) {
                                            // 38 You have won the case (final decision, not enforced)
                                            addNotification({
                                                id: notificationId+'.38',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You won the dispute!</Trans>
                                                        }
                                                        message={
                                                            <Trans>{'Press the button to enforce the ruling…'}</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Major,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: dispute.startTime
                                            }) 
                                        } else if (dispute.currentRulling === 1) {
                                            // 39 You have lost the case (final decision, not enforced)
                                            const currentDate = new Date()
                                            const targetDate = dispute.startTime
                                            const timePassed = targetDate.getTime() - currentDate.getTime()
                                            const hoursPassed = Math.floor(timePassed / 60000 / 60)
                                            const hoursLeft = klerosAppealPeriod - hoursPassed
                                            addNotification({
                                                id: notificationId+'.39',
                                                image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />,
                                                children: 
                                                    <CommonNotificationBody
                                                        header={
                                                            <Trans>The jury reached a verdict! You lost the dispute!</Trans>
                                                        }
                                                    />, 
                                                severity: SeverityLevel.Critical,
                                                buttonCallback: () => {
                                                    const uri = generateRequestLink(request.id, currentChain?.id)
                                                    window.open(uri, '_blank');
                                                },
                                                dateCreated: targetDate
                                            })
                                        }
                                    }
                                }
                            }
                            // Closing notifications
                            if (dispute.period !== Period.Evidence) {
                                // Close message 5 if exists
                                let toClose = getNotification(notificationId+'.5')
                                toClose && deleteNotification(toClose)
                                // Close message 24 if exists
                                toClose = getNotification(notificationId+'.24')
                                toClose && deleteNotification(toClose)
                            }
                            if ((dispute.period !== Period.Commit) && (dispute.period !== Period.Vote)) {
                                // Close message 8 if exists
                                let toClose = getNotification(notificationId+'.8')
                                toClose && deleteNotification(toClose)
                                // Close message 26 if exists
                                toClose = getNotification(notificationId+'.26')
                                toClose && deleteNotification(toClose)
                            }
                            if (dispute.period !== Period.Appeal) {
                                // Close message 10 if exists
                                let toClose = getNotification(notificationId+'.10')
                                toClose && deleteNotification(toClose)
                                // Close message 11 if exists
                                toClose = getNotification(notificationId+'.11')
                                toClose && deleteNotification(toClose)
                                // Close message 28 if exists
                                toClose = getNotification(notificationId+'.28')
                                toClose && deleteNotification(toClose)
                                // Close message 29 if exists
                                toClose = getNotification(notificationId+'.29')
                                toClose && deleteNotification(toClose)
                            }
                        }
                    } else if (request.status === ReqStatus.Initial) {
                        // 21. Request to transfer original received
                        const loadedNft = await getPNft(nft)
                        // Pending request is needed for dialog
                        if (!loadedNft.pendingRequest) {
                            await loadedNft.loadPendingRequest()
                        }
                        if (!loadedNft.ownerAddress) {
                            await loadedNft.loadOwnerAddress()
                        }
                        addNotification({
                            id: notificationId+'.21',
                            image: <NFTImage nft={ loadedNft } setDefaultStyles={false} />,
                            children:
                                <CommonNotificationBody
                                    header={
                                        <Trans>User <AddressDisplay address={nft.ownerAddress}/> is requesting the original NFT.</Trans>
                                    }
                                    message={
                                        <Trans>Do you want to transfer the original NFT to them?</Trans>
                                    }
                                />,
                            severity: SeverityLevel.Major,
                            buttonCallback: () => {
                                const dialog = getDialog('OriginalNftRequestedDialog')
                                dialog.setNft(loadedNft)
                                dialog.onOpen()
                            },
                            dateCreated: request.updateDate
                        })
                    } else if (request.status === ReqStatus.Rejected) {
                        if (loadedRequest.externalDisputeId.toString() !== '0') {
                            if (request.type === ReqType.OwnershipRestore) {
                                // 20.1 Restore rejected by request with dispute
                                addNotification({
                                    id: notificationId+'.20.1',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>User {nft.originalOwnerAddress} is still the owner of the pNFT. He can now sue you for Ownership Adjustment in case of Bona Fide Transfer.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            } else if (request.type === ReqType.OwnershipAdjustment) {
                                // 31.1 Ownership adjustment rejected by request with dispute
                                addNotification({
                                    id: notificationId+'.31.1',
                                    image: <NFTImage nft={ await getOriginalNft(nft) } setDefaultStyles={false} />, 
                                    children: 
                                        <CommonNotificationBody
                                            header={
                                                <Trans>{`The Ruling on dispute #${loadedRequest.externalDisputeId.toString()} is now enforced!`}</Trans>
                                            }
                                            message={
                                                <Trans>You are still the owner of the Original NFT. We recommend that you appeal to the court get the pNFT back.</Trans>
                                            }
                                        />, 
                                    severity: SeverityLevel.Major,
                                    buttonCallback: () => {
                                        const uri = generateRequestLink(request.id, currentChain?.id)
                                        window.open(uri, '_blank');
                                    },
                                    dateCreated: request.updateDate
                                })
                            }
                        }
                    }
                    // Closing notifications
                    if (request.status !== ReqStatus.Initial) {
                        // Close message 21 if exists
                        let toClose = getNotification(notificationId+'.21')
                        toClose && deleteNotification(toClose)
                    }
                } else {
                    // NFT has no pending request

                }

            })
        }
    }

    const loadArbitrableProxies = async () => {
        if (account && active && currentChain) {
            const currentArbitrators = arbitratorGraphs.find(it => it.chainId === currentChain.id)
            if (currentArbitrators) {
                const proxyPromises = currentArbitrators.arbitrators.map(arbitratorConfig => getArbitrableProxy(arbitratorConfig.arbitratorId))
                const proxies = await Promise.all(proxyPromises)
                setArbitrableProxies(proxies)
            }
        }
    }

    const loadArbitrators = async () => {
        if (account && active && currentChain) {
            const currentArbitrators = arbitratorGraphs.find(it => it.chainId === currentChain.id)
            if (currentArbitrators) {
                const arbPromises = currentArbitrators.arbitrators.map(arbitratorConfig => getArbitrator(arbitratorConfig.arbitratorId))
                const arbitrators = await Promise.all(arbPromises)
                setArbitrators(arbitrators)
            }
        }
    }

    useEffect(() => {
        clearNotifications()
        loadNotifications()
        loadArbitrableProxies()
    }, [account, active, currentChain])

    const subscribeNFTProtectEvents = () => {
        if (account && active) {
            const fromMe = nftProtectContract.filters.Transfer(account, null)
            const toMe = nftProtectContract.filters.Transfer(null, account)
            const ownershipAdjustedNewOwner = nftProtectContract.filters.OwnershipAdjusted(account)
            const ownershipAdjustedOldOwner = nftProtectContract.filters.OwnershipAdjusted(null, account)
            const ownershipAdjustmentAskedNewOwner = nftProtectContract.filters.OwnershipAdjustmentAsked(null, account)
            const ownershipAdjustmentAskedOldOwner = nftProtectContract.filters.OwnershipAdjustmentAsked(null, null, account)
            const ownershipRestoreAskedNewOwner = nftProtectContract.filters.OwnershipRestoreAsked(null, account)
            const ownershipRestoreAskedOldOwner = nftProtectContract.filters.OwnershipRestoreAsked(null, null, account)
            // These events doesn't contain indexed user information, so listen all
            const ownershipAdjustmentArbitrateAsked = nftProtectContract.filters.OwnershipAdjustmentArbitrateAsked()
            const ownershipAdjustmentAnswered = nftProtectContract.filters.OwnershipAdjustmentAnswered()
            const ownershipRestoreAnswered = nftProtectContract.filters.OwnershipRestoreAnswered()

            nftProtectContract.on(fromMe, loadNotifications)
            nftProtectContract.on(toMe, loadNotifications)
            nftProtectContract.on(ownershipAdjustmentArbitrateAsked, loadNotifications)
            nftProtectContract.on(ownershipAdjustedNewOwner, loadNotifications)
            nftProtectContract.on(ownershipAdjustedOldOwner, loadNotifications)
            nftProtectContract.on(ownershipAdjustmentAskedNewOwner, loadNotifications)
            nftProtectContract.on(ownershipAdjustmentAskedOldOwner, loadNotifications)
            nftProtectContract.on(ownershipRestoreAskedNewOwner, loadNotifications)
            nftProtectContract.on(ownershipRestoreAskedOldOwner, loadNotifications)
            nftProtectContract.on(ownershipAdjustmentAnswered, loadNotifications)
            nftProtectContract.on(ownershipRestoreAnswered, loadNotifications)
            return () => {
                nftProtectContract.removeAllListeners(toMe)
                nftProtectContract.removeAllListeners(fromMe)
                nftProtectContract.removeAllListeners(ownershipAdjustmentArbitrateAsked)
                nftProtectContract.removeAllListeners(ownershipAdjustedNewOwner)
                nftProtectContract.removeAllListeners(ownershipAdjustedOldOwner)
                nftProtectContract.removeAllListeners(ownershipAdjustmentAskedNewOwner)
                nftProtectContract.removeAllListeners(ownershipAdjustmentAskedOldOwner)
                nftProtectContract.removeAllListeners(ownershipRestoreAskedNewOwner)
                nftProtectContract.removeAllListeners(ownershipRestoreAskedOldOwner)
                nftProtectContract.removeAllListeners(ownershipAdjustmentAnswered)
                nftProtectContract.removeAllListeners(ownershipRestoreAnswered)
            }
        }
    }

    const subscribeArbitrableProxyEvents = () => {
        if (arbitrableProxies) {
            arbitrableProxies.forEach((proxy) => {
                // No way to filter, listening all
                const disputeCreated = proxy.filters.Dispute()
                const evidenceSubmitted = proxy.filters.Evidence()
                const ruled = proxy.filters.Ruling()
                proxy.on(disputeCreated, loadNotifications)
                proxy.on(evidenceSubmitted, loadNotifications)
                proxy.on(ruled, loadNotifications)
            })
            return () => {
                arbitrableProxies.forEach((proxy) => {
                    const disputeCreated = proxy.filters.Dispute()
                    const evidenceSubmitted = proxy.filters.Evidence()
                    const ruled = proxy.filters.Ruling()
                    proxy.removeAllListeners(disputeCreated)
                    proxy.removeAllListeners(evidenceSubmitted)
                    proxy.removeAllListeners(ruled)
                })
            }
        }
    }

    const subscribeArbitratorEvents = () => {
        // The most uneffective thing
        if (arbitrators && arbitrableProxies) {
            arbitrators.forEach((arbitrator, idx) => {
                const proxy = arbitrableProxies[idx]
                // No way to filter, listening all
                const appealPossible = arbitrator.filters.AppealPossible()
                const newPerod = arbitrator.filters.NewPeriod()
                const appealDecision = arbitrator.filters.AppealDecision(null, proxy.address)

                arbitrator.on(appealPossible, loadNotifications)
                arbitrator.on(newPerod, loadNotifications)
                arbitrator.on(appealDecision, loadNotifications)
            })
            return () => {
                arbitrators.forEach((arbitrator, idx) => {
                    const proxy = arbitrableProxies[idx]
                    // No way to filter, listening all
                    const appealPossible = arbitrator.filters.AppealPossible()
                    const newPerod = arbitrator.filters.NewPeriod()
                    const appealDecision = arbitrator.filters.AppealDecision(null, proxy.address)    
                    arbitrator.removeAllListeners(appealPossible)
                    arbitrator.removeAllListeners(newPerod)
                    arbitrator.removeAllListeners(appealDecision)
                })
            }
        }
    }

    useEffect(subscribeNFTProtectEvents, [account, currentChain])
    useEffect(subscribeArbitrableProxyEvents, [arbitrableProxies])
    useEffect(subscribeArbitratorEvents, [arbitrators, arbitrableProxies])


    return (<>
        <OriginalNftReceivedDialog/>
        <OriginalNftRejectedDialog/>
        <OriginalNftUnresponsiveDialog/>
        <SuedForBurnNFTDialog/>
        <SuedToObtainTheOriginalNFTDialog/>
    </>)
}

export default NotificationsLoader