import { useState } from 'react'
import FooterV2 from '../../layouts/Footer/FooterV2'
import { Block, Tabbar, TabbarLink } from 'konsta/react'
import ELORating from './ELORating'
import Statistic from './Statistic'
import ProfileSection from './ProfileSection'

const tabLinks = [
  { id: 'tab-1', label: 'Statistics', component: <Statistic /> },
  { id: 'tab-2', label: 'ELO Rating', component: <ELORating /> },
  {
    id: 'tab-3',
    label: 'History',
    component: <Block className="space-y-4 text-white bold">Coming Soon</Block>,
  },
]

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab-1')

  const backgroundStyles = {
    backgroundImage: 'url(./images/bg-game.png)',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
  }

  return (
    <div className="h-screen bg-center flex flex-col items-center" style={backgroundStyles}>
      <img
        className="max-w-[120px] max-h-[40px] mx-auto"
        src="/images/logo-dechess.svg"
        alt="DeChess Logo"
      />

      <ProfileSection />

      <Tabbar>
        {tabLinks.map(({ id, label }) => (
          <TabbarLink
            key={id}
            className="bg-transparent"
            active={activeTab === id}
            onClick={() => setActiveTab(id)}
            label={label}
          />
        ))}
      </Tabbar>

      {tabLinks.find((tab) => tab.id === activeTab)?.component}

      <FooterV2 activeIndex={0} />
    </div>
  )
}

export default ProfilePage
