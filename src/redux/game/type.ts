import { Chess, Square } from 'chess.js'

export interface GameReducer {
  optionSquares: { [key: string]: any }
  moveFrom: Square | undefined
  moveTo: Square | undefined
  showPromotionDialog: boolean
  isGameOver: boolean
  isGameDraw: boolean
  board: Chess
  history: string[]
  moveIndex: number
  moves: string[]
  isWinner: boolean
  isLoser: boolean
  turn: 'w' | 'b'
  player1: string
  player2: string
  playerTurn: string
  rightClickedSquares: any
  newMove: any
  hasMoveOptions: boolean
  isMove: boolean
  foundMove: any
  kingSquares: any
  startTime: any
  player1Moves: any
  player2Moves: any
}

export const defaultGameReducer: GameReducer = {
  optionSquares: {},
  moveFrom: undefined,
  moveTo: undefined,
  showPromotionDialog: false,
  isGameOver: false,
  isGameDraw: false,
  history: [new Chess().fen()],
  moveIndex: 0,
  moves: [],
  board: new Chess(),
  isWinner: false,
  isLoser: false,
  turn: 'w',
  player1: '',
  player2: '',
  playerTurn: '',
  rightClickedSquares: {},
  newMove: {},
  hasMoveOptions: false,
  isMove: false,
  foundMove: null,
  kingSquares: {},
  startTime: null,
  player1Moves: 0,
  player2Moves: 0,
}
