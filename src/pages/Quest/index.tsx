import { useMemo, useState } from 'react'
import FooterV2 from '../../layouts/Footer/FooterV2'
import { sliceAddress } from '../../utils/utils'
import iconWallet from '../../../public/icon-wallet.svg'
import iconChevronDown from '../../../public/icon-chevron-down.svg'
import InGameQuest from './InGameQuest'
import DailyQuest from './DailyQuest'

const tabLinks = [
  {
    id: 'tab-1',
    label: 'In-game Quest',
    commingSoon: false,
    component: <InGameQuest />,
  },
  {
    id: 'tab-2',
    label: 'Daily Quest',
    commingSoon: false,
    component: <DailyQuest />,
  },
]

const QuestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab-1')
  const address = localStorage.getItem('address')
  const backgroundStyles = useMemo(
    () => ({
      backgroundImage: 'url(./images/bg-game.png)',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
    }),
    []
  )

  return (
    <div className="h-screen bg-center flex flex-col items-center" style={backgroundStyles}>
      <div className="text-white flex items-center justify-between container gap-2 mt-6">
        <h3 className="font-medium text-xl">Treasure Quest</h3>
        <div className="flex items-center gap-1 cursor-pointer">
          <img src={iconWallet} alt="Wallet" />
          <p>{sliceAddress(address || '')}</p>
          <img width={30} height={30} src={iconChevronDown} alt="Chevron Down" />
        </div>
      </div>

      <ul className="flex items-center justify-between mt-4 mb-2 gap-4 container">
        {tabLinks.map(({ id, label, commingSoon }) => (
          <li
            key={id}
            className={`relative bg-transparent cursor-pointer border-b-2 px-6 flex-1 ${activeTab === id ? 'text-yellow-200 border-yellow-200' : 'text-white border-transparent'} ${commingSoon ? 'opacity-50 after:content-["Comming_soon"] after:text-black-1a after:text-xs after:absolute after:-top-full after:translate-y-1/4 after:left-0 after:right-3 after:text-center after:z-10 after:bg-white after:h-[20px] after:text-[8px] after:p-0.5 after:rounded pointer-events-none cursor-default' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </li>
        ))}
      </ul>

      {tabLinks.find((tab) => tab.id === activeTab)?.component}

      <FooterV2 />
    </div>
  )
}
export default QuestPage
