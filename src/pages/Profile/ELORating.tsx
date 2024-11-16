import { Block } from 'konsta/react'

interface RatingItemProps {
  imageUrl: string
  label: string
}

const RatingItem: React.FC<RatingItemProps> = ({ imageUrl, label }) => {
  return (
    <div
      className="flex flex-row items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[100px] max-h-[100px] space-x-1 border-4 border-yellow-200"
      style={{
        backgroundImage: 'url(/images/wood_circle.png)',
        width: '100px',
        height: '100px',
      }}
    >
      <img src={imageUrl} alt={label} />
      <span className="text-sm font-bold text-white">{label}</span>
    </div>
  )
}

const ELORating: React.FC = () => {
  return (
    <div className="space-y-4 flex container mt-2">
      <div className="flex flex-row justify-between w-full">
        <RatingItem imageUrl="/bullet.svg" label="Bullet" />
        <RatingItem imageUrl="/Thunder.svg" label="Rabbit" />
        <RatingItem imageUrl="/QuickLock.svg" label="Blitz" />
      </div>
    </div>
  )
}

export default ELORating
