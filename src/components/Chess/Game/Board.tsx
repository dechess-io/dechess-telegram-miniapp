import { Chess, Square } from 'chess.js'
import { formatTime, getAvatarName } from '../../../utils/utils'
import { Chessboard as Board } from 'react-chessboard'
import { truncateSuiTx } from '../../../services/address'
import { useTonWallet } from '@tonconnect/ui-react'
import MoveRecord from './MoveRecord'
import PlayerDisplay from './PlayerDisplay'
import React, { useMemo, useState } from 'react'
import { Block, Card } from 'konsta/react'
import { useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import ProgressBar from '@ramonak/react-progress-bar'

interface GameBoardProps {
  onSquareClick: (square: Square) => void
  onSquareRightClick: (square: Square) => void
  onPromotionPieceSelect: any
  moveSquares: Record<string, any>
  player1Timer: number
  player2Timer: number
  showProgressBar: boolean
  progressBar: number
  isDraggablePiece: any
  onDragOverSquare: any
  onPieceDragBegin: any
  onPieceDragEnd: any
  onPieceDrop: any
}

const GameBoardOriginal: React.FC<GameBoardProps> = ({
  onSquareClick,
  onSquareRightClick,
  onPromotionPieceSelect,
  moveSquares,
  player1Timer,
  player2Timer,
  showProgressBar,
  progressBar,
  isDraggablePiece,
  onDragOverSquare,
  onPieceDragBegin,
  onPieceDragEnd,
  onPieceDrop,
}) => {
  const {
    player1,
    player2,
    board,
    moveTo,
    showPromotionDialog,
    optionSquares,
    rightClickedSquares,
    kingSquares,
  } = useAppSelector(selectGame)

  const [name1] = useState(getAvatarName())
  const [name2] = useState(getAvatarName())

  const wallet = useTonWallet()

  const isOrientation = useMemo(
    () => (wallet?.account.address === player1 ? 'white' : 'black'),
    [player1, wallet?.account.address]
  )

  const getPlayerDisplayProps = (isTop: boolean) => {
    const isPlayer1 = wallet?.account.address === player1
    const isPlayer2 = wallet?.account.address === player2
    const isWhite = isOrientation === 'white'
    let playerName, playerImage, playerTime
    if (isTop) {
      playerName = isPlayer2 ? player1 : player2
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`
      playerTime = isWhite ? formatTime(player2Timer) : formatTime(player1Timer)
    } else {
      playerName = isPlayer1 || !isPlayer2 ? player1 : player2
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`
      playerTime = isWhite ? formatTime(player1Timer) : formatTime(player2Timer)
    }

    return {
      imageSrc: playerImage,
      name: truncateSuiTx(playerName || ''),
      time: playerTime,
      timeBoxClass: isTop
        ? 'bg-grey-100 border-b-4 border-grey-200'
        : 'bg-blue-gradient border-b-4 border-blue-200',
      clockIconSrc: isTop ? '/clock-stopwatch-white.svg' : '/clock-stopwatch-black.svg',
      textColor: 'text-white',
    }
  }

  return (
    <>
        <div className="flex flex-col justify-start h-screen w-full max-w-[400px]">
          <div className="flex justify-center items-center">
            <div className="h-full max-h-[400px] w-full max-w-[400px] mx-auto" style={{  cursor: 'pointer' }}>
              <div className="flex flex-col space-y-1 overflow-hidden">
                {showProgressBar && (
                  <ProgressBar
                    completed={progressBar}
                    bgColor="#93d3fb"
                    height="10px"
                    borderRadius="0"
                    isLabelVisible={false}
                    baseBgColor="black"
                  />
                )}
                <MoveRecord />
                <PlayerDisplay {...getPlayerDisplayProps(true)} />
                <div className="relative border-8 border-[#E1C16E] rounded-lg">
                  <Board
                    boardOrientation={isOrientation}
                    position={board.fen()}
                    id="ClickToMove"
                    animationDuration={200}
                    arePiecesDraggable={true}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    customBoardStyle={{
                      // borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                    customLightSquareStyle={{
                      backgroundColor: '#E1C16E',
                    }}
                    // customDarkSquareStyle={{
                    //   backgroundColor: '#FFFFF0',
                    // }}
                    customDropSquareStyle={{}}
                    customSquareStyles={{
                      ...moveSquares,
                      ...optionSquares,
                      ...kingSquares,
                      ...rightClickedSquares,
                    }}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                    isDraggablePiece={isDraggablePiece}
                    onDragOverSquare={onDragOverSquare}
                    onPieceDragBegin={onPieceDragBegin}
                    onPieceDragEnd={onPieceDragEnd}
                    onPieceDrop={onPieceDrop}
                    arePremovesAllowed={false}
                  />
                </div>
                <PlayerDisplay {...getPlayerDisplayProps(false)} />
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

const GameBoard = React.memo(GameBoardOriginal)
export default GameBoard
