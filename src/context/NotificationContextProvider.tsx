import { createContext, useContext, useEffect, useState } from "react";

export interface NotificationContextInterface {
    getNotification: Function,
    getNotificationIndex: Function,
    addNotifications: Function,
    deleteNotifications: Function,
    listNotifications: Function,
    notificationsCount: number
}

export type Notification = {
    id: string,
    children: React.ReactElement,
    severity: SeverityLevel,
    dateCreated: Date,
    closeable: boolean,
    callback: Function|undefined,
    image: {url: string, text: string}|undefined
}

export enum SeverityLevel {
    Ok,
    Info,
    Major,
    Critical
}

export const NotificationContext = createContext<NotificationContextInterface|null>(null);

export function NotificationContextProvider({ children }:any) {

    const [ notifications, setNotifications ] = useState<Array<Notification>>([])

    const getNotification = (id: string) => {
        return notifications.find(it => it.id === id)
    }

    const getNotificationIndex = (id: string) => {
        return notifications.findIndex(it => it.id === id)
    }

    const addNotifications = (newNotifications: {
        id: string, 
        children: React.ReactElement,
        severity: SeverityLevel|undefined,
        dateCreated: Date|undefined,
        closeable: boolean|undefined,
        callback: Function|undefined,
        image: {url: string, text: string}|undefined
    }[]) => {
        const updatingData: Notification[] = []
        newNotifications.forEach((notification) => {
            const existing = getNotification(notification.id)
            if (existing) {
                throw new Error(`Notification with ID ${notification.id} already exists`)
            }
            updatingData.push({
                id: notification.id,
                children: notification.children,
                severity: (notification.severity === undefined) ? SeverityLevel.Info : notification.severity,
                dateCreated: notification.dateCreated || new Date(),
                closeable: (notification.closeable === undefined) ? true : notification.closeable,
                callback: notification.callback,
                image: notification.image
            })
        })
        setNotifications({
            ...notifications,
            ...updatingData
        })
    }

    const deleteNotifications = (toDelete: any[]) => {
        const newState = [...notifications]
        if (toDelete.length > 0) {
            toDelete.forEach((notification) => {
                let id: string
                if (typeof notification === 'string') {
                    id = notification
                } else {
                    id = notification.id
                }
                const idx = getNotificationIndex(id)
                if (idx > -1) {
                    newState.splice(idx, 1)
                } else {
                    console.error('No such notification:', id)
                }
            })
            if (notifications.length > newState.length) {
                setNotifications(newState)
            }
        }
    }

    const defaultSort = (a: Notification, b: Notification) => {
        if ( a.dateCreated > b.dateCreated ){
            return -1;
        }
        if ( a.dateCreated < b.dateCreated ){
            return 1;
        }
        return 0;
    }

    const listNotifications = (compareFunction: Function = defaultSort) => {
        return notifications.sort(compareFunction as any)
    }

    return (
        <NotificationContext.Provider value={{
            getNotification,
            getNotificationIndex,
            addNotifications,
            deleteNotifications,
            listNotifications,
            notificationsCount: notifications.length
        }}>
            {children}
        </NotificationContext.Provider>
    );
}