import { useEffect, useRef } from 'react'

type MoveRecordProps = {
  moveLists: string[]
}

const MoveRecord: React.FC<MoveRecordProps> = ({ moveLists }) => {
  const moveListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollLeft = moveListRef.current.scrollWidth
    }
  }, [moveLists])

  return (
    <div
      ref={moveListRef}
      className="pb-4 bg-blue-gradient-1 h-[30px] text-white overflow-hidden whitespace-nowrap"
      style={{ width: '100%' }}
    >
      <div className="flex space-x-2">
        {moveLists.map((move, index) => (
          <span key={index} className="inline-block">{`${index + 1}: ${move}`}</span>
        ))}
      </div>
    </div>
  )
}

export default MoveRecord