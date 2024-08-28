import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import CHESS_MASTER from '../../public/images/chessmaster.svg'

import tournament_svg from '../../public/main/tournament.svg'
import academy_svg from '../../public/main/academy.svg'
import arena_svg from '../../public/main/arena.svg'
import quest_svg from '../../public/main/quest.svg'

import React, { useEffect } from 'react'
import '../index.css'
import ButtonV2 from '../components/Button/ButtonV2'
import FooterV2 from '../layouts/Footer/FooterV2'
import { RootState, useAppDispatch, useAppSelector } from '../redux/store'
import { getUserInfo } from '../redux/account/account.reducer'
import LoadingGame from '../components/Loading/Loading'
import { useNavigate } from 'react-router-dom'

const MainPage: React.FC<{}> = ({}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  // useEffect(() => {
  //   dispatch(
  //     getUserInfo({
  //       cb: (data) => {
  //         if (!data || data.isEarly === false) {
  //           navigate('/login')
  //         }
  //       },
  //     })
  //   )
  // }, [])

  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      {/* Top Header */}

      <img className="max-w-[120px] max-h-[40px] my-4" src={LOGO_DECHESS} alt="" />

      {/* Main Content */}
      <div className="inset-x-0 top-16 bottom-20">
        <div className="text-center text-white mb-4">
          <img src={CHESS_MASTER} alt="CHESS_MASTER" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center cursor-pointer">
            <img src={arena_svg} alt="DeChess Arena" className="mx-auto mb-2" />
          </div>
          <div className="text-center cursor-pointer">
            <img src={quest_svg} alt="Treasure Quest" className="mx-auto mb-2" />
          </div>
          <div className="text-center cursor-pointer">
            <img src={tournament_svg} alt="Tournament" className="mx-auto mb-2" />
          </div>
          <div className="text-center cursor-pointer">
            <img src={academy_svg} alt="DeChess Academy" className="mx-auto mb-2" />
          </div>
        </div>
      </div>

      {/* Play Now Button */}
      <div className="mt-8 w-full text-center">
        <ButtonV2 className="mx-auto" onClick={() => navigate('/mode')}>
          Play Now
        </ButtonV2>
      </div>
      <FooterV2 activeIndex={0} />
    </div>
  )
}
export default MainPage
