import { Chess, Square } from 'chess.js'

interface Coordinate {
  x: number
  y: number
}

export interface InfluencePiece {
  square: Square
  color: string
  type: string
}

export const promotions = [undefined, 'b', 'n', 'r', 'q']

export const pieceValues: { [key: string]: number } = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: Infinity,
  m: 0,
}

function getBoardCoordinates(square: Square): Coordinate {
  return {
    x: 'abcdefgh'.indexOf(square.slice(0, 1)),
    y: parseInt(square.slice(1)) - 1,
  }
}

function getSquare(coordinate: Coordinate): Square {
  return ('abcdefgh'.charAt(coordinate.x) + (coordinate.y + 1).toString()) as Square
}

// export function getAttackers(fen: string, square: Square): InfluencePiece[] {
//   let attackers: InfluencePiece[] = []

//   let board = new Chess(fen)
//   let piece = board.get(square)

//   board.load(
//     fen
//       .replace(/(?<= )(?:w|b)(?= )/g, piece.color == 'w' ? 'b' : 'w')
//       .replace(/ [a-h][1-8] /g, ' - ')
//   )

//   let legalMoves = board.moves({ verbose: true })

//   for (let move of legalMoves) {
//     if (move.to == square) {
//       attackers.push({
//         square: move.from,
//         color: move.color,
//         type: move.piece,
//       })
//     }
//   }

//   let oppositeKing: InfluencePiece
// }
