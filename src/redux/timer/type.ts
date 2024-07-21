import { getTimeFromLocalStorage } from '../../utils/utils'

export interface TimerReducer {
  timer1: number
  timer2: number
  player1Timer: number
  player2Timer: number
}

export const defaultTimerReducer: TimerReducer = {
  timer1: getTimeFromLocalStorage('timer1', 60),
  timer2: getTimeFromLocalStorage('timer2', 60),
  player1Timer: getTimeFromLocalStorage('player1Timer', -1),
  player2Timer: getTimeFromLocalStorage('player2Timer', -1),
}
