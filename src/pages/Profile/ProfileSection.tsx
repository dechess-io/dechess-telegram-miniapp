interface ProfileAvatarProps {
  avatarUrl: string
  frameUrl: string
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ avatarUrl, frameUrl }) => {
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
          <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

const ProfileHeader: React.FC = () => {
  return (
    <div className="flex flex-row items-center justify-center space-x-4">
      <span className="text-sm text-white">User Name</span>
      <img className="w-[20px] h-[20px]" src="/images/edit-name.png" alt="Edit Name" />
    </div>
  )
}

const ProfileSection: React.FC = () => {
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
      <ProfileAvatar avatarUrl="/images/avatar.png" frameUrl="./images/avatar-frame.png" />
      <ProfileHeader />
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
