import { Chess, Square } from 'chess.js'

export type GameState = {
  optionSquares: { [key: string]: any }
  moveFrom: Square | undefined
  moveTo: Square | undefined
  showPromotionDialog: boolean
  isGameOver: boolean
  isGameDraw: boolean
  game: Chess
  gameHistory: string[]
  currentMoveIndex: number
  moves: string[]
  isWinner: boolean
  isLoser: boolean
}

export const initialGameState: GameState = {
  optionSquares: {},
  moveFrom: undefined,
  moveTo: undefined,
  showPromotionDialog: false,
  isGameOver: false,
  isGameDraw: false,
  gameHistory: [new Chess().fen()],
  currentMoveIndex: 0,
  moves: [],
  game: new Chess(),
  isWinner: false,
  isLoser: false,
}

export type GameAction =
  | { type: 'SET_OPTION_SQUARES'; payload: { [key: string]: any } }
  | { type: 'SET_MOVE_FROM'; payload: Square | undefined }
  | { type: 'SET_MOVE_TO'; payload: Square | undefined }
  | { type: 'SHOW_PROMOTION_DIALOG'; payload: boolean }
  | { type: 'RESET_MOVE_SELECTION' }
  | { type: 'SET_GAME'; payload: Chess }
  | { type: 'SET_GAME_HISTORY'; payload: string[] }
  | { type: 'SET_MOVES'; payload: string[] }
  | { type: 'ADD_MOVES'; payload: string }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'SET_GAME_DRAW'; payload: boolean }
  | { type: 'ADD_GAME_HISTORY'; payload: string }
  | { type: 'SET_WINNER'; payload: boolean }
  | { type: 'SET_LOSER'; payload: boolean }
  | { type: 'SET_CURRENT_MOVE_INDEX'; payload: number }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_OPTION_SQUARES':
      return { ...state, optionSquares: action.payload }
    case 'SET_MOVE_FROM':
      return { ...state, moveFrom: action.payload, moveTo: undefined }
    case 'SET_MOVE_TO':
      return { ...state, moveTo: action.payload }
    case 'SET_CURRENT_MOVE_INDEX':
      return { ...state, currentMoveIndex: action.payload }
    case 'SHOW_PROMOTION_DIALOG':
      return { ...state, showPromotionDialog: action.payload }
    case 'RESET_MOVE_SELECTION':
      return { ...state, moveFrom: undefined, moveTo: undefined, optionSquares: {} }
    case 'SET_GAME':
      return { ...state, game: action.payload }
    case 'SET_GAME_HISTORY':
      return { ...state, gameHistory: action.payload }
    case 'ADD_GAME_HISTORY':
      return { ...state, gameHistory: [...state.gameHistory, action.payload] }
    case 'SET_MOVES':
      return { ...state, moves: action.payload }
    case 'ADD_MOVES':
      return { ...state, moves: [...state.moves, action.payload] }
    case 'SET_GAME_OVER':
      return { ...state, isGameOver: action.payload }
    case 'SET_GAME_DRAW':
      return { ...state, isGameDraw: action.payload }
    case 'SET_WINNER':
      return { ...state, isWinner: action.payload }
    case 'SET_LOSER':
      return { ...state, isLoser: action.payload }
    default:
      return state
  }
}

export const toggleGameDraw = (isGameDraw: boolean, gameDispatch: any) => {
  gameDispatch({ type: 'SET_GAME_DRAW', payload: !isGameDraw })
}

export const toggleGameOver = (isGameOver: boolean, gameDispatch: any) => {
  gameDispatch({ type: 'SET_GAME_OVER', payload: !isGameOver })
}

export const isOrientation = (address: string | undefined, player1: string) => {
  if (address === player1) {
    return 'white'
  } else {
    return 'black'
  }
}
