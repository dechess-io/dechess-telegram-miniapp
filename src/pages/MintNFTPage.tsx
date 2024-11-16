import FooterV2 from '../layouts/Footer/FooterV2'
import { sliceAddress } from '../utils/utils'
import iconWallet from '../../public/icon-wallet.svg'
import iconChevronDown from '../../public/icon-chevron-down.svg'
import { useMemo } from 'react'
import ButtonV2 from '../components/Button/ButtonV2'

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

      <div className="container mt-4 h-[calc(100vh_-_52px_-_113px)] flex justify-center items-center">
        <div className="flex flex-col gap-2 items-center">
          <img className="w-32 h-32 animate-pulse" src="/icon-earn.svg" alt="NFT Mint" />
          <p className="text-white text-sm">ID: 1234567890</p>
          <p className="text-white text-sm">Name: Dechess Master</p>
          <ButtonV2>Mint NFT</ButtonV2>
        </div>
      </div>

      <FooterV2 />
    </div>
  )
}
export default MintNFTPage
