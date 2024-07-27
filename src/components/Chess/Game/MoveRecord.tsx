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
      className="bg-blue-gradient-1 flex items-center text-xs gap-4 text-white overflow-hidden whitespace-nowrap bg-opacity-80 px-4"
    >
      {moveLists.map((move, index) => {
        if (index >= currentMoveIndex) return
        return <p key={index}>{`${index % 2 === 0 ? index / 2 + 1 + '. ' : ''}${move}`}</p>
      })}
    </div>
  )
}

export default MoveRecord
