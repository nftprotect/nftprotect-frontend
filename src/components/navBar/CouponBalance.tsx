import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import ERC20ABI from '../../abi/ERC20ABI'
import { couponsContractAddress } from '../../utils/config' 
import { Contract } from "@ethersproject/contracts";
import { useState, useEffect } from 'react';
import { formatEther } from "@ethersproject/units";
import useSWR from 'swr'

const CouponBalance = () => {

    const { account, active, setError, library } = useWeb3React<Web3Provider>()
    const [ symbol, setSymbol ] = useState<string>("")
    const contract: Contract = new Contract(couponsContractAddress, ERC20ABI, library?.getSigner())
    
    const couponsBalanceFetcher = (account: string) => {
        return contract.balanceOf(account)
    }
    
    const { data: balance, mutate } = useSWR([account, couponsContractAddress, 'balanceOf'], {
        fetcher: couponsBalanceFetcher,
    })

    useEffect( () => {
        if(!(active && account && library)) return
    
        library.getCode(couponsContractAddress).then((result:string)=>{
          //check whether it is a contract
          if(result === '0x') return
    
          contract.symbol().then((result:string)=>{
              setSymbol(result)
          }).catch('error', console.error)

        })
    //called only when changed to active
    }, [active])

    useEffect(() => {
        if(!(active && account && library)) return

        // listen for changes on an Ethereum address
        console.log(`listening for Transfer...`)
    
        const fromMe = contract.filters.Transfer(account, null)
        contract.on(fromMe, (from, to, amount, event) => {
            console.log('Transfer|sent', { from, to, amount, event })
            mutate(undefined, true)
        })
    
        const toMe = contract.filters.Transfer(null, account)
        contract.on(toMe, (from, to, amount, event) => {
            console.log('Transfer|received', { from, to, amount, event })
            mutate(undefined, true)
        })
    
        // remove listener when the component is unmounted
        return () => {
            contract.removeAllListeners(toMe)
            contract.removeAllListeners(fromMe)
        }
    
        // trigger the effect only on component mount
    }, [active,account])

    useEffect(() => {
        console.log("COUPONS BALANCE", balance, symbol)
    })

    return (<>
        { balance ? `${ formatEther(balance) } ${symbol}` : "Fetching balance..." }
    </>)
}

export default CouponBalance