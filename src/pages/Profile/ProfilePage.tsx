import { useState } from 'react'
import FooterV2 from '../../layouts/Footer/FooterV2'
import ELORating from './ELORating'
import Statistic from './Statistic'
import ProfileSection from './ProfileSection'
import iconWallet from '../../../public/icon-wallet.svg'
import iconChevronDown from '../../../public/icon-chevron-down.svg'
import { sliceAddress } from '../../utils/utils'

const tabLinks = [
  { id: 'tab-1', label: 'Statistics', commingSoon: false, component: <Statistic /> },
  { id: 'tab-2', label: 'ELO Rating', commingSoon: false, component: <ELORating /> },
  {
    id: 'tab-3',
    label: 'History',
    commingSoon: true,
    component: <div className="space-y-4 text-white bold">Coming Soon</div>,
  },
]

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab-1')
  const address = localStorage.getItem('address')

  const backgroundStyles = {
    backgroundImage: 'url(./images/bg-game.png)',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  }

  return (
    <div className="h-screen bg-center flex flex-col items-center" style={backgroundStyles}>
      <div className="text-white flex items-center justify-between container gap-2 mt-6">
        <h3 className="font-medium text-xl">Profile</h3>
        <div className="flex items-center gap-1 cursor-pointer">
          <img src={iconWallet} alt="Wallet" />
          <p>{sliceAddress(address || '')}</p>
          <img width={30} height={30} src={iconChevronDown} alt="Chevron Down" />
        </div>
      </div>

      <ProfileSection />

      <ul className="flex items-center justify-between mt-4 mb-2 gap-4 container">
        {tabLinks.map(({ id, label, commingSoon }) => (
          <li
            key={id}
            className={`relative bg-transparent cursor-pointer border-b-2 pr-5 ${activeTab === id ? 'text-yellow-200 border-yellow-200' : 'text-white border-transparent'} ${commingSoon ? 'opacity-50 after:content-["Comming_soon"] after:text-black-1a after:text-xs after:absolute after:-top-full after:translate-y-1/4 after:left-0 after:right-3 after:text-center after:z-10 after:bg-white after:h-[20px] after:text-[8px] after:p-0.5 after:rounded pointer-events-none cursor-default' : ''}`}
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

export default ProfilePage
