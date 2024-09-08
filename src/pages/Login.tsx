import React, { useEffect, useRef, useState } from 'react'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import ButtonV2 from '../components/Button/ButtonV2'
import { ConnectionSettings } from '../components/Connect/ConnectionSettings'
import { RootState, store, useAppDispatch, useAppSelector } from '../redux/store'
import { getUserInfo, submitEarlyAccessCode } from '../redux/account/account.reducer'
import { usePopups } from '../components/Chess/Popup/PopupProvider'
import Popup from '../components/Chess/Popup/Popup'
import Input from '../components/Input/Input'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTonWallet } from '@tonconnect/ui-react'
import { TonProofDemoApi } from '../services/ton'
import { isTMA, LaunchParams, retrieveLaunchParams } from '@telegram-apps/sdk'
import restApi from '../services/api'

const Login: React.FC<{}> = ({}) => {
  const dispatch = useAppDispatch()
  const { addPopup, removeAll } = usePopups()
  const navigate = useNavigate()
  const wallet = useTonWallet()
  // console.log('tonProofDemo', TonProofDemoApi)
  const [referralCode, setReferralCode] = useState('')
  const [submiting, setSubmiting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const [hasFetched, setHasFetched] = useState(false) // State to track if fetch has been done

  const onHandleSubmitEarlyAccessCode = async () => {
    setSubmiting(true)
    if (referralCode.length < 6) {
      setSubmiting(false)
      return
    }
    await dispatch(
      submitEarlyAccessCode({
        code: referralCode,
        cb: (data) => {
          if (data.status === 200) {
            setSubmiting(false)
            removeAll()
            navigate('/')
          } else {
            setSubmiting(false)
          }
        },
      })
    )
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value)
  }

  const handleTelegramLogin = async () => {
    setLoading(true)
    const isTma = await isTMA()
    if (isTma) {
      const data: LaunchParams = retrieveLaunchParams()
      console.log('tma', data.initData?.user)
      restApi
        .post('/telegram-login', {
          data: data.initDataRaw,
          user: data.initData?.user,
        })
        .then((res) => {
          if (res.status == 200) {
            console.log('token', res.data)
            location.pathname = '/'
            localStorage.setItem('token', res.data.data)
            localStorage.setItem('address', data.initData?.user?.username!)
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
    const token2 = localStorage.getItem('token')

    if (
      !hasFetched &&
      wallet?.account?.address &&
      token2 &&
      token2.length > 0 &&
      token === token2
    ) {
      dispatch(
        getUserInfo({
          cb: (data) => {
            console.log('data', data)
            setUser(data)
            if (data && data.isEarly) {
              navigate('/')
            }
            setHasFetched(true) // Mark as fetched after the first successful fetch
          },
        })
      )
    }
  }, [token])
  console.log('7s200:ref', hasFetched)
  // if (user && user.isEarly === false) {
  //   console.log('user2', user)
  //   return (
  //     <div className={`text-white`}>
  //       <div className="flex flex-col space-y-3 justify-center items-center pl-2 text-center">
  //         <h1 className="font-planet pt-2">Get started for free!</h1>
  //         <div>
  //           Enter your referral code to get exclusive in-game items and start playing now! Limited
  //           time offer.
  //         </div>
  //         <Input
  //           className="px-12"
  //           value={referralCode}
  //           onChange={handleInputChange}
  //           placeholder=""
  //           name={'refferal_code'}
  //         />
  //         <div className="p-4">
  //           <ButtonV2 loading={submiting} onClick={onHandleSubmitEarlyAccessCode}>
  //             Enter
  //           </ButtonV2>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
  return (
    <div
      className="relative h-screen  w-full mx-auto bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: 'url(./images/bg-main.png)' }}
    >
      {/* Centered Logo */}
      <div className="flex flex-col items-center justify-center h-full">
        <img
          src={LOGO_DECHESS}
          alt="Logo"
          className="w-full max-w-[162px] sm:max-w-[150px] md:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px] max-w-[350px]"
        />
      </div>

      {/* Centered Bottom Buttons */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-12 w-full max-w-[354px]">
        <ButtonV2
          kind="secondary"
          className="w-full mb-4"
          onClick={handleTelegramLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Telegram'}
        </ButtonV2>
        <div className="mb-4">
          <ConnectionSettings />
        </div>
      </div>
    </div>
  )
}

export default Login
