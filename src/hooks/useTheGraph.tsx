import { useContext } from "react";
import { Alchemy } from "alchemy-sdk";
import { AppContext, useAppContext } from "../context/AppContextProvider";
import graphClient from '../utils/graphql'
import { gql } from "@apollo/client"

export interface AlchemyContextInterface {
    alchemy: Alchemy,
}

export function useTheGraph() {
    const currentContext = useContext(AppContext);
    if (!currentContext) {
        throw new Error(
            "useTheGraph has to be used within <AppContext.Provider>"
        );
    }

    const { account, active } = useAppContext()

    const checkAccount= () => {
        if (!account) {
            throw new Error(
                "Invalid account!"
            );
        }
        if (!active) {
            throw new Error(
                "Invalid account!"
            );
        }
    }

    const loadDyArbitrators = async () => {
        checkAccount()
        const query = gql`
            query GetAllArbitrators($managerAddress: Bytes!) {
                requests(where: {status: InDispute, manager: $managerAddress}) {
                    id
                    name
                    disputeID
                    operation
                    manager
                }

                arbitrators(where: {manager: $managerAddress}) {
                    id
                    name
                    operations {
                        id
                        operation
                        extraData
                    }
                    contracts {
                        id
                        contract
                    }
                }
            }          
        `;
        const result = await graphClient.query({
            query,
            variables: { managerAddress: account }
        })
        console.log('GRAPH RETURNS', result)
        return result
    }

    return {
        loadDyArbitrators
    }
        
}