import { createContext, useContext, useEffect, useState } from "react";

export interface NotificationContextInterface {
    getNotification: Function,
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

const NotificationContext = createContext<NotificationContextInterface|null>(null);

export function NotificationContextProvider({ children }:any) {

    const [ notifications, setNotifications ] = useState<{[P in string]: Notification}>({})
    const count = Object.keys(notifications).length

    const getNotification = (id: string) => {
        return notifications[id]
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
        const updatingData:{[P in string]: Notification} = {}
        newNotifications.forEach((notification) => {
            updatingData[notification.id] = {
                id: notification.id,
                children: notification.children,
                severity: (notification.severity === undefined) ? SeverityLevel.Info : notification.severity,
                dateCreated: notification.dateCreated || new Date(),
                closeable: (notification.closeable === undefined) ? true : notification.closeable,
                callback: notification.callback,
                image: notification.image
            }
        })
        setNotifications({
            ...notifications,
            ...updatingData
        })
    }

    const deleteNotifications = (toDelete: any[]) => {
        const newState = {...notifications}
        if (toDelete.length > 0) {
            toDelete.forEach((notification) => {
                let id: string
                if (typeof notification === 'string') {
                    id = notification
                } else {
                    id = notification.id
                }
                if (newState.hasOwnProperty(id)) {
                    delete(newState[id])
                } else {
                    console.error('No such notification:', id, notifications)
                }
            })
            if (count > Object.keys(newState).length) {
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
        return Object.keys(notifications)
                .map(key => notifications[key])
                .sort(compareFunction as any)
    }

    return (
        <NotificationContext.Provider value={{
            getNotification,
            addNotifications,
            deleteNotifications,
            listNotifications,
            notificationsCount: count
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const currentContext = useContext(NotificationContext);
    if (!currentContext) {
        throw new Error(
            "useAppContext has to be used within <NotificationContext.Provider>"
        );
    }
    return currentContext;
}