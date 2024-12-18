import { useCallback, useEffect, useRef, useState } from 'react'
import {
  TonConnectButton,
  useTonConnectUI,
} from '@tonconnect/ui-react'
import { TonProofDemoApi } from '../../services/ton'
import useInterval from '../../hooks/useInterval'
import { useLocation, useNavigate } from 'react-router-dom'

export const resolverError = (key: string, type: string, message: string) => {
  return { [key]: { type, message } }
}

export function ConnectionSettings() {
  const location = useLocation()
  const firstProofLoading = useRef<boolean>(true)
  const navigate = useNavigate()

  const [authorized, setAuthorized] = useState(false)
  const [tonConnectUI] = useTonConnectUI()

  const recreateProofPayload = useCallback(async () => {
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
        if (!w) return

        if (!localStorage.getItem('token') || localStorage.getItem('token')?.length === 0) {
          tonConnectUI.setConnectRequestParameters(null)
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
        if (location.pathname === '/login') {
          navigate('/')
        }
      }),
    [tonConnectUI]
  )

  if (authorized) {
    return (
      <div id="ton-connect-button-1">
        <TonConnectButton />
      </div>
    )
  }

  return (
    <div id="ton-connect-button-1">
      <TonConnectButton />
    </div>
  )
}
