import { Icon, Tabbar, TabbarLink } from 'konsta/react'
import { Link, useNavigate } from 'react-router-dom'

const FooterV2: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const location = window.location
  let active = 0
  switch (location.toString().split('/')[3]) {
    case '':
      active = 0
      break
    case 'wallet':
      active = 1
      break
    case 'referral':
      active = 2
      break
    case 'profile':
      active = 3
      break
    default:
      active = 0
      break
  }
  return (
    <>
      <div
        className="absolute bottom-0 w-full py-4 max-w-[428px] bg-cover bg-center"
        style={{ backgroundImage: 'url(./Footer.png)' }}
      >
        <div className="flex justify-around items-center text-white">
          <Link className="flex flex-col items-center text-center" to={'/'}>
            <Icon
              ios={<img className="w-[40px] h-[40px]" src="/Pawn.png" />}
              material={<img className="w-[40px] h-[40px]" src="/Pawn.png" />}
            />
            <span className={`${active === 0 && 'text-[#E3C043]'}`}>Home</span>
          </Link>
          <Link className="flex flex-col items-center text-center" to={'/wallet'}>
            <Icon
              ios={<img className="w-[40px] h-[40px]" src="/Money.png" />}
              material={<img className="w-[40px] h-[40px]" src="/Money.png" />}
            />
            <span className={`${active === 1 && 'text-[#E3C043]'}`}>Wallet</span>
          </Link>
          <Link className="flex flex-col items-center text-center" to={'/referral'}>
            <Icon
              ios={<img className="w-[40px] h-[40px]" src="/Referral.png" />}
              material={<img className="w-[40px] h-[40px]" src="/Referral.png" />}
            />
            <span className={`${active === 2 && 'text-[#E3C043]'}`}>Referral</span>
          </Link>
          <Link className="flex flex-col items-center text-center" to={'/profile'}>
            <Icon
              ios={<img className="w-[40px] h-[40px]" src="/Profile.png" />}
              material={<img className="w-[40px] h-[40px]" src="/Profile.png" />}
            />
            <span className={`${active === 3 && 'text-[#E3C043]'}`}>Profile</span>
          </Link>
        </div>
      </div>
    </>
  )
}
export default FooterV2
