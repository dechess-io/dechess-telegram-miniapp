import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { truncateSuiTx } from '../../services/address'
import cn from '../../services/cn'
import { setAuthToken } from '../../utils/utils'
import Button from '../Button/Button'
import Input from '../Input/Input'
import Popup from '../Popup/Popup'
import { usePopups } from '../Popup/PopupProvider'
import restApi from '../../services/api'

import {
  ConnectButton,
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useSignPersonalMessage,
  useWallets,
} from '@mysten/dapp-kit'
import { verifyPersonalMessageSignature } from '@mysten/sui/verify'
import { useAppDispatch } from '../../redux/store'
import { getLoginMessage } from '../../redux/account/account.reducer'
import { Avatar, Badge } from '@material-tailwind/react'

export const resolverError = (key: string, type: string, message: string) => {
  return { [key]: { type, message } }
}

export function ConnectionSettings() {
  const wallets = useWallets()
  const { currentWallet, connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const { mutate: signPersonalMessage } = useSignPersonalMessage()

  const [isLoading, setIsLoading] = useState(false)

  const { addPopup } = usePopups()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (
      !localStorage.getItem('token') ||
      localStorage.getItem('token')!.length <= 0 ||
      !currentAccount
    ) {
      const tempMessage = `login::${currentAccount?.address}::${new Date().getTime()}`
      signPersonalMessage(
        {
          message: new TextEncoder().encode(tempMessage),
        },
        {
          onSuccess: async (result: any) => {
            const loginPayload = {
              address: currentAccount?.address,
              message: tempMessage,
              signature: result.signature,
            }

            await restApi
              .post('/login-verify-account', loginPayload)
              .then((response) => {
                if (response.data.status === 200) {
                  const token = response.data.token
                  localStorage.setItem('token', token)
                  setAuthToken(token)
                  window.location.href = '/'
                }
                // // setIsLoadingLogin(false)
                return
              })
              .catch((err) => {
                console.log(err)
                // setIsLoadingLogin(false)
                return
              })
            // const publicKey = await verifyPersonalMessageSignature(
            //   new TextEncoder().encode(tempMessage),
            //   result.signature
            // )
            // console.log('7s200:pub', publicKey, currentAccount?.publicKey)
          },
        }
      )
    }
  }, [wallets, currentAccount, connectionStatus])

  function hasJWT() {
    let flag = false
    localStorage.getItem('token') ? (flag = true) : (flag = false)
    return flag
  }

  if (connectionStatus === 'disconnected' && !currentAccount) {
    return (
      <ConnectButton
        className="!text-black bg-blue-gradient !rounded-lg font-bold  text-center text-white min-w-[150px] leading-[21px] py-1 cursor-pointer"
        connectText={'Connect'}
      />
    )
  }
  if (hasJWT() && currentAccount && currentAccount.publicKey) {
    return (
      <div className="!text-black bg-blue-gradient !rounded-lg font-bold  text-center text-white min-w-[150px] leading-[21px] py-1 cursor-pointer">
        <div>{truncateSuiTx(currentAccount.address)}</div>
      </div>
    )
  }

  return <></>
}
