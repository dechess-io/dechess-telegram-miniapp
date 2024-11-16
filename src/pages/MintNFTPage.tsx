import FooterV2 from '../layouts/Footer/FooterV2'

const MintNFTPage: React.FC = () => {
  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center"
      style={{ backgroundImage: 'url(./images/bg-game.png)' }}
    >
      <div className="flex justify-center items-center h-full text-white font-planet !text-[30px]">
        Coming soon!
      </div>
      <FooterV2 />
    </div>
  )
}
export default MintNFTPage
