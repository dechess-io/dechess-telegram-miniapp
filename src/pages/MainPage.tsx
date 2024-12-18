import React, { useEffect, useState } from 'react'
import '../index.css'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import CHESS_MASTER from '../../public/images/chessmaster.svg'
import ButtonV2 from '../components/Button/ButtonV2'
import FooterV2 from '../layouts/Footer/FooterV2'
import { useAppDispatch } from '../redux/store'
import { getUserInfo } from '../redux/account/account.reducer'
import { useNavigate } from 'react-router-dom'
import Dialog from '../components/Chess/Popup/Dialog'

const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const toggleDialog = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    dispatch(
      getUserInfo({
        cb: (data) => {
          if (data) {
            // TODO: remove this
            navigate('/profile')
          } else if (!localStorage.getItem('address')) {
            navigate('/login')
          }
        },
      })
    )
  }, [])

  // TODO: remove this
  return <></>

  return (
    <div
      className="h-screen bg-center bg-contain flex flex-col"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      <img className="max-w-[120px] max-h-[40px] mx-auto" src={LOGO_DECHESS} alt="DeChess Logo" />
      <div className="flex flex-col items-center justify-center mx-auto my-2">
        <div className="">
          <img
            className="w-full max-w-[300px] sm:max-w-[300px] md:max-w-[250px] mx-auto"
            src={CHESS_MASTER}
            alt="CHESS_MASTER"
          />

          <div className="grid grid-cols-2 w-full max-w-[500px] gap-2 p-1 md:p-4 lg:p-4 mx-auto ">
            <div className="text-center cursor-pointer">
              <img
                src="/main/arena.png"
                alt="DeChess Bot"
                className="mx-auto max-w-[120px] md:max-w-[125px]"
                onClick={toggleDialog}
              />
            </div>
            <div className="text-center cursor-pointer">
              <img
                src="/main/quest.png"
                alt="Treasure Quest"
                className="mx-auto max-w-[120px] md:max-w-[125px]"
              />
            </div>
            <div className="text-center cursor-pointer">
              <img
                src="/main/tournament.png"
                alt="Tournament"
                className="mx-auto max-w-[120px] md:max-w-[125px]"
              />
            </div>
            <div className="text-center cursor-pointer">
              <img
                src="/main/academy.png"
                alt="DeChess Academy"
                className="mx-auto max-w-[120px] md:max-w-[125px]"
              />
            </div>
          </div>
        </div>

        {/* Play Now Button */}
        <div className="w-full text-center text-black active:bg-transparent hover:bg-transparent">
          <ButtonV2 className="mx-auto" onClick={() => navigate('/mode')}>
            Play Now
          </ButtonV2>
        </div>
      </div>
      <div className="flex item-center justify-center">
        <FooterV2 activeIndex={0} />
      </div>
      <Dialog isOpen={isOpen} onClose={toggleDialog}></Dialog>
    </div>
  )
}
export default MainPage
