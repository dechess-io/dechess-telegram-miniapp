import { useEffect, useRef } from 'react'

type MoveRecordProps = {
  moveLists: string[]
  currentMoveIndex: any
}

const MoveRecord: React.FC<MoveRecordProps> = ({ moveLists, currentMoveIndex }) => {
  const moveListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollLeft = moveListRef.current.scrollWidth
    }
  }, [moveLists])

  return (
    <div
      ref={moveListRef}
      className="pb-1 bg-blue-gradient-1 h-[15px] text-white overflow-hidden whitespace-nowrap bg-opacity-80"
      style={{ width: '100%' }}
    >
      <div className="flex space-x-2 text-[12px]">
        {moveLists.map((move, index) => {
          if (index >= currentMoveIndex) return

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
