import iconGoldChess from '../../../public/icon-gold-chess.svg'

interface StatisticItemProps {
  value: number
  label: string
  className?: string
}

const StatisticItem: React.FC<StatisticItemProps> = ({ value, label, className }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat rounded-full w-full h-full max-w-[100px] max-h-[100px] border-4 border-yellow-200 ${className}`}
      style={{
        backgroundImage: 'url(/images/wood_circle.png)',
        width: '100px',
        height: '100px',
      }}
    >
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-sm text-white">{label}</span>
    </div>
  )
}

const Statistic: React.FC = () => {
  return (
    <div className="space-y-2 flex flex-col item-center container">
      <div className="bg-[url('/bg-card.png')] bg-contain md:bg-cover bg-center bg-no-repeat p-1.5 flex items-center gap-3 pr-5 text-white text-sm">
        <img src={iconGoldChess} alt="Gold Chess" />
        <p className='flex-1'>Played Games</p>
        <p>1</p>
      </div>
      <div className="flex flex-row justify-between w-full">
        <StatisticItem value={1} label="Wins" />
        <StatisticItem value={0} label="Loses" />
        <StatisticItem value={0} label="Draws" />
      </div>
    </div>
  )
}

export default Statistic
