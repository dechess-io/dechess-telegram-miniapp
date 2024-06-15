import { useCallback, useEffect, useRef, useState } from 'react'
import {
  THEME,
  TonConnectButton,
  TonConnectUIProvider,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react'
import { TonProofDemoApi } from '../../services/ton'
import useInterval from '../../hooks/useInterval'

export const resolverError = (key: string, type: string, message: string) => {
  return { [key]: { type, message } }
}

export function ConnectionSettings() {
  const firstProofLoading = useRef<boolean>(true)

  const [data, setData] = useState({})
  const wallet = useTonWallet()
  const [authorized, setAuthorized] = useState(false)
  const [tonConnectUI] = useTonConnectUI()
  const recreateProofPayload = useCallback(async () => {
    // if (hasJWT()) {
    //   console.log('7s200:has')
    //   return
    // } else {
    //   console.log('7s200:not')
    if (firstProofLoading.current) {
      tonConnectUI.setConnectRequestParameters({ state: 'loading' })
      firstProofLoading.current = false
    }
    const payload = await TonProofDemoApi.generatePayload()

    if (payload) {
      tonConnectUI.setConnectRequestParameters({ state: 'ready', value: payload })
    } else {
      tonConnectUI.setConnectRequestParameters(null)
    }
    // }
  }, [tonConnectUI, firstProofLoading])

  if (firstProofLoading.current) {
    recreateProofPayload()
  }

  useInterval(recreateProofPayload, TonProofDemoApi.refreshIntervalMs)

  useEffect(
    () =>
      tonConnectUI.onStatusChange(async (w) => {
        if (!w) {
          // TonProofDemoApi.reset()
          // setAuthorized(false)
          return
        }

        if (w.connectItems?.tonProof) {
          await TonProofDemoApi.checkProof((w.connectItems.tonProof as any).proof, w.account)
        }

        if (!TonProofDemoApi.accessToken) {
          tonConnectUI.disconnect()
          setAuthorized(false)
          return
        }

        setAuthorized(true)
      }),
    [tonConnectUI]
  )

  const handleClick = useCallback(async () => {
    if (!wallet) {
      return
    }
    const response = await TonProofDemoApi.getAccountInfo(wallet.account)

    setData(response)
  }, [wallet])

  function hasJWT() {
    let flag = false
    localStorage.getItem('token') ? (flag = true) : (flag = false)
    return flag
  }

  if (authorized) {
    return (
      <div className="text-white">
        <TonConnectButton />
      </div>
    )
  }
  return <TonConnectButton />
}
