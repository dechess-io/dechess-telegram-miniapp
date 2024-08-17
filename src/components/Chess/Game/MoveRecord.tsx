import { useEffect, useRef } from 'react'
import { useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'

type MoveRecordProps = {}

const MoveRecord: React.FC<MoveRecordProps> = () => {
  const { moves, moveIndex } = useAppSelector(selectGame)

  const moveListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollLeft = moveListRef.current.scrollWidth
    }
  }, [moves])

  return (
    <div
      ref={moveListRef}
      className="bg-blue-gradient-1 flex items-center text-xs gap-4 text-white overflow-x-auto whitespace-nowrap bg-opacity-80 px-4 scrollbar-hide scrollbar-x-hide"
    >
      {moves.map((move, index) => {
        if (index >= moveIndex) return
        return <p key={index}>{`${index % 2 === 0 ? index / 2 + 1 + '. ' : ''}${move}`}</p>
      })}
    </div>
  )
}

export default MoveRecord
