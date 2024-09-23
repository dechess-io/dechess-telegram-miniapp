import React, { useEffect, useRef, useState } from 'react'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import ButtonV2 from '../components/Button/ButtonV2'
import { ConnectionSettings } from '../components/Connect/ConnectionSettings'
import { RootState, store, useAppDispatch, useAppSelector } from '../redux/store'
import {
  generatePayloadSolana,
  getUserInfo,
  submitEarlyAccessCode,
  updateAddress,
  verifySignatureSolana,
} from '../redux/account/account.reducer'
// import { usePopups } from '../components/Chess/Popup/PopupProvider'
// import { Navigate, useNavigate } from 'react-router-dom'
import { useTonWallet } from '@tonconnect/ui-react'
import { TonProofDemoApi } from '../services/ton'
import { isTMA, LaunchParams, retrieveLaunchParams } from '@telegram-apps/sdk'
import restApi from '../services/api'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { truncateSuiTx } from '../services/address'
import { SOLANA_NETWORK } from '../components/Provider/SolanaAppWalletProvider'

// import Input from '../components/Input/Input'
// import Popup from '../components/Chess/Popup/Popup'

const Login: React.FC<{}> = ({}) => {
  const dispatch = useAppDispatch()
  // const { addPopup, removeAll } = usePopups()
  // const navigate = useNavigate()
  const wallet = useTonWallet()
  const { publicKey: pub_solana, wallet: wallet_solana, signMessage } = useWallet()

  // console.log('tonProofDemo', TonProofDemoApi)
  // const [referralCode, setReferralCode] = useState('')
  // const [submiting, setSubmiting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isSignSolana, setIsSignSolan] = useState(false)
  const token = localStorage.getItem('token')
  console.log('7s200:wallet', wallet)

  // const onHandleSubmitEarlyAccessCode = async () => {
  //   setSubmiting(true)
  //   if (referralCode.length < 6) {
  //     setSubmiting(false)
  //     return
  //   }
  //   await dispatch(
  //     submitEarlyAccessCode({
  //       code: referralCode,
  //       cb: (data) => {
  //         if (data.status === 200) {
  //           setSubmiting(false)
  //           removeAll()
  //           location.pathname = '/'
  //           localStorage.setItem('address', wallet?.account?.address!)
  //         } else {
  //           setSubmiting(false)
  //         }
  //       },
  //     })
  //   )
  // }
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setReferralCode(e.target.value)
  // }
  const handleTelegramLogin = async () => {
    setLoading(true)
    const isTma = await isTMA()
    if (isTma) {
      const data: LaunchParams = retrieveLaunchParams()
      restApi
        .post('/telegram-login', {
          data: data.initDataRaw,
          user: data.initData?.user,
        })
        .then((res) => {
          if (res.status == 200) {
            setTimeout(() => {
              location.pathname = '/'
              localStorage.setItem('data', JSON.stringify(data))
              localStorage.setItem('token', res.data.data)
              localStorage.setItem('address', data.initData?.user?.id.toString()!)
              localStorage.setItem('user', JSON.stringify(data.initData?.user))
              dispatch(updateAddress(data.initData?.user?.id.toString()))
            }, 1500)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      console.log('not tma')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSignSolana) {
      return
    }
    if (!pub_solana || !signMessage) {
      return
    }
    if (pub_solana.toString().length > 0) {
      if (!token || token.length === 0) {
        setIsSignSolan(true)
        dispatch(
          generatePayloadSolana({
            address: pub_solana.toString(),
            network: SOLANA_NETWORK,
            cb: async (message) => {
              console.log('7s200:message', message)
              const signature = await signMessage(new TextEncoder().encode(message))
              console.log('7s200:signature', signature)
              if (signature) {
                dispatch(
                  verifySignatureSolana({
                    address: pub_solana.toString(),
                    signature: signature,
                    message: message,
                    network: SOLANA_NETWORK,
                    cb: (verifyData) => {
                      if (verifyData) {
                        console.log('7s200:verify:data', verifyData)
                        const solanaAccessToken = localStorage.getItem('token')
                        const blockchain = localStorage.getItem('blockchain')
                        if (
                          solanaAccessToken &&
                          blockchain &&
                          solanaAccessToken.length > 0 &&
                          blockchain === 'SOLANA'
                        ) {
                          location.pathname = '/'
                        }
                      }
                    },
                  })
                )
              }
            },
          })
        )
        // const message = new TextEncoder().encode(
        //   `${
        //     window.location.host
        //   } wants you to sign in with your Solana account:\n${pub_solana.toBase58()}\n\nPlease sign in.`
        // )
        // const signature = signMessageSolana(message)
        //   .then((sig) => {
        //     console.log('7s200:sig:sol', sig)
        //     return sig
        //   })
        //   .catch((err) => {
        //     setIsSignSolan(false)
        //     console.log('7s200:sign:sol:err', err)
        //     return
        //   })
        // // console.log('7s200:sig', signature)
      }
    }
  }, [pub_solana])

  useEffect(() => {
    const token2 = localStorage.getItem('token')
    if (wallet?.account?.address && token2 && token2.length > 0 && token === token2) {
      dispatch(
        getUserInfo({
          cb: (data) => {
            console.log('data:ton', data)
            setUser(data)
            dispatch(updateAddress(wallet?.account?.address))
            localStorage.setItem('address', wallet?.account?.address)
            if (data) {
              location.pathname = '/'
              return
            }
          },
        })
      )
    }
    if (
      pub_solana &&
      pub_solana.toString().length > 0 &&
      token2 &&
      token2.length > 0 &&
      token === token2
    ) {
      dispatch(
        getUserInfo({
          cb: (data) => {
            console.log('data:sol', data)
            setUser(data)
            dispatch(updateAddress(pub_solana.toString()))
            localStorage.setItem('address', pub_solana.toString())
            if (data) {
              location.pathname = '/'
              return
            }
          },
        })
      )
    }
  }, [token])
  //   console.log('user2', user)

  // }
  console.log('7s200:user', user)

  // const onShowPopupEarlyAccess = () => {
  //   if (user && user.isEarly === false) {
  //     return (
  //       <Popup className={`text-white absolute`}>
  //         <div className={`text-white`}>
  //           <div className="flex flex-col space-y-3 justify-center items-center pl-2 text-center">
  //             <h1 className="font-planet pt-2">Get started for free!</h1>
  //             <div>
  //               Enter your referral code to get exclusive in-game items and start playing now!
  //               Limited time offer.
  //             </div>
  //             <Input
  //               className="px-12"
  //               value={referralCode}
  //               onChange={handleInputChange}
  //               placeholder=""
  //               name={'refferal_code'}
  //             />
  //             <div className="p-4">
  //               <ButtonV2 loading={submiting} onClick={onHandleSubmitEarlyAccessCode}>
  //                 Enter
  //               </ButtonV2>
  //             </div>
  //           </div>
  //         </div>
  //       </Popup>
  //     )
  //   }
  //   return <></>
  // }
  return (
    <div
      className="relative h-screen  w-full mx-auto bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: 'url(./images/bg-main.png)' }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {/* {onShowPopupEarlyAccess()} */}
        <img
          src={LOGO_DECHESS}
          alt="Logo"
          className="w-full max-w-[200px] md:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px] max-w-[350px]"
        />
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 md:mb-12 lg:mb-12">
        {(window as any).Telegram.WebApp.platform === 'unknown' && (
          <div className="mb-4 mx-auto my-auto">
            <WalletMultiButton
              style={{
                backgroundImage: 'url(./images/bg-btn-white.png)',
                // backgroundPosition: 'center',
                backgroundSize: '300px 50px',
                backgroundColor: 'transparent',
                padding: '24px',
                margin: '0px',
                color: 'black',
                fontFamily: 'Planet Gamers',
                width: '300px',
                height: '40px',
                border: 'none',
                borderRadius: '0px',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: '700',
                textTransform: 'lowercase',
              }}
            >
              <div className="flex justify-center items-center space-x-2">
                <p>{pub_solana ? truncateSuiTx(pub_solana.toString()) : 'Connect solana'}</p>
                <img className="w-[24px] h-[24px] mb-1" src="./images/solana-logo.png" alt="" />
              </div>
            </WalletMultiButton>
          </div>
        )}

        <ButtonV2
          kind="secondary"
          className="w-full mb-2"
          onClick={handleTelegramLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Telegram'}
        </ButtonV2>
        <div className="mb-2 mx-auto my-auto">
          <ConnectionSettings />
        </div>
      </div>
    </div>
  )
}

export default Login
