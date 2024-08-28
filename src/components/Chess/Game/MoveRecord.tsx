import { useEffect, useRef } from 'react'
import { useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import cn from '../../../services/cn'

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
    <div className="relative rounded overflow-hidden min-h-[16px]">
      <div
        ref={moveListRef}
        className={cn(
          'flex items-center text-xs gap-4 text-white overflow-x-auto whitespace-nowrap bg-opacity-80 pl-2 pr-4 scrollbar-hide absolute inset-0',
          {
            'bg-blue-gradient-1': moves.length > 0,
            'bg-transparent': moves.length === 0,
          }
        )}
      >
        {moves.map((move, index) => {
          if (index >= moveIndex) return
          return <p key={index}>{`${index % 2 === 0 ? index / 2 + 1 + '. ' : ''}${move}`}</p>
        })}
      </div>
    </div>
  )
}

export default MoveRecord
