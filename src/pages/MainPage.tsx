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
import { App } from 'konsta/react'

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
      className="h-screen bg-cover bg-center flex flex-col items-center justify-between"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      {/* Top Header */}
      <img
        className="max-w-[120px] max-h-[40px] my-4 md:my-8"
        src={LOGO_DECHESS}
        alt="DeChess Logo"
      />

      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 justify-center w-full px-4">
        <div className="text-center text-white">
          <img
            className="w-full max-w-[300px] sm:max-w-[250px] md:max-w-[200px]"
            src={CHESS_MASTER}
            alt="CHESS_MASTER"
          />
        </div>

        <div className="grid grid-cols-2  w-full max-w-[500px]">
          <div className="text-center cursor-pointer">
            <img src={arena_svg} alt="DeChess Bot" className="mx-auto max-w-[120px]" onClick={() => navigate('/bot')}/>
          </div>
          <div className="text-center cursor-pointer">
            <img src={quest_svg} alt="Treasure Quest" className="mx-auto  max-w-[120px]" />
          </div>
          <div className="text-center cursor-pointer">
            <img src={tournament_svg} alt="Tournament" className="mx-auto  max-w-[120px]" />
          </div>
          <div className="text-center cursor-pointer">
            <img src={academy_svg} alt="DeChess Academy" className="mx-auto  max-w-[120px]" />
          </div>
        </div>
      </div>

      {/* Play Now Button */}
      <div className="w-full text-center">
        <ButtonV2 className="mx-auto" onClick={() => navigate('/mode')}>
          Play Now
        </ButtonV2>
      </div>
      {/* <div className='pt-5'>
        <FooterV2 activeIndex={0} />
      </div> */}
    </div>
  )
}
export default MainPage
