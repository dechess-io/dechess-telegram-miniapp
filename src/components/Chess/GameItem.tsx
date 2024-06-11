import { Chess } from 'chess.js'
import { useState } from 'react'
import { Chessboard as Board } from 'react-chessboard'

const GameItem: React.FC<{ fen: string }> = ({ fen }) => {
  const [game, setGame] = useState(new Chess(fen))

  return (
    <>
      <Board
        position={game.fen()}
        id="ClickToMove"
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      />
    </>
  )
}
export default GameItem
