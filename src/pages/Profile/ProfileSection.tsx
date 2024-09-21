import { LaunchParams } from "@telegram-apps/sdk"
import WebApp from "@twa-dev/sdk"
import { useEffect, useState } from "react"
import restApi from "../../services/api"
import { getAvatarName } from "../../utils/utils"

interface ProfileAvatarProps {
  avatarUrl: string
  frameUrl: string
}

interface ProfileHeaderProps {
  username: any
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatarUrl, frameUrl }) => {
  const [name] = useState(getAvatarName())
  return (
    <div
      className="relative"
      style={{
        backgroundImage: `url(${frameUrl})`,
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
        <div className="w-11 h-11 bg-gray-300 rounded-full pb-2">
          <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name}`} alt="Avatar" className="rounded-full" />
        </div>
      </div>
    </div>
  )
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({username}) => {
  return (
    <div className="flex flex-row items-center justify-center space-x-2">
      <span className="text-sm text-white">{username}</span>
      <img className="w-[20px] h-[20px]" src="/images/edit-name.png" alt="Edit Name" />
    </div>
  )
}

const ProfileSection: React.FC = () => {
  const [user, setUser] = useState<any>('')
  

  useEffect(() => {
    restApi
        .post('/telegram-profile-image', {
          'user_id' : WebApp.initDataUnsafe.user?.id,
        })
        .then((res) => {
          if (res.status == 200) {
           const data = res.data 
          }
        })
        
  })

  return (
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
        minWidth: '360px',
        minHeight: '172px',
      }}
    >
      
        <ProfileAvatar avatarUrl={user.photoUrl} frameUrl="./images/avatar-frame.png" />
        <ProfileHeader username={user.username}/>
      <div
        className="mx-auto my-auto"
        style={{
          backgroundImage: 'url(./images/Point.png)',
          height: '27px',
          width: '115px',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      ></div>
    </div>
  )
}

export default ProfileSection
