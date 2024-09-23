import { Block } from 'konsta/react'

interface StatisticItemProps {
  value: number
  label: string
}

const StatisticItem: React.FC<StatisticItemProps> = ({ value, label }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[100px] max-h-[100px]"
      style={{
        backgroundImage: 'url(/images/wood_circle.png)',
        width: '90px',
        height: '90px',
      }}
    >
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-sm font-bold text-white">{label}</span>
    </div>
  )
}

const Statistic: React.FC = () => {
  return (
    <div className="space-y-2 flex flex-col item-center">
      <div
        style={{
          backgroundImage: 'url(./images/profile-statistic-card.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '60vh',
          maxHeight: '50px',
          maxWidth: '300px',
        }}
      ></div>
      <div className="flex flex-row justify-between w-full max-w-[300px]">
        <StatisticItem value={0} label="Wins" />
        <StatisticItem value={0} label="Loses" />
        <StatisticItem value={0} label="Draws" />
      </div>
    </div>
  )
}

export default Statistic
