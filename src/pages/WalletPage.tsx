import LOGO_DECHESS from '../../public/images/logo-dechess.svg'
import FooterV2 from '../layouts/Footer/FooterV2'

const WalletPage: React.FC<{}> = () => {
  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      {/* Centered Logo */}
      <img className="max-w-[120px] max-h-[40px] my-4" src={LOGO_DECHESS} alt="" />

      <div className="flex justify-center items-center h-full text-white font-planet !text-[30px]">
        Coming soon!
      </div>
      <FooterV2 activeIndex={0} />
    </div>
  )
}
export default WalletPage
