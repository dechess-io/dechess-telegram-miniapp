import FooterV2 from '../layouts/Footer/FooterV2'
import { sliceAddress } from '../utils/utils'
import iconWallet from '../../public/icon-wallet.svg'
import iconChevronDown from '../../public/icon-chevron-down.svg'
import { useMemo } from 'react'

const MintNFTPage: React.FC = () => {
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
        <h3 className="font-medium text-xl">Mint NFT</h3>
        <div className="flex items-center gap-1 cursor-pointer">
          <img src={iconWallet} alt="Wallet" />
          <p>{sliceAddress(address || '')}</p>
          <img width={30} height={30} src={iconChevronDown} alt="Chevron Down" />
        </div>
      </div>
      <FooterV2 />
    </div>
  )
}
export default MintNFTPage
