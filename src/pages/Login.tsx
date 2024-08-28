import React, { useEffect, useState } from 'react'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import ButtonV2 from '../components/Button/ButtonV2'
import { ConnectionSettings } from '../components/Connect/ConnectionSettings'
import { RootState, store, useAppDispatch, useAppSelector } from '../redux/store'
import { getUserInfo, submitEarlyAccessCode } from '../redux/account/account.reducer'
import { usePopups } from '../components/Chess/Popup/PopupProvider'
import Popup from '../components/Chess/Popup/Popup'
import Input from '../components/Input/Input'
import { useNavigate } from 'react-router-dom'

const Login: React.FC<{}> = ({}) => {
  const dispatch = useAppDispatch()
  const { addPopup, removeAll } = usePopups()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(
      getUserInfo({
        cb: async (data) => {
          return addPopup({
            Component: () => {
              const [referralCode, setReferralCode] = useState('')
              const [submiting, setSubmiting] = useState(false)
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
              return (
                <Popup className={`text-white`}>
                  <div className="flex flex-col space-y-3 justify-center items-center pl-2 text-center">
                    <h1 className="font-planet pt-2">Get started for free!</h1>
                    <div>
                      Enter your referral code to get exclusive in-game items and start playing now!
                      Limited time offer.
                    </div>
                    <Input
                      className="px-12"
                      value={referralCode}
                      onChange={handleInputChange}
                      placeholder=""
                      name={'refferal_code'}
                    />
                    <div className="p-4">
                      <ButtonV2 loading={submiting} onClick={onHandleSubmitEarlyAccessCode}>
                        Enter
                      </ButtonV2>
                    </div>
                  </div>
                </Popup>
              )
            },
          })
        },
      })
    )
  }, [])

  return (
    <div
      className="relative h-screen w-full mx-auto bg-center"
      style={{ backgroundImage: 'url(./images/bg-main.png)' }}
    >
      {/* Centered Logo */}
      <div className="flex flex-col items-center justify-center h-full">
        <img src={LOGO_DECHESS} alt="Logo" className="max-w-[362px]" />
      </div>

      {/* Centered Bottom Buttons */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-12 w-full max-w-[354px]">
        <ButtonV2 kind="secondary" disabled={true} className="w-full mb-4">
          social (Soon)
        </ButtonV2>
        <div className="mb-4">
          <ConnectionSettings />
        </div>
      </div>
    </div>
  )
}

export default Login
