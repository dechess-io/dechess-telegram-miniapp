import { Block } from 'konsta/react'

interface StatisticItemProps {
  value: number
  label: string
}

const StatisticItem: React.FC<StatisticItemProps> = ({ value, label }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[122px] max-h-[122px]"
      style={{
        backgroundImage: 'url(/images/wood_circle.png)',
        width: '122px',
        height: '122px',
      }}
    >
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-sm font-bold text-white">{label}</span>
    </div>
  )
}

const Statistic: React.FC = () => {
  return (
    <Block className="space-y-4 flex flex-col">
      <div
        style={{
          backgroundImage: 'url(./images/profile-statistic-card.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '90vw',
          height: '60vh',
          maxWidth: '398px',
          maxHeight: '66px',
        }}
      ></div>
      <div className="flex flex-row justify-between w-full">
        <StatisticItem value={0} label="Wins" />
        <StatisticItem value={0} label="Loses" />
        <StatisticItem value={0} label="Draws" />
      </div>
    </Block>
  )
}

export default Statistic
