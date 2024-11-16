import React, { useEffect, useMemo, useState } from 'react'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import ButtonV2 from '../components/Button/ButtonV2'
import { ConnectionSettings } from '../components/Connect/ConnectionSettings'
import { useAppDispatch } from '../redux/store'
import {
  generatePayloadSolana,
  getUserInfo,
  updateAddress,
  verifySignatureSolana,
} from '../redux/account/account.reducer'
import bgButtonGray from '/images/bg-btn-gray.png'
import { Select, Option } from '@material-tailwind/react'
import { useTonWallet } from '@tonconnect/ui-react'
import { isTMA, LaunchParams, retrieveLaunchParams } from '@telegram-apps/sdk'
import restApi from '../services/api'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { SOLANA_NETWORK } from '../components/Provider/SolanaAppWalletProvider'
import { ArrowDown, ChevronDown } from 'lucide-react'

const SOLANA = 'Solana'
const TELEGRAM = 'Telegram'
const TON = 'Ton'

const LOGIN_OPTIONS = [
  { key: SOLANA, label: SOLANA },
  { key: TELEGRAM, label: TELEGRAM },
  { key: TON, label: TON },
]

const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const wallet = useTonWallet()
  const { publicKey: pub_solana, signMessage } = useWallet()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isSignSolana, setIsSignSolan] = useState(false)
  const token = localStorage.getItem('token')
  const [selectedOption, setSelectedOption] = useState<string>(TON)

  const filteredLoginOptions = useMemo(() => {
    if ((window as any).Telegram.WebApp.platform !== 'unknown') {
      return LOGIN_OPTIONS.filter((option) => option.key !== SOLANA)
    }
    return LOGIN_OPTIONS
  }, [])

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

  const handleConnectWallet = () => {
    switch (selectedOption) {
      case SOLANA: {
        const solanaConnectButton: HTMLButtonElement | null = document.querySelector(
          '.wallet-adapter-button.wallet-adapter-button-trigger'
        )
        if (solanaConnectButton) {
          solanaConnectButton.click()
        }
        break
      }
      case TELEGRAM:
        handleTelegramLogin()
        break
      case TON: {
        const tonConnectButton = document.getElementById('ton-connect-button')
        const button = tonConnectButton?.querySelector('button')
        if (button) {
          button.click()
        }
        break
      }
      default:
        console.log('No valid option selected')
    }
  }

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
          className="w-full md:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px] max-w-[350px]"
        />
      </div>

      <div className="absolute bottom-4 md:bottom-10 left-1/2 transform -translate-x-1/2 grid gap-4">
        <div className="invisible">
          {(window as any).Telegram.WebApp.platform === 'unknown' && <WalletMultiButton />}
          <ConnectionSettings />
        </div>

        <div className="relative">
          <img
            className="absolute inset-0"
            src={bgButtonGray}
            width={300}
            height={40}
            alt="dechess-btn-background"
          />
          <div className="max-w-[190px] mx-auto">
            <Select
              variant="standard"
              value={selectedOption}
              className="text-white !border-none text-lg"
              labelProps={{ className: 'after:content-none' }}
              menuProps={{
                className: 'grid gap-2 rounded-none bg-[url(./images/bg-popup.png)] bg-cover bg-no-repeat bg-transparent border-none p-6 text-white',
              }}
              onChange={(value) => setSelectedOption(value as string)}
              arrow={<ChevronDown className="text-white" size={24} />}
            >
              {filteredLoginOptions.map((option) => (
                <Option className="capitalize" key={option.key} value={option.key}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <ButtonV2
          kind="primary"
          className="w-full"
          onClick={handleConnectWallet}
          loading={loading}
          disabled={loading || !selectedOption}
        >
          Connect wallet
        </ButtonV2>
      </div>
    </div>
  )
}

export default Login
