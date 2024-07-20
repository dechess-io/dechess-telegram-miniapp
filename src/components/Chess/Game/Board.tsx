import { Chess, Square } from 'chess.js';
import { formatTime, getAvatarName } from '../../../utils/utils';
import { Chessboard as Board } from 'react-chessboard';
import { truncateSuiTx } from '../../../services/address';
import { useTonWallet } from '@tonconnect/ui-react';
import MoveRecord from './MoveRecord';
import PlayerDisplay from './PlayerDisplay';
import React, { useMemo, useState } from 'react';
import { Block } from 'konsta/react';

interface GameBoardProps {
  player1: string;
  player2: string;
  moveLists: string[];
  game: Chess | any;
  onSquareClick: (square: Square) => void;
  onSquareRightClick: (square: Square) => void;
  onPromotionPieceSelect: any;
  showPromotionDialog: boolean;
  moveSquares: Record<string, any>;
  optionSquares: Record<string, any>;
  rightClickedSquares: Record<string, any>;
  moveTo: any;
  player1Timer: any;
  player2Timer: any;
  currentMoveIndex: any;
}

const GameBoardOriginal: React.FC<GameBoardProps> = ({
  player1,
  player2,
  moveLists,
  game,
  onSquareClick,
  onSquareRightClick,
  onPromotionPieceSelect,
  showPromotionDialog,
  moveSquares,
  optionSquares,
  rightClickedSquares,
  moveTo,
  player1Timer,
  player2Timer,
  currentMoveIndex,
}) => {
  const [name1] = useState(getAvatarName());
  const [name2] = useState(getAvatarName());

  const wallet = useTonWallet();

  const isOrientation = useMemo(
    () => (wallet?.account.address === player1 ? 'white' : 'black'),
    [player1, wallet?.account.address]
  );

  const getPlayerDisplayProps = (isTop: boolean) => {
    const isPlayer1 = wallet?.account.address === player1;
    const isPlayer2 = wallet?.account.address === player2;
    const isWhite = isOrientation === 'white';
    let playerName, playerImage, playerTime;
    if (isTop) {
      playerName = isPlayer2 ? player1 : player2;
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`;
      playerTime = isWhite ? formatTime(player2Timer) : formatTime(player1Timer);
    } else {
      playerName = isPlayer1 || !isPlayer2 ? player1 : player2;
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`;
      playerTime = isWhite ? formatTime(player1Timer) : formatTime(player2Timer);
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
    };
  };

  return (
    <>
      <Block strong style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="flex flex-col pt-6 justify-start bg-[#041d21] h-screen">
          <div className="flex justify-center items-center">
            <div className="" style={{ height: '400px', width: '400px', cursor: 'pointer' }}>
              <div className="flex flex-col space-y-1">
                <MoveRecord moveLists={moveLists} currentMoveIndex={currentMoveIndex} />
                <PlayerDisplay {...getPlayerDisplayProps(true)} />
                <div className="relative border-8 border-white rounded-lg">
                  <Board
                    boardOrientation={isOrientation}
                    position={game.fen()}
                    id="ClickToMove"
                    animationDuration={200}
                    arePiecesDraggable={false}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    customBoardStyle={{
                      // borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                    customLightSquareStyle={{
                      backgroundColor: '#E8EDF9',
                    }}
                    customDarkSquareStyle={{
                      backgroundColor: '#B7C0D8',
                    }}
                    customSquareStyles={{
                      ...moveSquares,
                      ...optionSquares,
                      ...rightClickedSquares,
                    }}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                  />
                </div>
                <PlayerDisplay {...getPlayerDisplayProps(false)} />
              </div>
            </div>
          </div>
        </div>
      </Block>
    </>
  );
};

const GameBoard = React.memo(GameBoardOriginal);
export default GameBoard;
