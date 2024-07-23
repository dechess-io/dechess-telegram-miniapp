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
      className="pb-1 bg-blue-gradient-1 h-[15px] text-white overflow-hidden whitespace-nowrap bg-opacity-80"
      style={{ width: '100%' }}
    >
      <div className="flex space-x-2 text-[12px]">
        {moves.map((move, index) => {
          if (index >= moveIndex) return
          return (
            <span key={index} className="inline-block">{`${
              index % 2 === 0 ? index / 2 + 1 + '. ' : ''
            }${move}`}</span>
          )
        })}
      </div>
    </div>
  )
}

export default MoveRecord
