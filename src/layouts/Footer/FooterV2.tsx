import { Link, useLocation } from 'react-router-dom'

const MENU_LINKS = [
  // { path: '/', icon: '/Pawn.png', label: 'Home', id: 0 },
  // { path: '/wallet', icon: '/Money.png', label: 'Wallet', id: 1 },
  // { path: '/referral', icon: '/Referral.png', label: 'Referral', id: 2 },
  { path: '/profile', icon: '/icon-profile.svg', label: 'Profile', id: 3 },
  { path: '/earn', icon: '/icon-earn.svg', label: 'Earn', id: 4 },
  { path: '/quest', icon: '/Referral.png', label: 'Quest', id: 2 },
  { path: '/mint-nft', icon: '/Money.png', label: 'Mint NFT', id: 1 },
]

const FooterV2: React.FC = () => {
  const { pathname } = useLocation()

  return (
    <div
      className="fixed bottom-0 w-full py-2 h-[113px] max-w-[428px] bg-center bg-contain mx-auto bg-no-repeat px-6 flex items-center"
      style={{ backgroundImage: 'url(./Footer.png)' }}
    >
      <div className="w-full flex justify-around items-center text-sm text-white gap-3">
        {MENU_LINKS.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="flex flex-col items-center text-center cursor-pointer"
          >
            <img
              className={`w-[40px] h-[40px] ${pathname === link.path ? 'icon-shadow' : ''}`}
              src={link.icon}
              alt={link.label}
            />
            <span className={`${pathname === link.path ? 'text-[#E3C043]' : ''}`}>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
export default FooterV2
