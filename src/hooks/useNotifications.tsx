import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContextProvider";

export function useNotifications() {
    const currentContext = useContext(NotificationContext);
    if (!currentContext) {
        throw new Error(
            "useNotifications has to be used within <NotificationContext.Provider>"
        );
    }
    return currentContext;
}