import iconGoldChess from '../../../public/icon-gold-chess.svg'

const quests = [
  { id: 1, name: 'Quest 1', points: 100 },
  { id: 2, name: 'Quest 3', points: 50 },
  { id: 3, name: 'Quest 2', points: 20 },
]
const InGameQuest = () => {
  return (
    <div className="w-full container text-white bold">
      {quests.map((quest) => (
        <div
          key={quest.id}
          className="bg-[url('/bg-card.png')] bg-contain md:bg-cover bg-center bg-no-repeat p-1.5 flex items-center gap-3 pr-5 text-white text-sm"
        >
          <img src={iconGoldChess} alt="Gold Chess" />
          <p className="flex-1">{quest.name}</p>
          <div className="flex items-center gap-0.5">
            <p>{quest.points}</p>
            <img className="w-4 h-4" src="/icon-earn.svg" alt="Earn" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default InGameQuest