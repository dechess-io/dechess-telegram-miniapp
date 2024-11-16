import FooterV2 from '../layouts/Footer/FooterV2'
import iconWallet from '../../public/icon-wallet.svg'
import iconChevronDown from '../../public/icon-chevron-down.svg'
import { sliceAddress } from '../utils/utils'
import { useMemo } from 'react'

const EarnPage: React.FC = () => {
  const address = localStorage.getItem('address')

  const backgroundStyles = useMemo(
    () => ({
      backgroundImage: 'url(./images/bg-game.png)',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
    }),
    []
  )

  const days = useMemo(
    () => [
      { day: 1, points: 100, completed: true },
      { day: 2, points: 100, completed: true },
      { day: 3, points: 100, completed: false },
      { day: 4, points: 100, completed: false },
      { day: 5, points: 100, completed: false },
      { day: 6, points: 100, completed: false },
      { day: 7, points: 100, completed: false },
    ],
    []
  )

  return (
    <div className="h-screen bg-center flex flex-col items-center" style={backgroundStyles}>
      <div className="text-white flex items-center justify-between container gap-2 mt-6">
        <h3 className="font-medium text-xl">Earn Points</h3>
        <div className="flex items-center gap-1 cursor-pointer">
          <img src={iconWallet} alt="Wallet" />
          <p>{sliceAddress(address || '')}</p>
          <img width={30} height={30} src={iconChevronDown} alt="Chevron Down" />
        </div>
      </div>
      <div className="container mt-4 p-4 flex items-center justify-center flex-wrap">
        {days.map((item) => (
          <div key={item.day} className="relative">
            {item.completed && (
              <img
                className="absolute top-1 right-1"
                src="/icon-check-earn.svg"
                alt="icon-check-earn"
              />
            )}

            <img width={85} height={90} src="./bg-card-earn.svg" alt="bg-card-earn" />
            <div className="absolute left-0 right-0 bottom-0 text-center pb-3 text-white">
              <p className="text-xs">+{item.points}</p>
              <p className="text-sm">Day {item.day}</p>
            </div>
          </div>
        ))}
      </div>
      <FooterV2 />
    </div>
  )
}
export default EarnPage
