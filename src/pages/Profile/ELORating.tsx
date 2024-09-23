import { Block } from 'konsta/react'

interface RatingItemProps {
  imageUrl: string
  label: string
}

const RatingItem: React.FC<RatingItemProps> = ({ imageUrl, label }) => {
  return (
    <div
      className="flex flex-row items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[100px] max-h-[100px] space-x-1"
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
    <Block className="space-y-4 flex">
      <div className=""></div>
      <div className="flex justify-between w-full">
        <RatingItem imageUrl="/bullet.svg" label="Bullet" />
        <RatingItem imageUrl="/Thunder.svg" label="Rabbit" />
        <RatingItem imageUrl="/QuickLock.svg" label="Blitz" />
      </div>
    </Block>
  )
}

export default ELORating
