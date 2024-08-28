import ButtonV2 from '../components/Button/ButtonV2'
import FooterV2 from '../layouts/Footer/FooterV2'
import LOGO_DECHESS from '../../public/images/logo-dechess.svg'

const InvitedUserItem: React.FC<{ name: string; elo: number }> = ({ name, elo }) => {
  return (
    <div className="flex justify-between items-center font-spaceGrotesk font-bold text-[16px]">
      <div className="flex items-center w-4/5">
        <img className="w-[50px] h-[50px]" src="/dechess-non.svg" alt="player" />
        <div>levien</div>
      </div>
      <div className="flex items-center w-1/5 space-x-2">
        <p>{elo}</p>
        <img src="/elo-icon.svg" alt="elo" />
      </div>
    </div>
  )
}
const ReferralPage: React.FC<{}> = () => {
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
  // const onShowInvitedFriends = () => {
  //   return (
  //     <>
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //       <InvitedUserItem name="vien" elo={100} />
  //     </>
  //   )
  // }
  // return (
  //   <div
  //     className="text-white font-spaceGrotesk h-screen bg-cover bg-center flex flex-col items-center"
  //     style={{ backgroundImage: 'url(./images/bg-game.png)' }}
  //   >
  //     <h1 className="text-[20px] font-bold my-6">Invite Friends</h1>

  //     {/* Centered Logo */}
  //     <div className="min-w-[400px] max-w-[430px]">
  //       <div className="flex flex-col space-y-4">
  //         <div className="flex space-x-2 items-center">
  //           <img src="/1.svg" alt="" />
  //           <p>Share your invitation link to your friends.</p>
  //         </div>
  //         <div className="flex space-x-2 items-center">
  //           <img src="/2.svg" alt="" />
  //           <p>Your friends join and play DeChess.</p>
  //         </div>
  //         <div className="flex space-x-2 items-center">
  //           <img src="/3.svg" alt="" />
  //           <p>You will get bonus from invitations.</p>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="my-6 min-w-[400px] max-w-[430px]">
  //       <h2 className="font-bold text-[18px]">Invited</h2>
  //       <div
  //         className="bg-cover p-4 pb-0 flex"
  //         style={{
  //           backgroundImage: 'url(./images/bg-friend.svg)',
  //           width: '398px',
  //           height: '268px',
  //         }}
  //       >
  //         <div
  //           className="w-full overflow-y-auto mx-4"
  //           style={{
  //             maxHeight: '200px',
  //           }}
  //         >
  //           {onShowInvitedFriends()}
  //         </div>
  //       </div>
  //     </div>
  //     <div className="flex space-x-2 px-2">
  //       <ButtonV2>Invite a friend</ButtonV2>
  //       <div className="cursor-pointer">
  //         <img src="/copy.svg" alt="copy" />
  //       </div>
  //     </div>
  //     {/* <div className="flex justify-center items-center h-full text-white font-planet !text-[30px]">
  //       Comming soon!
  //     </div> */}
  //     <FooterV2 activeIndex={0} />
  //   </div>
  // )
}
export default ReferralPage
