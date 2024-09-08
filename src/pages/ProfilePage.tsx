import { useState } from 'react'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import FooterV2 from '../layouts/Footer/FooterV2'
import { Block, List, ListItem, Navbar, Page, Tabbar, TabbarLink, Toggle } from 'konsta/react'
const ProfilePage: React.FC<{}> = () => {
  const [activeTab, setActiveTab] = useState('tab-1')
  const [isTabbarLabels, setIsTabbarLabels] = useState(true)
  const [isTabbarIcons, setIsTabbarIcons] = useState(false)

  return (
    <div
      className="h-screen bg-center flex flex-col items-center "
      style={{
        backgroundImage: 'url(./images/bg-game.png)',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
      }}
    >
      <div className="mx-auto text-white p-10">Profile</div>
      <div
        className="flex flex-col items-center space-y-2"
        style={{
          backgroundImage: 'url(./images/profile.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '90vw',
          height: '60vh',
          maxWidth: '398px',
          maxHeight: '172px',
        }}
      >
        <div
          className="mx-auto relative"
          style={{
            backgroundImage: 'url(./images/avatar-frame.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '90vw',
            height: '60vh',
            maxWidth: '70px',
            maxHeight: '85px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 bg-gray-300 rounded-full pb-2"></div>
          </div>
        </div>
        <div className="flex flex-row item-center justify-center space-x-4">
          <span className="text-sm text-white">User Name</span>
          <img className="w-[20px] h-[20px]" src="/images/edit-name.png" />
        </div>
        <div className="">
          <img className="w-[115px] h-[27px]" src="/images/Point.png" />
        </div>
      </div>

      <Tabbar labels={isTabbarLabels} icons={isTabbarIcons} className="">
        <TabbarLink
          className="bg-transparent"
          active={activeTab === 'tab-1'}
          onClick={() => setActiveTab('tab-1')}
          label={isTabbarLabels && 'Statistics'}
        />
        <TabbarLink
          active={activeTab === 'tab-2'}
          onClick={() => setActiveTab('tab-2')}
          label={isTabbarLabels && 'ELO Rating'}
        />
        <TabbarLink
          active={activeTab === 'tab-3'}
          onClick={() => setActiveTab('tab-3')}
          label={isTabbarLabels && 'History'}
        />
      </Tabbar>

      {activeTab === 'tab-1' && (
        <Block className="space-y-4 flex flex-col">
          <div
            style={{
              backgroundImage: 'url(./images/profile-statistic-card.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: '90vw',
              height: '60vh',
              maxWidth: '398px',
              maxHeight: '66px',
            }}
          ></div>
          <div className="flex flex-row justify-between w-full">
            <div
              className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] "
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <span className="text-xl font-bold text-white">0</span>
              <span className="text-sm font-bold text-white">Wins</span>
            </div>

            {/* Second circle div */}
            <div
              className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] "
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <span className="text-xl font-bold text-white">0</span>
              <span className="text-sm font-bold text-white">Loses</span>
            </div>

            {/* Third circle div */}
            <div
              className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] "
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <span className="text-xl font-bold text-white">0</span>
              <span className="text-sm font-bold text-white">Draws</span>
            </div>
          </div>
        </Block>
      )}
      {activeTab === 'tab-2' && (
        <Block className="space-y-4 flex">
          <div className=""></div>
          <div className="flex justify-between w-full">
            {/* First circle div */}
            <div
              className="flex flex-row items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] space-x-1"
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <img src="/bullet.svg" />
              <span className="text-sm font-bold text-white">Bullet</span>
            </div>

            {/* Second circle div */}
            <div
              className="flex flex-row items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] space-x-1"
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <img src="/Thunder.svg" />
              <span className="text-sm font-bold text-white">Rabbit</span>
            </div>

            {/* Third circle div */}
            <div
              className="flex flex-row items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px] space-x-1"
              style={{
                backgroundImage: 'url(/images/wood_circle.png)',
                width: '122px',
                height: '122px',
              }}
            >
              <img src="/QuickLock.svg" />
              <span className="text-sm font-bold text-white">Blitz</span>
            </div>
          </div>
        </Block>
      )}
      {activeTab === 'tab-3' && <Block className="space-y-4"></Block>}

      <FooterV2 activeIndex={0} />
    </div>
  )
}
export default ProfilePage
