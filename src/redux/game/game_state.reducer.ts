import { Chess, Square } from 'chess.js'

export type GameState = {
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
}

export const initialGameState: GameState = {
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
  | { type: 'SET_PLAYER_1'; payload: string }
  | { type: 'SET_PLAYER_2'; payload: string }
  | { type: 'SET_TURN'; payload: 'w' | 'b' }
  | { type: 'LOAD_GAME'; payload: any }
  | { type: 'SET_PREVIOUS_MOVE' }
  | { type: 'SET_NEXT_MOVE' }
  | { type: 'SET_PLAYER_TURN'; payload: string }
  | { type: 'SWITCH_PLAYER_TURN' }
  | { type: 'SET_NEW_MOVE'; payload: any }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      const {
        turn_player,
        fen,
        player_1,
        player_2,
        isGameDraw,
        isGameOver,
        history,
        winner,
        loser,
      } = action.payload
      return {
        ...state,
        isGameOver: isGameOver,
        isGameDraw: isGameDraw,
        board: new Chess(fen),
        history: [...history],
        moveIndex: history.length - 1,
        turn: turn_player,
        isWinner: winner && localStorage.getItem('address') === winner ? true : false,
        isLoser: loser && localStorage.getItem('address') === loser ? true : false,
        player1: player_1,
        player2: player_2,
        playerTurn: turn_player === 'w' ? player_1 : player_2,
      }
    case 'SET_OPTION_SQUARES':
      return { ...state, optionSquares: action.payload }
    case 'SET_MOVE_FROM':
      return { ...state, moveFrom: action.payload, moveTo: undefined }
    case 'SET_MOVE_TO':
      return { ...state, moveTo: action.payload }
    case 'SET_CURRENT_MOVE_INDEX':
      return { ...state, moveIndex: action.payload }
    case 'SHOW_PROMOTION_DIALOG':
      return { ...state, showPromotionDialog: action.payload }
    case 'RESET_MOVE_SELECTION':
      return { ...state, moveFrom: undefined, moveTo: undefined, optionSquares: {} }
    case 'SET_GAME':
      return { ...state, board: action.payload }
    case 'SET_GAME_HISTORY':
      return { ...state, history: action.payload }
    case 'ADD_GAME_HISTORY':
      return { ...state, history: [...state.history, action.payload] }
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
    case 'SET_PLAYER_1':
      return { ...state, player1: action.payload }
    case 'SET_PLAYER_2':
      return { ...state, player2: action.payload }
    case 'SET_TURN':
      return { ...state, turn: action.payload }
    case 'SET_PREVIOUS_MOVE':
      return {
        ...state,
        moveIndex: state.moveIndex - 1,
        board: new Chess(state.history[state.moveIndex - 1]),
      }
    case 'SET_NEXT_MOVE':
      return {
        ...state,
        moveIndex: state.moveIndex + 1,
        board: new Chess(state.history[state.moveIndex + 1]),
      }
    case 'SET_PLAYER_TURN':
      return { ...state, playerTurn: action.payload }
    case 'SWITCH_PLAYER_TURN':
      return {
        ...state,
        playerTurn: state.playerTurn === state.player1 ? state.player2 : state.player1,
      }
    case 'SET_NEW_MOVE':
      return {
        ...state,
        moves: [...state.moves, action.payload.san],
        turn: action.payload.turn,
        playerTurn: state.playerTurn === state.player1 ? state.player2 : state.player1,
        board: new Chess(action.payload.fen),
        history: action.payload.history,
        moveIndex: action.payload.history.length - 1,
      }
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
